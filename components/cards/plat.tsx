"use client"

import type React from "react"
import { useState } from "react"
import { type Plat, deletePlat } from "@/apis/plats_api"
import { Pencil, Trash2 } from "lucide-react"
import EditPlat from "./edit_plat"
import ImageCard from "../image-override"


interface PlatCardProps {
  plat: Plat
  onDelete?: () => void
}

const PlatCard: React.FC<PlatCardProps> = ({ plat, onDelete }) => {
  const [showEditModal, setShowEditModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce plat ?")) {
      setIsDeleting(true)
      try {
        await deletePlat(plat.id)
        if (onDelete) onDelete()
      } catch (error) {
        console.error("Error deleting plat:", error)
        alert("Erreur lors de la suppression du plat")
      } finally {
        setIsDeleting(false)
      }
    }
  }

  return (
    <>
      <div className="bg-white shadow-md rounded-lg overflow-hidden relative group">
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setShowEditModal(true)}
            className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
            disabled={isDeleting}
          >
            <Pencil size={16} className="text-[#F15928]" />
          </button>
          <button
            onClick={handleDelete}
            className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
            ) : (
              <Trash2 size={16} className="text-red-500" />
            )}
          </button>
        </div>
        <ImageCard
          src={plat.photo || "/placeholder.svg"}
          alt={plat.nomPlat}
          width={300}
          height={200}
          className="w-full h-48 object-cover"
        />
        <div className="p-4">
          <h2 className="text-lg font-semibold">{plat.nomPlat}</h2>
          <p className="text-sm text-gray-500">{plat.description}</p>
          <p className="text-xs text-gray-400 mt-2">{plat.ingredient}</p>
          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm text-gray-600">{plat.typePlat.replace("PLAT_", "")}</span>
            {plat.calories && <span className="text-sm font-semibold">{plat.calories} kcal</span>}
          </div>
        </div>
      </div>

      {showEditModal && <EditPlat showModal={showEditModal} onClose={() => setShowEditModal(false)} platId={plat.id} />}
    </>
  )
}

export default PlatCard
