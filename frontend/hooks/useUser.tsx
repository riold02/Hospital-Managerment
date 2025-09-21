"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"

interface User {
  id: string
  full_name: string
  email: string
  role: string
  department?: string
}

interface UserContextType {
  user: User | null
  setUser: (user: User | null) => void
  loading: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function useUser() {
  const context = useContext(UserContext)

  if (context === undefined) {
    // Return mock user data when context is not available
    return {
      user: {
        id: "1",
        full_name: "Nguyễn Thị B",
        email: "nurse@hospital.com",
        role: "Nurse",
        department: "Khoa Nội",
      },
      setUser: () => {},
      loading: false,
    }
  }

  return context
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading user data
    const loadUser = async () => {
      try {
        // In a real app, this would fetch from an API or auth service
        const mockUser: User = {
          id: "1",
          full_name: "Nguyễn Thị B",
          email: "nurse@hospital.com",
          role: "Nurse",
          department: "Khoa Nội",
        }

        setUser(mockUser)
      } catch (error) {
        console.error("Failed to load user:", error)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  return <UserContext.Provider value={{ user, setUser, loading }}>{children}</UserContext.Provider>
}
