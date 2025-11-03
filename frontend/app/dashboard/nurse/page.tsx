"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { formatAppointmentTime } from "@/lib/utils"
import {
  Activity,
  Heart,
  Thermometer,
  Stethoscope,
  Users,
  Calendar,
  Pill,
  FileText,
  Plus,
  Save,
  User,
  LogOut,
  Home,
  Bed,
  ClipboardList,
  Clock,
  Eye,
  CheckCircle2,
  Loader2
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { nurseApi, NurseDashboardData, PatientAssignment, VitalSigns, appointmentsApi, Appointment, billingApi, BillingRecord, CreateBillingData, roomsApi, Room, RoomAssignment, patientsApi, Patient } from "@/lib/api"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { CheckCircle, XCircle, DollarSign } from "lucide-react"
import EnhancedBillingForm from "@/components/nurse/EnhancedBillingForm"
import RoomManagementTab from "@/components/nurse/RoomManagementTab"
import PatientListTab from "@/components/nurse/PatientListTab"
import ShiftScheduleTab from "@/components/nurse/ShiftScheduleTab"
import AssignmentsTab from "@/components/nurse/AssignmentsTab"

// Helper function to format time
// Use formatAppointmentTime from utils for consistent time handling

// Helper function to get status info - API trả về PascalCase
const getStatusInfo = (status: string) => {
  const statusMap: any = {
    'Scheduled': { vietnamese: 'Đã lên lịch', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    'Confirmed': { vietnamese: 'Đã xác nhận', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    'Completed': { vietnamese: 'Hoàn thành', color: 'bg-green-100 text-green-800 border-green-200' },
    'Cancelled': { vietnamese: 'Đã hủy', color: 'bg-red-100 text-red-800 border-red-200' },
    'No_Show': { vietnamese: 'Không đến', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    'In_Progress': { vietnamese: 'Đang diễn ra', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  }
  
  return statusMap[status] || { vietnamese: status, color: 'bg-gray-100 text-gray-800 border-gray-200' }
};

export default function NurseDashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  // Dashboard Data States
  const [dashboardData, setDashboardData] = useState<NurseDashboardData | null>(null)
  const [patientAssignments, setPatientAssignments] = useState<PatientAssignment[]>([])
  const [medicationSchedule, setMedicationSchedule] = useState([])
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([])
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([])
  
  // Appointment Filter States - Enhanced
  const [daysFilter, setDaysFilter] = useState<number>(7) // 7 or 30 days
  const [statusFilter, setStatusFilter] = useState<string>('all') // all, scheduled, confirmed, cancelled, completed
  const [appointmentFilter, setAppointmentFilter] = useState<"all" | "unconfirmed" | "confirmed">("unconfirmed")
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]) // Default to today
  
  // Appointment Dialog States
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmNotes, setConfirmNotes] = useState("")
  
  // Vital Signs Form State
  const [vitalSigns, setVitalSigns] = useState({
    patient_id: "",
    blood_pressure_systolic: "",
    blood_pressure_diastolic: "",
    heart_rate: "",
    temperature: "",
    respiratory_rate: "",
    oxygen_saturation: "",
    notes: ""
  })

  // Billing States
  const [billingRecords, setBillingRecords] = useState<BillingRecord[]>([])
  const [filteredBillingRecords, setFilteredBillingRecords] = useState<BillingRecord[]>([])
  const [showAddBillingDialog, setShowAddBillingDialog] = useState(false)
  const [confirmingBill, setConfirmingBill] = useState<number | null>(null)
  const [billingStatusFilter, setBillingStatusFilter] = useState<string>('all')
  const [billingPaymentMethodFilter, setBillingPaymentMethodFilter] = useState<string>('all')
  const [billingSortBy, setBillingSortBy] = useState<'date' | 'amount'>('date')
  const [billingSortOrder, setBillingSortOrder] = useState<'asc' | 'desc'>('desc')

  // Room Management States
  const [rooms, setRooms] = useState<Room[]>([])
  const [roomAssignments, setRoomAssignments] = useState<RoomAssignment[]>([])
  const [allPatients, setAllPatients] = useState<Patient[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  // Filter and sort billing records
  useEffect(() => {
    if (!Array.isArray(billingRecords)) {
      setFilteredBillingRecords([])
      return
    }

    let filtered = [...billingRecords]

    // Filter by status
    if (billingStatusFilter !== 'all') {
      filtered = filtered.filter(bill => 
        bill.payment_status?.toUpperCase() === billingStatusFilter.toUpperCase()
      )
    }

    // Filter by payment method
    if (billingPaymentMethodFilter !== 'all') {
      filtered = filtered.filter(bill => 
        bill.payment_method?.toUpperCase() === billingPaymentMethodFilter.toUpperCase()
      )
    }

    // Sort
    filtered.sort((a, b) => {
      if (billingSortBy === 'date') {
        const dateA = new Date(a.created_at).getTime()
        const dateB = new Date(b.created_at).getTime()
        return billingSortOrder === 'desc' ? dateB - dateA : dateA - dateB
      } else {
        const amountA = Number(a.total_amount)
        const amountB = Number(b.total_amount)
        return billingSortOrder === 'desc' ? amountB - amountA : amountA - amountB
      }
    })

    setFilteredBillingRecords(filtered)
  }, [billingRecords, billingStatusFilter, billingPaymentMethodFilter, billingSortBy, billingSortOrder])

  const loadDashboardData = async () => {
    setLoading(true)
    
    try {
      // Use Promise.allSettled to prevent one failure from blocking others
      await Promise.allSettled([
        // Load nurse dashboard data
        nurseApi.getDashboard()
          .then(response => {
            setDashboardData(response)
          })
          .catch(err => console.error('Dashboard API error:', err)),

        // Load patient assignments
        nurseApi.getPatientAssignments({ limit: 20 })
          .then(response => {
            setPatientAssignments(response.data)
          })
          .catch(err => console.error('Patient Assignments API error:', err)),

        // Load medication schedule
        nurseApi.getMedicationSchedule({ limit: 20 })
          .then(response => {
            setMedicationSchedule(response.data)
          })
          .catch(err => console.error('Medication Schedule API error:', err)),

        // Load all appointments (for filtering)
        appointmentsApi.getAllAppointments({ limit: 100 })
          .then(response => {
            const appointments = response.data || []
            setAllAppointments(appointments)
            // Set pending appointments (Scheduled status only - API returns PascalCase)
            const pending = appointments.filter((apt: Appointment) => 
              apt.status === 'Scheduled'
            )
            setPendingAppointments(pending)
          })
          .catch(err => console.error('Appointments API error:', err)),

        // Load billing records
        billingApi.getAllBilling({ limit: 50 })
          .then(response => {
            setBillingRecords(Array.isArray(response.data) ? response.data : [])
          })
          .catch(err => console.error('Billing API error:', err)),

        // Load rooms
        roomsApi.getAllRooms({ limit: 100 })
          .then(response => {
            setRooms(response.data)
          })
          .catch(err => console.error('Rooms API error:', err)),

        // Load room assignments
        roomsApi.getAllRoomAssignments({ limit: 100, active_only: true })
          .then(response => {
            setRoomAssignments(response.data)
          })
          .catch(err => console.error('Room Assignments API error:', err)),

        // Load all patients (for assigning to rooms)
        patientsApi.getAllPatients({ limit: 100 })
          .then(response => {
            setAllPatients(response.data)
          })
          .catch(err => console.error('Patients API error:', err))
      ])

      console.log('Nurse dashboard data loaded successfully')

    } catch (error) {
      console.error("Error loading nurse dashboard data:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu dashboard",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRecordVitalSigns = async () => {
    try {
      if (!vitalSigns.patient_id || !vitalSigns.blood_pressure_systolic || 
          !vitalSigns.blood_pressure_diastolic || !vitalSigns.heart_rate || 
          !vitalSigns.temperature) {
        toast({
          title: "Lỗi",
          description: "Vui lòng điền đầy đủ thông tin sinh hiệu",
          variant: "destructive",
        })
        return
      }

      const vitalSignsData = {
        patient_id: parseInt(vitalSigns.patient_id),
        blood_pressure_systolic: parseInt(vitalSigns.blood_pressure_systolic),
        blood_pressure_diastolic: parseInt(vitalSigns.blood_pressure_diastolic),
        heart_rate: parseInt(vitalSigns.heart_rate),
        temperature: parseFloat(vitalSigns.temperature),
        respiratory_rate: vitalSigns.respiratory_rate ? parseInt(vitalSigns.respiratory_rate) : undefined,
        oxygen_saturation: vitalSigns.oxygen_saturation ? parseInt(vitalSigns.oxygen_saturation) : undefined,
        notes: vitalSigns.notes
      }

      await nurseApi.recordVitalSigns(vitalSignsData)
      
      toast({
        title: "Thành công",
        description: "Đã ghi nhận sinh hiệu bệnh nhân",
      })

      // Reset form
      setVitalSigns({
        patient_id: "",
        blood_pressure_systolic: "",
        blood_pressure_diastolic: "",
        heart_rate: "",
        temperature: "",
        respiratory_rate: "",
        oxygen_saturation: "",
        notes: ""
      })

    } catch (error) {
      console.error("Error recording vital signs:", error)
      toast({
        title: "Lỗi",
        description: "Không thể ghi nhận sinh hiệu",
        variant: "destructive",
      })
    }
  }

  const handleConfirmAppointment = async (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setShowConfirmDialog(true)
  }

  const handleSubmitConfirm = async () => {
    if (!selectedAppointment) return
    
    try {
      await appointmentsApi.confirmAppointment(selectedAppointment.appointment_id, confirmNotes)
      
      toast({
        title: "Thành công",
        description: "Đã xác nhận lịch hẹn",
      })
      
      // Refresh appointments
      const appointmentsResponse = await appointmentsApi.getPendingAppointments({ limit: 50 })
      setPendingAppointments(appointmentsResponse.data)
      
      setShowConfirmDialog(false)
      setConfirmNotes("")
      setSelectedAppointment(null)
    } catch (error) {
      console.error("Error confirming appointment:", error)
      toast({
        title: "Lỗi",
        description: "Không thể xác nhận lịch hẹn",
        variant: "destructive",
      })
    }
  }

  const loadBillingRecords = async () => {
    try {
      const response = await billingApi.getAllBilling({ limit: 50 })
      setBillingRecords(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      console.error("Error loading billing records:", error)
    }
  }

  const handleConfirmCashPayment = async (billId: number) => {
    try {
      setConfirmingBill(billId)
      
      await billingApi.updateBilling(billId, {
        payment_status: 'PAID'
      })
      
      toast({
        title: "Thành công",
        description: "Đã xác nhận thanh toán tiền mặt",
      })
      
      // Refresh billing records
      await loadBillingRecords()
    } catch (error) {
      console.error("Error confirming payment:", error)
      toast({
        title: "Lỗi",
        description: "Không thể xác nhận thanh toán",
        variant: "destructive",
      })
    } finally {
      setConfirmingBill(null)
    }
  }

  const handleCancelAppointment = async (appointment: Appointment) => {
    if (!confirm("Bạn có chắc muốn hủy lịch hẹn này?")) return
    
    try {
      await appointmentsApi.cancelAppointment(appointment.appointment_id, "Hủy bởi y tá")
      
      toast({
        title: "Thành công",
        description: "Đã hủy lịch hẹn",
      })
      
      // Refresh appointments
      const appointmentsResponse = await appointmentsApi.getPendingAppointments({ limit: 50 })
      setPendingAppointments(appointmentsResponse.data)
    } catch (error) {
      console.error("Error cancelling appointment:", error)
      toast({
        title: "Lỗi",
        description: "Không thể hủy lịch hẹn",
        variant: "destructive",
      })
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/auth')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }



  // Filter appointments by date range and status
  const filterAppointments = (appointments: Appointment[]) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Start of today

    return appointments.filter((apt: Appointment) => {
      const aptDate = new Date(apt.appointment_date);
      aptDate.setHours(0, 0, 0, 0);

      // Date filter based on daysFilter value
      if (daysFilter > 0) {
        // Forward looking: from now to now + daysFilter
        const maxDate = new Date(now);
        maxDate.setDate(maxDate.getDate() + daysFilter);
        if (aptDate < now || aptDate > maxDate) return false;
      } else if (daysFilter < 0) {
        // Backward looking: from now + daysFilter to now
        const minDate = new Date(now);
        minDate.setDate(minDate.getDate() + daysFilter); // daysFilter is negative
        if (aptDate < minDate || aptDate > now) return false;
      }
      // if daysFilter === 0, show all dates

      // Status filter
      if (statusFilter === 'all') return true;
      if (statusFilter === 'scheduled') return apt.status === 'Scheduled';
      if (statusFilter === 'confirmed') return apt.status === 'Confirmed';
      if (statusFilter === 'cancelled') return apt.status === 'Cancelled';
      if (statusFilter === 'completed') return apt.status === 'Completed';
      return true;
    });
  };

  const filteredAppointments = filterAppointments(allAppointments);

  // Reapply filters when filter options change
  useEffect(() => {
    filterAppointments(allAppointments);
  }, [daysFilter, statusFilter]);

  // Count for badges - filter by selected date (keep existing functionality)
  const appointmentsOnSelectedDate = allAppointments.filter((apt: Appointment) => {
    const aptDate = apt.appointment_date.split('T')[0] // Get YYYY-MM-DD part directly
    return aptDate === selectedDate
  })
  const unconfirmedCount = appointmentsOnSelectedDate.filter((apt: Appointment) => apt.status === 'Scheduled').length
  const confirmedCount = appointmentsOnSelectedDate.filter((apt: Appointment) => apt.status === 'Confirmed').length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Dashboard Y tá</h1>
              <p className="text-sm text-gray-500">
                {user?.full_name || user?.email || "Y tá"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {[
            { value: "overview", label: "Tổng quan", icon: Home },
            { value: "patients", label: "Bệnh nhân phụ trách", icon: Users },
            { value: "assignments", label: "Phân công bệnh nhân", icon: ClipboardList },
            { value: "appointments", label: "Lịch hẹn", icon: Calendar },
            { value: "shifts", label: "Lịch ca trực", icon: Clock },
            { value: "rooms", label: "Phòng trực", icon: Bed },
            { value: "vital-signs", label: "Sinh hiệu", icon: Activity },
            { value: "billing", label: "Thanh toán", icon: DollarSign },
            { value: "care-plan", label: "Kế hoạch chăm sóc", icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.value

            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm
                  transition-all duration-200 ease-in-out
                  ${
                    isActive
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                      : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                  }
                `}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-white" : ""}`} />
                <span className="flex-1 text-left">{tab.label}</span>
                {tab.badge && (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                    {tab.badge}
                  </Badge>
                )}
              </button>
            )
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-gray-200">
          <div className="p-4 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.full_name || user?.email || "Y tá"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || "nurse@hospital.vn"}
                </p>
                <Badge variant="secondary" className="text-xs mt-1">
                  NURSE
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="p-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {activeTab === "overview" && "Tổng quan"}
                {activeTab === "patients" && "Bệnh nhân phụ trách"}
                {activeTab === "appointments" && "Duyệt lịch hẹn"}
                {activeTab === "shifts" && "Lịch ca trực"}
                {activeTab === "assignments" && "Phân công bệnh nhân"}
                {activeTab === "rooms" && "Quản lý phòng trực"}
                {activeTab === "vital-signs" && "Sinh hiệu"}
                {activeTab === "billing" && "Quản lý thanh toán"}
                {activeTab === "care-plan" && "Kế hoạch chăm sóc"}
              </h2>
              {mounted && (
                <p className="text-sm text-gray-500">
                  Chào buổi {new Date().getHours() < 12 ? "sáng" : new Date().getHours() < 18 ? "chiều" : "tối"}, {" "}
                  {user?.full_name || user?.email || "Y tá"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Users className="h-8 w-8 text-blue-600 mb-2" />
                        <p className="text-3xl font-bold text-blue-800">
                          {dashboardData?.totalPatients || 0}
                        </p>
                        <p className="text-sm font-medium text-blue-600">Tổng bệnh nhân</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Bed className="h-8 w-8 text-green-600 mb-2" />
                        <p className="text-3xl font-bold text-green-800">
                          {dashboardData?.activeRoomAssignments || 0}
                        </p>
                        <p className="text-sm font-medium text-green-600">Phân công phòng</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Pill className="h-8 w-8 text-purple-600 mb-2" />
                        <p className="text-3xl font-bold text-purple-800">
                          {dashboardData?.totalMedicine || 0}
                        </p>
                        <p className="text-sm font-medium text-purple-600">Tổng thuốc</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Calendar className="h-8 w-8 text-orange-600 mb-2" />
                        <p className="text-3xl font-bold text-orange-800">
                          {dashboardData?.todayAppointments || 0}
                        </p>
                        <p className="text-sm font-medium text-orange-600">Hẹn hôm nay</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Patient Assignments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Phân công bệnh nhân
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {patientAssignments && patientAssignments.length > 0 ? patientAssignments.slice(0, 5).map((assignment) => (
                      <div key={assignment.assignment_id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-blue-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="font-bold text-blue-800">{assignment.room_number}</p>
                            <p className="text-sm text-blue-600">Giường {assignment.bed_number}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold">
                              {assignment.patient.first_name} {assignment.patient.last_name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Nhập viện: {new Date(assignment.admission_date).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={assignment.priority === 'high' ? 'destructive' : 'secondary'}>
                            {assignment.priority === 'high' ? 'Cao' : 'Thường'}
                          </Badge>
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3 mr-1" />
                            Xem
                          </Button>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Không có phân công bệnh nhân nào</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Patients Tab */}
            <TabsContent value="patients" className="space-y-6">
              <PatientListTab onRefresh={loadDashboardData} />
            </TabsContent>

            {/* Appointments Tab - WITH FILTER */}
            <TabsContent value="appointments" className="space-y-6">
              {/* Filter Controls */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label className="font-semibold">Thời gian:</Label>
                      <Select value={daysFilter.toString()} onValueChange={(value) => setDaysFilter(Number(value))}>
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Chọn khoảng thời gian" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="-30">30 ngày trước</SelectItem>
                          <SelectItem value="-7">7 ngày trước</SelectItem>
                          <SelectItem value="7">7 ngày tới</SelectItem>
                          <SelectItem value="30">30 ngày tới</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Label className="font-semibold">Trạng thái:</Label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tất cả</SelectItem>
                          <SelectItem value="scheduled">Chưa xác nhận</SelectItem>
                          <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                          <SelectItem value="cancelled">Đã hủy</SelectItem>
                          <SelectItem value="completed">Đã hoàn thành</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="ml-auto text-sm text-muted-foreground">
                      Hiển thị <span className="font-semibold text-primary">{filteredAppointments.length}</span> / <span className="font-semibold">{allAppointments.length}</span> lịch hẹn
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Appointments List */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-orange-600" />
                      Danh sách lịch hẹn
                      <Badge variant="secondary" className="ml-2">
                        {filteredAppointments.length} lịch hẹn
                      </Badge>
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredAppointments && filteredAppointments.length > 0 ? (
                    <div className="space-y-3">
                      {filteredAppointments.map((appointment) => {
                        const statusInfo = getStatusInfo(appointment.status)
                        return (
                          <div 
                            key={appointment.appointment_id} 
                            className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-4 flex-1">
                              <div className={`p-3 rounded-lg ${appointment.status === 'Scheduled' ? 'bg-blue-100' : appointment.status === 'Confirmed' ? 'bg-purple-100' : 'bg-gray-100'}`}>
                                <Clock className={`h-6 w-6 ${appointment.status === 'Scheduled' ? 'text-blue-600' : appointment.status === 'Confirmed' ? 'text-purple-600' : 'text-gray-600'}`} />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-lg">
                                    {appointment.patient?.first_name} {appointment.patient?.last_name}
                                  </h4>
                                  <Badge variant="outline" className="text-xs">
                                    ID: {appointment.patient_id}
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>{new Date(appointment.appointment_date).toLocaleDateString('vi-VN')}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>{formatAppointmentTime(appointment.appointment_time)}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Stethoscope className="h-4 w-4" />
                                    <span>BS. {appointment.doctor?.first_name} {appointment.doctor?.last_name}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    <span className="truncate">{appointment.purpose || 'Khám tổng quát'}</span>
                                  </div>
                                </div>
                                {appointment.patient?.phone && (
                                  <div className="text-sm text-gray-500 mt-1">
                                    📞 {appointment.patient.phone}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <Badge 
                                variant="secondary"
                                className={statusInfo.color}
                              >
                                {statusInfo.vietnamese}
                              </Badge>
                              {appointment.status === 'Scheduled' && (
                                <>
                                  <Button 
                                    size="sm" 
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => handleConfirmAppointment(appointment)}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Xác nhận
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="destructive"
                                    onClick={() => handleCancelAppointment(appointment)}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Hủy
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-1">
                        Không có lịch hẹn
                      </p>
                      <p className="text-sm">
                        Không có lịch hẹn nào khớp với bộ lọc đã chọn
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Shifts Tab */}
            <TabsContent value="shifts" className="space-y-6">
              <ShiftScheduleTab onRefresh={loadDashboardData} />
            </TabsContent>

            {/* Vital Signs Tab */}
            <TabsContent value="vital-signs" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-600" />
                    Ghi nhận sinh hiệu
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>ID Bệnh nhân</Label>
                      <Input
                        type="number"
                        placeholder="Nhập ID bệnh nhân"
                        value={vitalSigns.patient_id}
                        onChange={(e) => setVitalSigns(prev => ({...prev, patient_id: e.target.value}))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Nhiệt độ (°C)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="36.5"
                        value={vitalSigns.temperature}
                        onChange={(e) => setVitalSigns(prev => ({...prev, temperature: e.target.value}))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Huyết áp tâm thu</Label>
                      <Input
                        type="number"
                        placeholder="120"
                        value={vitalSigns.blood_pressure_systolic}
                        onChange={(e) => setVitalSigns(prev => ({...prev, blood_pressure_systolic: e.target.value}))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Huyết áp tâm trương</Label>
                      <Input
                        type="number"
                        placeholder="80"
                        value={vitalSigns.blood_pressure_diastolic}
                        onChange={(e) => setVitalSigns(prev => ({...prev, blood_pressure_diastolic: e.target.value}))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Nhịp tim (bpm)</Label>
                      <Input
                        type="number"
                        placeholder="72"
                        value={vitalSigns.heart_rate}
                        onChange={(e) => setVitalSigns(prev => ({...prev, heart_rate: e.target.value}))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Nhịp thở (rpm)</Label>
                      <Input
                        type="number"
                        placeholder="18"
                        value={vitalSigns.respiratory_rate}
                        onChange={(e) => setVitalSigns(prev => ({...prev, respiratory_rate: e.target.value}))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>SpO2 (%)</Label>
                      <Input
                        type="number"
                        placeholder="98"
                        value={vitalSigns.oxygen_saturation}
                        onChange={(e) => setVitalSigns(prev => ({...prev, oxygen_saturation: e.target.value}))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Ghi chú</Label>
                    <Textarea
                      placeholder="Ghi chú thêm về sinh hiệu..."
                      value={vitalSigns.notes}
                      onChange={(e) => setVitalSigns(prev => ({...prev, notes: e.target.value}))}
                    />
                  </div>
                  <Button onClick={handleRecordVitalSigns} className="bg-green-600 hover:bg-green-700">
                    <Save className="h-4 w-4 mr-2" />
                    Lưu sinh hiệu
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Assignments Tab */}
            <TabsContent value="assignments" className="space-y-6">
              <AssignmentsTab 
                assignments={patientAssignments}
                onRefresh={loadDashboardData}
              />
            </TabsContent>

            <TabsContent value="care-plan">
              <Card>
                <CardHeader>
                  <CardTitle>Kế hoạch chăm sóc</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Chức năng kế hoạch chăm sóc đang được phát triển...</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Billing Tab */}
            <TabsContent value="billing" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Quản lý Hóa đơn</h3>
                  <p className="text-sm text-gray-500">Tạo và theo dõi hóa đơn thanh toán của bệnh nhân</p>
                </div>
                <Button onClick={() => setShowAddBillingDialog(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Lập hóa đơn mới
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Danh sách hóa đơn ({filteredBillingRecords.length}/{billingRecords.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Filter and Sort Controls */}
                  <div className="flex flex-wrap gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-[200px]">
                      <Label className="text-xs mb-1">Trạng thái</Label>
                      <Select value={billingStatusFilter} onValueChange={setBillingStatusFilter}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tất cả</SelectItem>
                          <SelectItem value="PENDING">Đang chờ</SelectItem>
                          <SelectItem value="PAID">Đã thanh toán</SelectItem>
                          <SelectItem value="OVERDUE">Quá hạn</SelectItem>
                          <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex-1 min-w-[200px]">
                      <Label className="text-xs mb-1">Phương thức</Label>
                      <Select value={billingPaymentMethodFilter} onValueChange={setBillingPaymentMethodFilter}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tất cả</SelectItem>
                          <SelectItem value="CASH">Tiền mặt</SelectItem>
                          <SelectItem value="TRANSFER">Chuyển khoản</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex-1 min-w-[150px]">
                      <Label className="text-xs mb-1">Sắp xếp theo</Label>
                      <Select value={billingSortBy} onValueChange={(val: 'date' | 'amount') => setBillingSortBy(val)}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="date">Ngày tạo</SelectItem>
                          <SelectItem value="amount">Số tiền</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex-1 min-w-[120px]">
                      <Label className="text-xs mb-1">Thứ tự</Label>
                      <Select value={billingSortOrder} onValueChange={(val: 'asc' | 'desc') => setBillingSortOrder(val)}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="desc">Giảm dần</SelectItem>
                          <SelectItem value="asc">Tăng dần</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {filteredBillingRecords && filteredBillingRecords.length > 0 ? filteredBillingRecords.slice(0, 10).map((bill) => (
                      <div key={bill.bill_id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">#{bill.bill_id}</span>
                            <Badge className={
                              bill.payment_status?.toUpperCase() === 'PAID' ? 'bg-green-100 text-green-800' :
                              bill.payment_status?.toUpperCase() === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                              bill.payment_status?.toUpperCase() === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }>
                              {bill.payment_status?.toUpperCase() === 'PAID' ? 'Đã thanh toán' :
                               bill.payment_status?.toUpperCase() === 'PENDING' ? 'Đang chờ' :
                               bill.payment_status?.toUpperCase() === 'OVERDUE' ? 'Quá hạn' :
                               bill.payment_status?.toUpperCase() === 'CANCELLED' ? 'Đã hủy' : bill.payment_status}
                            </Badge>
                            {bill.payment_method && (
                              <Badge variant="outline" className="text-xs">
                                {bill.payment_method === 'CASH' ? '💵 Tiền mặt' : 
                                 bill.payment_method === 'TRANSFER' ? '🏦 Chuyển khoản' :
                                 bill.payment_method === 'MOMO' ? '📱 MoMo' :
                                 bill.payment_method === 'VNPAY' ? '💳 VNPay' :
                                 bill.payment_method}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            Bệnh nhân: {bill.patient?.first_name} {bill.patient?.last_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Ngày tạo: {new Date(bill.created_at).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                        <div className="text-right flex flex-col items-end gap-2">
                          <p className="text-xl font-bold text-blue-600">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(bill.total_amount)}
                          </p>
                          {bill.payment_method?.toUpperCase() === 'CASH' && 
                           bill.payment_status?.toUpperCase() === 'PENDING' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-600 hover:bg-green-50"
                              onClick={() => handleConfirmCashPayment(bill.bill_id)}
                              disabled={confirmingBill === bill.bill_id}
                            >
                              {confirmingBill === bill.bill_id ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Đang xử lý...
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  Xác nhận đã thanh toán
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8 text-gray-500">
                        <DollarSign className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                        <p>Chưa có hóa đơn nào</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Room Management Tab */}
            <TabsContent value="rooms" className="space-y-6">
              <RoomManagementTab
                rooms={rooms}
                roomAssignments={roomAssignments}
                patients={allPatients}
                onRefresh={loadDashboardData}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Enhanced Billing Dialog */}
      <Dialog open={showAddBillingDialog} onOpenChange={setShowAddBillingDialog}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-600" />
              Lập hóa đơn mới
            </DialogTitle>
            <DialogDescription>
              Chọn hồ sơ y tế và các dịch vụ đã thực hiện để tạo hóa đơn
            </DialogDescription>
          </DialogHeader>
          <EnhancedBillingForm 
            onSuccess={() => {
              setShowAddBillingDialog(false)
              // Reload billing records
              billingApi.getAllBilling({ limit: 50 })
                .then(response => setBillingRecords(Array.isArray(response.data) ? response.data : []))
                .catch(err => console.error('Error reloading billing:', err))
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Confirm Appointment Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Xác nhận lịch hẹn
            </DialogTitle>
            <DialogDescription>
              Xác nhận thông tin lịch hẹn và thêm ghi chú nếu cần
            </DialogDescription>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="space-y-4">
              {/* Patient Info */}
              <div className="p-4 bg-blue-50 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Bệnh nhân:</span>
                  <span className="font-semibold">
                    {selectedAppointment.patient?.first_name} {selectedAppointment.patient?.last_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Bác sĩ:</span>
                  <span className="font-semibold">
                    BS. {selectedAppointment.doctor?.first_name} {selectedAppointment.doctor?.last_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Ngày hẹn:</span>
                  <span className="font-semibold">
                    {new Date(selectedAppointment.appointment_date).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Giờ hẹn:</span>
                  <span className="font-semibold">{formatAppointmentTime(selectedAppointment.appointment_time)}</span>
                </div>
                {selectedAppointment.purpose && (
                  <div className="pt-2 border-t border-blue-200">
                    <span className="text-sm text-gray-600">Lý do khám:</span>
                    <p className="font-medium mt-1">{selectedAppointment.purpose}</p>
                  </div>
                )}
              </div>

              {/* Notes Input */}
              <div className="space-y-2">
                <Label htmlFor="confirmNotes">Ghi chú xác nhận (Tùy chọn)</Label>
                <Textarea
                  id="confirmNotes"
                  placeholder="Thêm ghi chú về việc xác nhận lịch hẹn..."
                  value={confirmNotes}
                  onChange={(e) => setConfirmNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowConfirmDialog(false)
                setConfirmNotes("")
                setSelectedAppointment(null)
              }}
            >
              Hủy
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={handleSubmitConfirm}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Xác nhận lịch hẹn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
