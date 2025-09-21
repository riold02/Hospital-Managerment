"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"
import { canAccessRoute } from "@/lib/rbac"
import type { Role } from "@/lib/rbac"
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Calendar,
  FileText,
  CreditCard,
  Pill,
  Bed,
  BarChart3,
  Menu,
  X,
  Bell,
  Search,
  Heart,
  HelpCircle,
  Droplets,
  Truck,
  Building2,
  Stethoscope,
  UserCog,
  ClipboardList,
} from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
  description?: string
  currentPath?: string
}

export default function DashboardLayout({
  children,
  title,
  description,
  currentPath = "/dashboard",
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { role, user, logout } = useAuth()

  const allMenuItems = [
    { icon: LayoutDashboard, label: "Tổng quan", href: "/dashboard", active: currentPath === "/dashboard" },
    { icon: Users, label: "Bệnh nhân", href: "/patients", active: currentPath === "/patients" },
    { icon: UserCheck, label: "Bác sĩ", href: "/doctors", active: currentPath === "/doctors" },
    { icon: UserCog, label: "Nhân viên", href: "/staff", active: currentPath === "/staff" },
    { icon: UserCog, label: "Phân quyền", href: "/permissions", active: currentPath === "/permissions" },
    { icon: Calendar, label: "Lịch hẹn", href: "/appointments", active: currentPath === "/appointments" },
    { icon: FileText, label: "Hồ sơ y tế", href: "/medical-records", active: currentPath === "/medical-records" },
    { icon: CreditCard, label: "Thanh toán", href: "/billing", active: currentPath === "/billing" },
    { icon: Pill, label: "Thuốc", href: "/medicine", active: currentPath === "/medicine" },
    { icon: Stethoscope, label: "Nhà thuốc", href: "/pharmacy", active: currentPath === "/pharmacy" },
    { icon: Droplets, label: "Ngân hàng máu", href: "/blood-bank", active: currentPath === "/blood-bank" },
    { icon: Building2, label: "Phòng bệnh", href: "/rooms", active: currentPath === "/rooms" },
    { icon: Bed, label: "Phân giường", href: "/room-assignments", active: currentPath === "/room-assignments" },
    { icon: ClipboardList, label: "Vệ sinh", href: "/cleaning", active: currentPath === "/cleaning" },
    { icon: Truck, label: "Xe cứu thương", href: "/ambulances", active: currentPath === "/ambulances" },
    { icon: BarChart3, label: "Báo cáo", href: "/reports", active: currentPath === "/reports" },
    { icon: HelpCircle, label: "Trợ giúp", href: "/help", active: currentPath === "/help" },
  ]

  // Filter menu items based on role permissions
  const menuItems = allMenuItems.filter(
    (item) =>
      item.href === "/dashboard" || // Always show dashboard
      item.href === "/help" || // Always show help
      (role && canAccessRoute(role as Role, item.href)),
  )

  const allRoleBasedDashboards = [
    { label: "Quản trị viên", href: "/dashboard/admin", icon: UserCog, roles: ["Admin"] },
    { label: "Bác sĩ", href: "/dashboard/doctor", icon: Stethoscope, roles: ["Doctor"] },
    { label: "Y tá", href: "/dashboard/nurse", icon: Heart, roles: ["Nurse"] },
    { label: "Dược sĩ", href: "/dashboard/pharmacist", icon: Pill, roles: ["Pharmacist"] },
    { label: "Kỹ thuật viên", href: "/dashboard/technician", icon: Building2, roles: ["Technician"] },
    { label: "Xét nghiệm", href: "/dashboard/lab", icon: FileText, roles: ["Lab Assistant"] },
    { label: "Tài xế", href: "/dashboard/driver", icon: Truck, roles: ["Driver"] },
    { label: "Công nhân", href: "/dashboard/worker", icon: ClipboardList, roles: ["Worker"] },
    { label: "Bệnh nhân", href: "/dashboard/patient", icon: Users, roles: ["Patient"] },
  ]

  const roleBasedDashboards = allRoleBasedDashboards.filter((dashboard) => role && dashboard.roles.includes(role))

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navbar */}
      <header className="bg-card border-b border-border sticky top-0 z-40 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden">
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">MediCare Plus</h1>
                <p className="text-xs text-muted-foreground">Hệ thống quản lý bệnh viện</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm kiếm bệnh nhân, bác sĩ..."
                className="pl-10 pr-4 py-2 bg-muted/50 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm w-64"
              />
            </div>
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-red-500">
                3
              </Badge>
            </Button>
            <div className="flex items-center gap-2">
              <Avatar className="w-9 h-9">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user?.profile?.first_name?.charAt(0) || user?.email?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              {sidebarOpen && (
                <div className="hidden lg:block">
                  <p className="text-sm font-medium">
                    {user?.profile?.first_name && user?.profile?.last_name 
                      ? `${user.profile.last_name} ${user.profile.first_name}`
                      : user?.email || 'User'
                    }
                  </p>
                  <p className="text-xs text-muted-foreground">{role}</p>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-muted-foreground hover:text-foreground"
              >
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`bg-card border-r border-border transition-all duration-300 ${
            sidebarOpen ? "w-72" : "w-16"
          } fixed lg:static h-screen lg:h-auto z-30 shadow-lg`}
        >
          <div className="p-4 space-y-6">
            {/* Main Navigation */}
            <div className="space-y-2">
              {sidebarOpen && (
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Chức năng chính
                </h3>
              )}
              {menuItems.map((item, index) => (
                <Link key={index} href={item.href}>
                  <Button
                    variant={item.active ? "default" : "ghost"}
                    className={`w-full justify-start gap-3 ${!sidebarOpen && "px-2"} ${
                      item.active
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && <span className="font-medium">{item.label}</span>}
                  </Button>
                </Link>
              ))}
            </div>

            {/* Role-based Dashboards */}
            {sidebarOpen && roleBasedDashboards.length > 0 && (
              <div className="space-y-2 pt-4 border-t border-border">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Dashboard chuyên biệt
                </h3>
                <div className="grid grid-cols-1 gap-1">
                  {roleBasedDashboards.map((dashboard, index) => (
                    <Link key={index} href={dashboard.href}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start gap-2 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      >
                        <dashboard.icon className="w-4 h-4" />
                        {dashboard.label}
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? "lg:ml-0" : "lg:ml-0"}`}>
          {/* Page Header */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-border">
            <div className="px-6 py-8">
              <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
                {description && <p className="text-muted-foreground text-lg">{description}</p>}
                {role && (
                  <Badge variant="secondary" className="mt-2">
                    Vai trò: {role}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="p-6">
            <div className="max-w-7xl mx-auto">{children}</div>
          </div>
        </main>
      </div>
    </div>
  )
}
