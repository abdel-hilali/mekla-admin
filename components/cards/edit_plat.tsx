"use client"

import { getPlat, getPlatById, PlatCalories, PlatData, updatePlat, uploadPlatImage } from "@/apis/plats_api"
import { step1Schema } from "@/lib/schema"
import type React from "react"
import { useEffect, useState } from "react"

interface EditPlatProps {
  showModal: boolean
  onClose: () => void
  platId: number
}

export default function EditPlat({ showModal, onClose, platId }: EditPlatProps) {
  const [step, setStep] = useState(1)
  const initialStep2Data = [
    { caloriesWithSport: "", priceWithSport: "", caloriesWithoutSport: "", priceWithoutSport: "" },
    { caloriesWithSport: "", priceWithSport: "", caloriesWithoutSport: "", priceWithoutSport: "" },
    { caloriesWithSport: "", priceWithSport: "", caloriesWithoutSport: "", priceWithoutSport: "" },
  ]
  const initialStep1Data = {
    name: "",
    type: "",
    description: "",
    ingredients: "",
    image: null as File | null,
  }

  const [formData, setFormData] = useState(initialStep1Data)
  const [step2Data, setStep2Data] = useState(initialStep2Data)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)

  useEffect(() => {
    if (showModal && platId) {
      fetchPlatData()
    }
  }, [showModal, platId])

  // Replace the fetchPlatData function with this updated version that uses getPlat for each user type
  const fetchPlatData = async () => {
    setIsLoadingData(true)
    try {
      // First get the basic plat data
      const plat = await getPlatById(platId)
      if (plat) {
        // Set step 1 data
        setFormData({
          name: plat.nomPlat || "",
          type: convertEnumToTypeString(plat.typePlat),
          description: plat.description || "",
          ingredients: plat.ingredient || "",
          image: null,
        })

        // Set image preview
        if (plat.photo) {
          setImagePreview(plat.photo)
        }

        // Initialize step2Data with default values
        const newStep2Data = [
          { caloriesWithSport: "0", priceWithSport: "0", caloriesWithoutSport: "0", priceWithoutSport: "0" },
          { caloriesWithSport: "0", priceWithSport: "0", caloriesWithoutSport: "0", priceWithoutSport: "0" },
          { caloriesWithSport: "0", priceWithSport: "0", caloriesWithoutSport: "0", priceWithoutSport: "0" },
        ]

        // Fetch data for each user type to populate step2Data
        try {
          // Réalignement alimentaire - Avec sport
          const reequilibrageAlimentaireSportif = await getPlat(platId, "REEQUILIBRAGE_ALIMENTAIRE_SPORTIF")
          if (reequilibrageAlimentaireSportif) {
            newStep2Data[0].caloriesWithSport = reequilibrageAlimentaireSportif.calories?.toString() || "0"
            newStep2Data[0].priceWithSport = reequilibrageAlimentaireSportif.prix?.toString() || "0"
          }

          // Réalignement alimentaire - Sans sport
          const reequilibrageAlimentaireNonSportif = await getPlat(platId, "REEQUILIBRAGE_ALIMENTAIRE_NON_SPORTIF")
          if (reequilibrageAlimentaireNonSportif) {
            newStep2Data[0].caloriesWithoutSport = reequilibrageAlimentaireNonSportif.calories?.toString() || "0"
            newStep2Data[0].priceWithoutSport = reequilibrageAlimentaireNonSportif.prix?.toString() || "0"
          }

          // Prise de masse - Avec sport
          const priseDeMassesSportif = await getPlat(platId, "PRISE_DE_MASSES_PORTIF")
          if (priseDeMassesSportif) {
            newStep2Data[1].caloriesWithSport = priseDeMassesSportif.calories?.toString() || "0"
            newStep2Data[1].priceWithSport = priseDeMassesSportif.prix?.toString() || "0"
          }

          // Prise de masse - Sans sport
          const priseDeMasseNonSportif = await getPlat(platId, "PRISE_DE_MASSE_NON_SPORTIF")
          if (priseDeMasseNonSportif) {
            newStep2Data[1].caloriesWithoutSport = priseDeMasseNonSportif.calories?.toString() || "0"
            newStep2Data[1].priceWithoutSport = priseDeMasseNonSportif.prix?.toString() || "0"
          }

          // Perte de poids - Avec sport
          const perteDePoidsPortif = await getPlat(platId, "PERTE_DE_POID_SPORTIF")
          if (perteDePoidsPortif) {
            newStep2Data[2].caloriesWithSport = perteDePoidsPortif.calories?.toString() || "0"
            newStep2Data[2].priceWithSport = perteDePoidsPortif.prix?.toString() || "0"
          }

          // Perte de poids - Sans sport
          const perteDePoidsNonSportif = await getPlat(platId, "PERTE_DE_POIDS_NON_SPORTIF")
          if (perteDePoidsNonSportif) {
            newStep2Data[2].caloriesWithoutSport = perteDePoidsNonSportif.calories?.toString() || "0"
            newStep2Data[2].priceWithoutSport = perteDePoidsNonSportif.prix?.toString() || "0"
          }
        } catch (error) {
          console.error("Error fetching plat calories data:", error)
        }

        setStep2Data(newStep2Data)
      }
    } catch (error) {
      console.error("Error fetching plat data:", error)
      alert("Erreur lors de la récupération des données du plat")
    } finally {
      setIsLoadingData(false)
    }
  }

  if (!showModal) return null

  const convertEnumToTypeString = (typeEnum: string): string => {
    switch (typeEnum) {
      case "ENTREE":
      case "ENTREE_DEJEUNER":
      case "ENTREE_DINER":
        return "Entrée"
      case "PLAT":
      case "PLAT_DEJEUNER":
      case "PLAT_DINER":
        return "Plat"
      case "DESSERT":
      case "DESSERT_DEJEUNER":
      case "DESSERT_DINER":
        return "Dessert"
      default:
        return "Plat"
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, image: file })
      setImagePreview(URL.createObjectURL(file))
      setErrors((prev) => ({ ...prev, image: "" }))
    }
  }

  const handleStep2Change = (index: number, field: keyof (typeof step2Data)[number], value: string) => {
    const updatedData = [...step2Data]
    updatedData[index][field] = value
    setStep2Data(updatedData)
    setErrors((prev) => ({ ...prev, [`${field}-${index}`]: "" }))
  }

  const validateStep1 = () => {
    const result = step1Schema.safeParse(formData)
    if (!result.success) {
      const newErrors: { [key: string]: string } = {}
      result.error.issues.forEach((issue) => {
        newErrors[issue.path[0]] = issue.message
      })
      setErrors(newErrors)
      return false
    }
    return true
  }

  const validateStep2 = () => {
    let isValid = true
    const newErrors: Record<string, string> = {}

    step2Data.forEach((item, index) => {
      if (!item.caloriesWithSport || isNaN(Number(item.caloriesWithSport)) || Number(item.caloriesWithSport) <= 0) {
        newErrors[`caloriesWithSport-${index}`] = "Champ requis et doit être un nombre positif"
        isValid = false
      }

      if (!item.priceWithSport || isNaN(Number(item.priceWithSport)) || Number(item.priceWithSport) <= 0) {
        newErrors[`priceWithSport-${index}`] = "Champ requis et doit être un nombre positif"
        isValid = false
      }

      if (
        !item.caloriesWithoutSport ||
        isNaN(Number(item.caloriesWithoutSport)) ||
        Number(item.caloriesWithoutSport) <= 0
      ) {
        newErrors[`caloriesWithoutSport-${index}`] = "Champ requis et doit être un nombre positif"
        isValid = false
      }

      if (!item.priceWithoutSport || isNaN(Number(item.priceWithoutSport)) || Number(item.priceWithoutSport) <= 0) {
        newErrors[`priceWithoutSport-${index}`] = "Champ requis et doit être un nombre positif"
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return
    if (step === 2 && !validateStep2()) return
    setStep(step + 1)
  }

  const convertTypePlatToEnum = (typeString: string): string => {
    switch (typeString) {
      case "Entrée":
        return "ENTREE"
      case "Plat":
        return "PLAT"
      case "Dessert":
        return "DESSERT"
      default:
        return "PLAT"
    }
  }

  // Fix the handleSubmit function to only update the image if a new one is selected
  const handleSubmit = async () => {
    if (!validateStep2()) return
    setIsLoading(true)

    try {
      const platCalories: PlatCalories[] = [
        {
          typeUser: "PERTE_DE_POID_SPORTIF",
          calories: Number(step2Data[2].caloriesWithSport),
          prix: Number(step2Data[2].priceWithSport),
        },
        {
          typeUser: "PERTE_DE_POIDS_NON_SPORTIF",
          calories: Number(step2Data[2].caloriesWithoutSport),
          prix: Number(step2Data[2].priceWithoutSport),
        },
        {
          typeUser: "REEQUILIBRAGE_ALIMENTAIRE_SPORTIF",
          calories: Number(step2Data[0].caloriesWithSport),
          prix: Number(step2Data[0].priceWithSport),
        },
        {
          typeUser: "REEQUILIBRAGE_ALIMENTAIRE_NON_SPORTIF",
          calories: Number(step2Data[0].caloriesWithoutSport),
          prix: Number(step2Data[0].priceWithoutSport),
        },
        {
          typeUser: "PRISE_DE_MASSES_PORTIF",
          calories: Number(step2Data[1].caloriesWithSport),
          prix: Number(step2Data[1].priceWithSport),
        },
        {
          typeUser: "PRISE_DE_MASSE_NON_SPORTIF",
          calories: Number(step2Data[1].caloriesWithoutSport),
          prix: Number(step2Data[1].priceWithoutSport),
        },
      ]

      // Use the current photo URL if no new image is selected
      const platData: PlatData = {
        nomPlat: formData.name,
        description: formData.description,
        ingredient: formData.ingredients,
        photo: imagePreview || "", // Keep the existing photo URL
        typePlat: convertTypePlatToEnum(formData.type),
        platCalories: platCalories,
      }

      // Update the plat
      await updatePlat(platId, platData)

      // Only upload new image if available
      if (formData.image) {
        await uploadPlatImage(platId, formData.image)
      }

      alert("Plat mis à jour avec succès !")
      onClose()
    } catch (error) {
      console.error("Erreur lors de la mise à jour du plat:", error)
      alert("Erreur lors de la mise à jour du plat")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-screen-sm overflow-y-auto relative p-8">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-[#F15928] hover:text-[#d9481f] p-2 bg-white rounded-full shadow"
          disabled={isLoading || isLoadingData}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="block text-3xl font-semibold mb-4">Modifier le plat</h2>

        {isLoadingData ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F15928]"></div>
          </div>
        ) : (
          <>
            <div className="flex justify-center gap-4 mb-6">
              <div className={`h-2 w-1/2 rounded-full ${step >= 1 ? "bg-[#F15928]" : "bg-[#FDDACF]"}`} />
              <div className={`h-2 w-1/2 rounded-full ${step >= 2 ? "bg-[#F15928]" : "bg-[#FDDACF]"}`} />
            </div>
            {step === 1 && (
              <div>
                <label className="block text-lg font-medium mb-1">Nom du plat</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 bg-transparent border-b shadow-lg rounded-lg focus:outline-none"
                  placeholder="Nom du plat"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}

                <label className="block text-lg font-medium mt-4 mb-1">Type du plat</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="shadow-lg rounded-lg w-full p-2 bg-transparent border-b focus:outline-none"
                >
                  <option value="">Type du plat</option>
                  <option>Plat</option>
                  <option>Entrée</option>
                  <option>Dessert</option>
                </select>
                {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}

                <label className="block text-lg font-medium mt-4 mb-1">Description :</label>
                <input
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full p-2 shadow-lg rounded-lg bg-transparent border-b focus:outline-none"
                  placeholder="Description"
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}

                <label className="block text-lg font-medium mt-4 mb-1">Ingrédients :</label>
                <input
                  name="ingredients"
                  value={formData.ingredients}
                  onChange={handleChange}
                  className="shadow-lg rounded-lg w-full p-2 bg-transparent border-b focus:outline-none"
                  placeholder="Ingrédients"
                />

                <div className="mt-6 bg-[#FEE9E2] p-6 rounded-lg flex flex-col items-center justify-center">
                  <div className="h-12 w-12 bg-[#F15928] rounded-full flex items-center justify-center text-white text-xl">
                    +
                  </div>
                  <p className="mt-2 font-medium">Importez une photo du plat</p>
                  <p className="text-sm text-gray-500">Fichiers acceptés : .png, .jpeg</p>
                  <input type="file" accept="image/png, image/jpeg" onChange={handleImageChange} className="mt-2" />
                  {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
                  {imagePreview && (
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Plat preview"
                      className="mt-2 w-32 h-32 object-cover"
                    />
                  )}
                </div>

                <div className="flex justify-between mt-6 gap-2">
                  <button
                    className="w-1/2 border border-[#F15928] text-[#F15928] px-4 py-2 rounded"
                    onClick={onClose}
                    disabled={isLoading}
                  >
                    Annuler
                  </button>
                  <button
                    className="w-1/2 bg-[#F15928] text-white px-4 py-2 rounded"
                    onClick={handleNext}
                    disabled={isLoading}
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                {["Réalignement alimentaire", "Prise de masse", "Perte de poids"].map((category, index) => (
                  <div key={index} className="bg-[#EAF5F3] p-4 rounded-lg mb-4">
                    <h3 className="font-medium">{category}</h3>
                    <p className="mt-2">• Avec sport :</p>
                    <div className="flex gap-4 mt-1">
                      <div className="w-full">
                        <input
                          value={step2Data[index].caloriesWithSport}
                          onChange={(e) => handleStep2Change(index, "caloriesWithSport", e.target.value)}
                          className="w-full p-2 bg-transparent border-b shadow focus:outline-none"
                          placeholder="Nombre de calories"
                        />
                        {errors[`caloriesWithSport-${index}`] && (
                          <p className="text-red-500 text-sm mt-1">{errors[`caloriesWithSport-${index}`]}</p>
                        )}
                      </div>
                      <div className="relative w-full">
                        <input
                          type="text"
                          value={step2Data[index].priceWithSport}
                          onChange={(e) => handleStep2Change(index, "priceWithSport", e.target.value)}
                          className="w-full p-2 pr-10 bg-transparent border-b shadow focus:outline-none"
                          placeholder="Prix"
                        />
                        <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">TND</span>
                        {errors[`priceWithSport-${index}`] && (
                          <p className="text-red-500 text-sm mt-1">{errors[`priceWithSport-${index}`]}</p>
                        )}
                      </div>
                    </div>

                    <p className="mt-2">• Sans sport :</p>
                    <div className="flex gap-4 mt-1">
                      <div className="w-full">
                        <input
                          value={step2Data[index].caloriesWithoutSport}
                          onChange={(e) => handleStep2Change(index, "caloriesWithoutSport", e.target.value)}
                          className="w-full p-2 bg-transparent border-b shadow focus:outline-none"
                          placeholder="Nombre de calories"
                        />
                        {errors[`caloriesWithoutSport-${index}`] && (
                          <p className="text-red-500 text-sm mt-1">{errors[`caloriesWithoutSport-${index}`]}</p>
                        )}
                      </div>
                      <div className="relative w-full">
                        <input
                          type="text"
                          value={step2Data[index].priceWithoutSport}
                          onChange={(e) => handleStep2Change(index, "priceWithoutSport", e.target.value)}
                          className="w-full p-2 pr-10 bg-transparent border-b shadow focus:outline-none"
                          placeholder="Prix"
                        />
                        <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">TND</span>
                        {errors[`priceWithoutSport-${index}`] && (
                          <p className="text-red-500 text-sm mt-1">{errors[`priceWithoutSport-${index}`]}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex justify-between mt-6 gap-3">
                  <button
                    className="w-1/2 border border-[#F15928] text-[#F15928] px-4 py-2 rounded"
                    onClick={() => setStep(1)}
                    disabled={isLoading}
                  >
                    Retour
                  </button>
                  <button
                    className="w-1/2 bg-[#F15928] text-white px-4 py-2 rounded flex justify-center items-center"
                    onClick={handleSubmit}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
                    ) : (
                      "Mettre à jour"
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
