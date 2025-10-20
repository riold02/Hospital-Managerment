"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Loader2 } from "lucide-react"

export default function HospitalDashboard() {
  const { user } = useAuth()
  const router = useRouter()

  // Auto-redirect users to their specific dashboard
  useEffect(() => {
    if (user) {
      const userRole = user.role?.toLowerCase() || user.roles?.[0]?.toLowerCase()
      
      // Redirect to role-specific dashboard
      if (userRole === 'admin') {
        router.push('/dashboard/admin')
      } else if (userRole) {
        router.push(`/dashboard/${userRole}`)
      }
    }
  }, [user, router])

  // Show loading state while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
        <p className="text-muted-foreground">Đang chuyển hướng đến dashboard...</p>
      </div>
    </div>
  )
}
