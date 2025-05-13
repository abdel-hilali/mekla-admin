"use client"


import { useEffect, useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import Image from "next/image"
import { Commande, CommandeJour, getUserCommandes } from "@/apis/commonde-api"
import { getPlat, Plat } from "@/apis/plats_api"
import { Emballage, getEmballage } from "@/apis/empalage"

// Component to display order details
const CommandeDetails = ({
  commandeJours,
  userType,
}: {
  commandeJours: CommandeJour[]
  userType: string
}) => {
  const [platsDetails, setPlatsDetails] = useState<{ [key: number]: Plat | null }>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlatsDetails = async () => {
      setLoading(true)

      // Get unique plat IDs from all commande jours
      const platIds = new Set<number>()
      commandeJours.forEach((jour) => {
        jour.commandePlats.forEach((commandePlat) => {
          platIds.add(commandePlat.platId)
        })
      })

      // Fetch details for each plat
      const platsDetailsMap: { [key: number]: Plat | null } = {}

      const fetchPromises = Array.from(platIds).map(async (platId) => {
        const platDetail = await getPlat(platId, userType)
        platsDetailsMap[platId] = platDetail
      })

      await Promise.all(fetchPromises)
      setPlatsDetails(platsDetailsMap)
      setLoading(false)
    }

    fetchPlatsDetails()
  }, [commandeJours, userType])

  if (loading) {
    return <div className="py-4 text-center">Chargement des détails...</div>
  }

  return (
    <div className="bg-gray-50 p-4 rounded-b-md border-t border-gray-200">
      {commandeJours.map((jour) => (
        <div key={jour.id} className="mb-4">
          <h3 className="font-medium text-gray-800 mb-2">
            {jour.jour === "MONDAY"
              ? "Lundi"
              : jour.jour === "TUESDAY"
                ? "Mardi"
                : jour.jour === "WEDNESDAY"
                  ? "Mercredi"
                  : jour.jour === "THURSDAY"
                    ? "Jeudi"
                    : jour.jour === "FRIDAY"
                      ? "Vendredi"
                      : jour.jour === "SATURDAY"
                        ? "Samedi"
                        : "Dimanche"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {jour.commandePlats.map((commandePlat) => {
              const platDetail = platsDetails[commandePlat.platId]

              return (
                <div key={commandePlat.id} className="flex items-center gap-3 bg-white p-3 rounded-md shadow-sm">
                  <div className="w-16 h-16 relative flex-shrink-0">
                    <Image
                      src={platDetail?.photo || commandePlat.plat.photo}
                      alt={platDetail?.nomPlat || commandePlat.plat.nomPlat}
                      className="object-cover rounded-md"
                      fill
                      sizes="64px"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{platDetail?.nomPlat || commandePlat.plat.nomPlat}</h4>
                    <div className="text-sm text-gray-600">
  {commandePlat.repasType?.replace("_", " ") || "Type non spécifié"}
</div>
                    <div className="flex justify-between mt-1">
                      <span className="text-sm text-gray-500">Quantité: {commandePlat.quantite}</span>
                      {platDetail?.prix && (
                        <span className="text-sm font-medium text-[#F15928]">
                          {platDetail.prix } TND
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// Component to display a single order
const CommandeComponent = ({
  commande,
  isExpanded,
  onToggle,
}: {
  commande: Commande
  isExpanded: boolean
  onToggle: () => void
  userType: string
}) => {
  const [emballageDetails, setEmballageDetails] = useState<Emballage>(null)
  const [loading, setLoading] = useState(true)
  const [platsDetails, setPlatsDetails] = useState<{ [key: number]: Plat | null }>({})
  const [platsLoaded, setPlatsLoaded] = useState(false)
  const [calculatedOrderPrice, setCalculatedOrderPrice] = useState(0)

  // Format date to display in a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR")
  }

  // Fetch emballage details
  useEffect(() => {
    const fetchEmballageDetails = async () => {
      if (commande.emballage?.id) {
        try {
          const result = await getEmballage(commande.emballage.id)
          if (result.success && result.data) {
            setEmballageDetails(result.data)
          }
        } catch (error) {
          console.error("Error fetching emballage details:", error)
        }
      }
      setLoading(false)
    }

    fetchEmballageDetails()
  }, [commande.emballage?.id])

  // Fetch all plat details first
  useEffect(() => {
    const fetchAllPlatsDetails = async () => {
      // Get unique plat IDs from all commande jours
      const platIds = new Set<number>()
      commande.commandeJours.forEach((jour) => {
        jour.commandePlats.forEach((commandePlat) => {
          platIds.add(commandePlat.platId)
        })
      })

      // Fetch details for each plat
      const platsDetailsMap: { [key: number]: Plat | null } = {}
      const fetchPromises = Array.from(platIds).map(async (platId) => {
        const platDetail = await getPlat(platId, commande.typeUser||"")
        platsDetailsMap[platId] = platDetail
      })

      await Promise.all(fetchPromises)
      setPlatsDetails(platsDetailsMap)
      setPlatsLoaded(true)
    }

    fetchAllPlatsDetails()
  }, [commande.commandeJours,commande.typeUser])

  // Calculate total price after all plats are loaded
  useEffect(() => {
    if (!platsLoaded) return

    let total = 0
    commande.commandeJours.forEach((jour) => {
      jour.commandePlats.forEach((commandePlat) => {
        const platDetail = platsDetails[commandePlat.platId]
        if (platDetail?.prix) {
          total += platDetail.prix * commandePlat.quantite
        }
      })
    })

    setCalculatedOrderPrice(total)
  }, [platsLoaded, platsDetails, commande.commandeJours])

  if (loading || !platsLoaded) {
    return (
      <div className="rounded-md my-2 overflow-hidden bg-white shadow-md p-4">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const packagingPrice = emballageDetails?.prix || 0
  const deliveryPrice = commande.modeLivraison === "LIVRAISON_A_DOMICILE" ? 7 : 0
  const totalPrice = calculatedOrderPrice + packagingPrice + deliveryPrice

  return (
    <div className="rounded-md my-2 overflow-hidden">
      <div className="bg-white shadow-md p-4 hover:bg-gray-50 cursor-pointer" onClick={onToggle}>
        <div className="flex justify-between items-center mb-3">
          <div className="text-gray-700">{formatDate(commande.dateCreation)}</div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#F15928]">#{commande.id}</span>
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Prix commande:</span>
            <span className="font-medium">{calculatedOrderPrice.toFixed(2)} TND</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Emballage:</span>
            <span className="font-medium">
              {emballageDetails?.nomEmballage || "Standard"} ({packagingPrice.toFixed(2)} TND)
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Livraison:</span>
            <span className="font-medium">
              {commande.modeLivraison === "LIVRAISON_A_DOMICILE"
                ? "À domicile (+7.00 TND)"
                : commande.modeLivraison.replace(/_/g, " ")}
            </span>
          </div>

          <div className="flex justify-between font-semibold pt-1 border-t border-gray-200">
            <span className="text-gray-800">Prix total:</span>
            <span className="text-[#F15928]">{totalPrice.toFixed(2)} TND</span>
          </div>
        </div>
      </div>

      {isExpanded && <CommandeDetails commandeJours={commande.commandeJours} userType={commande.typeUser||""} />}
    </div>
  )
}

interface HProps {
  userId: string | null
}

const HistoriqueCommandes = ({ userId }: HProps) => {
  const [commandes, setCommandes] = useState<Commande[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedCommandes, setExpandedCommandes] = useState<number[]>([])

  useEffect(() => {
    const fetchCommandes = async () => {
      try {
        if (userId) {
          const result = await getUserCommandes(userId)

          if (!result.success) {
            throw new Error(result.message)
          }

          setCommandes(result.data || [])
        }
      } catch (err) {
        console.log("Error fetching orders:", err)
        setError("Failed to load orders. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchCommandes()
  }, [userId])

  const toggleCommandeExpansion = (commandeId: number) => {
    setExpandedCommandes((prev) => {
      if (prev.includes(commandeId)) {
        return prev.filter((id) => id !== commandeId)
      } else {
        return [...prev, commandeId]
      }
    })
  }

  if (loading) {
    return (
      <div className="px-6 w-full max-w-4xl mx-auto text-center py-10">
        <div className="animate-pulse">Loading orders...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-6 w-full max-w-4xl mx-auto text-center py-10">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="px-6 w-full max-w-4xl mx-auto">
      <div className="flex justify-start">
        <h2 className="text-black text-xl">Historique des commandes</h2>
      </div>
      <div className="w-full h-0.5 bg-[#D8D8D8] my-2"></div>

      <div className="text-gray-600 mb-2 p-2">
        <div className="flex justify-between mb-1">
          <div>Date</div>
          <div>Commande</div>
        </div>
        <div className="text-xs text-gray-500">Cliquez sur une commande pour voir les détails</div>
      </div>

      {commandes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Aucune commande trouvée</div>
      ) : (
        commandes.map((commande) => (
          <> <CommandeComponent
            key={commande.id}
            commande={commande}
            isExpanded={expandedCommandes.includes(commande.id)}
            onToggle={() => toggleCommandeExpansion(commande.id)}
            userType={commande.typeUser||""}
          />
          </>
        ))
      )}
    </div>
  )
}

export default HistoriqueCommandes
