"use client"

import { X } from "lucide-react"
import { useEffect } from "react"

interface ValidationPopupProps {
  message: string
  isOpen: boolean
  onClose: () => void
}

export default function ValidationPopup({ message, isOpen, onClose }: ValidationPopupProps) {
  useEffect(() => {
    if (isOpen) {
      // Auto-close after 3 seconds
      const timer = setTimeout(() => {
        onClose()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4 relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
          <X className="h-5 w-5" />
        </button>
        <div className="text-center">
          <div className="mb-4 text-[#F15928] text-4xl">⚠️</div>
          <p className="text-gray-800">{message}</p>
        </div>
        <div className="mt-6 flex justify-center">
          <button onClick={onClose} className="px-4 py-2 bg-[#F15928] text-white rounded-md hover:bg-[#d64d22]">
            OK
          </button>
        </div>
      </div>
    </div>
  )
}

