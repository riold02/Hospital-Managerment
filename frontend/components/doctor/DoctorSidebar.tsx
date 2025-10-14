"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Stethoscope,
  Home,
  Users,
  Calendar,
  Bed,
  FileText,
  FlaskConical,
  UserCog,
  Clock,
  // Inbox, // Hidden: Feature not yet implemented
  LogOut,
  User,
} from "lucide-react"

interface MenuItem {
  value: string
  label: string
  icon: any
  badge?: number | null
}

interface DoctorSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  kpiData: {
    inpatients: number
    pendingResults: number
    newMessages: number
  }
  doctorInfo: {
    first_name: string
    last_name: string
    specialty?: string
  } | null
  userEmail: string | null
  onLogout: () => void
}

export default function DoctorSidebar({
  activeTab,
  onTabChange,
  kpiData,
  doctorInfo,
  userEmail,
  onLogout,
}: DoctorSidebarProps) {
  const menuItems: MenuItem[] = [
    {
      value: "timeline",
      label: "Tổng quan",
      icon: Home,
      badge: null,
    },
    {
      value: "patients",
      label: "Bệnh nhân",
      icon: Users,
      badge: null,
    },
    {
      value: "appointments",
      label: "Lịch hẹn",
      icon: Calendar,
      badge: null,
    },
    {
      value: "inpatient",
      label: "Nội trú",
      icon: Bed,
      badge: kpiData.inpatients,
    },
    {
      value: "medical-records",
      label: "Hồ sơ y tế",
      icon: FileText,
      badge: null,
    },
    {
      value: "results",
      label: "Kết quả xét nghiệm",
      icon: FlaskConical,
      badge: kpiData.pendingResults,
    },
    {
      value: "doctors",
      label: "Bác sĩ",
      icon: Stethoscope,
      badge: null,
    },
    {
      value: "staff",
      label: "Nhân viên",
      icon: UserCog,
      badge: null,
    },
    {
      value: "shifts",
      label: "Lịch ca trực",
      icon: Clock,
      badge: null,
    },
    // Hidden: Inbox/Messages feature not yet implemented
    // {
    //   value: "inbox",
    //   label: "Tin nhắn",
    //   icon: Inbox,
    //   badge: kpiData.newMessages,
    // },
  ]

  const displayName = doctorInfo 
    ? `${doctorInfo.first_name} ${doctorInfo.last_name}`
    : "Bác sĩ"

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
            <Stethoscope className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Dashboard Bác sĩ</h1>
            <p className="text-sm text-gray-500">{displayName}</p>
            {doctorInfo?.specialty && (
              <p className="text-xs text-gray-400">{doctorInfo.specialty}</p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.value

          return (
            <button
              key={tab.value}
              onClick={() => onTabChange(tab.value)}
              className={`
                w-full flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm
                transition-all duration-200 ease-in-out
                ${
                  isActive
                    ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md"
                    : "text-gray-600 hover:text-green-600 hover:bg-green-50"
                }
              `}
            >
              <Icon className={`h-5 w-5 ${isActive ? "text-white" : ""}`} />
              <span className="flex-1 text-left">{tab.label}</span>
              {tab.badge && tab.badge > 0 && (
                <span
                  className={`
                    min-w-5 h-5 rounded-full text-xs font-bold
                    flex items-center justify-center
                    ${isActive ? "bg-white text-green-600" : "bg-red-500 text-white"}
                  `}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* User Info & Logout Button */}
      <div className="border-t border-gray-200">
        {/* User Info */}
        <div className="p-4 bg-gray-50">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder-user.jpg" alt="Doctor Avatar" />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {displayName}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {userEmail || "doctor@hospital.vn"}
              </p>
              <Badge variant="secondary" className="text-xs mt-1">
                DOCTOR
              </Badge>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="p-4">
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>
    </div>
  )
}
