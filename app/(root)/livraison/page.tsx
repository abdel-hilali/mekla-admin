"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Pencil} from "lucide-react"
import { CalendarIcon } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { addDays, format, startOfWeek } from "date-fns"
import { fr } from "date-fns/locale"
import { getCommandesByDate, assignLivreurToCommandes, } from "@/apis/livraison-api"
import { getAllLivreurs, type Livreur } from "@/apis/livreurs-api"
import { getClientById } from "@/apis/clients-api"
import { toast } from "@/components/ui/use-toast"

// Define a type that matches the actual API response
interface CommandePlat {
  id: number
  platId: number
  commandeJourId: number
  typePlat: string
  quantite: number
}

interface CommandeJour {
  id: number
  commandeId: number
  jour: string
  commandePlats: CommandePlat[]
}

interface AdresseLivraison {
  rue: string
  ville: string
  codePostal: string
  region: string
}

interface ApiCommande {
  id: number
  clientId: number
  commandeJours: CommandeJour[]
  commandePlats: CommandePlat[]
  prixTotal: number
  descriptionCommande: string
  dateCreation: string
  adresseLivraison: AdresseLivraison
  status: string
  modeDePaiement: string
  modeLivraison: string
  dateLivraison: string
  typeUser: string
  livreurId?: number
  livreur?: {
    id: number
    nom: string
    prenom: string
    telephone: string
  }
}

const LivraisonPage = () => {
  const [search, setSearch] = useState("")
  const [commandes, setCommandes] = useState<ApiCommande[]>([])
  const [livreurs, setLivreurs] = useState<Livreur[]>([])
  const [selectedCommande, setSelectedCommande] = useState<ApiCommande | null>(null)
  const [selectedLivreur, setSelectedLivreur] = useState<string>("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [clientPhones, setClientPhones] = useState<Record<number, string>>({})

  // Date and week selection
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [days, setDays] = useState<string[]>([])
  const [selectedDay, setSelectedDay] = useState<string>("")

  // Initialize week days on component mount
  useEffect(() => {
    initializeWeekDays(new Date())
  }, [])

  // Initialize week days based on a date
  const initializeWeekDays = (newDate: Date) => {
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
  }

  // Handle date change from calendar
  const handleDateChange = (newDate: Date | undefined) => {
    if (!newDate) return

    setDate(newDate)
    initializeWeekDays(newDate)
  }

  // Format date for API
  const formatDateForApi = (day: string): string => {
    if (!day) return format(new Date(), "yyyy-MM-dd")
    const parts = day.split(" ")
    if (parts.length < 2) return format(new Date(), "yyyy-MM-dd")
    const datePart = parts[1]
    const [dd, mm] = datePart.split("/")
    const year = new Date().getFullYear()
    return `${year}-${mm}-${dd}`
  }

  // Fetch commandes when selected day changes
  useEffect(() => {
    if (!selectedDay) return

    const fetchCommandes = async () => {
      setLoading(true)
      try {
        const formattedDate = formatDateForApi(selectedDay)
        const data = await getCommandesByDate(formattedDate)
        setCommandes(data)

        // Fetch client phone numbers for each commande
        const phones: Record<number, string> = {}
        for (const commande of data) {
          try {
            const client = await getClientById(commande.clientId.toString())
            if (client && client.numTel) {
              phones[commande.id] = client.numTel
            }
          } catch (error) {
            console.error(`Error fetching client ${commande.clientId}:`, error)
          }
        }
        setClientPhones(phones)
      } catch (error) {
        console.error("Error fetching commandes:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCommandes()
  }, [selectedDay])

  // Fetch livreurs on component mount
  useEffect(() => {
    const fetchLivreurs = async () => {
      try {
        const data = await getAllLivreurs()
        setLivreurs(data)
      } catch (error) {
        console.error("Error fetching livreurs:", error)
      }
    }

    fetchLivreurs()
  }, [])

  const handleAssignLivreur = (commande: ApiCommande) => {
    setSelectedCommande(commande)
    setSelectedLivreur("")
    setIsDialogOpen(true)
  }

  const handleSaveLivreur = async () => {
    if (!selectedCommande || !selectedLivreur) return

    try {
      const livreurId = Number.parseInt(selectedLivreur)
      await assignLivreurToCommandes(livreurId, [selectedCommande.id])

      toast({
        title: "Succès",
        description: "Livreur assigné avec succès",
      })

      // Refresh commandes after assignment
      const formattedDate = formatDateForApi(selectedDay)
      const data = await getCommandesByDate(formattedDate)
      setCommandes(data)

      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error assigning livreur:", error)
      toast({
        title: "Erreur",
        description: "Erreur lors de l'assignation du livreur",
        variant: "destructive",
      })
    }
  }



  // Count total plates in a commande
  const countTotalPlats = (commande: ApiCommande): number => {
    let total = 0
    if (commande.commandePlats) {
      commande.commandePlats.forEach((plat) => {
        total += plat.quantite
      })
    }
    return total
  }

  // Get livreur name from commande
  const getLivreurName = (commande: ApiCommande): string => {
    if (commande.livreur) {
      return `${commande.livreur.prenom} ${commande.livreur.nom} ${commande.livreur.telephone}`
    }

    // If we have livreurId but no livreur object, try to find the livreur in our list
    if (commande.livreurId) {
      const livreur = livreurs.find((l) => l.id === commande.livreurId)
      if (livreur) {
        return `${livreur.prenom} ${livreur.nom} ${livreur.telephone}`
      }
      return `Livreur #${commande.livreurId}`
    }

    return "Non assigné"
  }

  // Check if commande has a livreur
  const hasLivreur = (commande: ApiCommande): boolean => {
    return !!commande.livreurId || (!!commande.livreur && !!commande.livreur.id)
  }

  // Filter commandes based on search
  const filteredCommandes = commandes.filter(
    (commande) =>
      commande.id.toString().includes(search) ||
      commande.adresseLivraison.ville.toLowerCase().includes(search.toLowerCase()) ||
      commande.adresseLivraison.rue.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="p-6 w-full justify-center">
      {/* Week header */}
      <h1 className="text-center text-2xl font-semibold mb-4">
        SEMAINE {days[0]?.split(" ")[1]} - {days[4]?.split(" ")[1]}
      </h1>

      {/* Day selector */}
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

        {/* Date picker */}
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

      {/* Search input */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Livraisons</h2>
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

      {/* Commandes Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-6 gap-4 p-4 border-b border-[#D1D2DB]">
          <span className="font-semibold">ID commande</span>
          <span className="font-semibold">Nombre de plats</span>
          <span className="font-semibold">Livreur</span>
          <span className="font-semibold">Numéro de téléphone</span>
          <span className="font-semibold">Adresse de livraison</span>
          <span className="font-semibold">Zone</span>
        </div>

        {/* Table Rows */}
        {loading ? (
          <div className="p-8 text-center">Chargement...</div>
        ) : filteredCommandes.length > 0 ? (
          filteredCommandes.map((commande) => (
            <div key={commande.id} className="grid grid-cols-6 gap-4 p-4 border-b border-[#D1D2DB] hover:bg-gray-50">
              <span>{commande.id}</span>
              <span>{countTotalPlats(commande)}</span>
              <div className="flex items-center gap-2">
                {hasLivreur(commande) ? (
                  <>
                    <span>{getLivreurName(commande)}</span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleAssignLivreur(commande)}
                        className="text-[#F15928B2] hover:bg-[#F15928]/10"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                     
                    </div>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAssignLivreur(commande)}
                    className="text-[#F15928B2] border-[#F15928B2]"
                  >
                    Assigner livreur
                  </Button>
                )}
              </div>
              <span>{clientPhones[commande.id] || "Non disponible"}</span>
              <span className="truncate">
                {commande.adresseLivraison.rue}, {commande.adresseLivraison.codePostal}{" "}
                {commande.adresseLivraison.ville}
              </span>
              <span>{commande.adresseLivraison.region}</span>
            </div>
          ))
        ) : (
          <div className="p-8 text-center">Aucune commande trouvée pour cette date</div>
        )}
      </div>

      {/* Assign Livreur Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assigner un livreur</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Select value={selectedLivreur} onValueChange={setSelectedLivreur}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionner un livreur" />
              </SelectTrigger>
              <SelectContent>
                {livreurs.map((livreur) => (
                  <SelectItem key={livreur.id} value={livreur.id.toString()}>
                    {livreur.prenom} {livreur.nom} - {livreur.telephone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="button" className="bg-[#F15928B2] text-white" onClick={handleSaveLivreur}>
                Enregistrer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pagination */}
      <div className="flex justify-end mt-4">
        <div className="flex gap-2">
          <button className="px-3 py-1 border rounded text-[#F15928B2] border-[#F15928B2]">Précédent</button>
          <button className="px-3 py-1 bg-[#F15928B2] text-white rounded">1</button>
          <button className="px-3 py-1 border rounded text-[#F15928B2] border-[#F15928B2]">Suivant</button>
        </div>
      </div>
    </div>
  )
}

export default LivraisonPage
