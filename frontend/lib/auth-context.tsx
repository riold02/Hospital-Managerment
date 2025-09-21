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

    apiClient
      .get("/auth/me")
      .then((resp: any) => {
        if (resp?.success && resp?.data) {
          setUser(resp.data as User)
          const primaryRole = (resp.data.roles?.[0] || resp.data.role || "patient").toLowerCase()
          setIsDemo(Boolean(resp.data.user_id && String(resp.data.user_id).startsWith("demo_")))
          localStorage.setItem("user_role", primaryRole)
          localStorage.setItem("user_info", JSON.stringify(resp.data))
        }
      })
      .catch(() => {
        // token có thể hết hạn
        localStorage.removeItem("auth_token")
        localStorage.removeItem("user_role")
        localStorage.removeItem("user_info")
      })
  }, [])

  const login = async (jwtToken: string) => {
    try {
      localStorage.setItem("auth_token", jwtToken)
      // Gọi /auth/me để lấy roles/permissions chuẩn từ backend
      const resp: any = await apiClient.get("/auth/me")
      if (resp?.success && resp?.data) {
        const userData = resp.data as User
        setUser(userData)
        const primaryRole = (userData.roles?.[0] || userData.role || "patient").toLowerCase()
        setIsDemo(Boolean(userData.user_id && String(userData.user_id).startsWith("demo_")))
        localStorage.setItem("user_role", primaryRole)
        localStorage.setItem("user_info", JSON.stringify(userData))
      }
    } catch (error) {
      console.error("Login flow failed:", error)
      localStorage.removeItem("auth_token")
      localStorage.removeItem("user_role")
      localStorage.removeItem("user_info")
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
