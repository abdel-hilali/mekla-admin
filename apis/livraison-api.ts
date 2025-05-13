import { fetchWithAuth } from "./api"

// Get commands by delivery date
export async function getCommandesByDate(date: string): Promise<any[]> {
  try {
    const response = await fetchWithAuth(`/api/commandes/by-date?dateLivraison=${date}`)

    if (!response.ok) {
      if (response.status === 404) {
        return []
      }
      throw new Error("Failed to fetch commandes by date")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching commandes by date:", error)
    return []
  }
}

// Get commands by delivery date range (for a week)
export async function getCommandesByDateRange(startDate: string, endDate: string): Promise<any[]> {
  try {
    const response = await fetchWithAuth(
      `/api/commandes/by-date-range?startDate=${startDate}&endDate=${endDate}`,
    )

    if (!response.ok) {
      if (response.status === 404) {
        return []
      }
      throw new Error("Failed to fetch commandes by date range")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching commandes by date range:", error)
    return []
  }
}

// Assign a delivery person to commands
export async function assignLivreurToCommandes(livreurId: number, commandeIds: number[]): Promise<void> {
  const response = await fetchWithAuth(`/api/livreurs/affecter-commandes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ livreurId, commandeIds }),
  })

  if (!response.ok) {
    throw new Error("Failed to assign livreur to commandes")
  }
}

// Remove a delivery person from a command
export async function removeLivreurFromCommande(commandeId: number): Promise<void> {
    const response = await fetchWithAuth(`/api/livreurs/${commandeId}/desaffecter-commandes`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    })
  
    if (!response.ok) {
      const errorText = await response.text()
      console.error("API Error:", errorText)
      throw new Error(`Failed to remove livreur from commande: ${response.status} ${errorText}`)
    }
  }