"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { getPlatById } from "@/apis/plats_api"
import type { MenuPlat, Plat } from "@/types/types"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import PlatUserCMD from "@/components/cards/plat_user-commonde"

// Mock data to simulate fetching MenuPlat by ID
const mockData: MenuPlat[] = [
  {
    id: 70,
    user1s: [
      { id: 19, quantite: 1 },
      { id: 20, quantite: 1 },
    ],
    user2s: [
      { id: 19, quantite: 2 },
      { id: 20, quantite: 2 },
      { id: 21, quantite: 2 },
    ],
    user3s: [
      { id: 19, quantite: 2 },
      { id: 20, quantite: 2 },
      { id: 21, quantite: 2 },
    ],
  },
  {
    id: 71,
    user1s: [
      { id: 19, quantite: 2 },
      { id: 20, quantite: 2 },
      { id: 21, quantite: 2 },
    ],
    user2s: [{ id: 19, quantite: 1 }],
    user3s: [
      { id: 19, quantite: 3 },
      { id: 20, quantite: 3 },
      { id: 21, quantite: 3 },
    ],
  },
  {
    id: 72,
    user1s: [
      { id: 21, quantite: 7 },
      { id: 20, quantite: 3 },
    ],
    user2s: [
      { id: 19, quantite: 5 },
      { id: 21, quantite: 1 },
    ],
    user3s: [
      { id: 19, quantite: 3 },
      { id: 20, quantite: 9 },
      { id: 21, quantite: 4 },
    ],
  },
]

// Function to get MenuPlat by ID (in a real app, this would be an API call)
const getMenuPlatById = (id: number): MenuPlat | undefined => {
  return mockData.find((plat) => plat.id === id)
}

const ProductionPlatPage = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const platId = searchParams.get("platId")
  const selectedDate = searchParams.get("date")
  const isStartWeek = searchParams.get("isStatWeek") === "true";

  const [menuPlat, setMenuPlat] = useState<MenuPlat | null>(null)
  const [plat, setPlat] = useState<Plat | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const categories = ["Rééquilibrage alimentaire", "Prise de masse", "Perte de poids"]
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0])
  const [currentUsers, setCurrentUsers] = useState<Array<{ id: number; quantite: number }>>([])
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      if (platId) {
        // Convert platId to number
        const id = Number.parseInt(platId)

        // Get MenuPlat data
        const menuPlatData = getMenuPlatById(id)

        if (menuPlatData) {
          setMenuPlat(menuPlatData)

          // Get Plat details
          const platData = await getPlatById(id)
          if (platData) {
            setPlat(platData)
          }
        }
      }

      setLoading(false)
    }

    fetchData()
  }, [platId])

  useEffect(() => {
    if (menuPlat) {
      switch (selectedCategory) {
        case categories[0]:
          setCurrentUsers(menuPlat.user1s)
          break
        case categories[1]:
          setCurrentUsers(menuPlat.user2s)
          break
        case categories[2]:
          setCurrentUsers(menuPlat.user3s)
          break
        default:
          setCurrentUsers(menuPlat.user1s)
      }
    }
  }, [selectedCategory, menuPlat])

  return (
    <div className="p-6 w-full   justify-center">
      <Button variant="ghost" className="mb-6 flex items-center text-[#F15928]" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour
      </Button>
      <h1 className="text-center text-2xl font-semibold mb-4">{plat?.nomPlat}</h1>

      {/*search and filter :*/}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm ${
                selectedCategory === category ? "bg-[#F15928]/20 text-[#F15928]" : "text-gray-600 hover:bg-gray-300"
              }`}
            >
              {category === categories[0] && menuPlat
                ? menuPlat.user1s.length
                : category === categories[1] && menuPlat
                  ? menuPlat.user2s.length
                  : category === categories[2] && menuPlat
                    ? menuPlat.user3s.length
                    : 0}{" "}
              {category}
            </button>
          ))}
        </div>

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

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-6 gap-4 p-4 border-b border-[#D1D2DB]">
          <span className="font-semibold">Nom du client</span>
          <span className="font-semibold">Nombre de plat</span>
          <span className="font-semibold">Activité physique</span>
          <span className="font-semibold">Allergies </span>
          <span className="font-semibold">Numéro de téléphone</span>
          <span className="font-semibold">Détails </span>
        </div>

        {/* Week Cards */}
        {currentUsers.length > 0 ? (
          currentUsers.map((user) => (
            <div key={user.id}>
              <PlatUserCMD platUser={user} isStartWeek={isStartWeek} date={selectedDate??""} />
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">Aucun utilisateur trouvé dans cette catégorie</div>
        )}
      </div>
    </div>
  )
}

export default ProductionPlatPage

