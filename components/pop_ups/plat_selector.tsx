"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { Plat } from "@/types/types"
import { getAllPlats } from "@/apis/plats_api"

interface PlatSelectorProps {
  open: boolean
  onClose: () => void
  onSelect: (plat: Plat) => void
  type: "ENTREE" | "PLAT" | "DESSERT"
}

export default function PlatSelector({ open, onClose, onSelect, type }: PlatSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [plats, setPlats] = useState<Plat[]>([]);
    useEffect(() => {
      async function fetchPlats() {
        const data = await getAllPlats("all");
        setPlats(data);
      }
      fetchPlats();
    }, []);


  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Sélectionner un plat</DialogTitle>
        </DialogHeader>
        <div className="relative mb-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un plat..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {plats.length > 0 ? (
            plats.map((plat) => (
              <div
                key={plat.id}
                className="flex items-center gap-3 p-3 border rounded-md mb-2 cursor-pointer hover:bg-muted"
                onClick={() => {
                  onSelect(plat)
                  onClose()
                }}
              >
                <img
                  src={plat.photo || "/placeholder.svg"}
                  alt={plat.nomPlat}
                  className="w-16 h-16 object-cover rounded-md"
                />
                <div className="flex-1">
                  <h3 className="font-medium">{plat.nomPlat +" "+plat.typePlat}</h3>
                  <p className="text-sm text-muted-foreground">{plat.description}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center py-4 text-muted-foreground">Aucun plat trouvé</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

