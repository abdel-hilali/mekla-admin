import { create } from "zustand"
import { getFormattedDate } from "@/lib/utils"

export interface PlatDetail {
  id: number
  nom: string
  nbCommandes: number
}

export interface PlatStats {
  typeUserCounts: Record<string, number>
  usersByCategory: {
    PERTE_DE_POID: UserStat[]
    REEQUILIBRAGE_ALIMENTAIRE: UserStat[]
    PRISE_DE_MASSE: UserStat[]
  }
}

export interface UserStat {
  userId: number
  typeUser: string
  nbPlatsCommandes: number
}

interface ProductionState {
  selectedDay: string
  isWeekView: boolean
  selectedDate: string
  platDetails: PlatDetail[]
  selectedPlatId: number | null
  selectedPlatStats: PlatStats | null

  // Actions
  setSelectedDay: (day: string) => void
  setIsWeekView: (isWeek: boolean) => void
  setSelectedDate: (date: string) => void
  setPlatDetails: (details: PlatDetail[]) => void
  setSelectedPlatId: (id: number | null) => void
  setSelectedPlatStats: (stats: PlatStats | null) => void
}

const useProductionStore = create<ProductionState>((set) => ({
  selectedDay: "",
  isWeekView: false,
  selectedDate: "",
  platDetails: [],
  selectedPlatId: null,
  selectedPlatStats: null,

  // Actions
  setSelectedDay: (day) => set({ selectedDay: day }),
  setIsWeekView: (isWeek) => set({ isWeekView: isWeek }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setPlatDetails: (details) => set({ platDetails: details }),
  setSelectedPlatId: (id) => set({ selectedPlatId: id }),
  setSelectedPlatStats: (stats) => set({ selectedPlatStats: stats }),
}))

export default useProductionStore
