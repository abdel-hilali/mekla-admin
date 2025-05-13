"use client"

import { useEffect, useState } from "react"
import { getClientById, ClientDetails, } from "@/apis/clients-api"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useParams } from "next/navigation"
import Image from "next/image"
import HistoriqueCommandes from "../Historique"

const ClientProfilePage = () => {
  const [client, setClient] = useState<ClientDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const params = useParams()
  const id = params.id as string

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch client details
        const clientData = await getClientById(id)
        setClient(clientData)
        
      } catch (err) {
        console.error("Error fetching client:", err)
        setError("Failed to load client data")
      } finally {
        setLoading(false)
      }
    }

    fetchClientData()
  }, [id])





  if (loading) {
    return (
      <div className="p-6 w-full flex justify-center items-center h-64">
        <div className="animate-pulse">Chargement des données du client...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 w-full flex flex-col items-center justify-center h-64">
        <div className="text-red-500 mb-4">{error}</div>
        <Link href="/commondes/clients">
          <Button variant="outline" className="text-[#F15928B2] border-[#F15928B2]">
            Retour à la liste
          </Button>
        </Link>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="p-6 w-full flex flex-col items-center justify-center h-64">
        <div className="mb-4">Client non trouvé</div>
        <Link href="/commondes/clients">
          <Button variant="outline" className="text-[#F15928B2] border-[#F15928B2]">
            Retour à la liste
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 w-full max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Profil du client</h1>
        <Link href="/commondes/clients">
          <Button variant="outline" className="text-[#F15928B2] border-[#F15928B2]">
            Retour à la liste
          </Button>
        </Link>
      </div>

      {/* Client Profile Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
          <div className="w-24 h-24 relative rounded-full overflow-hidden border-2 border-[#F15928]">
            <Image
              src={client.image || "/default-profile.png"}
              alt={`${client.username} ${client.prenom || ""}`}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="text-xl font-bold">
              {client.prenom} {client.username}
            </h2>
            <p className="text-gray-600">{client.adresseMail}</p>
            <p className="text-gray-600">{client.numTel}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Informations personnelles */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Informations personnelles</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Nom</p>
                <p className="font-medium">{client.username}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Prénom</p>
                <p className="font-medium">{client.prenom || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Age</p>
                <p className="font-medium">{client.age ? `${client.age} ans` : "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Sexe</p>
                <p className="font-medium">{client.sexe || "N/A"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Adresse e-mail</p>
                <p className="font-medium">{client.adresseMail || "N/A"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Numéro du téléphone</p>
                <p className="font-medium">{client.numTel || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Mode de vie et allergies */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Mode de vie</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Objectif alimentaire</p>
                <p className="font-medium">Réalignement alimentaire</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Activité physique</p>
                <p className="font-medium">Avec sport</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Allergies</p>
                <p className="font-medium">
                  {client.hasAllergy 
                    ? client.allergyDetails || "Oui (détails non spécifiés)"
                    : "Aucune"}
                </p>
              </div>
            </div>
          </div>

          {/* Localisation */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Localisation</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Zone</p>
                <p className="font-medium">
                  {client.adresse?.ville || "N/A"}, {client.adresse?.region || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Adresse de livraison</p>
                <p className="font-medium">
                  {client.adresse 
                    ? `${client.adresse.rue}, ${client.adresse.codePostal} ${client.adresse.ville}, ${client.adresse.region}`
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Code de parrainage</p>
                <p className="font-medium">{client.username} {client.age || "25"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Commandes */}
      <HistoriqueCommandes userId={id} ></HistoriqueCommandes>
    </div>
  )
}

export default ClientProfilePage