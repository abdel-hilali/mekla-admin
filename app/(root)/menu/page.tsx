"use client"
import type { WeekMenu } from "@/types/types"
import type React from "react"
import { useState, useEffect, useRef } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Calendar } from "lucide-react"
import { getMenuWeeksForMonth } from "@/apis/menu_api"
import { useRouter } from "next/navigation"

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

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation() // Prevent row click event
    // Here you would typically call an API to delete the menu
    // For now, we'll just update the UI
    setMenus(menus.filter((menu) => menu.id !== id))
  }

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>, id: number) => {
    e.stopPropagation() // Prevent row click event
    const isPublied = e.target.value === "published"
    // Here you would typically call an API to update the menu status
    // For now, we'll just update the UI
    setMenus((prevMenus) => prevMenus.map((m) => (m.id === id ? { ...m, isPublied } : m)))
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      setSelectedDate(new Date(e.target.value))
      setIsCalendarOpen(false)
    }
  }

  // Navigate to MenuJourPage with the selected week data
  const handleWeekClick = (menu: WeekMenu) => {
    // Encode the menu data as a URL parameter
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

  // Format the date to show day and month name in French
  const formattedDate = format(selectedDate, "d MMMM yyyy", { locale: fr })
  // Get month name for display
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
        <a href="/menu/menu_jour">
          <button className="flex items-center space-x-2 bg-[#F15928] text-white px-4 py-2 rounded-lg">
            <span>+</span>
            <span>Créer un menu</span>
          </button>
        </a>
      </div>

      {/* Search Input */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Recherche"
            className="w-full md:w-64 p-2 pl-10 rounded-lg bg-white placeholder-[#8BA3CB]"
          />
          <img
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
              <div className="flex items-center space-x-2">
                <select
                  value={menu.isPublied ? "published" : "archived"}
                  onChange={(e) => handleStatusChange(e, menu.id)}
                  className={`p-1 rounded-lg ${
                    menu.isPublied ? "bg-[#00D37F] bg-opacity-15" : "bg-[#F6A7B5] bg-opacity-50"
                  }`}
                  onClick={(e) => e.stopPropagation()} // Prevent row click event
                >
                  <option value="published">Publié</option>
                  <option value="archived">Archivé</option>
                </select>

                <button
                  onClick={(e) => handleDelete(e, menu.id)}
                  className="text-[#F15928] hover:text-[#F15928] hover:opacity-80"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

export default MenuPage

