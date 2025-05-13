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
import { createOrUpdateMenuWeek } from "@/apis/menu_api"

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

  useEffect(() => {
    if (weekMenuParam) {
      try {
        const decodedMenu = JSON.parse(decodeURIComponent(weekMenuParam)) as WeekMenu
        setWeekMenuData(decodedMenu)

        if (decodedMenu.dateDebut) {
          const startDate = new Date(decodedMenu.dateDebut)
          setDate(startDate)

          const weekStart = startOfWeek(startDate, { weekStartsOn: 1 })
          const weekDays = Array.from({ length: 5 }, (_, i) => {
            const day = addDays(weekStart, i)
            const dayName = format(day, "EEEE", { locale: fr })
            const dayDate = format(day, "dd/MM")
            return `${dayName} ${dayDate}`
          })

          setDays(weekDays)
          setSelectedDay(weekDays[0])

          if (decodedMenu.menuJours && decodedMenu.menuJours.length > 0) {
            initializeAllDaysFromApi(decodedMenu.menuJours)
          }
        }
      } catch (error) {
        console.error("Error parsing weekMenu parameter:", error)
        fetchWeekMenuData()
      }
    } else {
      fetchWeekMenuData()
    }
  }, [weekMenuParam, setDays])

  const fetchWeekMenuData = async () => {
    try {
      const today = date || new Date()
      const weekStart = startOfWeek(today, { weekStartsOn: 1 })
      const mondayDate = format(weekStart, "yyyy-MM-dd")
      const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/menu-week/by-date?dateDebut=${mondayDate}`)
      if (!response.ok) {
        console.log("Network response was not ok")
      }
      const data = await response.json()
      if (data && data.length > 0) {
        setWeekMenuData(data[0])
        setUserModifiedDays(new Set())
        if (data[0].menuJours && data[0].menuJours.length > 0) {
          initializeAllDaysFromApi(data[0].menuJours)
        }
      }
    } catch (error) {
      console.error("Error fetching week menu data:", error)
    }
  }

  useEffect(() => {
    fetchWeekMenuData()
  }, [date])

  const initializeAllDaysFromApi = (menuJours: MenuJourDto[]) => {
    days.forEach((day) => {
      const datePart = day.split(" ")[1]
      if (datePart) {
        const currentYear = new Date().getFullYear()
        const [dayNum, month] = datePart.split("/")
        const formattedDate = `${currentYear}-${month.padStart(2, "0")}-${dayNum.padStart(2, "0")}`
        const dayMenu = menuJours.find((menu) => menu.date === formattedDate)
        if (dayMenu) {
          const dayDate = getFormattedDate(day)
          initializeMenuFromApi(dayMenu, dayDate)
        }
      }
    })
  }

  useEffect(() => {
    if (weekMenuData && weekMenuData.menuJours && weekMenuData.menuJours.length > 0) {
      const datePart = selectedDay.split(" ")[1]
      if (datePart) {
        const currentYear = new Date().getFullYear()
        const [day, month] = datePart.split("/")
        const formattedDate = `${currentYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
        const dayMenu = weekMenuData.menuJours.find((menu) => menu.date === formattedDate)
        if (dayMenu) {
          setCurrentDayMenu(dayMenu)
          const dayChanged = lastSelectedDay.current !== selectedDay
          const dayNotModified = !userModifiedDays.has(selectedDate)
          if ((dayChanged && dayNotModified) || initialLoad) {
            initializeMenuFromApi(dayMenu, selectedDate)
            if (initialLoad) setInitialLoad(false)
          }
          lastSelectedDay.current = selectedDay
          setDisplayKey((prev) => prev + 1)
        }
      }
    } else {
      setCurrentDayMenu(null)
    }
  }, [weekMenuData, selectedDay, selectedDate, userModifiedDays, initialLoad])

  const initializeMenuFromApi = (dayMenu: MenuJourDto, date: string) => {
    resetDay(date)

    if (dayMenu.platDejeunerId) {
      setPlatDejeuner(date, { id: dayMenu.platDejeunerId, quantity: 1 })
    } else {
      setPlatDejeuner(date, null)
    }

    if (dayMenu.platDinerId) {
      setPlatDiner(date, { id: dayMenu.platDinerId, quantity: 1 })
    } else {
      setPlatDiner(date, null)
    }

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

    if (dayMenu.entreesJoursIds && dayMenu.entreesJoursIds.length > 0) {
      dayMenu.entreesJoursIds.forEach((id) => {
        addEntree(date, { id, quantity: 1 })
      })
    }

    if (dayMenu.dessertsJoursIds && dayMenu.dessertsJoursIds.length > 0) {
      dayMenu.dessertsJoursIds.forEach((id) => {
        addDessert(date, { id, quantity: 1 })
      })
    }
  }

  useEffect(() => {
    if (!orders[selectedDate]) {
      setPlatDejeuner(selectedDate, null)
      setPlatDiner(selectedDate, null)
    }
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
    if ((purpose === "entree" || purpose === "dessert") && !currentOrder.platDejeuner && !currentOrder.platDiner) {
      setValidationMessage(
        "Veuillez sélectionner au moins un plat principal (déjeuner ou dîner) avant d'ajouter des entrées ou desserts.",
      )
      setShowValidationPopup(true)
      return
    }

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

    setSelectorType(type)
    setSelectorPurpose(purpose)
    setSelectorOpen(true)
  }

  const handleDateChange = (newDate: Date | undefined) => {
    if (!newDate) return
    setDate(newDate)
    resetOrder()
    setUserModifiedDays(new Set())
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
    } else {
      setSelectedDay(weekDays[0])
    }
    setInitialLoad(true)
    setDisplayKey((prev) => prev + 1)
  }

  const handlePlatSelect = (plat: Plat) => {
    const mealSelection: MealSelection = { id: plat.id, quantity: 1 }
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
    setDisplayKey((prev) => prev + 1)
  }

  const handleRemovePlat = (type: keyof Omit<typeof currentOrder, "date">, id: number) => {
    const newUserModifiedDays = new Set(userModifiedDays)
    newUserModifiedDays.add(selectedDate)
    setUserModifiedDays(newUserModifiedDays)

    if (type === "platDejeuner") {
      if (currentOrder.platDejeunerAlt && currentOrder.platDejeunerAlt.length > 0) {
        currentOrder.platDejeunerAlt.forEach((alt) => {
          removeEntreDesertMealSelection(selectedDate, "platDejeunerAlt", alt.id)
        })
      }
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
      if (currentOrder.platDinerAlt && currentOrder.platDinerAlt.length > 0) {
        currentOrder.platDinerAlt.forEach((alt) => {
          removeEntreDesertMealSelection(selectedDate, "platDinerAlt", alt.id)
        })
      }
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

    if (type === "platDejeuner" || type === "platDiner") {
      removeMealSelection(selectedDate, type, id)
    } else {
      removeEntreDesertMealSelection(selectedDate, type, id)
    }
    setDisplayKey((prev) => prev + 1)
  }

  const handleSave = async () => {
    try {
      // First map all days to menuJours
      const menuJoursWithDates = days.map(day => {
        const datePart = day.split(" ")[1];
        const currentYear = new Date().getFullYear();
        const [dayNum, month] = datePart.split("/");
        const formattedDate = `${currentYear}-${month.padStart(2, "0")}-${dayNum.padStart(2, "0")}`;
        const dayDate = new Date(formattedDate);
        
        const dayOrder = orders[getFormattedDate(day)] || {
          platDejeuner: null,
          platDiner: null,
          entrees: [],
          desserts: [],
          platDejeunerAlt: [],
          platDinerAlt: [],
        };
  
        return {
          date: formattedDate,
          jour: format(dayDate, "EEEE").toUpperCase(), // English day names
          platDejeunerId: dayOrder.platDejeuner?.id || null,
          platDinerId: dayOrder.platDiner?.id || null,
          alternativesDejeunerIds: dayOrder.platDejeunerAlt?.map(alt => alt.id) || [],
          alternativesDinerIds: dayOrder.platDinerAlt?.map(alt => alt.id) || [],
          entreesJoursIds: dayOrder.entrees?.map(entree => entree.id) || [],
          dessertsJoursIds: dayOrder.desserts?.map(dessert => dessert.id) || [],
        };
      });
  
      // Get Monday and Friday dates from the first day (assuming days array is ordered)
      const mondayDate = new Date(menuJoursWithDates[0].date);
      const fridayDate = new Date(menuJoursWithDates[4]?.date || addDays(mondayDate, 4));
  
      // Prepare final data - always use Monday-Friday range
      const menuData = {
        dateDebut: format(mondayDate, "yyyy-MM-dd"),
        dateFin: format(fridayDate, "yyyy-MM-dd"),
        status: "PUBLIÉ",
        menuJours: menuJoursWithDates
      };
  
      console.log("Saving menu data:", JSON.stringify(menuData, null, 2));
  
      // Send to API
      const response = await createOrUpdateMenuWeek(menuData);
  
      // Handle success
      setValidationMessage("Menu enregistré avec succès!");
      setShowValidationPopup(true);
      setWeekMenuData(response);
      setUserModifiedDays(new Set());
      setDisplayKey(prev => prev + 1);
      
    } catch (error) {
      console.error("Error saving menu:", error);
      
      let errorMessage = "Erreur lors de l'enregistrement du menu";
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
      }
      
      setValidationMessage(errorMessage);
      setShowValidationPopup(true);
    }
  };

  const handleCancel = () => {
    resetDay(selectedDate)
    if (currentDayMenu) {
      initializeMenuFromApi(currentDayMenu, selectedDate)
    }
    const newUserModifiedDays = new Set(userModifiedDays)
    newUserModifiedDays.delete(selectedDate)
    setUserModifiedDays(newUserModifiedDays)
    setDisplayKey((prev) => prev + 1)
  }

  if (!weekMenuData && weekMenuParam) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div className="p-6 w-full max-w-6xl items-start">
      <h1 className="text-left text-2xl font-semibold mb-4">
        MENU DE LA SEMAINE {days[0].split(" ")[1]} - {days[4].split(" ")[1]}
      </h1>

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

      <div className="space-y-8">
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
                <AddPlat onClick={() => openSelector("PLAT", "platDejeunerAlt")} />
              </div>
            </div>
          </div>
        </section>

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