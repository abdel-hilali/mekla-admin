"use client"

import { createPlat } from "@/apis/plats_api"
import { TYPE_USER } from "@/constants/constants"
import { step1Schema } from "@/lib/schema"
import { PlatCalories, PlatData } from "@/types/types"
import type React from "react"

import { useState } from "react"

interface AddPlatProps {
  showModal: boolean
  onClose: () => void
}

export default function AddPlat({ showModal, onClose }: AddPlatProps) {
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

  if (!showModal) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setErrors((prev) => ({ ...prev, [e.target.name]: "" })) // Clear error on change
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, image: file })
      setImagePreview(URL.createObjectURL(file))
      setErrors((prev) => ({ ...prev, image: "" })) // Clear error on change
    }
  }

  const handleStep2Change = (index: number, field: keyof (typeof step2Data)[number], value: string) => {
    const updatedData = [...step2Data]
    updatedData[index][field] = value
    setStep2Data(updatedData)
    setErrors((prev) => ({ ...prev, [`${field}-${index}`]: "" })) // Clear error on change
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

    // Check each field in each category
    step2Data.forEach((item, index) => {
      // Check caloriesWithSport
      if (!item.caloriesWithSport || isNaN(Number(item.caloriesWithSport)) || Number(item.caloriesWithSport) <= 0) {
        newErrors[`caloriesWithSport-${index}`] = "Champ requis et doit être un nombre positif"
        isValid = false
      }

      // Check priceWithSport
      if (!item.priceWithSport || isNaN(Number(item.priceWithSport)) || Number(item.priceWithSport) <= 0) {
        newErrors[`priceWithSport-${index}`] = "Champ requis et doit être un nombre positif"
        isValid = false
      }

      // Check caloriesWithoutSport
      if (
        !item.caloriesWithoutSport ||
        isNaN(Number(item.caloriesWithoutSport)) ||
        Number(item.caloriesWithoutSport) <= 0
      ) {
        newErrors[`caloriesWithoutSport-${index}`] = "Champ requis et doit être un nombre positif"
        isValid = false
      }

      // Check priceWithoutSport
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
        return "ENTREE_DEJEUNER";
      case "Plat":
        return "PLAT_DEJEUNER";
      case "Dessert":
        return "DESSERT_DEJEUNER";
      default:
        return "PLAT"; // Default to PLAT if type is not recognized
    }
  };
  const handleSubmit = async () => {
    if (!validateStep2()) return
    
      const platCalories: PlatCalories[] = [
        {
          typeUser: TYPE_USER[0],
          calories: Number(step2Data[0].caloriesWithSport),
          prix: Number(step2Data[0].priceWithSport),
        },
        {
          typeUser: TYPE_USER[1],
          calories: Number(step2Data[0].caloriesWithoutSport),
          prix: Number(step2Data[0].priceWithoutSport),
        },
        {
          typeUser: TYPE_USER[2],
          calories: Number(step2Data[1].caloriesWithSport),
          prix: Number(step2Data[1].priceWithSport),
        },
        {
          typeUser: TYPE_USER[3],
          calories: Number(step2Data[1].caloriesWithoutSport),
          prix: Number(step2Data[1].priceWithoutSport),
        },
        {
          typeUser: TYPE_USER[4],
          calories: Number(step2Data[2].caloriesWithSport),
          prix: Number(step2Data[2].priceWithSport),
        },
        {
          typeUser: TYPE_USER[5],
          calories: Number(step2Data[2].caloriesWithoutSport),
          prix: Number(step2Data[2].priceWithoutSport),
        },
      ];
    
      const platData: PlatData = {
        nomPlat: formData.name,
        description: formData.description,
        ingredient: formData.ingredients,
        photo: imagePreview, // Ensure this is a valid URL or handle file upload
        typePlat: convertTypePlatToEnum(formData.type),
        platCalories,
      };

    try {
      console.log(platData.platCalories)
      await createPlat(platData)
      alert("Plat créé avec succès !")

      onClose()
    } catch (error) {
      console.error("Erreur lors de la création du plat:", error)
      alert("Erreur lors de la création du plat")
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-screen-sm overflow-y-auto relative p-8">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-[#F15928] hover:text-[#d9481f] p-2 bg-white rounded-full shadow"
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
        <h2 className="block text-3xl font-semibold mb-4">Créer un nouveau plat</h2>
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
              <button className="w-1/2 border border-[#F15928] text-[#F15928] px-4 py-2 rounded" onClick={onClose}>
                Annuler
              </button>
              <button className="w-1/2 bg-[#F15928] text-white px-4 py-2 rounded" onClick={handleNext}>
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
              >
                Retour
              </button>
              <button className="w-1/2 bg-[#F15928] text-white px-4 py-2 rounded" onClick={handleSubmit}>
                Créer le plat
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

