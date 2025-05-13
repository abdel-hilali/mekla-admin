import { fetchWithAuth } from "./api"
import type { PlatDetail, PlatStats } from "@/stores/production-store"

// Get plats for a specific day
export async function getPlatsByDate(date: string, typePlat = "ALL"): Promise<PlatDetail[]> {
  try {
    const response = await fetchWithAuth(
      `/api/plats/menujours/plats-details?date=${date}&typePlat=${typePlat}`,
    )

    if (!response.ok) {
      throw new Error("Failed to fetch plats for date")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching plats by date:", error)
    return []
  }
}

// Get plat stats for a specific day
export async function getPlatStatsByDay(platId: number, date: string): Promise<PlatStats | null> {
  try {
    const response = await fetchWithAuth(`/api/plats/${platId}/stats-day?date=${date}`)

    if (!response.ok) {
      throw new Error("Failed to fetch plat stats for day")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching plat stats by day:", error)
    return null
  }
}

// Get plat stats for a week
export async function getPlatStatsByWeek(platId: number, startDate: string): Promise<PlatStats | null> {
  try {
    const response = await fetchWithAuth(`/api/plats/${platId}/stats-week?dateDebut=${startDate}`)

    if (!response.ok) {
      throw new Error("Failed to fetch plat stats for week")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching plat stats by week:", error)
    return null
  }
}