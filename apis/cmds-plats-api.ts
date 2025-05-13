import { fetchWithAuth } from "./api"

export interface PlatAllergyStats {
  totalAvecAllergie: number
  totalSansAllergie: number
  avecAllergie: UserOrder[]
  sansAllergie: UserOrder[]
}

export interface UserOrder {
  userId: number
  typeUser: string
  nbPlatsCommandes: number
}

export interface PlatOrderDetail {
  id: number
  nom: string
  nbCommandes: number
  nbStandard?: number
  nbAllergies?: number
  details?: string
}

export async function getPlatOrdersByDate(
  date: string,
  typePlat?: string,
  isWeekView = false,
): Promise<PlatOrderDetail[] | null> {
  try {
    const weekParam = isWeekView ? "&week=true" : ""
    const typeParam = typePlat || "ALL"
    const endpoint = `/api/plats/menujours/plats-details?date=${date}&typePlat=${typeParam}${weekParam}`

    const response = await fetchWithAuth(endpoint)

    if (!response.ok) {
      if (response.status === 404) {
        return null // No data exists for this date
      }
      throw new Error("Failed to fetch plat orders for date")
    }

    const data = await response.json()
    
    if (!data || data.length === 0) {
      return null // API returned empty array
    }

    const platsWithDetails = await Promise.all(
      data.map(async (plat: any) => {
        try {
          const allergyStats = isWeekView
            ? await getPlatAllergyStatsByWeek(plat.id, date)
            : await getPlatAllergyStatsByDay(plat.id, date)

          const nbAllergies = allergyStats?.totalAvecAllergie || 0
          const nbStandard = Math.max(0, plat.nbCommandes - nbAllergies)

          return {
            id: plat.id,
            nom: plat.nom,
            nbCommandes: plat.nbCommandes,
            nbStandard,
            nbAllergies,
            details: `${nbStandard} standards, ${nbAllergies} spéciales`,
          }
        } catch (error) {
          console.error(`Error getting allergy stats for plat ${plat.id}:`, error)
          return {
            id: plat.id,
            nom: plat.nom,
            nbCommandes: plat.nbCommandes,
            nbStandard: plat.nbCommandes,
            nbAllergies: 0,
            details: `${plat.nbCommandes} standards, 0 spéciales`,
          }
        }
      }),
    )

    return platsWithDetails
  } catch (error) {
    console.error("Error fetching plat orders by date:", error)
    return null
  }
}

export async function getPlatAllergyStatsByDay(platId: number, date: string): Promise<PlatAllergyStats | null> {
  try {
    const response = await fetchWithAuth(`/api/plats/${platId}/allergy-stats?date=${date}`)

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error("Failed to fetch plat allergy stats for day")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching plat allergy stats by day:", error)
    return null
  }
}

export async function getPlatAllergyStatsByWeek(platId: number, startDate: string): Promise<PlatAllergyStats | null> {
  try {
    const response = await fetchWithAuth(
      `/api/plats/${platId}/allergy-stats/week?dateDebut=${startDate}`,
    )

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error("Failed to fetch plat allergy stats for week")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching plat allergy stats by week:", error)
    return null
  }
}

export async function getPlatById(platId: number) {
  try {
    const response = await fetchWithAuth(`/api/plats/${platId}`)

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error("Failed to fetch plat details")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching plat details:", error)
    return null
  }
}