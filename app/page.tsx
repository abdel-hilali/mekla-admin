"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import LoadingSpinner from "@/components/loadings/l1"

export default function LoadingPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace("/dashboard")
      } else {
        router.replace("/sign-in")
      }
    }
  }, [isLoading, isAuthenticated, router])

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#F5F7FA]">
      <div className="mb-8">
        <LoadingSpinner size="large" />
      </div>
      <h1 className="text-2xl font-bold text-gray-800">Loading your experience...</h1>
      <p className="text-gray-600 mt-2">Please wait while we prepare everything for you</p>
    </div>
  )
}

