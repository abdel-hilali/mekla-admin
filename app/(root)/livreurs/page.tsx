"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Pencil, Trash2, Search } from "lucide-react"
import { getAllLivreurs, createLivreur, updateLivreur, deleteLivreur, Livreur, LivreurData } from "@/apis/livreurs-api"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"

const LivreursPage = () => {
  const [search, setSearch] = useState("")
  const [livreurs, setLivreurs] = useState<Livreur[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedLivreur, setSelectedLivreur] = useState<Livreur | null>(null)
  const [currentLivreur, setCurrentLivreur] = useState<LivreurData>({
    nom: "",
    prenom: "",
    telephone: "",
    zone: ""
  })

  const fetchLivreurs = async () => {
    try {
      const data = await getAllLivreurs()
      setLivreurs(data)
    } catch (error) {
      console.error("Error fetching livreurs:", error)
    }
  }

  useEffect(() => {
    fetchLivreurs()
  }, [])

  const handleAddLivreur = () => {
    setCurrentLivreur({
      nom: "",
      prenom: "",
      telephone: "",
      zone: ""
    })
    setIsDialogOpen(true)
  }

  const handleEditLivreur = (livreur: Livreur) => {
    setCurrentLivreur(livreur)
    setIsDialogOpen(true)
  }

  const handleDeleteClick = (livreur: Livreur) => {
    setSelectedLivreur(livreur)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (selectedLivreur) {
      try {
        await deleteLivreur(selectedLivreur.id)
        fetchLivreurs()
        setIsDeleteDialogOpen(false)
      } catch (error) {
        console.error("Error deleting livreur:", error)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (currentLivreur.id) {
        // Update existing livreur
        await updateLivreur(currentLivreur)
      } else {
        // Add new livreur
        await createLivreur(currentLivreur)
      }
      fetchLivreurs()
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error saving livreur:", error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCurrentLivreur(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const filteredLivreurs = livreurs.filter(livreur =>
    `${livreur.nom} ${livreur.prenom} ${livreur.telephone} ${livreur.zone}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  return (
    <div className="p-4 md:p-6 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold">Livreurs</h1>
        
        <div className="flex flex-col-reverse md:flex-row w-full md:w-auto items-end md:items-center gap-3">
          <div className="relative w-full md:w-60">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              className="pl-10 w-full"
              placeholder="Recherche"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-[#F15928B2] text-white hover:bg-[#F15928] w-full md:w-auto"
                onClick={handleAddLivreur}
              >
                Ajouter un livreur
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {currentLivreur.id ? "Modifier livreur" : "Ajouter un livreur"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Nom</label>
                  <Input
                    name="nom"
                    value={currentLivreur.nom}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Prénom</label>
                  <Input
                    name="prenom"
                    value={currentLivreur.prenom}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Téléphone</label>
                  <Input
                    name="telephone"
                    value={currentLivreur.telephone}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Zone</label>
                  <Input
                    name="zone"
                    value={currentLivreur.zone}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" className="bg-[#F15928B2] text-white">
                    {currentLivreur.id ? "Modifier" : "Ajouter"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Livreurs Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Prénom</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLivreurs.map((livreur) => (
                <TableRow key={livreur.id}>
                  <TableCell>{livreur.nom}</TableCell>
                  <TableCell>{livreur.prenom}</TableCell>
                  <TableCell>{livreur.telephone}</TableCell>
                  <TableCell>{livreur.zone}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditLivreur(livreur)}
                        className="text-[#F15928B2] hover:bg-[#F15928]/10"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      
                      <AlertDialog open={isDeleteDialogOpen && selectedLivreur?.id === livreur.id} onOpenChange={setIsDeleteDialogOpen}>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(livreur)}
                            className="text-red-600 hover:bg-red-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                            <AlertDialogDescription>
                              Êtes-vous sûr de vouloir supprimer {livreur.prenom} {livreur.nom} ?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction 
                              className="bg-red-600 hover:bg-red-700"
                              onClick={confirmDelete}
                            >
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile List */}
        <div className="md:hidden">
          {filteredLivreurs.map((livreur) => (
            <div key={livreur.id} className="p-4 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{livreur.prenom} {livreur.nom}</div>
                  <div className="text-sm text-gray-500">{livreur.telephone}</div>
                  <div className="text-sm">{livreur.zone}</div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditLivreur(livreur)}>
                      <Pencil className="mr-2 h-4 w-4 text-[#F15928B2]" />
                      <span>Modifier</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={() => handleDeleteClick(livreur)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Supprimer</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer {selectedLivreur?.prenom} {selectedLivreur?.nom} ?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction 
                className="bg-red-600 hover:bg-red-700"
                onClick={confirmDelete}
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

export default LivreursPage