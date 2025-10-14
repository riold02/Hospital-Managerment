"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Role } from "./rbac"
import { useRouter } from "next/navigation"
import { apiClient } from "./api-client"

interface UserProfile {
  first_name?: string
  last_name?: string
  position?: string | null
  staff_role?: string | null
}

interface User {
  id: string
  user_id: string
  email: string
  role: string
  roles?: string[]
  permissions?: string[]
  type?: "patient" | "staff"
  patient_id?: number | null
  staff_id?: number | null
  department_id?: number | null
  profile?: UserProfile
}

interface AuthContextType {
  user: User | null
  role: Role | null
  isDemo: boolean
  isAuthenticated: boolean
  login: (jwtToken: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  isDemo: false,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isDemo, setIsDemo] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    if (!token) return

    // Check if this is a demo token
    if (token && token.startsWith('demo_')) {
      console.log("[AUTH] Detected demo token:", token.substring(0, 20) + "...")
      // For demo users, get data from localStorage
      const userInfo = localStorage.getItem("user_info")
      if (userInfo) {
        try {
          const userData = JSON.parse(userInfo) as User
          console.log("[AUTH] Loading demo user from localStorage:", userData)
          setUser(userData)
          setIsDemo(true)
          const primaryRole = (userData.roles?.[0] || userData.role || "patient").toLowerCase()
          localStorage.setItem("user_role", primaryRole)
          console.log("[AUTH] Demo user role:", primaryRole)
        } catch (error) {
          console.error("[AUTH] Failed to parse demo user info:", error)
          localStorage.removeItem("auth_token")
          localStorage.removeItem("user_role")
          localStorage.removeItem("user_info")
          router.push("/")
        }
      } else {
        // No user info stored yet, wait a bit
        console.log("No demo user info found, will check again...")
        setTimeout(() => {
          const userInfoRetry = localStorage.getItem("user_info")
          if (userInfoRetry) {
            try {
              const userData = JSON.parse(userInfoRetry) as User
              console.log("Loading demo user from localStorage (retry):", userData)
              setUser(userData)
              setIsDemo(true)
              const primaryRole = (userData.roles?.[0] || userData.role || "patient").toLowerCase()
              localStorage.setItem("user_role", primaryRole)
            } catch (error) {
              console.error("Failed to parse demo user info (retry):", error)
            }
          }
        }, 500)
      }
    } else {
      // For real users, call API
      console.log("[AUTH] Real token detected, calling /auth/me...")
      apiClient
        .get("/auth/me")
        .then((resp: any) => {
          if (resp?.success && resp?.data) {
            console.log("[AUTH] Successfully loaded real user:", resp.data)
            setUser(resp.data as User)
            const primaryRole = (resp.data.roles?.[0] || resp.data.role || "patient").toLowerCase()
            setIsDemo(false)
            localStorage.setItem("user_role", primaryRole)
            localStorage.setItem("user_info", JSON.stringify(resp.data))
            console.log("[AUTH] Real user role:", primaryRole)
          }
        })
        .catch((error) => {
          // token có thể hết hạn
          console.error("[AUTH] Failed to fetch user data on mount:", error)
          console.log("[AUTH] Error details:", error.response?.data || error.message)
          console.log("[AUTH] Clearing auth data and redirecting to home...")
          localStorage.removeItem("auth_token")
          localStorage.removeItem("user_role")
          localStorage.removeItem("user_info")
          // Redirect to home if token is invalid
          router.push("/")
        })
    }
  }, [])

  const login = async (jwtToken: string) => {
    try {
      localStorage.setItem("auth_token", jwtToken)
      
      // Check if this is a demo token
      if (jwtToken && jwtToken.startsWith('demo_')) {
        // For demo users, get data from localStorage
        const userInfo = localStorage.getItem("user_info")
        if (userInfo) {
          const userData = JSON.parse(userInfo) as User
          setUser(userData)
          setIsDemo(true)
          const primaryRole = (userData.roles?.[0] || userData.role || "patient").toLowerCase()
          localStorage.setItem("user_role", primaryRole)
          
          // Auto-redirect for demo users based on role
          const roleRoutes: Record<string, string> = {
            admin: "/dashboard",
            doctor: "/dashboard/doctor",
            nurse: "/dashboard/nurse", 
            patient: "/dashboard/patient",
            pharmacist: "/dashboard/pharmacist",
            technician: "/dashboard/technician",
            "lab assistant": "/dashboard/lab",
            driver: "/dashboard/driver",
            worker: "/dashboard/worker",
          }
          
          const redirectPath = roleRoutes[primaryRole] || "/dashboard/patient"
          setTimeout(() => router.push(redirectPath), 100)
        }
      } else {
        // For real users, always call /auth/me to get fresh data from backend
        const resp: any = await apiClient.get("/auth/me")
        if (resp?.success && resp?.data) {
          const userData = resp.data as User
          setUser(userData)
          const primaryRole = (userData.roles?.[0] || userData.role || "patient").toLowerCase()
          setIsDemo(false)
          localStorage.setItem("user_role", primaryRole)
          localStorage.setItem("user_info", JSON.stringify(userData))
          console.log("Real user logged in:", userData)
          
          // Auto-redirect for real users based on role
          const roleRoutes: Record<string, string> = {
            admin: "/dashboard",
            doctor: "/dashboard/doctor",
            nurse: "/dashboard/nurse",
            patient: "/dashboard/patient",
            pharmacist: "/dashboard/pharmacist",
            technician: "/dashboard/technician",
            "lab assistant": "/dashboard/lab",
            driver: "/dashboard/driver",
            worker: "/dashboard/worker",
          }
          
          const redirectPath = roleRoutes[primaryRole] || "/dashboard/patient"
          setTimeout(() => router.push(redirectPath), 100)
        }
      }
    } catch (error) {
      console.error("Login flow failed:", error)
      localStorage.removeItem("auth_token")
      localStorage.removeItem("user_role")
      localStorage.removeItem("user_info")
      throw error
    }
  }

  const logout = async () => {
    try {
      if (user && !user.user_id?.startsWith("demo_")) {
        await apiClient.logout()
      }
    } catch (error) {
      console.error("Logout API call failed:", error)
      // Continue with local logout even if API fails
    }

    setUser(null)
    setIsDemo(false)
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_role")
    localStorage.removeItem("user_info")
    router.push("/")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        role: (user?.roles?.[0] as Role) || ((user?.role as unknown as Role) || null),
        isDemo,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
