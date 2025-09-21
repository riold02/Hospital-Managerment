"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Calendar,
  Clock,
  CreditCard,
  Plus,
  Edit,
  X,
  Eye,
  Download,
  User,
  FileText,
  History,
  DollarSign,
  LogOut,
  Users,
  RefreshCw,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { apiClient, ApiError } from "@/lib/api-client"

interface Appointment {
  id: number
  doctor: string
  department: string
  date: string
  time: string
  purpose: string
  status: string
  canCancel: boolean
}

interface Prescription {
  id: number
  doctor: string
  date: string
  medications: Array<{
    name: string
    dosage: string
    duration: string
  }>
  status: string
}

interface MedicalRecord {
  id: number
  date: string
  doctor: string
  diagnosis: string
  treatment: string
  notes: string
}

interface Bill {
  id: number
  date: string
  description: string
  amount: number
  status: string
  dueDate: string
}

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

export default function PatientDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [medicalHistory, setMedicalHistory] = useState<MedicalRecord[]>([])
  const [billing, setBilling] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null)
  const [isRecordOpen, setIsRecordOpen] = useState(false)
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    date_of_birth: '',
    gender: ''
  })
  const { toast } = useToast()
  const { user, logout } = useAuth()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        console.log("[v0] Loading patient dashboard data from API")
        console.log("[v0] Current user:", user)
        console.log("[v0] Auth token:", localStorage.getItem('auth_token'))
        console.log("[v0] User role:", localStorage.getItem('user_role'))

        // Check if user is authenticated
        if (!user) {
          console.error("[v0] No user found, redirecting to login")
          // Don't show error for demo users, give auth context time to load
          const token = localStorage.getItem('auth_token')
          if (token && token.startsWith('demo_')) {
            console.log("[v0] Demo token found, waiting for auth context...")
            setLoading(false)
            return
          }
          
          toast({
            title: "Lỗi xác thực",
            description: "Vui lòng đăng nhập lại.",
            variant: "destructive",
          })
          return
        }

        // Fetch patient's profile first (most important)
        try {
          const profileData = await apiClient.get("/auth/patient/profile")
          if (profileData.success && profileData.data) {
            setPatientProfile(profileData.data.patient)
            // Initialize form with current data
            const profile = profileData.data.patient
            setProfileForm({
              first_name: profile.first_name || '',
              last_name: profile.last_name || '',
              phone: profile.phone || '',
              address: profile.address || '',
              date_of_birth: profile.date_of_birth ? profile.date_of_birth.split('T')[0] : '',
              gender: profile.gender || ''
            })
          }
        } catch (error) {
          console.error("[v0] Error fetching patient profile:", error)
          toast({
            title: "Lỗi",
            description: "Không thể tải thông tin cá nhân",
            variant: "destructive",
          })
        }

        // Fetch other data (optional - don't block if failed)
        try {
          const appointmentsData = await apiClient.getAppointments()
          setAppointments(appointmentsData)
        } catch (error) {
          console.error("[v0] Error fetching appointments:", error)
        }

        try {
          const prescriptionsData = await apiClient.get("/prescriptions?patient_id=current")
          setPrescriptions(prescriptionsData)
        } catch (error) {
          console.error("[v0] Error fetching prescriptions:", error)
        }

        try {
          const medicalData = await apiClient.getMedicalRecords()
          setMedicalHistory(medicalData)
        } catch (error) {
          console.error("[v0] Error fetching medical records:", error)
        }

        try {
          const billingData = await apiClient.getBilling()
          setBilling(billingData)
        } catch (error) {
          console.error("[v0] Error fetching billing:", error)
        }
      } catch (error) {
        console.error("[v0] Error fetching patient data:", error)
        if (error instanceof ApiError) {
          toast({
            title: "Lỗi",
            description: `Không thể tải dữ liệu: ${error.message}`,
            variant: "destructive",
          })
        } else {
          toast({
            title: "Lỗi",
            description: "Không thể tải dữ liệu. Vui lòng thử lại.",
            variant: "destructive",
          })
        }
      } finally {
        setLoading(false)
      }
    }

    // Only fetch data if user is available
    if (user) {
      fetchData()
    } else {
      setLoading(false)
    }
  }, [toast, user])

  // KPI calculations
  const upcomingAppointments = appointments.filter(
    (apt) => new Date(apt.date) >= new Date() && apt.status !== "Đã hủy",
  ).length

  const unpaidBills = billing.filter((bill) => bill.status === "Chưa thanh toán").length

  const handleBookAppointment = async (formData: any) => {
    try {
      console.log("[v0] Booking new appointment:", formData)

      const newAppointment = await apiClient.createAppointment({
        doctor_name: formData.doctor,
        department: formData.department,
        appointment_date: formData.date,
        appointment_time: formData.time,
        purpose: formData.purpose,
        status: "Chờ xác nhận",
      })

      setAppointments([...appointments, newAppointment])
      setIsBookingOpen(false)
      toast({
        title: "Đặt lịch thành công",
        description: "Lịch hẹn của bạn đã được gửi và đang chờ xác nhận.",
      })
    } catch (error) {
      console.error("[v0] Error booking appointment:", error)
      toast({
        title: "Lỗi",
        description: "Không thể đặt lịch hẹn. Vui lòng thử lại.",
        variant: "destructive",
      })
    }
  }

  const handleCancelAppointment = async (id: number) => {
    try {
      console.log("[v0] Cancelling appointment:", id)

      await apiClient.updateAppointmentStatus(id.toString(), "Đã hủy")

      setAppointments(appointments.map((apt) => (apt.id === id ? { ...apt, status: "Đã hủy", canCancel: false } : apt)))
      toast({
        title: "Hủy lịch thành công",
        description: "Lịch hẹn đã được hủy.",
      })
    } catch (error) {
      console.error("[v0] Error cancelling appointment:", error)
      toast({
        title: "Lỗi",
        description: "Không thể hủy lịch hẹn. Vui lòng thử lại.",
        variant: "destructive",
      })
    }
  }

  const handleRescheduleAppointment = async (id: number, newDate: string, newTime: string) => {
    try {
      console.log("[v0] Rescheduling appointment:", id, newDate, newTime)

      await apiClient.updateAppointment(id.toString(), {
        appointment_date: newDate,
        appointment_time: newTime,
        status: "Chờ xác nhận",
      })

      setAppointments(
        appointments.map((apt) =>
          apt.id === id ? { ...apt, date: newDate, time: newTime, status: "Chờ xác nhận" } : apt,
        ),
      )
      toast({
        title: "Đổi lịch thành công",
        description: "Lịch hẹn mới đang chờ xác nhận.",
      })
    } catch (error) {
      console.error("[v0] Error rescheduling appointment:", error)
      toast({
        title: "Lỗi",
        description: "Không thể đổi lịch hẹn. Vui lòng thử lại.",
        variant: "destructive",
      })
    }
  }

  const handleEditProfile = () => {
    setIsEditingProfile(true)
  }

  const handleCancelEdit = () => {
    setIsEditingProfile(false)
    // Reset form to original data
    if (patientProfile) {
      setProfileForm({
        first_name: patientProfile.first_name || '',
        last_name: patientProfile.last_name || '',
        phone: patientProfile.phone || '',
        address: patientProfile.address || '',
        date_of_birth: patientProfile.date_of_birth ? patientProfile.date_of_birth.split('T')[0] : '',
        gender: patientProfile.gender || ''
      })
    }
  }

  const handleSaveProfile = async () => {
    try {
      const response = await apiClient.put("/auth/patient/profile", profileForm)
      if (response.success && response.data) {
        setPatientProfile(response.data.patient)
        setIsEditingProfile(false)
        toast({
          title: "Cập nhật thành công",
          description: "Thông tin cá nhân đã được cập nhật.",
        })
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật thông tin. Vui lòng thử lại.",
        variant: "destructive",
      })
    }
  }

  const handleProfileFormChange = (field: string, value: string) => {
    setProfileForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Đã xác nhận":
        return "bg-green-100 text-green-800"
      case "Chờ xác nhận":
        return "bg-yellow-100 text-yellow-800"
      case "Đã hủy":
        return "bg-red-100 text-red-800"
      case "Đã cấp phát":
        return "bg-green-100 text-green-800"
      case "Chờ cấp phát":
        return "bg-yellow-100 text-yellow-800"
      case "Đã thanh toán":
        return "bg-green-100 text-green-800"
      case "Chưa thanh toán":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Đang tải dữ liệu từ server...</p>
        </div>
      </div>
    )
  }

  // Show login prompt if no user and not loading and not demo token
  if (!user && !loading) {
    const token = localStorage.getItem('auth_token')
    // If there's a demo token, give auth context more time to load
    if (token && token.startsWith('demo_')) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Đang tải thông tin demo user...</p>
          </div>
        </div>
      )
    }
    
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold mb-2">Chưa đăng nhập</h2>
          <p className="text-gray-600 mb-4">Vui lòng đăng nhập để xem dashboard</p>
          <button
            onClick={() => window.location.href = '/auth'}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Vertical Sidebar */}
      <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Bệnh nhân</h2>
              <p className="text-sm text-gray-600">
                {user?.profile?.first_name && user?.profile?.last_name 
                  ? `${user.profile.first_name} ${user.profile.last_name}`
                  : user?.email || 'Bệnh nhân'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
              activeTab === "overview"
                ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <User className="h-5 w-5" />
            <span>Tổng quan</span>
          </button>

          <button
            onClick={() => setActiveTab("patients")}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
              activeTab === "patients"
                ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Users className="h-5 w-5" />
            <span>Thông tin cá nhân</span>
          </button>

          <button
            onClick={() => setActiveTab("appointments")}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
              activeTab === "appointments"
                ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Calendar className="h-5 w-5" />
            <span>Lịch hẹn</span>
          </button>

          <button
            onClick={() => setActiveTab("prescriptions")}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
              activeTab === "prescriptions"
                ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <FileText className="h-5 w-5" />
            <span>Đơn thuốc</span>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
              activeTab === "history"
                ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <History className="h-5 w-5" />
            <span>Lịch sử khám</span>
          </button>

          <button
            onClick={() => setActiveTab("billing")}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
              activeTab === "billing"
                ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <DollarSign className="h-5 w-5" />
            <span>Hóa đơn</span>
          </button>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Bảng điều khiển bệnh nhân</h1>
            <p className="text-gray-600">Quản lý lịch hẹn, đơn thuốc và hồ sơ y tế của bạn</p>
          </div>

          {activeTab === "patients" && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Thông tin cá nhân</CardTitle>
                  {!isEditingProfile ? (
                    <Button onClick={handleEditProfile} variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Chỉnh sửa
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button onClick={handleSaveProfile} size="sm">
                        Lưu
                      </Button>
                      <Button onClick={handleCancelEdit} variant="outline" size="sm">
                        Hủy
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {!isEditingProfile ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="font-semibold">Họ:</Label>
                        <p className="text-gray-700">
                          {patientProfile?.first_name || 'Chưa có thông tin'}
                        </p>
                      </div>
                      <div>
                        <Label className="font-semibold">Tên:</Label>
                        <p className="text-gray-700">
                          {patientProfile?.last_name || 'Chưa có thông tin'}
                        </p>
                      </div>
                      <div>
                        <Label className="font-semibold">Ngày sinh:</Label>
                        <p className="text-gray-700">
                          {patientProfile?.date_of_birth 
                            ? new Date(patientProfile.date_of_birth).toLocaleDateString('vi-VN')
                            : 'Chưa có thông tin'
                          }
                        </p>
                      </div>
                      <div>
                        <Label className="font-semibold">Giới tính:</Label>
                        <p className="text-gray-700">
                          {patientProfile?.gender === 'male' && 'Nam'}
                          {patientProfile?.gender === 'female' && 'Nữ'}
                          {patientProfile?.gender === 'other' && 'Khác'}
                          {!patientProfile?.gender && 'Chưa có thông tin'}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label className="font-semibold">Email:</Label>
                        <p className="text-gray-700">{patientProfile?.email || 'Chưa có thông tin'}</p>
                      </div>
                      <div>
                        <Label className="font-semibold">Số điện thoại:</Label>
                        <p className="text-gray-700">{patientProfile?.phone || 'Chưa có thông tin'}</p>
                      </div>
                      <div>
                        <Label className="font-semibold">Địa chỉ:</Label>
                        <p className="text-gray-700">{patientProfile?.address || 'Chưa có thông tin'}</p>
                      </div>
                      <div>
                        <Label className="font-semibold">Mã bệnh nhân:</Label>
                        <p className="text-gray-700">{patientProfile?.patient_code || 'Chưa có thông tin'}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="firstName">Họ</Label>
                        <Input
                          id="firstName"
                          value={profileForm.first_name}
                          onChange={(e) => handleProfileFormChange('first_name', e.target.value)}
                          placeholder="Nhập họ"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Tên</Label>
                        <Input
                          id="lastName"
                          value={profileForm.last_name}
                          onChange={(e) => handleProfileFormChange('last_name', e.target.value)}
                          placeholder="Nhập tên"
                        />
                      </div>
                      <div>
                        <Label htmlFor="dateOfBirth">Ngày sinh</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={profileForm.date_of_birth}
                          onChange={(e) => handleProfileFormChange('date_of_birth', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="gender">Giới tính</Label>
                        <Select
                          value={profileForm.gender}
                          onValueChange={(value) => handleProfileFormChange('gender', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn giới tính" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Nam</SelectItem>
                            <SelectItem value="female">Nữ</SelectItem>
                            <SelectItem value="other">Khác</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          value={patientProfile?.email || ''}
                          disabled
                          className="bg-gray-50"
                        />
                        <p className="text-sm text-gray-500 mt-1">Email không thể thay đổi</p>
                      </div>
                      <div>
                        <Label htmlFor="phone">Số điện thoại</Label>
                        <Input
                          id="phone"
                          value={profileForm.phone}
                          onChange={(e) => handleProfileFormChange('phone', e.target.value)}
                          placeholder="Nhập số điện thoại"
                        />
                      </div>
                      <div>
                        <Label htmlFor="address">Địa chỉ</Label>
                        <Textarea
                          id="address"
                          value={profileForm.address}
                          onChange={(e) => handleProfileFormChange('address', e.target.value)}
                          placeholder="Nhập địa chỉ"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "appointments" && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Lịch hẹn của tôi</CardTitle>
                  <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Đặt lịch mới
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Đặt lịch hẹn mới</DialogTitle>
                        <DialogDescription>Vui lòng điền thông tin để đặt lịch hẹn</DialogDescription>
                      </DialogHeader>
                      <BookingForm onSubmit={handleBookAppointment} />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <Card key={appointment.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{appointment.doctor}</h4>
                              <Badge variant="outline">{appointment.department}</Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {appointment.date}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {appointment.time}
                              </span>
                            </div>
                            <p className="text-sm">{appointment.purpose}</p>
                            <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                          </div>
                          <div className="flex gap-2">
                            {appointment.canCancel && appointment.status !== "Đã hủy" && (
                              <>
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4 mr-1" />
                                  Đổi lịch
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCancelAppointment(appointment.id)}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Hủy
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "prescriptions" && (
            <Card>
              <CardHeader>
                <CardTitle>Đơn thuốc của tôi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {prescriptions.map((prescription) => (
                    <Card key={prescription.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold">{prescription.doctor}</h4>
                            <p className="text-sm text-gray-600">{prescription.date}</p>
                          </div>
                          <Badge className={getStatusColor(prescription.status)}>{prescription.status}</Badge>
                        </div>
                        <div className="space-y-2">
                          {prescription.medications.map((med, index) => (
                            <div key={index} className="bg-gray-50 p-3 rounded">
                              <div className="font-medium">{med.name}</div>
                              <div className="text-sm text-gray-600">
                                Liều dùng: {med.dosage} • Thời gian: {med.duration}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "history" && (
            <Card>
              <CardHeader>
                <CardTitle>Lịch sử khám bệnh</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {medicalHistory.map((record) => (
                    <Card key={record.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{record.doctor}</h4>
                              <span className="text-sm text-gray-600">{record.date}</span>
                            </div>
                            <div>
                              <span className="font-medium">Chẩn đoán: </span>
                              <span>{record.diagnosis}</span>
                            </div>
                            <div>
                              <span className="font-medium">Điều trị: </span>
                              <span>{record.treatment}</span>
                            </div>
                            {record.notes && (
                              <div>
                                <span className="font-medium">Ghi chú: </span>
                                <span className="text-gray-600">{record.notes}</span>
                              </div>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRecord(record)
                              setIsRecordOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Xem chi tiết
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "billing" && (
            <Card>
              <CardHeader>
                <CardTitle>Hóa đơn thanh toán</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {billing.map((bill) => (
                    <Card key={bill.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <h4 className="font-semibold">{bill.description}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>Ngày: {bill.date}</span>
                              <span>Hạn thanh toán: {bill.dueDate}</span>
                            </div>
                            <div className="text-lg font-bold text-blue-600">{formatCurrency(bill.amount)}</div>
                            <Badge className={getStatusColor(bill.status)}>{bill.status}</Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              Tải PDF
                            </Button>
                            {bill.status === "Chưa thanh toán" && (
                              <Button size="sm">
                                <CreditCard className="h-4 w-4 mr-1" />
                                Thanh toán
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Medical Record Detail Modal */}
          <Dialog open={isRecordOpen} onOpenChange={setIsRecordOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Chi tiết hồ sơ khám bệnh</DialogTitle>
              </DialogHeader>
              {selectedRecord && (
                <div className="space-y-4">
                  <div>
                    <Label className="font-semibold">Bác sĩ khám:</Label>
                    <p>{selectedRecord.doctor}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Ngày khám:</Label>
                    <p>{selectedRecord.date}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Chẩn đoán:</Label>
                    <p>{selectedRecord.diagnosis}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Phương pháp điều trị:</Label>
                    <p>{selectedRecord.treatment}</p>
                  </div>
                  {selectedRecord.notes && (
                    <div>
                      <Label className="font-semibold">Ghi chú:</Label>
                      <p className="text-gray-600">{selectedRecord.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* CSS to hide admin buttons */}
      <style jsx global>{`
        .admin-only-button,
        .admin-action-button,
        button[aria-label*="Thêm"],
        button[aria-label*="Sửa"],
        button[aria-label*="Xóa"],
        button[aria-label*="Tạo"],
        button[aria-label*="Cập nhật"] {
          display: none !important;
        }
      `}</style>
    </div>
  )
}

// Booking Form Component
function BookingForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    doctor: "",
    department: "",
    date: "",
    time: "",
    purpose: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    setFormData({
      doctor: "",
      department: "",
      date: "",
      time: "",
      purpose: "",
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="department">Khoa</Label>
        <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Chọn khoa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tim-mach">Tim mạch</SelectItem>
            <SelectItem value="da-lieu">Da liễu</SelectItem>
            <SelectItem value="noi-khoa">Nội khoa</SelectItem>
            <SelectItem value="ngoai-khoa">Ngoại khoa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="doctor">Bác sĩ</Label>
        <Select value={formData.doctor} onValueChange={(value) => setFormData({ ...formData, doctor: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Chọn bác sĩ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="BS. Nguyễn Văn A">BS. Nguyễn Văn A</SelectItem>
            <SelectItem value="BS. Trần Thị B">BS. Trần Thị B</SelectItem>
            <SelectItem value="BS. Lê Văn C">BS. Lê Văn C</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="date">Ngày hẹn</Label>
        <Input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          min={new Date().toISOString().split("T")[0]}
        />
      </div>

      <div>
        <Label htmlFor="time">Giờ hẹn</Label>
        <Select value={formData.time} onValueChange={(value) => setFormData({ ...formData, time: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Chọn giờ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="08:00">08:00</SelectItem>
            <SelectItem value="09:00">09:00</SelectItem>
            <SelectItem value="10:00">10:00</SelectItem>
            <SelectItem value="14:00">14:00</SelectItem>
            <SelectItem value="15:00">15:00</SelectItem>
            <SelectItem value="16:00">16:00</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="purpose">Mục đích khám</Label>
        <Textarea
          value={formData.purpose}
          onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
          placeholder="Mô tả lý do khám bệnh..."
        />
      </div>

      <DialogFooter>
        <Button type="submit">Đặt lịch hẹn</Button>
      </DialogFooter>
    </form>
  )
}
