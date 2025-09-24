"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Clock,
  CreditCard,
  Plus,
  Edit,
  FileText,
  History,
  User,
  Activity,
  TrendingUp,
  Bell,
} from "lucide-react"

interface PatientProfile {
  patient_id: number
  patient_code: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  address: string | null
  date_of_birth: string
  gender: string
  medical_history: string | null
  created_at: string
  updated_at: string
}

interface PatientOverviewProps {
  patientProfile: PatientProfile | null
  appointments: any[]
  prescriptions: any[]
  medicalHistory: any[]
  billing: any[]
  upcomingAppointments: number
  unpaidBills: number
  onSetActiveTab: (tab: string) => void
  onOpenBooking: () => void
  getStatusColor: (status: string) => string
  getDoctorName: (appointment: any) => string
  getAppointmentDate: (appointment: any) => string
  getAppointmentTime: (appointment: any) => string
  getAppointmentId: (appointment: any) => number
}

export default function PatientOverview({
  patientProfile,
  appointments,
  prescriptions,
  medicalHistory,
  billing,
  upcomingAppointments,
  unpaidBills,
  onSetActiveTab,
  onOpenBooking,
  getStatusColor,
  getDoctorName,
  getAppointmentDate,
  getAppointmentTime,
  getAppointmentId,
}: PatientOverviewProps) {
  // Calculate additional stats
  const totalVisits = medicalHistory.length
  const completedAppointments = appointments.filter(apt => apt.status === "Đã hoàn thành").length
  const pendingAppointments = appointments.filter(apt => apt.status === "Chờ xác nhận").length
  
  // Recent activity notifications
  const recentActivities = [
    {
      type: "appointment",
      message: "Lịch hẹn với BS. Nguyễn Văn A",
      time: "2 giờ trước",
      icon: Calendar,
      color: "text-blue-600",
    },
    {
      type: "prescription",
      message: "Đơn thuốc mới được cấp",
      time: "1 ngày trước", 
      icon: FileText,
      color: "text-green-600",
    },
    {
      type: "billing",
      message: "Hóa đơn thanh toán",
      time: "3 ngày trước",
      icon: CreditCard,
      color: "text-orange-600",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Card với thông tin bệnh nhân */}
      <Card className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-blue-200 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full -mr-16 -mt-16 opacity-20"></div>
        <CardContent className="p-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                <User className="h-10 w-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  Xin chào, {patientProfile ? `${patientProfile.first_name} ${patientProfile.last_name}` : 'Bệnh nhân'}!
                </h2>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                  <span>Mã BN: <span className="font-mono font-semibold">{patientProfile?.patient_code || 'N/A'}</span></span>
                  <span>•</span>
                  <span>Thành viên từ {patientProfile?.created_at ? new Date(patientProfile.created_at).toLocaleDateString('vi-VN') : 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    <Activity className="h-3 w-3 mr-1" />
                    Đang hoạt động
                  </Badge>
                  {upcomingAppointments > 0 && (
                    <Badge variant="default" className="bg-green-100 text-green-700">
                      <Calendar className="h-3 w-3 mr-1" />
                      {upcomingAppointments} lịch hẹn sắp tới
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button onClick={() => onSetActiveTab("patients")} variant="outline" className="shadow-sm">
              <Edit className="h-4 w-4 mr-2" />
              Cập nhật thông tin
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Lịch hẹn sắp tới</p>
                <p className="text-3xl font-bold text-blue-600">{upcomingAppointments}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <p className="text-xs text-green-600 font-medium">Tuần này</p>
                </div>
              </div>
              <div className="p-4 bg-blue-100 rounded-full">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Đơn thuốc</p>
                <p className="text-3xl font-bold text-green-600">{prescriptions.length}</p>
                <div className="flex items-center mt-2">
                  <Clock className="h-4 w-4 text-orange-500 mr-1" />
                  <p className="text-xs text-orange-600 font-medium">Tổng số</p>
                </div>
              </div>
              <div className="p-4 bg-green-100 rounded-full">
                <FileText className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Lần khám</p>
                <p className="text-3xl font-bold text-purple-600">{totalVisits}</p>
                <div className="flex items-center mt-2">
                  <Activity className="h-4 w-4 text-blue-500 mr-1" />
                  <p className="text-xs text-blue-600 font-medium">Hoàn thành</p>
                </div>
              </div>
              <div className="p-4 bg-purple-100 rounded-full">
                <History className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Hóa đơn</p>
                <p className="text-3xl font-bold text-red-600">{unpaidBills}</p>
                <div className="flex items-center mt-2">
                  <Bell className="h-4 w-4 text-red-500 mr-1" />
                  <p className="text-xs text-red-600 font-medium">Cần thanh toán</p>
                </div>
              </div>
              <div className="p-4 bg-red-100 rounded-full">
                <CreditCard className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="h-5 w-5 mr-2 text-blue-600" />
            Thao tác nhanh
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={onOpenBooking}
              className="flex flex-col items-center justify-center p-8 h-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md"
            >
              <Plus className="h-10 w-10 mb-3" />
              <span className="font-semibold text-lg">Đặt lịch hẹn</span>
              <span className="text-xs opacity-90">Đặt lịch khám mới với bác sĩ</span>
            </Button>
            <Button 
              variant="outline"
              onClick={() => onSetActiveTab("history")}
              className="flex flex-col items-center justify-center p-8 h-auto hover:bg-purple-50 border-purple-200 group"
            >
              <History className="h-10 w-10 mb-3 text-purple-600 group-hover:text-purple-700" />
              <span className="font-semibold text-lg text-purple-700">Lịch sử khám</span>
              <span className="text-xs text-gray-500">Xem hồ sơ y tế của bạn</span>
            </Button>
            <Button 
              variant="outline"
              onClick={() => onSetActiveTab("billing")}
              className="flex flex-col items-center justify-center p-8 h-auto hover:bg-green-50 border-green-200 group"
            >
              <CreditCard className="h-10 w-10 mb-3 text-green-600 group-hover:text-green-700" />
              <span className="font-semibold text-lg text-green-700">Thanh toán</span>
              <span className="text-xs text-gray-500">Quản lý hóa đơn</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity & Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2 text-orange-600" />
              Hoạt động gần đây
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`p-2 rounded-full bg-white shadow-sm`}>
                    <activity.icon className={`h-4 w-4 ${activity.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Appointments */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                Lịch hẹn gần đây
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onSetActiveTab("appointments")}
                className="text-blue-600 hover:text-blue-700"
              >
                Xem tất cả →
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {appointments.length > 0 ? appointments.slice(0, 4).map((appointment) => (
                <div key={getAppointmentId(appointment)} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{getDoctorName(appointment)}</p>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{getAppointmentDate(appointment)}</span>
                        <Clock className="h-4 w-4 ml-2" />
                        <span>{getAppointmentTime(appointment)}</span>
                      </div>
                    </div>
                  </div>
                  <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                </div>
              )) : (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có lịch hẹn nào</h3>
                  <p className="text-sm mb-4">Đặt lịch hẹn đầu tiên của bạn để bắt đầu</p>
                  <Button 
                    onClick={onOpenBooking}
                    variant="outline"
                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Đặt lịch ngay
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}