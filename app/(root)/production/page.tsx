"use client"

import { useState, useEffect } from "react"
import { cn, getFormattedDate, getMenuDays } from "@/lib/utils"
import type { MenuJourDto, Plat, MealSelection, WeekMenu, MenuPlat } from "@/types/types"
import { Button } from "@/components/ui/button"
import useOrderStore from "@/stores/menu_jour_store"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { addDays, format, startOfWeek } from "date-fns"
import { fr } from "date-fns/locale"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import PlatAllCMD from "@/components/cards/plat_all_commonde"

const mockData: MenuPlat[] = [
  { 
    id: 70,  
    user1s: [{ id: 19, quantite: 1 }, { id: 20, quantite: 1 }, { id: 21, quantite: 1 }],
    user2s: [{ id: 19, quantite: 2 }, { id: 20, quantite: 2 }, { id: 21, quantite: 2 }],
    user3s: [{ id: 19, quantite: 2 }, { id: 20, quantite: 2 }, { id: 21, quantite: 2 }]
  },
  { 
    id: 71,  
    user1s: [{ id: 19, quantite: 2 }, { id: 20, quantite: 2 }, { id: 21, quantite: 2 }],
    user2s: [{ id: 19, quantite: 1 }],
    user3s: [{ id: 19, quantite: 3 }, { id: 20, quantite: 3 }, { id: 21, quantite: 3 }]
  },
  { 
    id: 72,  
    user1s: [{ id: 19, quantite: 1 }, { id: 20, quantite: 1 }, { id: 21, quantite: 1 }],
    user2s: [{ id: 19, quantite: 1 }, { id: 20, quantite: 1 }],
    user3s: [{ id: 19, quantite: 1 }, { id: 20, quantite: 1 }, { id: 21, quantite: 1 }]
  }
];


const ProductionPage = () => {
  const {
    days,
    orders,
    setDays,
    setPlatDejeuner,
    setPlatDiner,
  } = useOrderStore()
  const [selectedDay, setSelectedDay] = useState(days[0])
  const [menuData, setMenuData] = useState<MenuJourDto | null>(null)
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Plats", "Desserts", "Entrées"];

  const selectedDate = getFormattedDate(selectedDay)
  const [platsList, setplatsList] = useState<MenuPlat[]>(mockData);

  // Initialize the order for the selected day if it doesn't exist
  useEffect(() => {
    if (!orders[selectedDate]) {
      // Initialize with empty values
      setPlatDejeuner(selectedDate, null)
      setPlatDiner(selectedDate, null)
    }
  }, [selectedDate, orders, setPlatDejeuner, setPlatDiner])


  const handleDateChange = (newDate: Date | undefined) => {
    if (!newDate) return

    setDate(newDate)

    // Get the Monday of the week containing the selected date
    const weekStart = startOfWeek(newDate, { weekStartsOn: 1 })

    // Generate the days of that week (Monday to Friday)
    const weekDays = Array.from({ length: 5 }, (_, i) => {
      const day = addDays(weekStart, i)
      const dayName = format(day, "EEEE", { locale: fr })
      const dayDate = format(day, "dd/MM")
      return `${dayName} ${dayDate}`
    })

    // Update the days in the store
    setDays(weekDays)

    // Select the day that was clicked in the calendar
    const selectedDayFormat = format(newDate, "EEEE dd/MM", { locale: fr })
    if (weekDays.includes(selectedDayFormat)) {
      setSelectedDay(selectedDayFormat)
    } else {
      // If the selected day is weekend, select Monday by default
      setSelectedDay(weekDays[0])
    }
  }




  return (
    //days list :
    <div className="p-6 w-full   justify-center">
      <h1 className="text-center text-2xl font-semibold mb-4">
        SEMAINE {days[0].split(" ")[1]} - {days[4].split(" ")[1]}
      </h1>
      
       {/* Day selection buttons with date picker */}
       <div className="flex flex-wrap w-full mb-6 items-center">
        <div className="flex flex-wrap flex-1">
          {days.map((day) => (
            <button
              key={day}
              className={cn(
                "flex-1 px-4 py-2 border text-sm font-semibold transition-all",
                selectedDay === day ? "bg-[#F15928B2] text-white" : "text-[#F15928B2] border-[#F15928B2]",
              )}
              onClick={() => setSelectedDay(day)}
            >
              {day.substring(0, day.length - 3)}
            </button>
          ))}
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
      </div>

      {/*search and filter :*/}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm ${
                selectedCategory === category
                  ? "bg-[#F15928]/20 text-[#F15928]"
                  : "text-gray-600 hover:bg-gray-300"
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
      
       {/* Table Section */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-5 gap-4 p-4 border-b border-[#D1D2DB]">
          <span className="font-semibold">Nom du plat</span>
          <span className="font-semibold">Nombres de plats</span>
          <span className="font-semibold">Rééquilibrage alimentaire</span>
          <span className="font-semibold">Perte de poids</span>
          <span className="font-semibold">Prise de masse</span>
        </div>

        {/* Week Cards */}
        {platsList.map((menu) => (
          <div
            key={menu.id}
          >
           <PlatAllCMD menuPlat={menu} date={selectedDay} isStartWeek={false}/>
          </div>
        ))}
      </div>
      

    </div>
  )
}

export default ProductionPage

