"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSearchParams, useRouter } from "next/navigation"
import { getPlatById } from "@/apis/cmds-plats-api"
import { getPlatAllergyStatsByDay, getPlatAllergyStatsByWeek } from "@/apis/cmds-plats-api"
import { getClientById } from "@/apis/clients-api"
import type { Client } from "@/apis/clients-api"
import type { UserOrder } from "@/apis/cmds-plats-api"

interface ClientWithOrder extends Client {
  nbPlatsCommandes: number
  hasAllergy: boolean
}

const PlatCommandesPage = () => {
  const searchParams = useSearchParams()
  const router = useRouter()

  const platId = searchParams.get("platId")
  const selectedDate = searchParams.get("date")
  const isWeekView = searchParams.get("isWeekView") === "true"

  const [platName, setPlatName] = useState("")
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState("avec")
  const [loading, setLoading] = useState(true)
  const [clientsWithAllergy, setClientsWithAllergy] = useState<ClientWithOrder[]>([])
  const [clientsWithoutAllergy, setClientsWithoutAllergy] = useState<ClientWithOrder[]>([])
  const [totalAvecAllergie, setTotalAvecAllergie] = useState(0)
  const [totalSansAllergie, setTotalSansAllergie] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      if (!platId || !selectedDate) return

      setLoading(true)
      try {
        // Fetch plat details
        const platData = await getPlatById(Number(platId))
        if (platData) {
          setPlatName(platData.nomPlat || "Plat")
        }

        // Fetch allergy stats
        const allergyStats = isWeekView
          ? await getPlatAllergyStatsByWeek(Number(platId), selectedDate)
          : await getPlatAllergyStatsByDay(Number(platId), selectedDate)

        if (allergyStats) {
          setTotalAvecAllergie(allergyStats.totalAvecAllergie)
          setTotalSansAllergie(allergyStats.totalSansAllergie)

          // Fetch client details for users with allergies
          const clientsWithAllergyData = await Promise.all(
            allergyStats.avecAllergie.map(async (user: UserOrder) => {
              try {
                const clientData = await getClientById(user.userId.toString())
                return {
                  ...clientData,
                  nbPlatsCommandes: user.nbPlatsCommandes,
                  hasAllergy: true,
                }
              } catch (error) {
                console.error(`Error fetching client ${user.userId}:`, error)
                return null
              }
            }),
          )

          // Fetch client details for users without allergies
          const clientsWithoutAllergyData = await Promise.all(
            allergyStats.sansAllergie.map(async (user: UserOrder) => {
              try {
                const clientData = await getClientById(user.userId.toString())
                return {
                  ...clientData,
                  nbPlatsCommandes: user.nbPlatsCommandes,
                  hasAllergy: false,
                }
              } catch (error) {
                console.error(`Error fetching client ${user.userId}:`, error)
                return null
              }
            }),
          )

          setClientsWithAllergy(clientsWithAllergyData.filter(Boolean) as ClientWithOrder[])
          setClientsWithoutAllergy(clientsWithoutAllergyData.filter(Boolean) as ClientWithOrder[])
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [platId, selectedDate, isWeekView])

  const handleStatusChange = (clientId: string, newStatus: string) => {
    // In a real app, you would update the status in your database
    console.log(`Updating order for client ${clientId} to status ${newStatus}`)
  }

  const filteredClients =
    activeTab === "standard"
      ? clientsWithoutAllergy.filter(
          (client) =>
            client.username.toLowerCase().includes(search.toLowerCase()) ||
            (client.prenom && client.prenom.toLowerCase().includes(search.toLowerCase())) ||
            client.numTel.includes(search),
        )
      : clientsWithAllergy.filter(
          (client) =>
            client.username.toLowerCase().includes(search.toLowerCase()) ||
            (client.prenom && client.prenom.toLowerCase().includes(search.toLowerCase())) ||
            client.numTel.includes(search),
        )

  return (
    <div className="p-6 w-full justify-center">
      {/* Header with back button and title */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/commondes" className="flex items-center text-[#F15928B2] hover:text-[#F15928]">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Retour
        </Link>
        <h1 className="text-xl font-semibold text-center flex-1">{platName}</h1>
        <div className="w-24"></div> {/* Spacer for alignment */}
      </div>

      {loading ? (
        <div className="text-center py-8">Chargement...</div>
      ) : (
        <>
          {/* Tabs and Print button */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2">
              <Button
                variant={activeTab === "standard" ? "default" : "outline"}
                className={
                  activeTab === "standard" ? "bg-[#F15928B2] text-white" : "text-[#F15928B2] border-[#F15928B2]"
                }
                onClick={() => setActiveTab("standard")}
              >
                {totalSansAllergie} plats standards
              </Button>
              <Button
                variant={activeTab === "special" ? "default" : "outline"}
                className={
                  activeTab === "special" ? "bg-[#F15928B2] text-white" : "text-[#F15928B2] border-[#F15928B2]"
                }
                onClick={() => setActiveTab("special")}
              >
                {totalAvecAllergie} plats spéciaux
              </Button>
            </div>

            <Button className="bg-[#F15928B2] text-white hover:bg-[#F15928]">Imprimer</Button>
          </div>

          {/* Search input */}
          <div className="flex justify-end mb-6">
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
              <span className="font-semibold">Nombre de plat</span>
              <span className="font-semibold">Nom du client</span>
              <span className="font-semibold">Numéro de téléphone</span>
              <span className="font-semibold">Code parrainage</span>
              <span className="font-semibold">Status</span>
            </div>

            {/* Table Rows */}
            {filteredClients.length > 0 ? (
              filteredClients.map((client,index) => (
                <div key={index} className="grid grid-cols-6 gap-4 p-4 border-b border-[#D1D2DB]">
                  <span>{client.id}</span>
                  <span>{client.nbPlatsCommandes}</span>
                  <span>
                    {client.prenom} {client.username}
                  </span>
                  <span>{client.numTel}</span>
                  <div>
                    <Select defaultValue="en cours" onValueChange={(value) => handleStatusChange(client.id, value)}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en cours">En cours</SelectItem>
                        <SelectItem value="annulé">Annulé</SelectItem>
                        <SelectItem value="livré">Livré</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">Aucun client trouvé</div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default PlatCommandesPage
