'use client'
import { X } from "lucide-react"
import Image from "next/image"
import type { Plat } from "@/types/types"
import { useEffect, useState } from "react"
import { getPlatById } from "@/apis/plats_api"

interface PlatDisplayProps {
  id :number
  onRemove: () => void
}

export default function PlatDisplay({ id, onRemove }: PlatDisplayProps) {

    const [plat, setPlat] = useState<Plat|null>(null);

      useEffect(() => {
        async function fetchPlats() {
          const data = await getPlatById(id);
          if (data){
            setPlat(data);
          }
        }
        fetchPlats();
      }, []);

  return (
    <div className=" bg-[#F1592833] relative flex items-center p-3 border rounded-lg w-60 h-28">
      <button
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
        className="absolute top-1 right-1 p-1 rounded-full bg-white hover:bg-gray-100"
      >
        <X className="h-4 w-4 text-gray-500" />
      </button>
      <div className="flex flex-col items-center w-full">
        <div className="relative w-12 h-12 mb-2">
          <img
        src={plat?.photo}
        alt={plat?.nomPlat}
        className="object-cover rounded-md"
      />
        </div>
        <h3 className="text-sm font-medium text-center line-clamp-2">{plat?.nomPlat}</h3>
      </div>
    </div>
  )
}

