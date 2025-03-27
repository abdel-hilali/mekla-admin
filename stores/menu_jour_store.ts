// This is a partial implementation to match your provided code
import { getMenuDays } from "@/lib/utils"
import type { DailyOrder, MealSelection } from "@/types/types"
import { create } from "zustand"

interface OrderState {
  days: string[]
  orders: { [date: string]: DailyOrder }

  setDays: (days: string[]) => void
  setPlatDejeuner: (date: string, plat: MealSelection | null) => void
  setPlatDiner: (date: string, plat: MealSelection | null) => void
  addEntree: (date: string, entree: MealSelection) => void
  addDessert: (date: string, dessert: MealSelection) => void
  addAltPlatDejeune: (date: string, entree: MealSelection) => void
  addAltrDiner: (date: string, dessert: MealSelection) => void
  removeMealSelection: (date: string, type: keyof Omit<DailyOrder, "date">, id: number) => void
  removeEntreDesertMealSelection: (date: string, type: keyof Omit<DailyOrder, "date">, id: number) => void
  resetOrder: () => void
  resetDay: (date: string) => void
}

const useOrderStore = create<OrderState>((set, get) => ({
  days: getMenuDays(),
  orders: {},

  resetDay: (date) =>
    set((state) => {
      const updatedOrders = { ...state.orders }
      if (updatedOrders[date]) {
        delete updatedOrders[date] // Delete the order for the specified date
      }
      return { orders: updatedOrders }
    }),

  setDays: (days) => set({ days }),

  setPlatDejeuner: (date, plat) =>
    set((state) => {
      // Initialize the order for this date if it doesn't exist
      const currentOrder = state.orders[date] || {
        date,
        platDejeuner: null,
        platDiner: null,
        entrees: [],
        desserts: [],
        platDejeunerAlt :[] ,
        platDinerAlt :[],
      }

      return {
        orders: {
          ...state.orders,
          [date]: { ...currentOrder, platDejeuner: plat },
        },
      }
    }),

  setPlatDiner: (date, plat) =>
    set((state) => {
      // Initialize the order for this date if it doesn't exist
      const currentOrder = state.orders[date] || {
        date,
        platDejeuner: null,
        platDiner: null,
        entrees: [],
        desserts: [],
        platDejeunerAlt :[] ,
        platDinerAlt :[],
      }

      return {
        orders: {
          ...state.orders,
          [date]: { ...currentOrder, platDiner: plat },
        },
      }
    }),

  addEntree: (date, entree) =>
    set((state) => {
      // Initialize the order for this date if it doesn't exist
      const currentOrder = state.orders[date] || {
        date,
        platDejeuner: null,
        platDiner: null,
        entrees: [],
        desserts: [],
        platDejeunerAlt :[] ,
        platDinerAlt :[],
      }

      // Check if this entree already exists
      const entreeExists = currentOrder.entrees.some((e) => e.id === entree.id)
      if (entreeExists) return state // Don't add duplicates

      return {
        orders: {
          ...state.orders,
          [date]: {
            ...currentOrder,
            entrees: [...currentOrder.entrees, entree],
          },
        },
      }
    }),
    addAltPlatDejeune: (date, entree) =>
        set((state) => {
          // Initialize the order for this date if it doesn't exist
          const currentOrder = state.orders[date] || {
            date,
            platDejeuner: null,
            platDiner: null,
            entrees: [],
            desserts: [],
            platDejeunerAlt :[] ,
            platDinerAlt :[],
          }
    
          // Check if this entree already exists
          const entreeExists = currentOrder.platDejeunerAlt.some((e) => e.id === entree.id) || entree.id=== currentOrder.platDejeuner?.id
          if (entreeExists) return state // Don't add duplicates
    
          return {
            orders: {
              ...state.orders,
              [date]: {
                ...currentOrder,
                platDejeunerAlt: [...currentOrder.platDejeunerAlt, entree],
              },
            },
          }
        }),

        addAltrDiner: (date, entree) =>
            set((state) => {
              // Initialize the order for this date if it doesn't exist
              const currentOrder = state.orders[date] || {
                date,
                platDejeuner: null,
                platDiner: null,
                entrees: [],
                desserts: [],
                platDejeunerAlt :[] ,
                platDinerAlt :[],
              }
        
              // Check if this entree already exists
              const entreeExists = currentOrder.platDinerAlt.some((e) => e.id === entree.id) || entree.id=== currentOrder.platDiner?.id
              if (entreeExists) return state // Don't add duplicates
        
              return {
                orders: {
                  ...state.orders,
                  [date]: {
                    ...currentOrder,
                    platDinerAlt: [...currentOrder.platDinerAlt, entree],
                  },
                },
              }
            }),

  addDessert: (date, dessert) =>
    set((state) => {
      // Initialize the order for this date if it doesn't exist
      const currentOrder = state.orders[date] || {
        date,
        platDejeuner: null,
        platDiner: null,
        entrees: [],
        desserts: [],
        platDejeunerAlt :[] ,
        platDinerAlt :[],
      }

      // Check if this dessert already exists
      const dessertExists = currentOrder.desserts.some((d) => d.id === dessert.id)
      if (dessertExists) return state // Don't add duplicates

      return {
        orders: {
          ...state.orders,
          [date]: {
            ...currentOrder,
            desserts: [...currentOrder.desserts, dessert],
          },
        },
      }
    }),

  removeMealSelection: (date, type, id) =>
    set((state) => {
      const currentOrder = state.orders[date]
      if (!currentOrder) return state

      return {
        orders: {
          ...state.orders,
          [date]: {
            ...currentOrder,
            [type]: null,
          },
        },
      }
    }),

    removeEntreDesertMealSelection: (date, type, id) =>
        set((state) => {
          const currentOrder = state.orders[date];
          if (!currentOrder) return state;
      
          // Ensure currentOrder[type] is treated as an array, default to empty array if not
          const mealSelections = Array.isArray(currentOrder[type]) ? currentOrder[type] : [];
      
          return {
            orders: {
              ...state.orders,
              [date]: {
                ...currentOrder,
                [type]: mealSelections.filter((item) => item.id !== id),
              },
            },
          };
        }),
  resetOrder: () => set({ orders: {} }),
}))

export default useOrderStore

