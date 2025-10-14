"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bell, Search, Settings } from "lucide-react"

interface DoctorTopBarProps {
  activeTab: string
  greeting: string
  doctorInfo: {
    first_name: string
    last_name: string
    specialty?: string
  } | null
  userFullName?: string | null
  userEmail?: string | null
  currentDateFormatted: string
  mounted: boolean
  newMessagesCount: number
}

export default function DoctorTopBar({
  activeTab,
  greeting,
  doctorInfo,
  userFullName,
  userEmail,
  currentDateFormatted,
  mounted,
  newMessagesCount,
}: DoctorTopBarProps) {
  const getTabTitle = () => {
    const titles: Record<string, string> = {
      timeline: "Tổng quan",
      chart: "Hồ sơ bệnh nhân",
      inpatient: "Nội trú",
      results: "Kết quả xét nghiệm",
      shifts: "Lịch ca trực",
      staff: "Nhân viên",
      doctors: "Bác sĩ",
      patients: "Bệnh nhân",
      appointments: "Lịch hẹn",
      "medical-records": "Hồ sơ y tế",
      inbox: "Hộp thư",
    }
    return titles[activeTab] || "Dashboard"
  }

  const displayName = doctorInfo
    ? `${doctorInfo.first_name} ${doctorInfo.last_name}`
    : userFullName || userEmail || "Bác sĩ"

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{getTabTitle()}</h2>
          <p className="text-sm text-gray-500">
            Chào buổi {greeting || "sáng"}, {displayName}
            {doctorInfo?.specialty && ` - ${doctorInfo.specialty}`}
          </p>
          {mounted && currentDateFormatted && (
            <p className="text-xs text-gray-400 mt-1">{currentDateFormatted}</p>
          )}
        </div>
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            {newMessagesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {newMessagesCount}
              </span>
            )}
          </Button>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm..."
              className="pl-10 w-64"
            />
          </div>

          {/* Settings */}
          <Button variant="ghost" size="sm">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
