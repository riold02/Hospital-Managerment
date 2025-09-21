"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { canAccessRoute } from "@/lib/data-adapter"
import type { Role } from "@/lib/rbac"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface RBACRouteProps {
  route: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function RBACRoute({ route, children, fallback }: RBACRouteProps) {
  const { role, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth")
      return
    }

    if (role && !canAccessRoute(role as Role, route)) {
      router.push("/dashboard")
      return
    }
  }, [role, isAuthenticated, route, router])

  if (!isAuthenticated) {
    return fallback || <div>Đang chuyển hướng...</div>
  }

  if (!role || !canAccessRoute(role as Role, route)) {
    return fallback || <div>Không có quyền truy cập</div>
  }

  return <>{children}</>
}
