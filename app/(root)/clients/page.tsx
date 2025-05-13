"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { getAllClients, getClientById, Client } from "@/apis/clients-api"

const ClientsPage = () => {
  const [search, setSearch] = useState("")
  const [clients, setClients] = useState<Client[]>([])
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 1,
    totalElements: 0,
  })
  const [loading, setLoading] = useState(true)

  const fetchClients = async () => {
    try {
      setLoading(true)
      // First get paginated client IDs and basic info
      const paginatedData = await getAllClients(pagination.page, pagination.size)
      
      // Then fetch each client's full details individually and combine with the ID
      const clientsPromises = paginatedData.content.map(async (client) => {
        const clientDetails = await getClientById(client.id)
        return {
          ...clientDetails,
          id: client.id // Ensure we have the ID from the initial response
        }
      })
      
      const clientsData = await Promise.all(clientsPromises)
      
      setClients(clientsData)
      setPagination(prev => ({
        ...prev,
        totalPages: paginatedData.totalPages,
        totalElements: paginatedData.totalElements,
      }))
    } catch (error) {
      console.error("Error fetching clients:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClients()
  }, [pagination.page, pagination.size])

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const filteredClients = clients.filter(client =>
    `${client.username} ${client.prenom} ${client.numTel}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  const formatAddress = (client: Client) => {
    if (!client.adresse) return 'N/A'
    const parts = []
    if (client.adresse.ville) parts.push(client.adresse.ville)
    if (client.adresse.rue) parts.push(client.adresse.rue)
    return parts.join(', ') || 'N/A'
  }

  if (loading) {
    return (
      <div className="p-6 w-full flex justify-center items-center h-64">
        <div className="animate-pulse">Loading clients...</div>
      </div>
    )
  }

  return (
    <div className="p-6 w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Nos clients</h1>
        
        {/* Search input */}
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

      {/* Clients Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-5 gap-4 p-4 border-b border-[#D1D2DB]">
          <span className="font-semibold">Nom du client</span>
          <span className="font-semibold">Numéro de téléphone</span>
          <span className="font-semibold">Ville, Rue</span>
          <span className="font-semibold">Région</span>
          <span className="font-semibold">Action</span>
        </div>

        {/* Table Rows */}
        {filteredClients.length > 0 ? (
          filteredClients.map((client) => (
            <div key={client.id} className="grid grid-cols-5 gap-4 p-4 border-b border-[#D1D2DB] hover:bg-gray-50">
              <span>{client.prenom ? `${client.prenom} ${client.username}` : client.username}</span>
              <span>{client.numTel || 'N/A'}</span>
              <span className="truncate" title={formatAddress(client)}>
                {formatAddress(client)}
              </span>
              <span>{client.adresse?.region || 'N/A'}</span>
              
              <Link 
                href={`/client-profile/${client.id}`}
                className="text-[#F15928B2] hover:underline"
              >
                Voir profil
              </Link>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">
            Aucun client trouvé
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-end mt-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={pagination.page === 0}
              onClick={() => handlePageChange(pagination.page - 1)}
              className="text-[#F15928B2] border-[#F15928B2]"
            >
              Précédent
            </Button>
            
            {Array.from({ length: pagination.totalPages }, (_, i) => (
              <Button
                key={i}
                variant={pagination.page === i ? 'default' : 'outline'}
                className={pagination.page === i ? 'bg-[#F15928B2] text-white' : 'text-[#F15928B2] border-[#F15928B2]'}
                onClick={() => handlePageChange(i)}
              >
                {i + 1}
              </Button>
            ))}
            
            <Button
              variant="outline"
              disabled={pagination.page >= pagination.totalPages - 1}
              onClick={() => handlePageChange(pagination.page + 1)}
              className="text-[#F15928B2] border-[#F15928B2]"
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ClientsPage