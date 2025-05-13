"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import useOrderStore from "@/stores/menu_jour_store"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, RefreshCw } from "lucide-react"
import { addDays, format, startOfWeek } from "date-fns"
import { fr } from "date-fns/locale"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { getPlatOrdersByDate, getPlatAllergyStatsByDay, getPlatAllergyStatsByWeek } from "@/apis/cmds-plats-api"
import type { PlatOrderDetail } from "@/apis/cmds-plats-api"

const CommandesPage = () => {
  const { days, setDays } = useOrderStore()

  const [selectedDay, setSelectedDay] = useState(days[0])
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [search, setSearch] = useState("")
  const [isWeekView, setIsWeekView] = useState(false)
  const [loading, setLoading] = useState(false)
  const [noDataMessage, setNoDataMessage] = useState("")

  // State for different meal types
  const [platsPlats, setPlatsPlats] = useState<PlatOrderDetail[]>([])
  const [entreePlats, setEntreePlats] = useState<PlatOrderDetail[]>([])
  const [dessertPlats, setDessertPlats] = useState<PlatOrderDetail[]>([])

  const fetchPlatsData = async (forceWeekView = isWeekView) => {
    setLoading(true)
    setNoDataMessage("")
    setPlatsPlats([])
    setEntreePlats([])
    setDessertPlats([])
    
    try {
      const formattedDate = formatDateForApi(selectedDay)
      
      // Fetch all data in parallel
      const [platsData, entreeData, dessertData] = await Promise.all([
        fetchPlatTypeData(formattedDate, "PLAT", forceWeekView),
        fetchPlatTypeData(formattedDate, "ENTREE", forceWeekView),
        fetchPlatTypeData(formattedDate, "DESSERT", forceWeekView)
      ]);

      setPlatsPlats(platsData)
      setEntreePlats(entreeData)
      setDessertPlats(dessertData)

      // Check if we have any data at all
      if (platsData.length === 0 && entreeData.length === 0 && dessertData.length === 0) {
        setNoDataMessage(
          forceWeekView 
            ? "Aucune donnée disponible pour cette semaine" 
            : "Aucune donnée disponible pour cette date"
        )
      }
    } catch (error) {
      console.error("Error fetching plats data:", error)
      setNoDataMessage("Erreur lors du chargement des données")
    } finally {
      setLoading(false)
    }
  }

  const fetchPlatTypeData = async (date: string, typePlat: string, isWeekView: boolean): Promise<PlatOrderDetail[]> => {
    try {
      const plats = await getPlatOrdersByDate(date, typePlat, isWeekView)
      if (!plats || plats.length === 0) return []

      const platsWithDetails = await Promise.all(
        plats.map(async (plat) => {
          try {
            const allergyStats = isWeekView
              ? await getPlatAllergyStatsByWeek(plat.id, date)
              : await getPlatAllergyStatsByDay(plat.id, date)

            const nbAllergies = allergyStats?.totalAvecAllergie || 0
            const nbStandard = allergyStats?.totalSansAllergie || 0

            return {
              id: plat.id,
              nom: plat.nom,
              nbCommandes: nbStandard+nbAllergies,
              nbStandard,
              nbAllergies,
              details: `${nbStandard} standards, ${nbAllergies} spéciales`,
            }
          } catch (error) {
            console.error(`Error getting allergy stats for plat ${plat.id}:`, error)
            return {
              id: plat.id,
              nom: plat.nom,
              nbCommandes: 0,
              nbStandard: 0,
              nbAllergies: 0,
              details: `0 standards, 0 spéciales`,
            }
          }
        })
      )

      return platsWithDetails.filter(Boolean) as PlatOrderDetail[]
    } catch (error) {
      console.error(`Error fetching ${typePlat} data:`, error)
      return []
    }
  }

  useEffect(() => {
    if (!selectedDay) return
    fetchPlatsData()
  }, [selectedDay, isWeekView])

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
      setIsWeekView(false)
    } else {
      setSelectedDay(weekDays[0])
      setIsWeekView(false)
    }
  }

  const handleDayClick = (day: string) => {
    setSelectedDay(day)
    setIsWeekView(false)
  }

  const handleWeekView = () => {
    setIsWeekView(true)
  }

  const formatDateForApi = (day: string): string => {
    if (!day) return format(new Date(), "yyyy-MM-dd")
    
    try {
      const parts = day.split(" ")
      if (parts.length < 2) return format(new Date(), "yyyy-MM-dd")
      
      const datePart = parts[parts.length - 1]
      const [dd, mm] = datePart.split("/")
      
      if (!dd || !mm) {
        console.error("Invalid date format:", day)
        return format(new Date(), "yyyy-MM-dd")
      }
      
      const year = new Date().getFullYear()
      return `${year}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`
    } catch (error) {
      console.error("Error formatting date:", error)
      return format(new Date(), "yyyy-MM-dd")
    }
  }

  const filterPlats = (plats: PlatOrderDetail[]) => {
    if (!plats || plats.length === 0) return []
    return plats.filter((plat) => 
      plat.nom.toLowerCase().includes(search.toLowerCase())
    )
  }

  const handleRefresh = () => {
    fetchPlatsData()
  }

  return (
    <div className="p-6 w-full justify-center">
      <h1 className="text-center text-2xl font-semibold mb-4">
        SEMAINE {days[0]?.split(" ")[1]} - {days[4]?.split(" ")[1]}
      </h1>

      {/* Day selection buttons with date picker */}
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
              onClick={() => handleDayClick(day)}
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
            <Calendar 
              mode="single" 
              selected={date} 
              onSelect={handleDateChange} 
              className="border rounded-md" 
            />
          </PopoverContent>
        </Popover>
        
        <Button 
          variant="outline" 
          size="icon" 
          className="ml-2 border-[#F15928B2] text-[#F15928B2]" 
          onClick={handleRefresh}
          title="Rafraîchir les données"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Search input */}
      <div className="flex justify-end mb-6">
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

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F15928B2]"></div>
        </div>
      ) : noDataMessage ? (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center mt-4">
          <p className="text-lg text-gray-500">{noDataMessage}</p>
          <Button 
            className="mt-4 bg-[#F15928B2] hover:bg-[#F15928] transition-colors"
            onClick={handleRefresh}
          >
            Rafraîchir
          </Button>
        </div>
      ) : (
        <>
          {/* Plats Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Plats</h2>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-4 gap-4 p-4 border-b border-[#D1D2DB]">
                <span className="font-semibold">Nom du plat</span>
                <span className="font-semibold">Nombres de plats</span>
                <span className="font-semibold">Détails</span>
                <span className="font-semibold">Action</span>
              </div>

              {/* Table Rows */}
              {filterPlats(platsPlats).length > 0 ? (
                filterPlats(platsPlats).map((plat) => (
                  <div key={plat.id} className="grid grid-cols-4 gap-4 p-4 border-b border-[#D1D2DB]">
                    <span>{plat.nom}</span>
                    <span>{plat.nbCommandes}</span>
                    <div className="flex flex-col">
                      <span>{plat.nbStandard} standards</span>
                      <span>{plat.nbAllergies} spéciales</span>
                    </div>
                    <Link
                      href={`/commondes/plat-commondes?platId=${plat.id}&date=${formatDateForApi(selectedDay)}&isWeekView=${isWeekView}`}
                      className="text-[#F15928B2] hover:underline"
                    >
                      Voir plus
                    </Link>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">Aucun plat trouvé</div>
              )}
            </div>
          </div>

          {/* Entrées Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Entrées</h2>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-4 gap-4 p-4 border-b border-[#D1D2DB]">
                <span className="font-semibold">Nom du plat</span>
                <span className="font-semibold">Nombres de plats</span>
                <span className="font-semibold">Détails</span>
                <span className="font-semibold">Action</span>
              </div>

              {/* Table Rows */}
              {filterPlats(entreePlats).length > 0 ? (
                filterPlats(entreePlats).map((plat) => (
                  <div key={plat.id} className="grid grid-cols-4 gap-4 p-4 border-b border-[#D1D2DB]">
                    <span>{plat.nom}</span>
                    <span>{plat.nbCommandes}</span>
                    <div className="flex flex-col">
                      <span>{plat.nbStandard} standards</span>
                      <span>{plat.nbAllergies} spéciales</span>
                    </div>
                    <Link
                      href={`/commondes/plat-commondes?platId=${plat.id}&date=${formatDateForApi(selectedDay)}&isWeekView=${isWeekView}`}
                      className="text-[#F15928B2] hover:underline"
                    >
                      Voir plus
                    </Link>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">Aucune entrée trouvée</div>
              )}
            </div>
          </div>

          {/* Desserts Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Desserts</h2>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-4 gap-4 p-4 border-b border-[#D1D2DB]">
                <span className="font-semibold">Nom du plat</span>
                <span className="font-semibold">Nombres de plats</span>
                <span className="font-semibold">Détails</span>
                <span className="font-semibold">Action</span>
              </div>

              {/* Table Rows */}
              {filterPlats(dessertPlats).length > 0 ? (
                filterPlats(dessertPlats).map((plat) => (
                  <div key={plat.id} className="grid grid-cols-4 gap-4 p-4 border-b border-[#D1D2DB]">
                    <span>{plat.nom}</span>
                    <span>{plat.nbCommandes}</span>
                    <div className="flex flex-col">
                      <span>{plat.nbStandard} standards</span>
                      <span>{plat.nbAllergies} spéciales</span>
                    </div>
                    <Link
                      href={`/commondes/plat-commondes?platId=${plat.id}&date=${formatDateForApi(selectedDay)}&isWeekView=${isWeekView}`}
                      className="text-[#F15928B2] hover:underline"
                    >
                      Voir plus
                    </Link>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">Aucun dessert trouvé</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default CommandesPage