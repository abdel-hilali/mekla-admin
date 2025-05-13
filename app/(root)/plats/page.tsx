"use client"
import Image from "next/image"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import PlatCard from "@/components/cards/plat"
import { getAllPlats, Plat } from "@/apis/plats_api"
import AddPlat from "@/components/cards/add_plat"

export default function PlatsPage() {
  const [plats, setPlats] = useState<Plat[]>([])
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [showAddModal, setShowAddModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const categories = ["All", "Plats", "Desserts", "Entrées"]

  useEffect(() => {
    async function fetchPlats() {
      setIsLoading(true)
      try {
        const data = await getAllPlats("all")
        setPlats(data)
      } catch (error) {
        console.error("Error fetching plats:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPlats()
  }, [showAddModal, refreshTrigger])

  const handleAddClick = () => {
    setShowAddModal(true)
  }

  const handlePlatDeleted = () => {
    // Trigger a refresh of the plat list
    setRefreshTrigger((prev) => prev + 1)
  }

  // Filter plats based on search and category
  const filteredPlats = plats.filter((plat) => {
    const matchesSearch =
      plat.nomPlat.toLowerCase().includes(search.toLowerCase()) ||
      plat.description.toLowerCase().includes(search.toLowerCase())

    if (selectedCategory === "All") {
      return matchesSearch
    }

    const categoryMap: Record<string, string[]> = {
      Plats: ["PLAT", "PLAT_DEJEUNER", "PLAT_DINER"],
      Desserts: ["DESSERT", "DESSERT_DEJEUNER", "DESSERT_DINER"],
      Entrées: ["ENTREE", "ENTREE_DEJEUNER", "ENTREE_DINER"],
    }

    return matchesSearch && categoryMap[selectedCategory]?.includes(plat.typePlat)
  })

  return (
    <div className="bg-[#F5F7FA] min-h-screen p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Nos plats</h1>
        <Button
          className="bg-[#F15928] text-white rounded-full px-4 py-2 flex items-center gap-2"
          onClick={handleAddClick}
        >
          <span className="text-xl">+</span> Créer un nouveau plat
        </Button>
      </div>

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

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F15928]"></div>
        </div>
      ) : filteredPlats.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredPlats.map((plat) => (
            <PlatCard key={plat.id} plat={plat} onDelete={handlePlatDeleted} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">Aucun plat trouvé</p>
        </div>
      )}

      <AddPlat showModal={showAddModal} onClose={() => setShowAddModal(false)} />
    </div>
  )
}
