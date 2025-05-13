"use client"
import type { WeekMenu } from "@/types/types"
import type React from "react"
import { useState, useEffect, useRef } from "react"
import { format, startOfWeek, addDays } from "date-fns"
import { fr } from "date-fns/locale"
import { Calendar } from "lucide-react"
import { getMenuWeeksForMonth, updateMenuWeekStatus } from "@/apis/menu_api"
import { useRouter } from "next/navigation"
import Image from "next/image"

const MenuPage = () => {
  const router = useRouter()
  const [menus, setMenus] = useState<WeekMenu[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const calendarRef = useRef<HTMLDivElement>(null)

  // Fetch menu weeks when the selected date changes
  useEffect(() => {
    const fetchMenuWeeks = async () => {
      setLoading(true)
      try {
        const menuWeeks = await getMenuWeeksForMonth(selectedDate)
        setMenus(menuWeeks)
      } catch (error) {
        console.error("Error fetching menu weeks:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMenuWeeks()
  }, [selectedDate])



  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      setSelectedDate(new Date(e.target.value))
      setIsCalendarOpen(false)
    }
  }

  const handleWeekClick = (menu: WeekMenu) => {
    const encodedMenu = encodeURIComponent(JSON.stringify(menu))
    router.push(`/menu/menu_jour?weekMenu=${encodedMenu}`)
  }

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const formattedDate = format(selectedDate, "d MMMM yyyy", { locale: fr })
  const monthName = format(selectedDate, "MMMM yyyy", { locale: fr })

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: "#F5F7FA" }}>
      {/* Top Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold">
            Menus du mois : <span className="capitalize">{monthName}</span>
          </h1>

          {/* Date Picker */}
          <div className="relative" ref={calendarRef}>
            <div
              className="flex items-center space-x-2 p-2 rounded-lg border border-gray-300 bg-white cursor-pointer"
              onClick={() => setIsCalendarOpen(!isCalendarOpen)}
            >
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="capitalize">{formattedDate}</span>
            </div>

            {isCalendarOpen && (
              <div className="absolute z-10 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-2">
                <input
                  type="date"
                  value={format(selectedDate, "yyyy-MM-dd")}
                  onChange={handleDateChange}
                  className="p-2 border border-gray-300 rounded-lg w-full"
                />
              </div>
            )}
          </div>
        </div>
        <button 
          className="flex items-center space-x-2 bg-[#F15928] text-white px-4 py-2 rounded-lg"
          onClick={() => {
            const today = new Date();
            const weekStart = startOfWeek(today, { weekStartsOn: 1 });
            const weekEnd = addDays(weekStart, 6);
            
            const emptyWeekMenu: WeekMenu = {
              id: 0,
              isPublied: false,
              dateDebut: format(weekStart, "yyyy-MM-dd"),
              dateFin: format(weekEnd, "yyyy-MM-dd"),
              menuJours: Array.from({ length: 5 }).map((_, i) => {
                const day = addDays(weekStart, i);
                return {
                  id: 0,
                  jour: format(day, "EEEE", { locale: fr }).toUpperCase(),
                  date: format(day, "yyyy-MM-dd"),
                  platDejeunerId: null,
                  platDinerId: null,
                  alternativesDejeunerIds: [],
                  alternativesDinerIds: [],
                  entreesJoursIds: [],
                  dessertsJoursIds: [],
                };
              }),
            };
            
            router.push(`/menu/menu_jour?weekMenu=${encodeURIComponent(JSON.stringify(emptyWeekMenu))}`);
          }}
        >
          <span>+</span>
          <span>Créer un menu</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Recherche"
            className="w-full md:w-64 p-2 pl-10 rounded-lg bg-white placeholder-[#8BA3CB]"
          />
          <Image
          height={200}
          width={200}
            src="/logos/search.png"
            alt="Search"
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-4 gap-4 p-4 border-b border-[#D1D2DB]">
          <span className="font-semibold">ID</span>
          <span className="font-semibold">Date de début</span>
          <span className="font-semibold">Date de fin</span>
          <span className="font-semibold">Statut de publication</span>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#F15928] border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Chargement des menus...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && menus.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-600">Aucun menu trouvé pour ce mois.</p>
          </div>
        )}

        {/* Week Cards */}
        {!loading &&
          menus.map((menu) => (
            <div
              key={menu.id}
              className="grid grid-cols-4 gap-4 p-4 hover:bg-[#F15928] hover:bg-opacity-10 transition-colors cursor-pointer border-b border-[#D1D2DB] last:border-b-0"
              onClick={() => handleWeekClick(menu)}
            >
              <span>{menu.id}</span>
              <span>{menu.dateDebut}</span>
              <span>{menu.dateFin}</span>
              <div>
                  <span className="px-3 py-1 bg-[#00D37F] bg-opacity-15 text-[#00D37F] rounded-lg">Publié</span>
                
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

export default MenuPage