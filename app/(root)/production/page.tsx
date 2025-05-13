"use client"

import { useState, useEffect } from "react"
import { cn, getFormattedDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import useOrderStore from "@/stores/menu_jour_store"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { addDays, format, startOfWeek, eachDayOfInterval } from "date-fns"
import { fr } from "date-fns/locale"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import useProductionStore from "@/stores/production-store"
import { getPlatsByDate, getPlatStatsByDay, getPlatStatsByWeek } from "@/apis/production-api"
import { useRouter } from "next/navigation"

interface UserOrder {
  userId: number
  typeUser: string
  nbPlatsCommandes: number
}

interface PlatStat {
  typeUserCounts: Record<string, number>
  usersByCategory: Record<string, UserOrder[]>
}

interface PlatDetail {
  id: number
  nom: string
  nbCommandes: number
  stats?: PlatStat
}

const ProductionPage = () => {
  const router = useRouter()
  const { days, orders, setDays, setPlatDejeuner, setPlatDiner } = useOrderStore()

  const {
    selectedDay,
    isWeekView,
    setSelectedDay,
    setIsWeekView,
    setSelectedDate,
    setPlatDetails,
    platDetails,
    setSelectedPlatId,
  } = useProductionStore()

  const [date, setDate] = useState<Date | undefined>(new Date())
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [loading, setLoading] = useState(false)
  const [statsLoading, setStatsLoading] = useState<Record<number, boolean>>({})

  const categories = ["All", "Plats", "Desserts", "Entrées"]

  useEffect(() => {
    if (selectedDay && !orders[getFormattedDate(selectedDay)]) {
      setPlatDejeuner(getFormattedDate(selectedDay), null)
      setPlatDiner(getFormattedDate(selectedDay), null)
    }
  }, [selectedDay, orders, setPlatDejeuner, setPlatDiner])

  useEffect(() => {
    if (!selectedDay) return

    const fetchPlatsAndStats = async () => {
      setLoading(true)
      try {
        const formattedDate = formatDateForApi(selectedDay)
        const typePlat = getCategoryTypeForApi(selectedCategory)
        let plats = await getPlatsByDate(formattedDate, typePlat)

        if (isWeekView) {
          const weekStart = startOfWeek(date || new Date(), { weekStartsOn: 1 })
          const weekDays = eachDayOfInterval({
            start: weekStart,
            end: addDays(weekStart, 4)
          })

          const allPlats = await Promise.all(
            weekDays.map(async (day) => {
              const dateStr = format(day, "yyyy-MM-dd")
              return await getPlatsByDate(dateStr, typePlat)
            })
          )
          
          plats = allPlats.flat().reduce((acc: PlatDetail[], plat) => {
            const existing = acc.find(p => p.id === plat.id)
            if (!existing) {
              acc.push({ ...plat, nbCommandes: 0 })
            }
            return acc
          }, [])
        }

        const platsWithStats = await Promise.all(
          plats.map(async (plat) => {
            if (plat.nbCommandes > 0 || isWeekView) {
              setStatsLoading(prev => ({ ...prev, [plat.id]: true }))
              try {
                const stats = isWeekView
                  ? await getPlatStatsByWeek(plat.id, formatDateForApi(days[0]))
                  : await getPlatStatsByDay(plat.id, formattedDate)

                return {
                  ...plat,
                  stats,
                  nbCommandes: stats ? calculateTotalFromStats(stats) : plat.nbCommandes
                }
              } catch (error) {
                console.error(`Error fetching stats for plat ${plat.id}:`, error)
                return plat
              } finally {
                setStatsLoading(prev => ({ ...prev, [plat.id]: false }))
              }
            }
            return plat
          })
        )

        setPlatDetails(platsWithStats)
      } catch (error) {
        console.error("Error fetching plats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlatsAndStats()
  }, [selectedDay, selectedCategory, isWeekView, date, days])

  const calculateTotalFromStats = (stats: PlatStat): number => {
    let total = 0
    Object.values(stats.usersByCategory).forEach(users => {
      if (users) {
        users.forEach(user => {
          total += user.nbPlatsCommandes
        })
      }
    })
    return total
  }

  const handleDateChange = (newDate: Date | undefined) => {
    if (!newDate) return

    setDate(newDate)
    const weekStart = startOfWeek(newDate, { weekStartsOn: 1 })
    const weekDays = Array.from({ length: 5 }, (_, i) => {
      const day = addDays(weekStart, i)
      const dayName = format(day, "EEEE", { locale: fr })
      const dayDate = format(day, "dd/MM")
      return `${dayName} ${dayDate}`
    })

    setDays(weekDays)
    const selectedDayFormat = format(newDate, "EEEE dd/MM", { locale: fr })
    if (weekDays.includes(selectedDayFormat)) {
      setSelectedDay(selectedDayFormat)
      setSelectedDate(format(newDate, "yyyy-MM-dd"))
      setIsWeekView(false)
    } else {
      setSelectedDay(weekDays[0])
      setSelectedDate(format(weekStart, "yyyy-MM-dd"))
      setIsWeekView(false)
    }
  }

  const handleWeekView = async () => {
    setIsWeekView(true)
    const weekStart = startOfWeek(date || new Date(), { weekStartsOn: 1 })
    setSelectedDate(format(weekStart, "yyyy-MM-dd"))
  }

  const handlePlatClick = (platId: number) => {
    setSelectedPlatId(platId)
    const formattedDate = formatDateForApi(selectedDay)
    router.push(`/production/production_plat?platId=${platId}&date=${formattedDate}&isStatWeek=${isWeekView}`)
  }

  const formatDateForApi = (day: string): string => {
    if (!day) return format(new Date(), "yyyy-MM-dd")
    const parts = day.split(" ")
    if (parts.length < 2) return format(new Date(), "yyyy-MM-dd")
    const datePart = parts[1]
    const [dd, mm] = datePart.split("/")
    const year = new Date().getFullYear()
    return `${year}-${mm}-${dd}`
  }

  const getCategoryTypeForApi = (category: string): string => {
    switch (category) {
      case "Plats": return "PLAT"
      case "Desserts": return "DESSERT"
      case "Entrées": return "ENTREE"
      default: return "ALL"
    }
  }

  const getCategoryCount = (plat: PlatDetail, category: string): string => {
    if (!plat.stats) return "0";
    if (statsLoading[plat.id]) return "Chargement...";
  
    // First check if we have the simplified category structure
    const simplifiedCategories = {
      "Rééquilibrage alimentaire": "REEQUILIBRAGE_ALIMENTAIRE",
      "Perte de poids": "PERTE_DE_POID",
      "Prise de masse": "PRISE_DE_MASSE"
    };
  
    const simplifiedKey = simplifiedCategories[category as keyof typeof simplifiedCategories];
    if (simplifiedKey && plat.stats.usersByCategory[simplifiedKey]) {
      const users = plat.stats.usersByCategory[simplifiedKey];
      return users.reduce((sum, user) => sum + user.nbPlatsCommandes, 0).toString();
    }
  
    // If not found, check for the full variations
    const categoryVariations = {
      "Rééquilibrage alimentaire": [
        "REEQUILIBRAGE_ALIMENTAIRE_SPORTIF",
        "REEQUILIBRAGE_ALIMENTAIRE_NON_SPORTIF"
      ],
      "Perte de poids": [
        "PERTE_DE_POID_SPORTIF",
        "PERTE_DE_POIDS_NON_SPORTIF"
      ],
      "Prise de masse": [
        "PRISE_DE_MASSES_PORTIF",
        "PRISE_DE_MASSE_NON_SPORTIF"
      ]
    }[category];
  
    if (!categoryVariations) return "0";
  
    let count = 0;
    categoryVariations.forEach(variation => {
      const users = plat.stats?.usersByCategory?.[variation];
      if (users) {
        count += users.reduce((sum, user) => sum + user.nbPlatsCommandes, 0);
      }
    });
  
    return count.toString();
  };

  const filteredPlats = platDetails.filter((plat) => 
    plat.nom.toLowerCase().includes(search.toLowerCase())
  )



  return (
    <div className="p-6 w-full justify-center">
      <h1 className="text-center text-2xl font-semibold mb-4">
        SEMAINE {days[0]?.split(" ")[1]} - {days[4]?.split(" ")[1]}
      </h1>

      <div className="flex flex-wrap w-full mb-6 items-center">
        <div className="flex flex-wrap flex-1">
          {days.map((day) => (
            <button
              key={day}
              className={cn(
                "flex-1 px-4 py-2 border text-sm font-semibold transition-all",
                selectedDay === day && !isWeekView
                  ? "bg-[#F15928B2] text-white"
                  : "text-[#F15928B2] border-[#F15928B2]",
              )}
              onClick={() => {
                setSelectedDay(day)
                setIsWeekView(false)
                setSelectedDate(formatDateForApi(day))
              }}
            >
              {day.substring(0, day.length - 3)}
            </button>
          ))}

          <button
            className={cn(
              "flex-1 px-4 py-2 border text-sm font-semibold transition-all",
              isWeekView ? "bg-[#F15928B2] text-white" : "text-[#F15928B2] border-[#F15928B2]",
            )}
            onClick={handleWeekView}
          >
            Toute la semaine
          </button>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="ml-4 border-[#F15928B2] text-[#F15928B2]">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "dd MMMM yyyy", { locale: fr }) : "Sélectionner une date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar mode="single" selected={date} onSelect={handleDateChange} className="border rounded-md" />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm ${
                selectedCategory === category ? "bg-[#F15928]/20 text-[#F15928]" : "text-gray-600 hover:bg-gray-300"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="relative">
          <Input
            className="rounded-full bg-white pl-10 pr-4 py-2 w-60"
            placeholder="Recherche"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Image
            src="/logos/search.png"
            alt="Search"
            width={20}
            height={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="grid grid-cols-5 gap-4 p-4 border-b border-[#D1D2DB]">
          <span className="font-semibold">Nom du plat</span>
          <span className="font-semibold">Nombres de plats</span>
          <span className="font-semibold">Rééquilibrage alimentaire</span>
          <span className="font-semibold">Perte de poids</span>
          <span className="font-semibold">Prise de masse</span>
        </div>

        {loading ? (
          <div className="p-8 text-center">Chargement...</div>
        ) : filteredPlats.length > 0 ? (
          filteredPlats.map((plat) => (
            <div key={plat.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handlePlatClick(plat.id)}>
              <div className="grid grid-cols-5 gap-4 p-4 border-b border-gray-200">
                <span>{plat.nom}</span>
                <span>{plat.nbCommandes}</span>
                <span>{getCategoryCount(plat, "Rééquilibrage alimentaire")}</span>
                <span>{getCategoryCount(plat, "Perte de poids")}</span>
                <span>{getCategoryCount(plat, "Prise de masse")}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center">Aucun plat trouvé</div>
        )}
      </div>
    </div>
  )
}

export default ProductionPage