"use client"

import { SetStateAction, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { getPlatById, Plat } from "@/apis/plats_api"
import { getPlatStatsByDay, getPlatStatsByWeek } from "@/apis/production-api"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import useProductionStore from "@/stores/production-store"
import { getClientById } from "@/apis/clients-api"

interface ClientWithDetails {
  id: string;
  username: string;
  prenom: string | null;
  numTel: string;
  typeUser: string;
  hasAllergy?: boolean;
  allergyDetails?: string;
  image?: string;
}

const ProductionPlatPage = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const platId = searchParams.get("platId")
  const selectedDate = searchParams.get("date")
  const isStartWeek = searchParams.get("isStatWeek") === "true"

  const { selectedPlatStats, setSelectedPlatStats } = useProductionStore()

  const [plat, setPlat] = useState<Plat | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const categories = ["Rééquilibrage alimentaire", "Prise de masse", "Perte de poids"]
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0])
  const [currentUsers, setCurrentUsers] = useState<Array<{ id: string; quantite: number; clientData?: ClientWithDetails }>>([])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      if (platId && selectedDate) {
        const id = Number.parseInt(platId)

        try {
          const platData = await getPlatById(id)
          if (platData) {
            setPlat(platData)
          }

          const stats = isStartWeek
            ? await getPlatStatsByWeek(id, selectedDate)
            : await getPlatStatsByDay(id, selectedDate)

          if (stats) {
            setSelectedPlatStats(stats)
          }
        } catch (error) {
          console.error("Error fetching data:", error)
        }
      }

      setLoading(false)
    }

    fetchData()
  }, [ selectedDate, isStartWeek, setSelectedPlatStats])

  useEffect(() => {
    const fetchClientData = async () => {
      if (selectedPlatStats) {
        try {
          let users: SetStateAction<{ id: string; quantite: number; clientData?: ClientWithDetails }[]> = [];
          
          switch (selectedCategory) {
            case categories[0]: // Rééquilibrage alimentaire
              users = await Promise.all(
                selectedPlatStats.usersByCategory.REEQUILIBRAGE_ALIMENTAIRE.map(async (user) => {
                  const clientData = await getClientById(user.userId.toString());
                  return {
                    id: user.userId.toString(),
                    quantite: user.nbPlatsCommandes,
                    clientData: {
                      id: clientData.id,
                      username: clientData.username,
                      prenom: clientData.prenom,
                      numTel: clientData.numTel,
                      typeUser: clientData.typeUser,
                      hasAllergy: clientData.hasAllergy,
                      allergyDetails: clientData.allergyDetails,
                      image: clientData.image
                    }
                  };
                })
              );
              break;
            case categories[1]: // Prise de masse
              users = await Promise.all(
                selectedPlatStats.usersByCategory.PRISE_DE_MASSE.map(async (user) => {
                  const clientData = await getClientById(user.userId.toString());
                  return {
                    id: user.userId.toString(),
                    quantite: user.nbPlatsCommandes,
                    clientData: {
                      id: clientData.id,
                      username: clientData.username,
                      prenom: clientData.prenom,
                      numTel: clientData.numTel,
                      typeUser: clientData.typeUser,
                      hasAllergy: clientData.hasAllergy,
                      allergyDetails: clientData.allergyDetails,
                      image: clientData.image
                    }
                  };
                })
              );
              break;
            case categories[2]: // Perte de poids
              users = await Promise.all(
                selectedPlatStats.usersByCategory.PERTE_DE_POID.map(async (user) => {
                  const clientData = await getClientById(user.userId.toString());
                  return {
                    id: user.userId.toString(),
                    quantite: user.nbPlatsCommandes,
                    clientData: {
                      id: clientData.id,
                      username: clientData.username,
                      prenom: clientData.prenom,
                      numTel: clientData.numTel,
                      typeUser: clientData.typeUser,
                      hasAllergy: clientData.hasAllergy,
                      allergyDetails: clientData.allergyDetails,
                      image: clientData.image
                    }
                  };
                })
              );
              break;
            default:
              users = [];
          }

          setCurrentUsers(users);
        } catch (error) {
          console.error("Error fetching client data:", error);
        }
      }
    };

    fetchClientData();
  }, [selectedCategory]);

  const filteredUsers = currentUsers.filter((user) => {
    const searchTerm = search.toLowerCase();
    return (
      user.clientData?.username.toLowerCase().includes(searchTerm) ||
      user.clientData?.prenom?.toLowerCase().includes(searchTerm) ||
      user.clientData?.numTel.includes(search)
    );
  });

  const handleViewClient = (clientId: string) => {
    router.push(`/client-profile/${clientId}`);
  };

  return (
    <div className="p-6 w-full justify-center">
      <Button variant="ghost" className="mb-6 flex items-center text-[#F15928]" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour
      </Button>

      {loading ? (
        <div className="text-center">Chargement...</div>
      ) : (
        <>
          <h1 className="text-center text-2xl font-semibold mb-4">{plat?.nomPlat}</h1>
          <p className="text-center text-gray-500 mb-6">
            {isStartWeek ? "Statistiques pour toute la semaine  date debut (landi) = "+ selectedDate : "Statistiques pour la journée "+ selectedDate}
          </p>

          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-4">
              {categories.map((category) => {
                let count = 0
                if (selectedPlatStats) {
                  if (category === categories[0]) {
                    count = selectedPlatStats.usersByCategory.REEQUILIBRAGE_ALIMENTAIRE.length
                  } else if (category === categories[1]) {
                    count = selectedPlatStats.usersByCategory.PRISE_DE_MASSE.length
                  } else if (category === categories[2]) {
                    count = selectedPlatStats.usersByCategory.PERTE_DE_POID.length
                  }
                }

                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm ${
                      selectedCategory === category
                        ? "bg-[#F15928]/20 text-[#F15928]"
                        : "text-gray-600 hover:bg-gray-300"
                    }`}
                  >
                    {count} {category}
                  </button>
                )
              })}
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

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="grid grid-cols-6 gap-4 p-4 border-b border-[#D1D2DB]">
              <span className="font-semibold">Nom du client</span>
              <span className="font-semibold">Nombre de plat</span>
              <span className="font-semibold">Activité physique</span>
              <span className="font-semibold">Allergies</span>
              <span className="font-semibold">Numéro de téléphone</span>
              <span className="font-semibold">Détails</span>
            </div>

            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div key={user.id} className="grid grid-cols-6 gap-4 p-4 border-b border-gray-200 items-center">
                  <span>{user.clientData?.prenom} {user.clientData?.username}</span>
                  <span>{user.quantite}</span>
                  <span>{user.clientData?.typeUser.includes('SPORTIF') ? 'Oui' : 'Non'}</span>
                  <span>{user.clientData?.hasAllergy ? user.clientData.allergyDetails || 'Oui' : 'Non'}</span>
                  <span>{user.clientData?.numTel}</span>
                  <span>
                    <Button 
                      variant="ghost" 
                      onClick={() => handleViewClient(user.id)}
                      className="text-[#F15928] hover:text-[#F15928]/80"
                    >
                      Voir plus &gt;
                    </Button>
                  </span>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">Aucun utilisateur trouvé dans cette catégorie</div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default ProductionPlatPage