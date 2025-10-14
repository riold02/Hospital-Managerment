"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  CheckCircle,
  TestTube,
  AlertTriangle,
  Bed,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react"

interface KPIData {
  appointmentsToday: number
  completedToday: number
  pendingResults: number
  criticalAlerts: number
  inpatients: number
  newMessages: number
}

interface DoctorKPICardsProps {
  kpiData: KPIData
}

export default function DoctorKPICards({ kpiData }: DoctorKPICardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 mb-8">
      {/* Today's Appointments - Light Blue */}
      <Card className="bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Calendar
                className="h-6 w-6 text-blue-600 mb-2"
                strokeWidth={2}
              />
              <p className="text-4xl font-bold text-blue-800">
                {kpiData.appointmentsToday}
              </p>
              <p className="text-sm font-medium text-blue-600">Hẹn hôm nay</p>
              <div className="flex items-center gap-1 text-xs text-blue-500">
                <TrendingUp className="h-3 w-3" />
                <span>+2 từ hôm qua</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completed - Light Green */}
      <Card className="bg-gradient-to-br from-green-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CheckCircle
                className="h-6 w-6 text-green-600 mb-2"
                strokeWidth={2}
              />
              <p className="text-4xl font-bold text-green-800">
                {kpiData.completedToday}
              </p>
              <p className="text-sm font-medium text-green-600">
                Đã hoàn thành
              </p>
              <div className="flex items-center gap-1 text-xs text-green-500">
                <TrendingUp className="h-3 w-3" />
                <span>+1 từ hôm qua</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Results - Light Purple */}
      <Card className="bg-gradient-to-br from-purple-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <TestTube
                className="h-6 w-6 text-purple-600 mb-2"
                strokeWidth={2}
              />
              <p className="text-4xl font-bold text-purple-800">
                {kpiData.pendingResults}
              </p>
              <p className="text-sm font-medium text-purple-600">Kết quả chờ</p>
              <div className="flex items-center gap-1 text-xs text-purple-500">
                <Minus className="h-3 w-3" />
                <span>Không đổi</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts - Light Red */}
      <Card className="bg-gradient-to-br from-red-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <AlertTriangle
                className="h-6 w-6 text-red-600 mb-2"
                strokeWidth={2}
              />
              <p className="text-4xl font-bold text-red-800">
                {kpiData.criticalAlerts}
              </p>
              <p className="text-sm font-medium text-red-600">Cảnh báo</p>
              <div className="flex items-center gap-1 text-xs text-red-500">
                <TrendingDown className="h-3 w-3" />
                <span>-1 từ hôm qua</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inpatients - Light Orange */}
      <Card className="bg-gradient-to-br from-orange-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Bed className="h-6 w-6 text-orange-600 mb-2" strokeWidth={2} />
              <p className="text-4xl font-bold text-orange-800">
                {kpiData.inpatients}
              </p>
              <p className="text-sm font-medium text-orange-600">Nội trú</p>
              <div className="flex items-center gap-1 text-xs text-orange-500">
                <TrendingUp className="h-3 w-3" />
                <span>+3 từ hôm qua</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages - Light Teal */}
      <Card className="bg-gradient-to-br from-teal-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <MessageSquare
                className="h-6 w-6 text-teal-600 mb-2"
                strokeWidth={2}
              />
              <p className="text-4xl font-bold text-teal-800">
                {kpiData.newMessages}
              </p>
              <p className="text-sm font-medium text-teal-600">Tin nhắn</p>
              <div className="flex items-center gap-1 text-xs text-teal-500">
                <TrendingUp className="h-3 w-3" />
                <span>+1 từ hôm qua</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
