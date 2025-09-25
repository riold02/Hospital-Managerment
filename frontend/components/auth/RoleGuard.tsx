"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

interface RoleGuardProps {
  allowedRole: string
  children: React.ReactNode
}

export function RoleGuard({ allowedRole, children }: RoleGuardProps) {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      const userRole = user.role?.toLowerCase()
      
      // If user role doesn't match allowed role, redirect to their appropriate dashboard
      if (userRole !== allowedRole.toLowerCase()) {
        router.push(`/dashboard/${userRole}`)
        return
      }
    }
  }, [user, router, allowedRole])

  // Don't render children if user role doesn't match
  if (user && user.role?.toLowerCase() !== allowedRole.toLowerCase()) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang chuyển hướng...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}