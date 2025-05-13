// src/apis/commande.ts
import { fetchWithAuth } from "@/apis/api"

// Define interfaces for the order data structure
export interface CommandePlat {
  id: number
  platId: number
  plat: {
    id: number
    nomPlat: string
    description: string
    ingredient: string
    photo: string
    typePlat: string
    platCalories: number | null
  }
  commandeJourId: number
  repasType: string
  quantite: number
}

export interface CommandeJour {
  id: number
  commandeId: number
  jour: string
  entreesDejeuner: CommandePlat[]
  platsDejeuner: CommandePlat[]
  dessertsDejeuner: CommandePlat[]
  entreesDiner: CommandePlat[]
  platsDiner: CommandePlat[]
  dessertsDiner: CommandePlat[]
  commandePlats: CommandePlat[]
}

export interface AdresseLivraison {
  rue: string
  ville: string
  codePostal: string
  region: string
}

export interface CommandeEmballage {
  id: number
  nomEmballage: string | null
  descriptionEmballage: string | null
  prix: number
  photoEmballage: string | null
  commandes: unknown[] // Replace with proper type if known
}

export interface Commande {
  id: number
  clientId: number
  commandeJours: CommandeJour[]
  prixTotal: number
  descriptionCommande: string
  dateCreation: string
  adresseLivraison: AdresseLivraison
  emballage: CommandeEmballage
  status: string
  modeDePaiement: string
  modeLivraison: string
  dateLivraison: string
  typeUser: string | null
}

/**
 * Fetches order history for a specific user
 * @param userId The ID of the user
 * @returns A promise with the result containing success status, data, and error message
 */
export const getUserCommandes = async (
  userId: string,
): Promise<{
  success: boolean
  data?: Commande[]
  message?: string
}> => {
  try {
    const response = await fetchWithAuth(`/api/commandes/client/${userId}`)

    if (!response.ok) {
      return {
        success: false,
        message: "Échec du chargement des commandes",
      }
    }

    const responseData = await response.json()
    return responseData
  } catch (error) {
    console.log("Error fetching user commandes:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Une erreur s'est produite lors du chargement des commandes.",
    }
  }
}