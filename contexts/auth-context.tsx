"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getConnectedUserId, getProfileDetails } from "@/apis/auth"
import type { Profile } from "@/types/types"

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  user: Profile | null
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  logout: () => {},
})

export const useAuth = () => useContext(AuthContext)

// List of public routes that don't require authentication
const publicRoutes = ["/sign-in", "/sign-up", "/forgot-password"]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<Profile | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is logged in
        const userId = await getConnectedUserId()

        if (userId) {
          // User is authenticated, fetch profile
          const profile = await getProfileDetails()
          setUser(profile)
          setIsAuthenticated(true)
        } else {
          // User is not authenticated
          setIsAuthenticated(false)
          setUser(null)

          // If current route is not public, redirect to sign-in
          if (!publicRoutes.includes(pathname) && pathname !== "/") {
            router.push("/sign-in")
          }
        }
      } catch (error) {
        console.error("Auth check error:", error)
        setIsAuthenticated(false)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [pathname, router])

  const logout = () => {
    localStorage.removeItem("isLoggedIn")
    setIsAuthenticated(false)
    setUser(null)
    router.push("/sign-in")
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, logout }}>
      {isLoading && !publicRoutes.includes(pathname) ? (
        // You can add a loading spinner here
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin h-10 w-10 border-4 border-[#f15928] rounded-full border-t-transparent"></div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  )
}

