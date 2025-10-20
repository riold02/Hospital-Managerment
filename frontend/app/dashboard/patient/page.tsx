
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatAppointmentTime } from "@/lib/utils"
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
import { useRouter } from "next/navigation"
import PatientOverview from "@/components/patient/PatientOverview"
import MedicalHistoryList from "@/components/patient/MedicalHistoryList"
import MedicalRecordDetailDialog from "@/components/patient/MedicalRecordDetailDialog"

interface Appointment {
  id?: number
  appointment_id?: number
  patient_id?: number | string | null
  doctor_id?: number | string | null
  doctor: string | { doctor_id?: number; first_name?: string; last_name?: string; specialty?: string }
  department?: string
  date?: string
  time?: string
  purpose?: string
  status: string
  rawStatus?: string // Original English status for API calls
  canCancel?: boolean
  appointment_date?: string
  appointment_time?: string
  patient?: { patient_id?: number; first_name?: string; last_name?: string }
  created_at?: string
  updated_at?: string
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
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]) // Store all appointments
  const [medicalHistory, setMedicalHistory] = useState<MedicalRecord[]>([])
  const [billing, setBilling] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false)
  const [rescheduleAppointment, setRescheduleAppointment] = useState<Appointment | null>(null)
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
  
  // Appointment filters
  const [daysFilter, setDaysFilter] = useState<number>(7) // 7 or 30 days
  const [statusFilter, setStatusFilter] = useState<string>('all') // all, scheduled, confirmed, cancelled, completed
  
  const { toast } = useToast()
  const { user, logout } = useAuth()

  // Parse medications from string format
  // Filter appointments based on days and status
  const filterAppointments = (appointments: Appointment[]) => {
    const now = new Date()
    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + daysFilter)
    
    return appointments.filter(apt => {
      // Filter by date range (only future appointments within selected days)
      const aptDate = new Date(apt.appointment_date || apt.date)
      const isWithinRange = aptDate >= now && aptDate <= maxDate
      
      // Filter by status
      let matchesStatus = true
      if (statusFilter !== 'all') {
        const statusMap: any = {
          'scheduled': 'Đã lên lịch',
          'confirmed': 'Đã xác nhận', 
          'cancelled': 'Đã hủy',
          'completed': 'Hoàn thành'
        }
        matchesStatus = apt.status === statusMap[statusFilter]
      }
      
      return isWithinRange && matchesStatus
    })
  }

  // Helper functions to safely extract appointment data
  const getDoctorName = (appointment: Appointment): string => {
    if (typeof appointment.doctor === 'string') {
      return appointment.doctor
    }
    if (appointment.doctor && typeof appointment.doctor === 'object') {
      const { first_name = '', last_name = '' } = appointment.doctor
      return `${first_name} ${last_name}`.trim() || 'Chưa xác định'
    }
    return 'Chưa xác định'
  }

  const getDepartmentName = (appointment: Appointment): string => {
    if (appointment.department) return appointment.department
    if (appointment.doctor && typeof appointment.doctor === 'object' && appointment.doctor.specialty) {
      return appointment.doctor.specialty
    }
    return 'Chưa xác định'
  }

  const getAppointmentDate = (appointment: Appointment): string => {
    if (appointment.date) return appointment.date
    if (appointment.appointment_date) {
      return new Date(appointment.appointment_date).toLocaleDateString('vi-VN')
    }
    return 'Chưa xác định'
  }

  const getAppointmentTime = (appointment: Appointment): string => {
    if (appointment.time) return appointment.time
    if (appointment.appointment_time) return appointment.appointment_time
    return 'Chưa xác định'
  }

  const getAppointmentId = (appointment: Appointment): number => {
    return appointment.id || appointment.appointment_id || 0
  }

  const getPatientId = (appointment: Appointment): string => {
    if (appointment.patient_id !== null && appointment.patient_id !== undefined) {
      return String(appointment.patient_id)
    }
    if (appointment.patient?.patient_id) {
      return String(appointment.patient.patient_id)
    }
    return '0'
  }

  const getDoctorId = (appointment: Appointment): string => {
    if (appointment.doctor_id !== null && appointment.doctor_id !== undefined) {
      return String(appointment.doctor_id)
    }
    if (appointment.doctor && typeof appointment.doctor === 'object' && appointment.doctor.doctor_id) {
      return String(appointment.doctor.doctor_id)
    }
    return '0'
  }

  // Apply filters when filter options change
  useEffect(() => {
    if (allAppointments.length > 0) {
      setAppointments(filterAppointments(allAppointments))
    }
  }, [daysFilter, statusFilter, allAppointments])

  // Role protection - only allow patients to access this dashboard
  useEffect(() => {
    if (user && user.role?.toLowerCase() !== 'patient') {
      // Redirect non-patients to their appropriate dashboard
      const userRole = user.role?.toLowerCase()
      router.push(`/dashboard/${userRole}`)
      return
    }
  }, [user, router])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Check if user is authenticated
        if (!user) {
          console.error("[v0] No user found, redirecting to login")
          // Don't show error for demo users, give auth context time to load
          const token = localStorage.getItem('auth_token')
          if (token && token.startsWith('demo_')) {
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
          if (profileData && profileData.patient) {
            setPatientProfile(profileData.patient)
            // Initialize form with current data
            const profile = profileData.patient
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

        // Fetch patient's appointments specifically
        try {
          const appointmentsData = await apiClient.getPatientAppointments()
          console.log("[v0] Raw Patient appointments data:", appointmentsData)
          
          // Debug each appointment structure
          if (Array.isArray(appointmentsData) && appointmentsData.length > 0) {
            console.log("[v0] First appointment structure:", JSON.stringify(appointmentsData[0], null, 2))
            appointmentsData.forEach((apt, index) => {
              console.log(`[v0] Appointment ${index}:`, {
                id: apt.id || apt.appointment_id,
                patient_id: apt.patient_id,
                doctor_id: apt.doctor_id,
                doctor: apt.doctor,
                date: apt.date || apt.appointment_date,
                time: apt.time || apt.appointment_time,
                purpose: apt.purpose,
                status: apt.status
              })
            })
          }
          
          // Format appointments data before setting
          const formattedAppointments = Array.isArray(appointmentsData) ? appointmentsData.map(apt => {
            // Normalize status from backend
            let normalizedStatus = apt.status
            const statusMap: any = {
              'SCHEDULED': 'Scheduled',
              'CONFIRMED': 'Confirmed',
              'COMPLETED': 'Completed',
              'CANCELLED': 'Cancelled',
              'Scheduled': 'Scheduled',
              'Confirmed': 'Confirmed',
              'Completed': 'Completed',
              'Cancelled': 'Cancelled'
            }
            normalizedStatus = statusMap[apt.status] || apt.status
            
            // Convert to Vietnamese for display
            const statusVietnamese: any = {
              'Scheduled': 'Đã lên lịch',
              'Confirmed': 'Đã xác nhận',
              'Completed': 'Hoàn thành',
              'Cancelled': 'Đã hủy',
              'No Show': 'Không đến'
            }
            
            return {
              id: apt.appointment_id || apt.id,
              doctor: apt.doctor ? `${apt.doctor.first_name || apt.doctor.firstName || ''} ${apt.doctor.last_name || apt.doctor.lastName || ''}`.trim() : 'N/A',
              department: apt.doctor?.specialty || apt.department || 'N/A',
              date: apt.appointment_date ? new Date(apt.appointment_date).toISOString().split('T')[0] : apt.date,
              time: formatAppointmentTime(apt.appointment_time) || apt.time,
              purpose: apt.purpose || '',
              status: statusVietnamese[normalizedStatus] || normalizedStatus,
              rawStatus: normalizedStatus, // Keep original for API calls
              canCancel: normalizedStatus === 'Scheduled' || normalizedStatus === 'Confirmed',
              appointment_date: apt.appointment_date // Keep original date for sorting
            }
          }) : []
          
          // Sort appointments by date - nearest date first (ascending order)
          const sortedAppointments = formattedAppointments.sort((a, b) => {
            const dateA = new Date(a.appointment_date || a.date)
            const dateB = new Date(b.appointment_date || b.date)
            return dateA.getTime() - dateB.getTime() // Ascending: nearest first
          })
          
          // Store all appointments
          setAllAppointments(sortedAppointments)
          
          // Apply filter
          setAppointments(filterAppointments(sortedAppointments))
        } catch (error) {
          console.error("[v0] Error fetching patient appointments:", error)
          setAppointments([])
        }

        // Fetch medical records for current patient
        try {
          console.log("[Patient Dashboard] Fetching medical records...")
          const medicalData = await apiClient.getMedicalRecords(user.patient_id?.toString())
          
          console.log("[Patient Dashboard] Medical records response:", medicalData)
          console.log("[Patient Dashboard] Is array?:", Array.isArray(medicalData))
          console.log("[Patient Dashboard] Records count:", Array.isArray(medicalData) ? medicalData.length : 0)
          
          // Transform data to match component interface
          const transformedRecords = Array.isArray(medicalData)
            ? medicalData.map((r, index) => {
                console.log(`[Patient Dashboard] Record ${index + 1}:`, {
                  id: r.record_id || r.id,
                  doctor: r.doctor,
                  diagnosis: r.diagnosis?.substring(0, 50) + '...',
                })
                
                return {
                  id: r.record_id || r.id,
                  record_id: r.record_id || r.id,
                  date: r.visit_date ? new Date(r.visit_date).toLocaleDateString('vi-VN') : 
                        r.created_at ? new Date(r.created_at).toLocaleDateString('vi-VN') : 'N/A',
                  doctor: r.doctor ? `${r.doctor.first_name} ${r.doctor.last_name}` : 'N/A',
                  doctor_name: r.doctor ? `${r.doctor.first_name} ${r.doctor.last_name}` : 'N/A',
                  diagnosis: r.diagnosis || '',
                  treatment: r.treatment || '',
                  notes: r.notes || '',
                  prescription: r.prescription || '',
                  status: r.status || '',
                  created_at: r.created_at
                }
              })
            : []
          
          console.log("[Patient Dashboard] ✅ Transformed", transformedRecords.length, "medical records")
          setMedicalHistory(transformedRecords)
        } catch (error: any) {
          console.error("[Patient Dashboard] ❌ Error fetching medical records:", error)
          console.error("[Patient Dashboard] Error message:", error?.message)
          console.error("[Patient Dashboard] Error status:", error?.status)
          setMedicalHistory([])
          
          // Show toast error
          toast({
            title: "Lỗi tải hồ sơ",
            description: error?.message || "Không thể tải hồ sơ khám bệnh",
            variant: "destructive",
          })
        }

        try {
          const billingData = await apiClient.getBilling()
          
          // Transform billing data to match component interface
          const transformedBilling = Array.isArray(billingData)
            ? billingData.map(b => ({
                id: b.bill_id || b.id,
                bill_id: b.bill_id || b.id,
                description: b.medical_record?.diagnosis || 'Khám bệnh',
                amount: parseFloat(b.total_amount) || 0,
                date: b.billing_date ? new Date(b.billing_date).toLocaleDateString('vi-VN') : 
                      b.created_at ? new Date(b.created_at).toLocaleDateString('vi-VN') : 'N/A',
                dueDate: b.payment_date ? new Date(b.payment_date).toLocaleDateString('vi-VN') : 'Chưa có',
                status: b.payment_status === 'PAID' ? 'Đã thanh toán' : 
                       b.payment_status === 'PENDING' ? 'Chưa thanh toán' : 
                       b.payment_status || 'Chưa thanh toán'
              }))
            : []
          
          setBilling(transformedBilling)
        } catch (error) {
          console.error("[v0] Error fetching billing:", error)
          setBilling([])
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

  // KPI calculations - ensure arrays exist
  const upcomingAppointments = Array.isArray(appointments) ? appointments.filter(
    (apt) => {
      const appointmentDate = apt.date || apt.appointment_date
      return appointmentDate && new Date(appointmentDate) >= new Date() && apt.status !== "Đã hủy"
    }
  ).length : 0

  const unpaidBills = Array.isArray(billing) ? billing.filter((bill) => bill.status === "Chưa thanh toán").length : 0

  const handleBookAppointment = async (formData: any) => {
    try {
      // Validate user authentication
      if (!user) {
        toast({
          title: "Lỗi xác thực",
          description: "Vui lòng đăng nhập để đặt lịch hẹn.",
          variant: "destructive",
        })
        return;
      }

      const appointmentData = {
        doctor_id: Number(formData.doctor_id),
        appointment_date: formData.appointment_date,
        appointment_time: formData.appointment_time,
        purpose: formData.purpose,
        status: 'Scheduled'
      }

      console.log('Submitting appointment data:', appointmentData)
      const newAppointment = await apiClient.createAppointment(appointmentData)
      
      // Convert backend response to frontend format
      const statusVietnamese: any = {
        'Scheduled': 'Đã lên lịch',
        'Confirmed': 'Đã xác nhận',
        'Completed': 'Hoàn thành',
        'Cancelled': 'Đã hủy',
        'No Show': 'Không đến'
      }
      
      const formattedAppointment = {
        id: newAppointment.appointment_id,
        doctor: `${newAppointment.doctor?.first_name || ''} ${newAppointment.doctor?.last_name || ''}`.trim(),
        department: newAppointment.doctor?.specialty || 'N/A',
        date: new Date(newAppointment.appointment_date).toISOString().split('T')[0],
        time: formatAppointmentTime(newAppointment.appointment_time),
        purpose: newAppointment.purpose || '',
        status: statusVietnamese[newAppointment.status] || newAppointment.status,
        rawStatus: newAppointment.status, // Keep original for API calls
        canCancel: newAppointment.status === 'Scheduled' || newAppointment.status === 'Confirmed',
        appointment_date: newAppointment.appointment_date // Keep for sorting
      }

      // Add new appointment and sort by date (nearest first)
      const updatedAppointments = [...appointments, formattedAppointment].sort((a: any, b: any) => {
        const dateA = new Date(a.appointment_date || a.date)
        const dateB = new Date(b.appointment_date || b.date)
        return dateA.getTime() - dateB.getTime()
      })
      
      setAppointments(updatedAppointments)
      setIsBookingOpen(false)
      toast({
        title: "Đặt lịch thành công",
        description: "Lịch hẹn của bạn đã được tạo và đang chờ xác nhận.",
      })
    } catch (error: any) {
      console.error("[v0] Error booking appointment:", error)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể đặt lịch hẹn. Vui lòng thử lại.",
        variant: "destructive",
      })
      throw error // Re-throw to handle in form
    }
  }

  const handleCancelAppointment = async (id: number) => {
    try {
      // Call the cancel appointment endpoint
      await apiClient.cancelAppointment(id.toString())

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
      await apiClient.updateAppointment(id.toString(), {
        appointment_date: newDate,
        appointment_time: newTime,
        status: "Scheduled", // Send English status to backend
      })

      setAppointments(
        appointments.map((apt) =>
          apt.id === id ? { ...apt, date: newDate, time: newTime, status: "Đã lên lịch", rawStatus: "Scheduled" } : apt,
        ),
      )
      toast({
        title: "Đổi lịch thành công",
        description: "Lịch hẹn mới đã được cập nhật.",
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
      if (response && response.patient) {
        setPatientProfile(response.patient)
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
      case "Đã lên lịch":
        return "bg-blue-100 text-blue-800"
      case "Đã xác nhận":
        return "bg-purple-100 text-purple-800"
      case "Hoàn thành":
        return "bg-green-100 text-green-800"
      case "Đã hủy":
        return "bg-red-100 text-red-800"
      case "Không đến":
        return "bg-gray-100 text-gray-800"
      case "Chờ xác nhận": // Legacy status
        return "bg-yellow-100 text-yellow-800"
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
            <p className="text-gray-600">Quản lý lịch hẹn và hồ sơ y tế của bạn</p>
          </div>

          {activeTab === "overview" && (
            <PatientOverview
              patientProfile={patientProfile}
              appointments={appointments}
              medicalHistory={medicalHistory}
              billing={billing}
              upcomingAppointments={upcomingAppointments}
              unpaidBills={unpaidBills}
              onSetActiveTab={setActiveTab}
              onOpenBooking={() => setIsBookingOpen(true)}
              getStatusColor={getStatusColor}
              getDoctorName={getDoctorName}
              getAppointmentDate={getAppointmentDate}
              getAppointmentTime={getAppointmentTime}
              getAppointmentId={getAppointmentId}
            />
          )}

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
                
                {/* Filter Controls */}
                <div className="flex gap-4 mt-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Label>Hiển thị:</Label>
                    <Select value={String(daysFilter)} onValueChange={(value) => setDaysFilter(Number(value))}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 ngày tới</SelectItem>
                        <SelectItem value="30">30 ngày tới</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Label>Trạng thái:</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[160px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="scheduled">Chưa xác nhận</SelectItem>
                        <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                        <SelectItem value="cancelled">Đã hủy</SelectItem>
                        <SelectItem value="completed">Hoàn thành</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="text-sm text-muted-foreground self-center">
                    Hiển thị {appointments.length} / {allAppointments.length} lịch hẹn
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                  <div className="space-y-4">
                    {Array.isArray(appointments) && appointments.length > 0 ? appointments.map((appointment) => (
                    <Card key={getAppointmentId(appointment)}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{getDoctorName(appointment)}</h4>
                              <Badge variant="outline">{getDepartmentName(appointment)}</Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {getAppointmentDate(appointment)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {getAppointmentTime(appointment)}
                              </span>
                            </div>
                            <p className="text-sm">{String(appointment.purpose || 'Chưa có mô tả')}</p>
                            <Badge className={getStatusColor(appointment.status)}>{String(appointment.status || 'Chưa xác định')}</Badge>
                          </div>
                          <div className="flex gap-2">
                            {appointment.canCancel && appointment.status !== "Đã hủy" && (
                              <>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    setRescheduleAppointment(appointment)
                                    setIsRescheduleOpen(true)
                                  }}
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Đổi lịch
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCancelAppointment(getAppointmentId(appointment))}
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
                  )) : (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Chưa có lịch hẹn nào</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reschedule Dialog */}
          {rescheduleAppointment && (
            <Dialog open={isRescheduleOpen} onOpenChange={setIsRescheduleOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Đổi lịch hẹn</DialogTitle>
                  <DialogDescription>
                    Đổi lịch hẹn với {rescheduleAppointment.doctor}
                  </DialogDescription>
                </DialogHeader>
                <RescheduleForm 
                  appointment={rescheduleAppointment}
                  onSubmit={async (newDate, newTime) => {
                    await handleRescheduleAppointment(rescheduleAppointment.id, newDate, newTime)
                    setIsRescheduleOpen(false)
                    setRescheduleAppointment(null)
                  }}
                  onCancel={() => {
                    setIsRescheduleOpen(false)
                    setRescheduleAppointment(null)
                  }}
                />
              </DialogContent>
            </Dialog>
          )}

          {activeTab === "history" && (
            <MedicalHistoryList
              records={medicalHistory}
              onViewDetail={(record) => {
                setSelectedRecord(record)
                setIsRecordOpen(true)
              }}
              onPrint={(record) => {
                toast({
                  title: "In hồ sơ",
                  description: `Đang chuẩn bị in hồ sơ khám bệnh`,
                })
                window.print()
              }}
              showActions={true}
            />
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
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(bill.status)}>{bill.status}</Badge>
                              {bill.paymentMethod && (
                                <Badge variant="outline" className="text-xs">
                                  {bill.paymentMethod === 'CASH' ? '💵 Tiền mặt' : 
                                   bill.paymentMethod === 'TRANSFER' ? '🏦 Chuyển khoản' :
                                   bill.paymentMethod === 'MOMO' ? '📱 MoMo' :
                                   bill.paymentMethod === 'VNPAY' ? '💳 VNPay' :
                                   bill.paymentMethod}
                                </Badge>
                              )}
                            </div>
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
          <MedicalRecordDetailDialog
            open={isRecordOpen}
            onOpenChange={setIsRecordOpen}
            record={selectedRecord}
            patientProfile={patientProfile}
            onPrint={(record) => {
              toast({
                title: "In hồ sơ",
                description: `Đang chuẩn bị in hồ sơ khám bệnh`,
              })
            }}
          />
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
    doctor_id: "",
    department_id: "",
    appointment_date: "",
    appointment_time: "",
    purpose: "",
  })
  const [doctors, setDoctors] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const { toast } = useToast()

  // Load departments and doctors on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Try to load from API first
        const [departmentsData, doctorsData] = await Promise.all([
          apiClient.getDepartments().catch(err => {
            console.error("Error loading departments:", err)
            return []
          }),
          apiClient.getDoctors().catch(err => {
            console.error("Error loading doctors:", err) 
            return []
          })
        ])
        
        // Use fallback data if API fails
        const fallbackDepartments = [
          { department_id: 1, department_name: "Khoa Nội" },
          { department_id: 2, department_name: "Khoa Ngoại" },
          { department_id: 3, department_name: "Khoa Tim mạch" },
          { department_id: 4, department_name: "Khoa Sản Phụ khoa" },
          { department_id: 5, department_name: "Khoa Nhi" }
        ]
        
        const fallbackDoctors = [
          { doctor_id: 1, first_name: "BS. Nguyễn", last_name: "Văn Hùng", specialty: "Nội Tổng hợp", department_id: 1 },
          { doctor_id: 2, first_name: "BS. Trần", last_name: "Minh Tuấn", specialty: "Phẫu thuật Tổng hợp", department_id: 2 },
          { doctor_id: 3, first_name: "BS. Lê", last_name: "Văn Cương", specialty: "Tim mạch", department_id: 3 },
          { doctor_id: 4, first_name: "BS. Phạm", last_name: "Thị Dung", specialty: "Sản khoa", department_id: 4 },
          { doctor_id: 5, first_name: "BS. Hoàng", last_name: "Văn Em", specialty: "Nhi khoa", department_id: 5 }
        ]
        
        setDepartments(departmentsData.length > 0 ? departmentsData : fallbackDepartments)
        setDoctors(doctorsData.length > 0 ? doctorsData : fallbackDoctors)
        
      } catch (error) {
        console.error("Error loading form data:", error)
        
        // Use fallback data on error
        const fallbackDepartments = [
          { department_id: 1, department_name: "Khoa Nội" },
          { department_id: 2, department_name: "Khoa Ngoại" },
          { department_id: 3, department_name: "Khoa Tim mạch" },
          { department_id: 4, department_name: "Khoa Sản Phụ khoa" }
        ]
        
        const fallbackDoctors = [
          { doctor_id: 1, first_name: "BS. Nguyễn", last_name: "Văn Hùng", specialty: "Nội Tổng hợp", department_id: 1 },
          { doctor_id: 2, first_name: "BS. Trần", last_name: "Minh Tuấn", specialty: "Phẫu thuật Tổng hợp", department_id: 2 },
          { doctor_id: 3, first_name: "BS. Lê", last_name: "Văn Cương", specialty: "Tim mạch", department_id: 3 },
          { doctor_id: 4, first_name: "BS. Phạm", last_name: "Thị Dung", specialty: "Sản khoa", department_id: 4 }
        ]
        
        setDepartments(fallbackDepartments)
        setDoctors(fallbackDoctors)
        
        toast({
          title: "Thông báo",
          description: "Đang sử dụng dữ liệu mẫu. Một số chức năng có thể bị hạn chế.",
          variant: "default",
        })
      }
    }
    loadData()
  }, [toast])

  // Reload doctors when department changes
  useEffect(() => {
    const loadDoctorsByDepartment = async () => {
      if (formData.department_id) {
        try {
          const doctorsData = await apiClient.getDoctors(undefined, formData.department_id)
          setDoctors(doctorsData)
        } catch (error) {
          console.error("Error loading doctors by department:", error)
          // Keep existing doctors if filtering fails
        }
      } else {
        // If no department selected, load all doctors
        try {
          const doctorsData = await apiClient.getDoctors()
          setDoctors(doctorsData)
        } catch (error) {
          console.error("Error loading all doctors:", error)
        }
      }
    }
    
    // Only call API if we have departments data 
    if (departments.length > 0) {
      loadDoctorsByDepartment()
    }
  }, [formData.department_id, departments])

  // Filter doctors by selected department (client-side fallback)
  const filteredDoctors = formData.department_id 
    ? doctors.filter(doctor => {
        // Handle both API structure (doctor_department relation) and fallback structure (department_id)
        if (doctor.doctor_department && Array.isArray(doctor.doctor_department)) {
          return doctor.doctor_department.some(dept => dept.department_id?.toString() === formData.department_id)
        }
        return doctor.department_id?.toString() === formData.department_id
      })
    : doctors

  const validateForm = async () => {
    const newErrors: {[key: string]: string} = {}
    
    if (!formData.doctor_id) newErrors.doctor_id = "Vui lòng chọn bác sĩ"
    if (!formData.appointment_date) newErrors.appointment_date = "Vui lòng chọn ngày hẹn"
    if (!formData.appointment_time) newErrors.appointment_time = "Vui lòng chọn giờ hẹn"
    if (!formData.purpose || formData.purpose.length < 10) {
      newErrors.purpose = "Mục đích khám phải có ít nhất 10 ký tự"
    }

    // Check if appointment date is not in the past
    const appointmentDate = new Date(formData.appointment_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (appointmentDate < today) {
      newErrors.appointment_date = "Không thể đặt lịch hẹn trong quá khứ"
    }

    // Check if it's weekend
    const dayOfWeek = appointmentDate.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      newErrors.appointment_date = "Không thể đặt lịch hẹn vào cuối tuần"
    }

    // Check slot availability if all required fields are filled
    if (formData.doctor_id && formData.appointment_date && formData.appointment_time && Object.keys(newErrors).length === 0) {
      try {
        const availability = await apiClient.checkAppointmentAvailability(
          Number(formData.doctor_id),
          formData.appointment_date,
          formData.appointment_time
        )
        
        if (!availability.available) {
          newErrors.appointment_time = "Khung giờ này đã có người đặt. Vui lòng chọn khung giờ khác."
        }
      } catch (error) {
        console.error("Error checking availability:", error)
        // Don't block booking if availability check fails
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setLoading(true)
    const isValid = await validateForm()
    
    if (!isValid) {
      setLoading(false)
      return
    }

    try {
      await onSubmit(formData)
      setFormData({
        doctor_id: "",
        department_id: "",
        appointment_date: "",
        appointment_time: "",
        purpose: "",
      })
      setErrors({})
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateTimeSlots = () => {
    const slots = []
    // Morning slots: 8:00 - 11:30
    for (let i = 8; i <= 11; i++) {
      slots.push(`${i.toString().padStart(2, '0')}:00`)
      if (i < 11) slots.push(`${i.toString().padStart(2, '0')}:30`)
    }
    // Afternoon slots: 14:00 - 17:30
    for (let i = 14; i <= 17; i++) {
      slots.push(`${i.toString().padStart(2, '0')}:00`)
      if (i < 17) slots.push(`${i.toString().padStart(2, '0')}:30`)
    }
    return slots
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="department">Khoa</Label>
        <Select 
          value={formData.department_id} 
          onValueChange={(value) => setFormData({ ...formData, department_id: value, doctor_id: "" })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn khoa (không bắt buộc)" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((dept) => (
              <SelectItem key={dept.department_id} value={dept.department_id.toString()}>
                {dept.department_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.department_id && <p className="text-sm text-red-500 mt-1">{errors.department_id}</p>}
      </div>

      <div>
        <Label htmlFor="doctor">Bác sĩ *</Label>
        <Select 
          value={formData.doctor_id} 
          onValueChange={(value) => setFormData({ ...formData, doctor_id: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn bác sĩ" />
          </SelectTrigger>
          <SelectContent>
            {filteredDoctors.map((doctor) => (
              <SelectItem key={doctor.doctor_id} value={doctor.doctor_id.toString()}>
                {doctor.first_name} {doctor.last_name} - {doctor.specialty}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.doctor_id && <p className="text-sm text-red-500 mt-1">{errors.doctor_id}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date">Ngày hẹn *</Label>
          <Input
            type="date"
            value={formData.appointment_date}
            onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
            min={new Date().toISOString().split("T")[0]}
          />
          {errors.appointment_date && <p className="text-sm text-red-500 mt-1">{errors.appointment_date}</p>}
        </div>
        
        <div>
          <Label htmlFor="time">Giờ hẹn *</Label>
          <Select 
            value={formData.appointment_time} 
            onValueChange={(value) => setFormData({ ...formData, appointment_time: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn giờ" />
            </SelectTrigger>
            <SelectContent>
              {generateTimeSlots().map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.appointment_time && <p className="text-sm text-red-500 mt-1">{errors.appointment_time}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="purpose">Mục đích khám *</Label>
        <Textarea
          value={formData.purpose}
          onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
          placeholder="Mô tả triệu chứng hoặc lý do khám bệnh (ít nhất 10 ký tự)..."
          rows={3}
          minLength={10}
          maxLength={500}
        />
        <div className="text-xs text-muted-foreground mt-1">
          {formData.purpose.length}/500 ký tự (tối thiểu 10 ký tự)
        </div>
        {errors.purpose && <p className="text-sm text-red-500 mt-1">{errors.purpose}</p>}
      </div>

      <DialogFooter>
        <Button type="submit" disabled={loading}>
          {loading ? "Đang đặt lịch..." : "Đặt lịch hẹn"}
        </Button>
      </DialogFooter>
    </form>
  )
}

// Reschedule Form Component
function RescheduleForm({ 
  appointment, 
  onSubmit, 
  onCancel 
}: { 
  appointment: Appointment
  onSubmit: (newDate: string, newTime: string) => Promise<void>
  onCancel: () => void
}) {
  const [newDate, setNewDate] = useState(appointment.date)
  const [newTime, setNewTime] = useState(appointment.time)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  const generateTimeSlots = () => {
    const slots = []
    // Morning slots: 8:00 - 11:30
    for (let i = 8; i <= 11; i++) {
      slots.push(`${i.toString().padStart(2, '0')}:00`)
      if (i < 11) slots.push(`${i.toString().padStart(2, '0')}:30`)
    }
    // Afternoon slots: 14:00 - 17:30
    for (let i = 14; i <= 17; i++) {
      slots.push(`${i.toString().padStart(2, '0')}:00`)
      if (i < 17) slots.push(`${i.toString().padStart(2, '0')}:30`)
    }
    return slots
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}
    
    if (!newDate) newErrors.date = "Vui lòng chọn ngày mới"
    if (!newTime) newErrors.time = "Vui lòng chọn giờ mới"

    // Check if appointment date is not in the past
    const appointmentDate = new Date(newDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (appointmentDate < today) {
      newErrors.date = "Không thể đặt lịch hẹn trong quá khứ"
    }

    // Check if it's weekend
    const dayOfWeek = appointmentDate.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      newErrors.date = "Không thể đặt lịch hẹn vào cuối tuần"
    }

    // Check if new date/time is different from current
    if (newDate === appointment.date && newTime === appointment.time) {
      newErrors.general = "Vui lòng chọn ngày hoặc giờ khác với lịch hẹn hiện tại"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      await onSubmit(newDate, newTime)
    } catch (error) {
      console.error("Error rescheduling appointment:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.general && (
        <div className="text-sm text-red-500 bg-red-50 p-3 rounded">
          {errors.general}
        </div>
      )}
      
      <div className="bg-gray-50 p-3 rounded">
        <h4 className="font-medium text-sm mb-2">Lịch hẹn hiện tại:</h4>
        <p className="text-sm text-gray-600">
          {appointment.date} lúc {appointment.time}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="newDate">Ngày mới *</Label>
          <Input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
          />
          {errors.date && <p className="text-sm text-red-500 mt-1">{errors.date}</p>}
        </div>
        
        <div>
          <Label htmlFor="newTime">Giờ mới *</Label>
          <Select value={newTime} onValueChange={setNewTime}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn giờ mới" />
            </SelectTrigger>
            <SelectContent>
              {generateTimeSlots().map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.time && <p className="text-sm text-red-500 mt-1">{errors.time}</p>}
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Hủy
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Đang cập nhật..." : "Đổi lịch"}
        </Button>
      </DialogFooter>
    </form>
  )
}
