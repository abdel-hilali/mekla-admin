"use client"

import { useState, useEffect, useRef } from "react"
import { cn, getFormattedDate } from "@/lib/utils"
import type { MenuJourDto, Plat, MealSelection, WeekMenu } from "@/types/types"
import { Button } from "@/components/ui/button"
import useOrderStore from "@/stores/menu_jour_store"
import PlatDisplay from "@/components/cards/plat_display"
import AddPlat from "@/components/cards/plat_selector"
import PlatSelector from "@/components/pop_ups/plat_selector"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { addDays, format, startOfWeek } from "date-fns"
import { fr } from "date-fns/locale"
import { fetchWithAuth } from "@/apis/api"
import { useSearchParams } from "next/navigation"
import ValidationPopup from "./validation"


const MenuJourPage = () => {
  const searchParams = useSearchParams()
  const weekMenuParam = searchParams.get("weekMenu")

  const {
    days,
    orders,
    setDays,
    setPlatDejeuner,
    setPlatDiner,
    addEntree,
    addDessert,
    removeMealSelection,
    removeEntreDesertMealSelection,
    resetDay,
    addAltPlatDejeune,
    addAltrDiner,
    resetOrder,
  } = useOrderStore()
  const [selectedDay, setSelectedDay] = useState(days[0])
  const [weekMenuData, setWeekMenuData] = useState<WeekMenu>()
  const [currentDayMenu, setCurrentDayMenu] = useState<MenuJourDto | null>(null)
  const [selectorOpen, setSelectorOpen] = useState(false)
  const [selectorType, setSelectorType] = useState<"ENTREE" | "PLAT" | "DESSERT">("ENTREE")
  const [selectorPurpose, setSelectorPurpose] = useState<
    "platDejeuner" | "platDiner" | "platDejeunerAlt" | "platDinerAlt" | "entree" | "dessert"
  >("entree")
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [initialLoad, setInitialLoad] = useState(true)
  const lastSelectedDay = useRef(selectedDay)
  const [userModifiedDays, setUserModifiedDays] = useState<Set<string>>(new Set())
  const [displayKey, setDisplayKey] = useState(0)
  const [validationMessage, setValidationMessage] = useState("")
  const [showValidationPopup, setShowValidationPopup] = useState(false)

  const selectedDate = getFormattedDate(selectedDay)

  // Parse the weekMenu from URL parameters if available
  useEffect(() => {
    if (weekMenuParam) {
      try {
        const decodedMenu = JSON.parse(decodeURIComponent(weekMenuParam)) as WeekMenu
        setWeekMenuData(decodedMenu)

        // Set the date to the start date of the week menu
        if (decodedMenu.dateDebut) {
          const startDate = new Date(decodedMenu.dateDebut)
          setDate(startDate)

          // Generate the days for this week
          const weekStart = startOfWeek(startDate, { weekStartsOn: 1 })
          const weekDays = Array.from({ length: 5 }, (_, i) => {
            const day = addDays(weekStart, i)
            const dayName = format(day, "EEEE", { locale: fr })
            const dayDate = format(day, "dd/MM")
            return `${dayName} ${dayDate}`
          })

          // Update the days in the store
          setDays(weekDays)
          setSelectedDay(weekDays[0])

          // Initialize all days in the week
          if (decodedMenu.menuJours && decodedMenu.menuJours.length > 0) {
            initializeAllDaysFromApi(decodedMenu.menuJours)
          }
        }
      } catch (error) {
        console.error("Error parsing weekMenu parameter:", error)
        // If there's an error parsing the weekMenu, fall back to fetching data
        fetchWeekMenuData()
      }
    } else {
      // If no weekMenu parameter, fetch the data as before
      fetchWeekMenuData()
    }
    // This effect should only run once when the component mounts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekMenuParam, setDays])

  // Fetch the week menu data when the component mounts or when the date changes via calendar
  const fetchWeekMenuData = async () => {
    try {
      // Use the current date to get this week's Monday
      const today = date || new Date()
      const weekStart = startOfWeek(today, { weekStartsOn: 1 })
      const mondayDate = format(weekStart, "yyyy-MM-dd")
      const response = await fetchWithAuth(`http://localhost:8080/menu-week/by-date?dateDebut=${mondayDate}`)
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }
      const data = await response.json()
      if (data && data.length > 0) {
        setWeekMenuData(data[0])
        console.log(data[0])
        // Reset user modified days when changing weeks
        setUserModifiedDays(new Set())

        // Initialize all days in the week
        if (data[0].menuJours && data[0].menuJours.length > 0) {
          initializeAllDaysFromApi(data[0].menuJours)
        }
      } else {
      }
    } catch (error) {
      console.error("Error fetching week menu data:", error)
    }
  }

  // Fetch data when date changes
  useEffect(() => {
    // Always fetch new data when date changes, even if weekMenu was initially passed
    fetchWeekMenuData()
  }, [date])

  // Function to initialize all days from API data
  const initializeAllDaysFromApi = (menuJours: MenuJourDto[]) => {
    console.log("Initializing all days from API")

    // For each day in the week
    days.forEach((day) => {
      // Get the date from the day (e.g., "05/03" from "lundi 05/03")
      const datePart = day.split(" ")[1] // Get "05/03" part

      if (datePart) {
        // Convert to format that matches the API (YYYY-MM-DD)
        const currentYear = new Date().getFullYear()
        const [dayNum, month] = datePart.split("/")
        const formattedDate = `${currentYear}-${month.padStart(2, "0")}-${dayNum.padStart(2, "0")}`

        // Find the menu for this date
        const dayMenu = menuJours.find((menu) => menu.date === formattedDate)

        if (dayMenu) {
          const dayDate = getFormattedDate(day)
          console.log(`Initializing menu for ${day} (${dayDate})`)

          // Initialize this day's menu
          initializeMenuFromApi(dayMenu, dayDate)
        }
      }
    })
  }

  // Update currentDayMenu when weekMenuData or selectedDay changes
  useEffect(() => {
    if (weekMenuData && weekMenuData.menuJours && weekMenuData.menuJours.length > 0) {
      // Get the date from the selected day (e.g., "05/03" from "lundi 05/03")
      const datePart = selectedDay.split(" ")[1] // Get "05/03" part

      if (datePart) {
        // Convert to format that matches the API (YYYY-MM-DD)
        const currentYear = new Date().getFullYear()
        const [day, month] = datePart.split("/")
        const formattedDate = `${currentYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`

        console.log("Looking for menu with date:", formattedDate)

        // Find the menu for the selected date
        const dayMenu = weekMenuData.menuJours.find((menu) => menu.date === formattedDate)

        if (dayMenu) {
          setCurrentDayMenu(dayMenu)
          const dayChanged = lastSelectedDay.current !== selectedDay
          const dayNotModified = !userModifiedDays.has(selectedDate)

          if ((dayChanged && dayNotModified) || initialLoad) {
            console.log("Day changed and not modified by user, initializing from API")
            initializeMenuFromApi(dayMenu, selectedDate)
            if (initialLoad) setInitialLoad(false)
          }

          // Update the last selected day
          lastSelectedDay.current = selectedDay

          // Increment the display key to force re-render of PlatDisplay components
          setDisplayKey((prev) => prev + 1)
        }
      }
    } else {
      setCurrentDayMenu(null)
    }
  }, [weekMenuData, selectedDay, selectedDate, userModifiedDays, initialLoad])

  // Function to initialize menu from API data
  const initializeMenuFromApi = (dayMenu: MenuJourDto, date: string) => {
    console.log("Initializing menu from API for date:", date)
    console.log("Day menu data:", dayMenu)

    // Reset the day first
    resetDay(date)

    // Set main dishes if they exist
    if (dayMenu.platDejeunerId) {
      console.log(`Setting platDejeuner for ${date}: ${dayMenu.platDejeunerId}`)
      setPlatDejeuner(date, { id: dayMenu.platDejeunerId, quantity: 1 })
    } else {
      // Explicitly set to null if no platDejeunerId
      setPlatDejeuner(date, null)
    }

    if (dayMenu.platDinerId) {
      console.log(`Setting platDiner for ${date}: ${dayMenu.platDinerId}`)
      setPlatDiner(date, { id: dayMenu.platDinerId, quantity: 1 })
    } else {
      // Explicitly set to null if no platDinerId
      setPlatDiner(date, null)
    }

    // Add alternative dishes
    if (dayMenu.alternativesDejeunerIds && dayMenu.alternativesDejeunerIds.length > 0) {
      dayMenu.alternativesDejeunerIds.forEach((id) => {
        addAltPlatDejeune(date, { id, quantity: 1 })
      })
    }

    if (dayMenu.alternativesDinerIds && dayMenu.alternativesDinerIds.length > 0) {
      dayMenu.alternativesDinerIds.forEach((id) => {
        addAltrDiner(date, { id, quantity: 1 })
      })
    }

    // Add entrees
    if (dayMenu.entreesJoursIds && dayMenu.entreesJoursIds.length > 0) {
      dayMenu.entreesJoursIds.forEach((id) => {
        addEntree(date, { id, quantity: 1 })
      })
    }

    // Add desserts
    if (dayMenu.dessertsJoursIds && dayMenu.dessertsJoursIds.length > 0) {
      dayMenu.dessertsJoursIds.forEach((id) => {
        addDessert(date, { id, quantity: 1 })
      })
    }

    console.log("Menu initialized for date:", date)
  }

  // Initialize the order for the selected day if it doesn't exist
  useEffect(() => {
    if (!orders[selectedDate]) {
      // Initialize with empty values
      setPlatDejeuner(selectedDate, null)
      setPlatDiner(selectedDate, null)
    }

    // Increment the display key to force re-render of PlatDisplay components
    setDisplayKey((prev) => prev + 1)
  }, [selectedDate, orders, setPlatDejeuner, setPlatDiner])

  const currentOrder = orders[selectedDate] || {
    date: selectedDate,
    platDejeuner: null,
    platDiner: null,
    entrees: [],
    desserts: [],
    platDejeunerAlt: [],
    platDinerAlt: [],
  }

  const openSelector = (
    type: "ENTREE" | "PLAT" | "DESSERT",
    purpose: "platDejeuner" | "platDiner" | "platDejeunerAlt" | "platDinerAlt" | "entree" | "dessert",
  ) => {
    // Check if at least one main dish is selected for entrées and desserts
    if ((purpose === "entree" || purpose === "dessert") && !currentOrder.platDejeuner && !currentOrder.platDiner) {
      setValidationMessage(
        "Veuillez sélectionner au moins un plat principal (déjeuner ou dîner) avant d'ajouter des entrées ou desserts.",
      )
      setShowValidationPopup(true)
      return
    }

    // Check if main dish is selected for alternatives
    if (purpose === "platDejeunerAlt" && !currentOrder.platDejeuner) {
      setValidationMessage("Veuillez sélectionner un plat principal pour le déjeuner avant d'ajouter des alternatives.")
      setShowValidationPopup(true)
      return
    }

    if (purpose === "platDinerAlt" && !currentOrder.platDiner) {
      setValidationMessage("Veuillez sélectionner un plat principal pour le dîner avant d'ajouter des alternatives.")
      setShowValidationPopup(true)
      return
    }

    // If all conditions are met, open the selector
    setSelectorType(type)
    setSelectorPurpose(purpose)
    setSelectorOpen(true)
  }

  const handleDateChange = (newDate: Date | undefined) => {
    if (!newDate) return

    setDate(newDate)

    // Reset the entire order store when changing dates
    resetOrder()

    // Reset user modified days when changing weeks
    setUserModifiedDays(new Set())

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

    // Set initialLoad to true to force reloading data for all days
    setInitialLoad(true)

    // Increment the display key to force re-render of PlatDisplay components
    setDisplayKey((prev) => prev + 1)
  }

  const handlePlatSelect = (plat: Plat) => {
    const mealSelection: MealSelection = { id: plat.id, quantity: 1 }

    // Mark this day as modified by the user
    const newUserModifiedDays = new Set(userModifiedDays)
    newUserModifiedDays.add(selectedDate)
    setUserModifiedDays(newUserModifiedDays)

    switch (selectorPurpose) {
      case "platDejeuner":
        setPlatDejeuner(selectedDate, mealSelection)
        break
      case "platDiner":
        setPlatDiner(selectedDate, mealSelection)
        break
      case "entree":
        addEntree(selectedDate, mealSelection)
        break
      case "dessert":
        addDessert(selectedDate, mealSelection)
        break
      case "platDejeunerAlt":
        addAltPlatDejeune(selectedDate, mealSelection)
        break
      case "platDinerAlt":
        addAltrDiner(selectedDate, mealSelection)
        break
    }

    // Increment the display key to force re-render of PlatDisplay components
    setDisplayKey((prev) => prev + 1)
  }

  const handleRemovePlat = (type: keyof Omit<typeof currentOrder, "date">, id: number) => {
    // Mark this day as modified by the user
    const newUserModifiedDays = new Set(userModifiedDays)
    newUserModifiedDays.add(selectedDate)
    setUserModifiedDays(newUserModifiedDays)

    // Handle cascading removals
    if (type === "platDejeuner") {
      // Remove all déjeuner alternatives
      if (currentOrder.platDejeunerAlt && currentOrder.platDejeunerAlt.length > 0) {
        currentOrder.platDejeunerAlt.forEach((alt) => {
          removeEntreDesertMealSelection(selectedDate, "platDejeunerAlt", alt.id)
        })
      }

      // If both main dishes will be removed, also remove entrées and desserts
      if (!currentOrder.platDiner) {
        if (currentOrder.entrees && currentOrder.entrees.length > 0) {
          currentOrder.entrees.forEach((entree) => {
            removeEntreDesertMealSelection(selectedDate, "entrees", entree.id)
          })
        }
        if (currentOrder.desserts && currentOrder.desserts.length > 0) {
          currentOrder.desserts.forEach((dessert) => {
            removeEntreDesertMealSelection(selectedDate, "desserts", dessert.id)
          })
        }
      }
    } else if (type === "platDiner") {
      // Remove all dîner alternatives
      if (currentOrder.platDinerAlt && currentOrder.platDinerAlt.length > 0) {
        currentOrder.platDinerAlt.forEach((alt) => {
          removeEntreDesertMealSelection(selectedDate, "platDinerAlt", alt.id)
        })
      }

      // If both main dishes will be removed, also remove entrées and desserts
      if (!currentOrder.platDejeuner) {
        if (currentOrder.entrees && currentOrder.entrees.length > 0) {
          currentOrder.entrees.forEach((entree) => {
            removeEntreDesertMealSelection(selectedDate, "entrees", entree.id)
          })
        }
        if (currentOrder.desserts && currentOrder.desserts.length > 0) {
          currentOrder.desserts.forEach((dessert) => {
            removeEntreDesertMealSelection(selectedDate, "desserts", dessert.id)
          })
        }
      }
    }

    // Perform the actual removal
    if (type === "platDejeuner" || type === "platDiner") {
      removeMealSelection(selectedDate, type, id)
    } else {
      removeEntreDesertMealSelection(selectedDate, type, id)
    }

    // Increment the display key to force re-render of PlatDisplay components
    setDisplayKey((prev) => prev + 1)
  }

  const handleSave = async () => {
    // Here you would implement the save functionality
    // For example, sending the currentOrder to your backend
    console.log("Saving menu for", selectedDate, currentOrder)
    alert("Menu enregistré avec succès!")
  }

  const handleCancel = () => {
    // Reset the current day's order
    resetDay(selectedDate)

    // If there's API data for this day, reinitialize from it
    if (currentDayMenu) {
      initializeMenuFromApi(currentDayMenu, selectedDate)
    }

    // Remove this day from the user modified days
    const newUserModifiedDays = new Set(userModifiedDays)
    newUserModifiedDays.delete(selectedDate)
    setUserModifiedDays(newUserModifiedDays)

    // Increment the display key to force re-render of PlatDisplay components
    setDisplayKey((prev) => prev + 1)
  }

  // Show loading state while fetching data
  if (!weekMenuData) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div className="p-6 w-full max-w-6xl  items-start">
      <h1 className="text-left text-2xl font-semibold mb-4">
        MENU DE LA SEMAINE {days[0].split(" ")[1]} - {days[4].split(" ")[1]}
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
            <Calendar mode="single" selected={date} onSelect={handleDateChange} className="border rounded-md" />
          </PopoverContent>
        </Popover>
      </div>

      {/* Menu content */}
      <div className="space-y-8">
        {/* Entrée section */}
        <section>
          <h2 className="text-xl font-semibold mb-3 text-left">Entrée</h2>
          <div className="flex flex-wrap gap-4">
            {currentOrder.entrees?.map((entree) => (
              <PlatDisplay
                key={`${entree.id}-${displayKey}`}
                id={entree.id}
                onRemove={() => handleRemovePlat("entrees", entree.id)}
              />
            ))}
            <AddPlat onClick={() => openSelector("ENTREE", "entree")} />
          </div>
        </section>

        {/* Déjeuner section */}
        <section>
          <h2 className="text-xl font-semibold mb-3 text-left">Déjeuner</h2>
          <div className="flex">
            <div className="flexjustify-start">
              <h3 className="text-md font-medium mb-3 text-left">Plat principal :</h3>
              <div className="flex">
                {currentOrder.platDejeuner ? (
                  <PlatDisplay
                    key={`dejeuner-${currentOrder.platDejeuner.id}-${displayKey}`}
                    id={currentOrder.platDejeuner.id}
                    onRemove={() => handleRemovePlat("platDejeuner", currentOrder.platDejeuner!.id)}
                  />
                ) : (
                  <AddPlat onClick={() => openSelector("PLAT", "platDejeuner")} />
                )}
              </div>
            </div>

            <div className="w-px bg-gray-300 mx-6"></div>

            <div className="flex-1">
              <h3 className="text-md font-medium mb-3 text-left">Plat substitutionnels :</h3>
              <div className="flex flex-wrap gap-4">
                {currentOrder.platDejeunerAlt?.map((entree) => (
                  <PlatDisplay
                    key={`dejeunerAlt-${entree.id}-${displayKey}`}
                    id={entree.id}
                    onRemove={() => handleRemovePlat("platDejeunerAlt", entree.id)}
                  />
                ))}
                {/* In a real app, you would map through alternative dishes here */}
                <AddPlat onClick={() => openSelector("PLAT", "platDejeunerAlt")} />
              </div>
            </div>
          </div>
        </section>

        {/* Diner section */}
        <section>
          <h2 className="text-xl font-semibold mb-3 text-left">Diner</h2>
          <div className="flex">
            <div className="flexjustify-start">
              <h3 className="text-md font-medium mb-3 text-left">Plat principal :</h3>
              <div className="flex">
                {currentOrder.platDiner ? (
                  <PlatDisplay
                    key={`diner-${currentOrder.platDiner.id}-${displayKey}`}
                    id={currentOrder.platDiner.id}
                    onRemove={() => handleRemovePlat("platDiner", currentOrder.platDiner!.id)}
                  />
                ) : (
                  <AddPlat onClick={() => openSelector("PLAT", "platDiner")} />
                )}
              </div>
            </div>

            <div className="w-px bg-gray-300 mx-6"></div>

            <div className="flex-1">
              <h3 className="text-md font-medium mb-3 text-left">Plat substitutionnels :</h3>
              <div className="flex flex-wrap gap-4">
                {/* In a real app, you would map through alternative dishes here */}
                {currentOrder.platDinerAlt?.map((entree) => (
                  <PlatDisplay
                    key={`dinerAlt-${entree.id}-${displayKey}`}
                    id={entree.id}
                    onRemove={() => handleRemovePlat("platDinerAlt", entree.id)}
                  />
                ))}
                <AddPlat onClick={() => openSelector("PLAT", "platDinerAlt")} />
              </div>
            </div>
          </div>
        </section>

        {/* Dessert section */}
        <section>
          <h2 className="text-xl font-semibold mb-3 text-left">Dessert</h2>
          <div className="flex flex-wrap gap-4">
            {currentOrder.desserts?.map((dessert) => (
              <PlatDisplay
                key={`dessert-${dessert.id}-${displayKey}`}
                id={dessert.id}
                onRemove={() => handleRemovePlat("desserts", dessert.id)}
              />
            ))}
            <AddPlat onClick={() => openSelector("DESSERT", "dessert")} />
          </div>
        </section>

        {/* Action buttons */}
        <div className="flex justify-start gap-4 mt-8">
          <Button className="w-1/4 bg-[#F15928] hover:bg-[#d64d22] text-white px-6" onClick={handleSave}>
            Enregistrer
          </Button>
          <Button
            variant="outline"
            className="w-1/4 border-[#F15928] text-[#F15928] hover:bg-[#fff5f2]"
            onClick={handleCancel}
          >
            Annuler
          </Button>
        </div>
      </div>

      <ValidationPopup
        message={validationMessage}
        isOpen={showValidationPopup}
        onClose={() => setShowValidationPopup(false)}
      />

      {/* Plat selector dialog */}
      <PlatSelector
        open={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        onSelect={handlePlatSelect}
        type={selectorType}
      />
    </div>
  )
}

export default MenuJourPage

