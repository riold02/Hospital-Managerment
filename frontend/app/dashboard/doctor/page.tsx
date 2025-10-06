"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { toast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Calendar,
  Clock,
  FileText,
  Plus,
  Play,
  CheckCircle,
  Stethoscope,
  Pill,
  AlertTriangle,
  Bell,
  Search,
  Heart,
  Activity,
  Thermometer,
  TestTube,
  Printer,
  Eye,
  Save,
  Bed,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Minus,
  Home,
  UserCheck,
  FlaskConical,
  Inbox,
  Settings,
  Users,
  UserCog,
  X,
  CreditCard,
  Building2,
  Droplets,
  DoorOpen,
  BedDouble,
  Building,
  LogOut,
  User
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useUser } from "@/hooks/useUser"
import { doctorApi, DoctorDashboardData, AppointmentData, DoctorInfo, staffApi, StaffMember } from "@/lib/api"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// Comment out problematic imports
// import AppointmentsPage from "@/app/appointments/page"
// import MedicalRecordsPage from "@/app/medical-records/page"
// import BillingPage from "@/app/billing/page"
// import MedicinePage from "@/app/medicine/page"
// import PharmacyPage from "@/app/pharmacy/page"
// import BloodBankPage from "@/app/blood-bank/page"
// import RoomsPage from "@/app/rooms/page"
// import RoomAssignmentsPage from "@/app/room-assignments/page"
// import PatientsPage from "@/app/patients/page"
// import DoctorsPage from "@/app/doctors/page"
// import StaffPage from "@/app/staff/page"

// Mock data for comprehensive doctor dashboard
const mockKPIData = {
  appointmentsToday: 12,
  completedToday: 8,
  pendingResults: 5,
  criticalAlerts: 2,
  inpatients: 6,
  newMessages: 3,
}

const mockAppointments = [
  {
    id: 1,
    time: "08:30",
    patient: "Nguyễn Văn An",
    age: 45,
    gender: "Nam",
    purpose: "Khám tổng quát",
    status: "Đã đến",
    patient_id: "P001",
    avatar: "/api/placeholder/32/32",
    allergies: ["Penicillin", "Aspirin"],
    conditions: ["Tăng huyết áp", "Tiểu đường type 2"],
    lastVisit: "2024-01-15",
    vitals: { bp: "140/90", hr: "78", temp: "36.5" },
  },
  {
    id: 2,
    time: "09:15",
    patient: "Trần Thị Bình",
    age: 32,
    gender: "Nữ",
    purpose: "Tái khám tim mạch",
    status: "Đang khám",
    patient_id: "P002",
    avatar: "/api/placeholder/32/32",
    allergies: [],
    conditions: ["Rối loạn nhịp tim"],
    lastVisit: "2024-01-10",
    vitals: { bp: "120/80", hr: "85", temp: "36.8" },
  },
  {
    id: 3,
    time: "10:00",
    patient: "Lê Minh Cường",
    age: 28,
    gender: "Nam",
    purpose: "Khám da liễu",
    status: "Trễ hẹn",
    patient_id: "P003",
    avatar: "/api/placeholder/32/32",
    allergies: ["Latex"],
    conditions: ["Viêm da cơ địa"],
    lastVisit: "2024-01-08",
    vitals: { bp: "115/75", hr: "72", temp: "36.4" },
  },
  {
    id: 4,
    time: "11:30",
    patient: "Phạm Thị Dung",
    age: 55,
    gender: "Nữ",
    purpose: "Khám nội tiết",
    status: "Đang chờ",
    patient_id: "P004",
    avatar: "/api/placeholder/32/32",
    allergies: [],
    conditions: ["Suy giáp"],
    lastVisit: "2024-01-05",
    vitals: { bp: "130/85", hr: "68", temp: "36.6" },
  },
]

const mockInpatients = [
  {
    id: 1,
    room: "A101",
    bed: "1",
    patient: "Hoàng Văn Đức",
    condition: "Phẫu thuật ruột thừa",
    priority: "Cao",
    vitals: { bp: "125/80", hr: "82", temp: "37.2", spo2: "98%" },
    orders: 3,
    lastNote: "2 giờ trước",
  },
  {
    id: 2,
    room: "A102",
    bed: "2",
    patient: "Nguyễn Thị Lan",
    condition: "Viêm phổi",
    priority: "Trung bình",
    vitals: { bp: "110/70", hr: "88", temp: "38.1", spo2: "95%" },
    orders: 1,
    lastNote: "4 giờ trước",
  },
]

const mockPendingResults = [
  { id: 1, patient: "Nguyễn Văn An", test: "Xét nghiệm máu tổng quát", status: "Hoàn thành", priority: "Bình thường" },
  { id: 2, patient: "Trần Thị Bình", test: "Siêu âm tim", status: "Hoàn thành", priority: "Cần xem ngay" },
  { id: 3, patient: "Lê Minh Cường", test: "X-quang ngực", status: "Đang xử lý", priority: "Bình thường" },
]

const mockMessages = [
  {
    id: 1,
    from: "Y tá Nguyễn Lan",
    message: "Bệnh nhân phòng A101 cần tư vấn thuốc",
    time: "10 phút trước",
    priority: "Cao",
  },
  {
    id: 2,
    from: "Dược sĩ Trần Minh",
    message: "Đơn thuốc P002 có tương tác",
    time: "30 phút trước",
    priority: "Trung bình",
  },
  {
    id: 3,
    from: "Kỹ thuật viên",
    message: "Kết quả CT scan đã sẵn sàng",
    time: "1 giờ trước",
    priority: "Bình thường",
  },
]

export default function DoctorDashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("timeline")
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null)
  const [showPatientChart, setShowPatientChart] = useState(false)
  const [filterStatus, setFilterStatus] = useState("all")
  const [loading, setLoading] = useState(false)
  
  // Real KPI Data States
  const [dashboardData, setDashboardData] = useState<DoctorDashboardData | null>(null)
  const [appointments, setAppointments] = useState<AppointmentData[]>([])
  const [inpatients, setInpatients] = useState([])
  const [pendingResults, setPendingResults] = useState([])
  const [messages, setMessages] = useState([])
  const [criticalAlerts, setCriticalAlerts] = useState(0)
  const [doctorInfo, setDoctorInfo] = useState<DoctorInfo | null>(null)
  const [allDoctors, setAllDoctors] = useState<DoctorInfo[]>([])
  const [doctorStats, setDoctorStats] = useState<any>(null)
  const [staffList, setStaffList] = useState<StaffMember[]>([])
  const [staffStats, setStaffStats] = useState<any>(null)
  const [greeting, setGreeting] = useState<string>('')
  
  // Client-side date states (to avoid hydration errors)
  const [currentDate, setCurrentDate] = useState<string>('')
  const [currentDateFormatted, setCurrentDateFormatted] = useState<string>('')
  const [mounted, setMounted] = useState(false)

  // Dialog States
  const [showPatientDetail, setShowPatientDetail] = useState(false)
  const [showMedicalHistory, setShowMedicalHistory] = useState(false)
  const [showProgressNotes, setShowProgressNotes] = useState(false)
  const [showExamination, setShowExamination] = useState(false)
  
  // Clinical Workflow Tab State
  const [clinicalTab, setClinicalTab] = useState("notes")

  // Clinical Notes State
  const [clinicalNotes, setClinicalNotes] = useState({
    subjective: "",
    objective: "",
    assessment: "",
    plan: "",
    template: "",
  })

  // Orders State
  const [orders, setOrders] = useState([])
  const [newOrder, setNewOrder] = useState({
    type: "",
    test: "",
    priority: "routine",
    notes: "",
  })

  // Prescription State
  const [prescription, setPrescription] = useState({
    medication: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
  })
  const [prescriptions, setPrescriptions] = useState<any[]>([])

  // Common medications list
  const commonMedications = [
    "Paracetamol 500mg",
    "Amoxicillin 500mg",
    "Ibuprofen 400mg",
    "Vitamin C 1000mg",
    "Omeprazole 20mg",
    "Metformin 500mg",
    "Aspirin 100mg",
    "Cetirizine 10mg",
  ]

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  // Set greeting on client side to avoid hydration mismatch
  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) {
      setGreeting('sáng')
    } else if (hour < 18) {
      setGreeting('chiều')
    } else {
      setGreeting('tối')
    }
  }, [])

  // Set current date on client side to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
    // Get local date without timezone conversion
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const localDate = `${year}-${month}-${day}`
    
    setCurrentDate(localDate)
    setCurrentDateFormatted(today.toLocaleDateString('vi-VN', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }))
    
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    
    try {
      // Load all data independently to prevent one failure from blocking others
      await Promise.allSettled([
        // Load doctor dashboard data
        doctorApi.getDashboard()
          .then(response => {
            setDashboardData(response)
          })
          .catch(err => console.error('Dashboard API error:', err)),

        // Load doctor appointments
        doctorApi.getAppointments({ limit: 20 })
          .then(response => {
            setAppointments(response.data)
          })
          .catch(err => console.error('Appointments API error:', err)),

        // Load doctor patients (inpatients)
        doctorApi.getPatients({ limit: 10 })
          .then(response => {
            setInpatients(response.data)
          })
          .catch(err => console.error('Patients API error:', err)),

        // Load medical records (pending results) - may fail
        doctorApi.getMedicalRecords({ limit: 10 })
          .then(response => {
            setPendingResults(response.data)
          })
          .catch(err => console.error('Medical Records API error (optional):', err)),

        // Load doctor schedule
        doctorApi.getSchedule()
          .then(response => {
            // Successfully loaded schedule
          })
          .catch(err => console.error('Schedule API error:', err)),

        // Get all doctors to find current doctor info
        doctorApi.getAllDoctors({ limit: 100 })
          .then(response => {
            setAllDoctors(response.data)
            
            if (response.data && user?.user_id) {
              const currentDoctor = response.data.find((doctor: DoctorInfo) => doctor.user_id === user.user_id)
              if (currentDoctor) {
                setDoctorInfo(currentDoctor)
              }
            }
          })
          .catch(err => console.error('All Doctors API error:', err)),

        // Load doctor statistics
        doctorApi.getStatistics()
          .then(response => {
            setDoctorStats(response)
          })
          .catch(err => console.error('Statistics API error:', err)),

        // Load staff list
        staffApi.getAllStaff({ limit: 100 })
          .then(response => {
            setStaffList(response.data)
          })
          .catch(err => console.error('Staff API error:', err)),

        // Load staff statistics
        staffApi.getStaffStats()
          .then(response => {
            setStaffStats(response.data)
          })
          .catch(err => console.error('Staff Stats API error:', err))
      ])

      // Set critical alerts based on real data
      setCriticalAlerts(0)

    } catch (error) {
      console.error("Error loading dashboard data:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu dashboard",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Calculate real KPI data from states
  const kpiData = {
    appointmentsToday: dashboardData?.todayAppointments || appointments.filter((apt: AppointmentData) => {
      const today = new Date().toISOString().split('T')[0]
      const appointmentDate = apt.appointment_date.split('T')[0]
      // Chỉ hiển thị lịch hẹn đã xác nhận của hôm nay
      return appointmentDate === today && (apt.status === "Confirmed" || apt.status === "Đã xác nhận")
    }).length,
    completedToday: appointments.filter((apt: AppointmentData) => apt.status === "Completed" || apt.status === "Hoàn thành").length,
    pendingResults: pendingResults.length,
    criticalAlerts: criticalAlerts,
    inpatients: inpatients.length,
    newMessages: messages.filter((msg: any) => !msg.read).length
  }
  console.log('Messages:', messages)

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/auth')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Patient Dialog Handlers
  const handleViewPatientDetail = (patient: any) => {
    setSelectedPatient(patient)
    setShowPatientDetail(true)
  }

  const handleViewMedicalHistory = (patient: any) => {
    setSelectedPatient(patient)
    setShowMedicalHistory(true)
  }

  const handleViewProgressNotes = (patient: any) => {
    setSelectedPatient(patient)
    setShowProgressNotes(true)
  }

  const handleStartExamination = (patient: any) => {
    setSelectedPatient(patient)
    setShowExamination(true)
  }

  // Medical Record Handlers
  const handleSaveClinicalNotes = async () => {
    if (!selectedPatient?.patient_id && !selectedPatient?.patient_info?.patient_id) {
      toast({
        title: "Lỗi",
        description: "Không tìm thấy thông tin bệnh nhân",
        variant: "destructive",
      })
      return
    }

    try {
      const patientId = selectedPatient.patient_info?.patient_id || selectedPatient.patient_id
      
      // Tạo medical record với SOAP notes
      const diagnosis = `${clinicalNotes.assessment}\n\nTriệu chứng: ${clinicalNotes.subjective}\nKhám lâm sàng: ${clinicalNotes.objective}`
      const treatment = clinicalNotes.plan
      
      await doctorApi.createMedicalRecord({
        patient_id: patientId,
        diagnosis: diagnosis,
        treatment: treatment,
      })

      toast({
        title: "Thành công",
        description: "Đã lưu ghi chú khám bệnh",
      })

      // Clear notes after save
      setClinicalNotes({
        subjective: "",
        objective: "",
        assessment: "",
        plan: "",
        template: "",
      })
    } catch (error) {
      console.error('Error saving clinical notes:', error)
      toast({
        title: "Lỗi",
        description: "Không thể lưu ghi chú khám bệnh",
        variant: "destructive",
      })
    }
  }

  const handleAddOrder = () => {
    if (!newOrder.type || !newOrder.test) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin chỉ định",
        variant: "destructive",
      })
      return
    }

    setOrders([...orders, { ...newOrder, id: Date.now() }])
    setNewOrder({
      type: "",
      test: "",
      priority: "routine",
      notes: "",
    })

    toast({
      title: "Thành công",
      description: "Đã thêm chỉ định",
    })
  }

  const handleAddPrescription = async () => {
    if (!prescription.medication || !prescription.dosage || !prescription.frequency) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin thuốc (Tên, Liều lượng, Tần suất)",
        variant: "destructive",
      })
      return
    }

    // Add to prescriptions list
    setPrescriptions([...prescriptions, { ...prescription, id: Date.now() }])
    
    toast({
      title: "Thành công",
      description: `Đã thêm thuốc ${prescription.medication}`,
    })

    // Clear form
    setPrescription({
      medication: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
    })
  }

  const handleRemovePrescription = (id: number) => {
    setPrescriptions(prescriptions.filter((p: any) => p.id !== id))
    toast({
      title: "Đã xóa",
      description: "Đã xóa thuốc khỏi đơn",
    })
  }

  const handleSavePrescriptions = async () => {
    if (prescriptions.length === 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng thêm ít nhất 1 loại thuốc",
        variant: "destructive",
      })
      return
    }

    // TODO: Call API to save all prescriptions
    toast({
      title: "Thành công",
      description: `Đã lưu đơn thuốc với ${prescriptions.length} loại thuốc`,
    })
  }

  // Handler to save complete medical record
  const handleSaveCompleteRecord = async () => {
    if (!selectedPatient?.patient_id && !selectedPatient?.patient_info?.patient_id) {
      toast({
        title: "Lỗi",
        description: "Không tìm thấy thông tin bệnh nhân",
        variant: "destructive",
      })
      return
    }

    // Validate required fields
    if (!clinicalNotes.assessment || !clinicalNotes.plan) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập chẩn đoán (Assessment) và kế hoạch điều trị (Plan)",
        variant: "destructive",
      })
      return
    }

    try {
      const patientId = selectedPatient.patient_info?.patient_id || selectedPatient.patient_id
      
      // Build comprehensive diagnosis with SOAP notes
      let diagnosis = `[CHẨN ĐOÁN]\n${clinicalNotes.assessment}\n\n`
      
      if (clinicalNotes.subjective) {
        diagnosis += `[TRIỆU CHỨNG CHỦ QUAN]\n${clinicalNotes.subjective}\n\n`
      }
      
      if (clinicalNotes.objective) {
        diagnosis += `[KHÁM LÂM SÀNG]\n${clinicalNotes.objective}\n\n`
      }
      
      // Build treatment plan with orders and prescriptions
      let treatment = `[KẾ HOẠCH ĐIỀU TRỊ]\n${clinicalNotes.plan}\n\n`
      
      if (orders.length > 0) {
        treatment += `[CHỈ ĐỊNH CẬN LÂM SÀNG]\n`
        orders.forEach((order: any, index: number) => {
          treatment += `${index + 1}. ${order.test} (${order.type}) - Mức độ: ${order.priority}\n`
          if (order.notes) {
            treatment += `   Ghi chú: ${order.notes}\n`
          }
        })
        treatment += `\n`
      }
      
      if (prescriptions.length > 0) {
        treatment += `[ĐỌN THUỐC]\n`
        prescriptions.forEach((med: any, index: number) => {
          treatment += `${index + 1}. ${med.medication}\n`
          treatment += `   - Liều lượng: ${med.dosage}\n`
          treatment += `   - Tần suất: ${med.frequency}\n`
          if (med.duration) {
            treatment += `   - Thời gian: ${med.duration}\n`
          }
          if (med.instructions) {
            treatment += `   - Hướng dẫn: ${med.instructions}\n`
          }
        })
      }
      
      await doctorApi.createMedicalRecord({
        patient_id: patientId,
        diagnosis: diagnosis,
        treatment: treatment,
      })

      toast({
        title: "Thành công",
        description: "Đã lưu hồ sơ khám bệnh hoàn chỉnh",
      })

      // Clear all forms after successful save
      setClinicalNotes({
        subjective: "",
        objective: "",
        assessment: "",
        plan: "",
        template: "",
      })
      setOrders([])
      setPrescriptions([])
      
      // Reload medical records
      loadDashboardData()
      
    } catch (error) {
      console.error('Error saving complete medical record:', error)
      toast({
        title: "Lỗi",
        description: "Không thể lưu hồ sơ khám bệnh",
        variant: "destructive",
      })
    }
  }

  // Handler to print medical record
  const handlePrintMedicalRecord = () => {
    if (!selectedPatient) {
      toast({
        title: "Lỗi",
        description: "Không tìm thấy thông tin bệnh nhân",
        variant: "destructive",
      })
      return
    }

    // Create print window
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast({
        title: "Lỗi",
        description: "Không thể mở cửa sổ in. Vui lòng cho phép popup.",
        variant: "destructive",
      })
      return
    }

    const patientName = selectedPatient.patient_name || 
      `${selectedPatient.patient_info?.first_name || ''} ${selectedPatient.patient_info?.last_name || ''}`.trim() ||
      'Bệnh nhân'
    
    const patientCode = selectedPatient.patient_info?.patient_code || 'N/A'
    const dateOfBirth = selectedPatient.patient_info?.date_of_birth 
      ? new Date(selectedPatient.patient_info.date_of_birth).toLocaleDateString('vi-VN')
      : 'N/A'
    const gender = selectedPatient.patient_info?.gender === 'male' ? 'Nam' : 
                   selectedPatient.patient_info?.gender === 'female' ? 'Nữ' : 'Chưa xác định'
    const phone = selectedPatient.patient_info?.phone || 'N/A'
    const address = selectedPatient.patient_info?.address || 'N/A'
    const allergies = selectedPatient.patient_info?.allergies || 'Không có'
    
    const doctorName = doctorInfo ? `${doctorInfo.first_name} ${doctorInfo.last_name}` : 'Bác sĩ'
    const specialty = doctorInfo?.specialty || 'N/A'
    const today = new Date().toLocaleDateString('vi-VN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })

    // Build HTML content
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Hồ sơ khám bệnh - ${patientName}</title>
        <style>
          @media print {
            @page { margin: 2cm; }
            body { margin: 0; }
          }
          body {
            font-family: 'Times New Roman', Times, serif;
            line-height: 1.6;
            color: #000;
            max-width: 21cm;
            margin: 0 auto;
            padding: 20px;
            background: white;
          }
          .header {
            text-align: center;
            border-bottom: 3px double #000;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }
          .hospital-name {
            font-size: 18px;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 5px;
          }
          .title {
            font-size: 24px;
            font-weight: bold;
            text-transform: uppercase;
            margin: 20px 0;
            color: #2563eb;
          }
          .section {
            margin: 20px 0;
            page-break-inside: avoid;
          }
          .section-title {
            font-size: 16px;
            font-weight: bold;
            background: #f3f4f6;
            padding: 8px 12px;
            margin: 15px 0 10px 0;
            border-left: 4px solid #2563eb;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 150px 1fr;
            gap: 8px;
            margin: 10px 0;
          }
          .info-label {
            font-weight: bold;
          }
          .content {
            margin: 10px 0;
            padding-left: 20px;
            white-space: pre-wrap;
          }
          .signature-section {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
          }
          .signature-box {
            text-align: center;
            width: 200px;
          }
          .alert {
            background: #fee;
            border: 2px solid #f00;
            padding: 10px;
            margin: 15px 0;
            border-radius: 5px;
          }
          .medication-list {
            margin: 10px 0;
          }
          .medication-item {
            border: 1px solid #ddd;
            padding: 10px;
            margin: 8px 0;
            border-radius: 5px;
            background: #fafafa;
          }
          .medication-name {
            font-weight: bold;
            font-size: 14px;
            color: #1e40af;
          }
          .medication-details {
            margin-top: 5px;
            padding-left: 15px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f3f4f6;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="hospital-name">Bệnh viện Đa khoa Quốc tế</div>
          <div>Địa chỉ: 123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh</div>
          <div>Điện thoại: (028) 1234 5678 | Email: info@hospital.vn</div>
        </div>

        <div class="title">HỒ SƠ KHÁM BỆNH</div>

        <div class="section">
          <div class="section-title">THÔNG TIN BỆNH NHÂN</div>
          <div class="info-grid">
            <div class="info-label">Họ và tên:</div>
            <div>${patientName}</div>
            <div class="info-label">Mã bệnh nhân:</div>
            <div>${patientCode}</div>
            <div class="info-label">Ngày sinh:</div>
            <div>${dateOfBirth}</div>
            <div class="info-label">Giới tính:</div>
            <div>${gender}</div>
            <div class="info-label">Điện thoại:</div>
            <div>${phone}</div>
            <div class="info-label">Địa chỉ:</div>
            <div>${address}</div>
          </div>
          ${allergies !== 'Không có' ? `
            <div class="alert">
              <strong>⚠️ CẢNH BÁO DỊ ỨNG:</strong> ${allergies}
            </div>
          ` : ''}
        </div>

        <div class="section">
          <div class="section-title">THÔNG TIN KHÁM BỆNH</div>
          <div class="info-grid">
            <div class="info-label">Bác sĩ khám:</div>
            <div>${doctorName}</div>
            <div class="info-label">Chuyên khoa:</div>
            <div>${specialty}</div>
            <div class="info-label">Ngày khám:</div>
            <div>${today}</div>
          </div>
        </div>
    `

    // Add SOAP Notes
    if (clinicalNotes.subjective || clinicalNotes.objective || clinicalNotes.assessment || clinicalNotes.plan) {
      htmlContent += `
        <div class="section">
          <div class="section-title">GHI CHÚ KHÁM BỆNH (SOAP)</div>
      `
      
      if (clinicalNotes.subjective) {
        htmlContent += `
          <div style="margin: 15px 0;">
            <strong>Subjective (Triệu chứng chủ quan):</strong>
            <div class="content">${clinicalNotes.subjective}</div>
          </div>
        `
      }
      
      if (clinicalNotes.objective) {
        htmlContent += `
          <div style="margin: 15px 0;">
            <strong>Objective (Khám lâm sàng):</strong>
            <div class="content">${clinicalNotes.objective}</div>
          </div>
        `
      }
      
      if (clinicalNotes.assessment) {
        htmlContent += `
          <div style="margin: 15px 0;">
            <strong>Assessment (Chẩn đoán):</strong>
            <div class="content">${clinicalNotes.assessment}</div>
          </div>
        `
      }
      
      if (clinicalNotes.plan) {
        htmlContent += `
          <div style="margin: 15px 0;">
            <strong>Plan (Kế hoạch điều trị):</strong>
            <div class="content">${clinicalNotes.plan}</div>
          </div>
        `
      }
      
      htmlContent += `</div>`
    }

    // Add Orders
    if (orders.length > 0) {
      htmlContent += `
        <div class="section">
          <div class="section-title">CHỈ ĐỊNH CẬN LÂM SÀNG</div>
          <table>
            <thead>
              <tr>
                <th>STT</th>
                <th>Loại</th>
                <th>Tên xét nghiệm/Chỉ định</th>
                <th>Mức độ</th>
                <th>Ghi chú</th>
              </tr>
            </thead>
            <tbody>
      `
      
      orders.forEach((order: any, index: number) => {
        const typeMap: any = {
          'lab': 'Xét nghiệm',
          'imaging': 'Chẩn đoán hình ảnh',
          'procedure': 'Thủ thuật',
          'consultation': 'Hội chẩn'
        }
        htmlContent += `
          <tr>
            <td>${index + 1}</td>
            <td>${typeMap[order.type] || order.type}</td>
            <td>${order.test}</td>
            <td>${order.priority}</td>
            <td>${order.notes || '-'}</td>
          </tr>
        `
      })
      
      htmlContent += `
            </tbody>
          </table>
        </div>
      `
    }

    // Add Prescriptions
    if (prescriptions.length > 0) {
      htmlContent += `
        <div class="section">
          <div class="section-title">ĐƠN THUỐC</div>
          <div class="medication-list">
      `
      
      prescriptions.forEach((med: any, index: number) => {
        htmlContent += `
          <div class="medication-item">
            <div class="medication-name">${index + 1}. ${med.medication}</div>
            <div class="medication-details">
              <div>• Liều lượng: <strong>${med.dosage}</strong></div>
              <div>• Tần suất: <strong>${med.frequency}</strong></div>
              ${med.duration ? `<div>• Thời gian: <strong>${med.duration}</strong></div>` : ''}
              ${med.instructions ? `<div>• Hướng dẫn: <em>${med.instructions}</em></div>` : ''}
            </div>
          </div>
        `
      })
      
      htmlContent += `
          </div>
        </div>
      `
    }

    // Add signature section
    htmlContent += `
        <div class="signature-section">
          <div class="signature-box">
            <div>Bệnh nhân/Người nhà</div>
            <div style="margin-top: 80px;">_________________</div>
          </div>
          <div class="signature-box">
            <div>Bác sĩ điều trị</div>
            <div style="margin-top: 60px; font-weight: bold;">${doctorName}</div>
            <div style="margin-top: 5px; font-style: italic;">${specialty}</div>
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()
  }

  const getStatusBadge = (status: string) => {
    // Map English status to Vietnamese
    const statusMap: { [key: string]: string } = {
      "Scheduled": "Đã lên lịch",
      "Confirmed": "Đã xác nhận", 
      "In Progress": "Đang khám",
      "Completed": "Hoàn thành",
      "Cancelled": "Đã hủy",
      "No Show": "Vắng mặt"
    }
    
    const config: { [key: string]: any } = {
      "Đã lên lịch": { variant: "secondary" as const, color: "bg-blue-100 text-blue-800", icon: Clock },
      "Scheduled": { variant: "secondary" as const, color: "bg-blue-100 text-blue-800", icon: Clock },
      "Đã xác nhận": { variant: "default" as const, color: "bg-green-100 text-green-800", icon: CheckCircle },
      "Confirmed": { variant: "default" as const, color: "bg-green-100 text-green-800", icon: CheckCircle },
      "Đang khám": { variant: "outline" as const, color: "bg-yellow-100 text-yellow-800", icon: Stethoscope },
      "In Progress": { variant: "outline" as const, color: "bg-yellow-100 text-yellow-800", icon: Stethoscope },
      "Hoàn thành": { variant: "default" as const, color: "bg-green-100 text-green-800", icon: CheckCircle },
      "Completed": { variant: "default" as const, color: "bg-green-100 text-green-800", icon: CheckCircle },
      "Đã hủy": { variant: "destructive" as const, color: "bg-red-100 text-red-800", icon: AlertTriangle },
      "Cancelled": { variant: "destructive" as const, color: "bg-red-100 text-red-800", icon: AlertTriangle },
    }

    const displayStatus = statusMap[status] || status
    const { color, icon: Icon } = config[status] || config["Scheduled"]

    return (
      <Badge className={`${color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {displayStatus}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const colors = {
      Cao: "bg-red-100 text-red-800",
      "Trung bình": "bg-yellow-100 text-yellow-800",
      "Bình thường": "bg-green-100 text-green-800",
    }
    return <Badge className={colors[priority] || colors["Bình thường"]}>{priority}</Badge>
  }

  const startVisit = (appointment: any) => {
    // Chuyển appointment data sang tab chart với thông tin bệnh nhân đầy đủ
    const patientData = {
      ...appointment,
      patient_name: `${appointment.patient?.first_name || ''} ${appointment.patient?.last_name || ''}`.trim(),
      patient_id: appointment.patient?.patient_id,
      patient_info: appointment.patient
    }
    setSelectedPatient(patientData)
    setActiveTab("chart")
    toast({
      title: "Bắt đầu khám bệnh",
      description: `Đã mở hồ sơ khám cho ${patientData.patient_name || 'bệnh nhân'}`,
    })
  }

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
      {/* Vertical Sidebar */}
      <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Dashboard Bác sĩ</h1>
              <p className="text-sm text-gray-500">
                {doctorInfo ? `${doctorInfo.first_name} ${doctorInfo.last_name}` : (user?.full_name || user?.email || "Bác sĩ")}
              </p>
              {doctorInfo?.specialty && (
                <p className="text-xs text-gray-400">{doctorInfo.specialty}</p>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-3 space-y-1">
          {[
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
              value: "inbox",
              label: "Tin nhắn",
              icon: Inbox,
              badge: kpiData.newMessages,
            },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.value

            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
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
                  {doctorInfo ? `${doctorInfo.first_name} ${doctorInfo.last_name}` : (user?.full_name || user?.email || "Bác sĩ")}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || "doctor@hospital.vn"}
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
                {activeTab === "timeline" && "Tổng quan"}
                {activeTab === "chart" && "Hồ sơ bệnh nhân"}
                {activeTab === "inpatient" && "Nội trú"}
                {activeTab === "results" && "Kết quả"}
                {activeTab === "inbox" && "Hộp thư"}
              </h2>
              <p className="text-sm text-gray-500">
                Chào buổi {greeting || 'sáng'}, {" "}
                {doctorInfo ? `${doctorInfo.first_name} ${doctorInfo.last_name}` : (user?.full_name || user?.email || "Bác sĩ")}
                {doctorInfo?.specialty && ` - ${doctorInfo.specialty}`}
              </p>
              {mounted && currentDateFormatted && (
                <p className="text-xs text-gray-400 mt-1">
                  {currentDateFormatted}
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              {/* Notification Bell */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                {kpiData.newMessages > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {kpiData.newMessages}
                  </span>
                )}
              </Button>

              {/* Patient Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm bệnh nhân..."
                  className="pl-10 w-64 border-gray-200 focus:border-green-300 focus:ring-green-200"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6">
          {/* KPI Cards - Only show on timeline tab */}
          {activeTab === "timeline" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 mb-8">
              {/* Today's Appointments - Light Blue */}
              <Card className="bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <Calendar className="h-6 w-6 text-blue-600 mb-2" strokeWidth={2} />
                      <p className="text-4xl font-bold text-blue-800">{kpiData.appointmentsToday}</p>
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
                      <CheckCircle className="h-6 w-6 text-green-600 mb-2" strokeWidth={2} />
                      <p className="text-4xl font-bold text-green-800">{kpiData.completedToday}</p>
                      <p className="text-sm font-medium text-green-600">Đã hoàn thành</p>
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
                      <TestTube className="h-6 w-6 text-purple-600 mb-2" strokeWidth={2} />
                      <p className="text-4xl font-bold text-purple-800">{kpiData.pendingResults}</p>
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
                      <AlertTriangle className="h-6 w-6 text-red-600 mb-2" strokeWidth={2} />
                      <p className="text-4xl font-bold text-red-800">{kpiData.criticalAlerts}</p>
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
                      <p className="text-4xl font-bold text-orange-800">{kpiData.inpatients}</p>
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
                      <MessageSquare className="h-6 w-6 text-teal-600 mb-2" strokeWidth={2} />
                      <p className="text-4xl font-bold text-teal-800">{kpiData.newMessages}</p>
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
          )}

          {/* Tab Content */}
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              {/* Overview Tab */}
              <TabsContent value="timeline" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Appointment Timeline */}
                  <div className="lg:col-span-2">
                    <Card className="shadow-sm">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <Clock className="h-5 w-5 text-green-600" />
                              Lịch hẹn hôm nay
                            </CardTitle>
                            {mounted && currentDateFormatted && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {currentDateFormatted}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Tất cả</SelectItem>
                                <SelectItem value="late">Trễ hẹn</SelectItem>
                                <SelectItem value="arrived">Đã đến</SelectItem>
                                <SelectItem value="examining">Đang khám</SelectItem>
                                <SelectItem value="completed">Hoàn thành</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="space-y-4">
                            {appointments && appointments.length > 0 && mounted && currentDate ? appointments.filter((appointment: any) => {
                              const appointmentDate = appointment.appointment_date?.split('T')[0]
                              // Chỉ hiển thị lịch hẹn đã xác nhận của hôm nay, loại bỏ đã hủy
                              return appointmentDate === currentDate && 
                                     (appointment.status === "Confirmed" || appointment.status === "Đã xác nhận") &&
                                     appointment.status !== "Cancelled" && appointment.status !== "Đã hủy"
                            }).map((appointment, index) => (
                              <div
                                key={appointment.appointment_id || appointment.id}
                                className="flex items-center gap-4 p-4 rounded-lg border hover:bg-green-50 transition-colors"
                              >
                                <div className="text-center min-w-16">
                                  <div className="text-lg font-bold text-green-800">
                                    {appointment.appointment_time 
                                      ? new Date(appointment.appointment_time).toLocaleTimeString('vi-VN', { 
                                          hour: '2-digit', 
                                          minute: '2-digit',
                                          hour12: false 
                                        })
                                      : new Date(appointment.appointment_date).toLocaleTimeString('vi-VN', { 
                                          hour: '2-digit', 
                                          minute: '2-digit',
                                          hour12: false 
                                        })
                                    }
                                  </div>
                                  <div className="text-xs text-green-600">
                                    {index === 0 ? "Tiếp theo" : `+${index * 45}m`}
                                  </div>
                                </div>

                                <div className="flex-1">
                                  <div className="flex items-center gap-3">
                                    <img
                                      src="/placeholder-user.jpg"
                                      alt={`${appointment.patient?.first_name || ''} ${appointment.patient?.last_name || ''}`.trim() || 'Bệnh nhân'}
                                      className="w-8 h-8 rounded-full"
                                    />
                                    <div>
                                      <HoverCard>
                                        <HoverCardTrigger asChild>
                                          <Button variant="link" className="p-0 h-auto font-semibold text-green-800">
                                            {`${appointment.patient?.first_name || ''} ${appointment.patient?.last_name || ''}`.trim() || 'Không có tên'}
                                          </Button>
                                        </HoverCardTrigger>
                                        <HoverCardContent className="w-80">
                                          <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                              <img
                                                src="/placeholder-user.jpg"
                                                alt=""
                                                className="w-12 h-12 rounded-full"
                                              />
                                              <div>
                                                <h4 className="font-semibold">{`${appointment.patient?.first_name || ''} ${appointment.patient?.last_name || ''}`.trim() || 'Không có tên'}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                  {appointment.patient?.date_of_birth 
                                                    ? `${new Date().getFullYear() - new Date(appointment.patient.date_of_birth).getFullYear()} tuổi` 
                                                    : 'Chưa có thông tin tuổi'
                                                  } • {appointment.patient?.gender || 'Chưa xác định'}
                                                </p>
                                              </div>
                                            </div>

                                            {appointment.patient?.allergies && (
                                              <div>
                                                <p className="text-sm font-medium text-red-600 mb-1">Dị ứng:</p>
                                                <div className="flex flex-wrap gap-1">
                                                  <Badge className="bg-red-100 text-red-800">
                                                    {appointment.patient.allergies}
                                                  </Badge>
                                                </div>
                                              </div>
                                            )}

                                            {appointment.patient?.medical_history && (
                                              <div>
                                                <p className="text-sm font-medium mb-1">Bệnh sử:</p>
                                                <div className="flex flex-wrap gap-1">
                                                  <Badge variant="outline">
                                                    {appointment.patient.medical_history}
                                                  </Badge>
                                                </div>
                                              </div>
                                            )}

                                            <p className="text-xs text-muted-foreground">
                                              Số điện thoại: {appointment.patient?.phone || 'Chưa có'}
                                            </p>
                                          </div>
                                        </HoverCardContent>
                                      </HoverCard>
                                      <p className="text-sm text-muted-foreground">{appointment.purpose || 'Khám tổng quát'}</p>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3">
                                  {getStatusBadge(appointment.status)}
                                  {(appointment.status === "Confirmed" || appointment.status === "Đã xác nhận" || appointment.status === "Đã đến") && (
                                    <Button
                                      size="sm"
                                      onClick={() => startVisit(appointment)}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <Stethoscope className="h-3 w-3 mr-1" />
                                      Khám
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )) : (
                              <div className="text-center py-8 text-gray-500">
                                <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p>Không có lịch hẹn nào hôm nay</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Quick Actions & Inbox */}
                  <div className="space-y-6">
                    <Card className="shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-green-800">Hành động nhanh</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button className="w-full justify-start bg-green-600 hover:bg-green-700">
                          <Plus className="h-4 w-4 mr-2" />
                          Tạo hồ sơ mới
                        </Button>
                        <Button variant="outline" className="w-full justify-start bg-transparent">
                          <TestTube className="h-4 w-4 mr-2" />
                          Chỉ định xét nghiệm
                        </Button>
                        <Button variant="outline" className="w-full justify-start bg-transparent">
                          <Pill className="h-4 w-4 mr-2" />
                          Kê đơn thuốc
                        </Button>
                        <Button variant="outline" className="w-full justify-start bg-transparent">
                          <Calendar className="h-4 w-4 mr-2" />
                          Hẹn tái khám
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-800">
                          <Bell className="h-5 w-5" />
                          Thông báo mới
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="space-y-3">
                            {messages && messages.length > 0 ? messages.map((message) => (
                              <div key={message.id} className="p-3 rounded-lg border-l-4 border-l-blue-500 bg-blue-50">
                                <div className="flex items-center justify-between mb-1">
                                  <p className="text-sm font-medium">{message.sender?.full_name || 'Hệ thống'}</p>
                                  <Badge
                                    className={
                                      message.priority === "high"
                                        ? "bg-red-100 text-red-800"
                                        : message.priority === "medium"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : "bg-green-100 text-green-800"
                                    }
                                  >
                                    {message.priority === "high" ? "Cao" : 
                                     message.priority === "medium" ? "Trung bình" : "Thấp"}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-1">{message.message}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(message.created_at).toLocaleString('vi-VN')}
                                </p>
                              </div>
                            )) : (
                              <div className="text-center py-6 text-gray-500">
                                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>Không có thông báo mới</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* Patient Chart Tab */}
              <TabsContent value="chart" className="space-y-6">
                {selectedPatient ? (
                  <div className="space-y-6">
                    {/* Patient Header */}
                    <Card className="shadow-sm border-l-4 border-l-green-500">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <img
                              src="/placeholder-user.jpg"
                              alt=""
                              className="w-16 h-16 rounded-full"
                            />
                            <div>
                              <h2 className="text-2xl font-bold text-green-800">
                                {selectedPatient.patient_name || 'Không có tên'}
                              </h2>
                              <p className="text-green-600">
                                {(() => {
                                  const gender = selectedPatient.patient_info?.gender || selectedPatient.patient?.gender
                                  if (!gender) return 'Chưa xác định'
                                  if (gender === 'M' || gender === 'Male' || gender === 'Nam') return 'Nam'
                                  if (gender === 'F' || gender === 'Female' || gender === 'Nữ') return 'Nữ'
                                  return gender
                                })()} • 
                                ID: {selectedPatient.patient_info?.patient_id || selectedPatient.patient_id || 'N/A'}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                {selectedPatient.patient_info?.date_of_birth && (
                                  <>SN: {new Date(selectedPatient.patient_info.date_of_birth).toLocaleDateString('vi-VN')} • </>
                                )}
                                {selectedPatient.patient_info?.phone && (
                                  <>SĐT: {selectedPatient.patient_info.phone} • </>
                                )}
                                Ngày khám: {selectedPatient.appointment_date ? new Date(selectedPatient.appointment_date).toLocaleDateString('vi-VN') : 'N/A'} • 
                                Giờ: {(() => {
                                  const time = selectedPatient.appointment_time
                                  if (!time) return 'N/A'
                                  
                                  // Nếu time là ISO string dạng "1970-01-01T09:00:00.000Z"
                                  if (typeof time === 'string' && time.includes('T')) {
                                    try {
                                      const date = new Date(time)
                                      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })
                                    } catch {
                                      return 'N/A'
                                    }
                                  }
                                  
                                  // Nếu time là string dạng "HH:MM:SS" hoặc "HH:MM"
                                  if (typeof time === 'string' && time.includes(':')) {
                                    const parts = time.split(':')
                                    return `${parts[0]}:${parts[1]}`
                                  }
                                  
                                  return String(time)
                                })()}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                {selectedPatient.patient_info?.allergies && (
                                  <div className="flex items-center gap-1">
                                    <AlertTriangle className="h-4 w-4 text-red-500" />
                                    <Badge className="bg-red-100 text-red-800">
                                      {selectedPatient.patient_info.allergies}
                                    </Badge>
                                  </div>
                                )}
                                {selectedPatient.purpose && (
                                  <Badge variant="outline" className="text-blue-600 border-blue-300">
                                    {selectedPatient.purpose}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          {selectedPatient.vitals && (
                            <div className="grid grid-cols-3 gap-4 text-center">
                              <div className="p-3 rounded-lg bg-red-50">
                                <Heart className="h-6 w-6 text-red-500 mx-auto mb-1" />
                                <p className="text-sm font-medium">Huyết áp</p>
                                <p className="text-lg font-bold text-red-600">{selectedPatient.vitals.bp}</p>
                              </div>
                              <div className="p-3 rounded-lg bg-blue-50">
                                <Activity className="h-6 w-6 text-blue-500 mx-auto mb-1" />
                                <p className="text-sm font-medium">Mạch</p>
                                <p className="text-lg font-bold text-blue-600">{selectedPatient.vitals.hr}</p>
                              </div>
                              <div className="p-3 rounded-lg bg-orange-50">
                                <Thermometer className="h-6 w-6 text-orange-500 mx-auto mb-1" />
                                <p className="text-sm font-medium">Nhiệt độ</p>
                                <p className="text-lg font-bold text-orange-600">{selectedPatient.vitals.temp}°C</p>
                              </div>
                            </div>
                          )}
                        </div>


                      </CardContent>
                    </Card>

                    {/* Clinical Workflow Tabs */}
                    <Tabs value={clinicalTab} onValueChange={setClinicalTab} className="space-y-4">
                      <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="notes">Ghi chú SOAP</TabsTrigger>
                        <TabsTrigger value="orders">Chỉ định</TabsTrigger>
                        <TabsTrigger value="prescriptions">Đơn thuốc</TabsTrigger>
                        <TabsTrigger value="history">Tiền sử</TabsTrigger>
                        <TabsTrigger value="followup">Tái khám</TabsTrigger>
                      </TabsList>

                      <TabsContent value="notes">
                        <Card>
                          <CardHeader>
                            <CardTitle>Ghi chú khám bệnh (SOAP)</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Subjective (Triệu chứng chủ quan)</Label>
                                <Textarea
                                  placeholder="Bệnh nhân than phiền..."
                                  value={clinicalNotes.subjective}
                                  onChange={(e) =>
                                    setClinicalNotes((prev) => ({ ...prev, subjective: e.target.value }))
                                  }
                                  rows={4}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Objective (Khám lâm sàng)</Label>
                                <Textarea
                                  placeholder="Khám thực thể..."
                                  value={clinicalNotes.objective}
                                  onChange={(e) => setClinicalNotes((prev) => ({ ...prev, objective: e.target.value }))}
                                  rows={4}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Assessment (Đánh giá)</Label>
                                <Textarea
                                  placeholder="Chẩn đoán..."
                                  value={clinicalNotes.assessment}
                                  onChange={(e) =>
                                    setClinicalNotes((prev) => ({ ...prev, assessment: e.target.value }))
                                  }
                                  rows={4}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Plan (Kế hoạch điều trị)</Label>
                                <Textarea
                                  placeholder="Kế hoạch điều trị..."
                                  value={clinicalNotes.plan}
                                  onChange={(e) => setClinicalNotes((prev) => ({ ...prev, plan: e.target.value }))}
                                  rows={4}
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button 
                                className="bg-green-600 hover:bg-green-700"
                                onClick={handleSaveClinicalNotes}
                                disabled={!clinicalNotes.assessment || !clinicalNotes.plan}
                              >
                                <Save className="h-4 w-4 mr-2" />
                                Lưu ghi chú
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="orders">
                        <Card>
                          <CardHeader>
                            <CardTitle>Chỉ định cận lâm sàng</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-4 gap-4">
                              <div className="space-y-2">
                                <Label>Loại chỉ định</Label>
                                <Select
                                  value={newOrder.type}
                                  onValueChange={(value) => setNewOrder((prev) => ({ ...prev, type: value }))}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Chọn loại" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="lab">Xét nghiệm</SelectItem>
                                    <SelectItem value="imaging">Chẩn đoán hình ảnh</SelectItem>
                                    <SelectItem value="procedure">Thủ thuật</SelectItem>
                                    <SelectItem value="consultation">Hội chẩn</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Tên xét nghiệm/chỉ định</Label>
                                <Input
                                  placeholder="Nhập tên..."
                                  value={newOrder.test}
                                  onChange={(e) => setNewOrder((prev) => ({ ...prev, test: e.target.value }))}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Mức độ ưu tiên</Label>
                                <Select
                                  value={newOrder.priority}
                                  onValueChange={(value) => setNewOrder((prev) => ({ ...prev, priority: value }))}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="routine">Thường quy</SelectItem>
                                    <SelectItem value="urgent">Khẩn cấp</SelectItem>
                                    <SelectItem value="stat">Cấp cứu</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>&nbsp;</Label>
                                <Button 
                                  className="w-full bg-green-600 hover:bg-green-700"
                                  onClick={handleAddOrder}
                                  disabled={!newOrder.type || !newOrder.test}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Thêm chỉ định
                                </Button>
                              </div>
                            </div>

                            {/* Orders List */}
                            {orders.length > 0 && (
                              <div className="mt-4">
                                <h4 className="font-semibold mb-2">Danh sách chỉ định:</h4>
                                <div className="space-y-2">
                                  {orders.map((order: any) => (
                                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                      <div>
                                        <p className="font-medium">{order.test}</p>
                                        <p className="text-sm text-gray-600">
                                          Loại: {order.type === 'lab' ? 'Xét nghiệm' : order.type === 'imaging' ? 'Chẩn đoán hình ảnh' : order.type === 'procedure' ? 'Thủ thuật' : 'Hội chẩn'} • 
                                          Độ ưu tiên: {order.priority === 'routine' ? 'Thường quy' : order.priority === 'urgent' ? 'Khẩn cấp' : 'Cấp cứu'}
                                        </p>
                                      </div>
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => setOrders(orders.filter((o: any) => o.id !== order.id))}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="prescriptions">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                              <span>Kê đơn thuốc điện tử</span>
                              {prescriptions.length > 0 && (
                                <Badge variant="secondary">{prescriptions.length} thuốc</Badge>
                              )}
                            </CardTitle>
                            <CardDescription>Thêm thuốc vào đơn, sau đó lưu toàn bộ đơn thuốc</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Form thêm thuốc */}
                            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                              <h4 className="font-semibold mb-3 text-gray-700">Thêm thuốc mới</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="space-y-2 lg:col-span-2">
                                  <Label>Tên thuốc *</Label>
                                  <div className="flex gap-2">
                                    <Input
                                      list="common-meds"
                                      placeholder="Nhập tên thuốc hoặc chọn từ danh sách..."
                                      value={prescription.medication}
                                      onChange={(e) => setPrescription((prev) => ({ ...prev, medication: e.target.value }))}
                                      className="flex-1"
                                    />
                                    <datalist id="common-meds">
                                      {commonMedications.map((med) => (
                                        <option key={med} value={med} />
                                      ))}
                                    </datalist>
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label>Liều lượng *</Label>
                                  <Input
                                    placeholder="Ví dụ: 500mg, 1 viên"
                                    value={prescription.dosage}
                                    onChange={(e) => setPrescription((prev) => ({ ...prev, dosage: e.target.value }))}
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label>Tần suất sử dụng *</Label>
                                  <Select
                                    value={prescription.frequency}
                                    onValueChange={(value) => setPrescription((prev) => ({ ...prev, frequency: value }))}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Chọn tần suất" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="1 lần/ngày">1 lần/ngày</SelectItem>
                                      <SelectItem value="2 lần/ngày (sáng, tối)">2 lần/ngày (sáng, tối)</SelectItem>
                                      <SelectItem value="3 lần/ngày (sáng, trưa, tối)">3 lần/ngày (sáng, trưa, tối)</SelectItem>
                                      <SelectItem value="Mỗi 4 giờ">Mỗi 4 giờ</SelectItem>
                                      <SelectItem value="Mỗi 6 giờ">Mỗi 6 giờ</SelectItem>
                                      <SelectItem value="Mỗi 8 giờ">Mỗi 8 giờ</SelectItem>
                                      <SelectItem value="Khi cần thiết">Khi cần thiết</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label>Thời gian sử dụng</Label>
                                  <Select
                                    value={prescription.duration}
                                    onValueChange={(value) => setPrescription((prev) => ({ ...prev, duration: value }))}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Chọn thời gian" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="3 ngày">3 ngày</SelectItem>
                                      <SelectItem value="5 ngày">5 ngày</SelectItem>
                                      <SelectItem value="7 ngày">7 ngày</SelectItem>
                                      <SelectItem value="10 ngày">10 ngày</SelectItem>
                                      <SelectItem value="14 ngày">14 ngày</SelectItem>
                                      <SelectItem value="30 ngày">30 ngày</SelectItem>
                                      <SelectItem value="Dùng liên tục">Dùng liên tục</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div className="space-y-2 lg:col-span-2">
                                  <Label>Hướng dẫn sử dụng</Label>
                                  <Input
                                    placeholder="Ví dụ: Uống sau bữa ăn, không dùng với rượu..."
                                    value={prescription.instructions}
                                    onChange={(e) => setPrescription((prev) => ({ ...prev, instructions: e.target.value }))}
                                  />
                                </div>
                              </div>
                              
                              <div className="mt-4">
                                <Button 
                                  className="w-full md:w-auto bg-green-600 hover:bg-green-700"
                                  onClick={handleAddPrescription}
                                  disabled={!prescription.medication || !prescription.dosage || !prescription.frequency}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Thêm vào đơn thuốc
                                </Button>
                              </div>
                            </div>

                            {/* Cảnh báo dị ứng */}
                            {selectedPatient.patient_info?.allergies && (
                              <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <AlertTriangle className="h-5 w-5 text-red-500" />
                                  <p className="font-medium text-red-800">Cảnh báo dị ứng</p>
                                </div>
                                <p className="text-sm text-red-700">
                                  Bệnh nhân dị ứng với: {selectedPatient.patient_info.allergies}
                                </p>
                              </div>
                            )}

                            {/* Danh sách thuốc đã kê */}
                            {prescriptions.length > 0 && (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-semibold text-gray-900">Đơn thuốc hiện tại ({prescriptions.length} loại)</h4>
                                  <Button
                                    onClick={handleSavePrescriptions}
                                    className="bg-blue-600 hover:bg-blue-700"
                                  >
                                    <Save className="h-4 w-4 mr-2" />
                                    Lưu đơn thuốc
                                  </Button>
                                </div>
                                <div className="space-y-2">
                                  {prescriptions.map((rx: any, index: number) => (
                                    <div key={rx.id} className="p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-2">
                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                                              #{index + 1}
                                            </Badge>
                                            <h5 className="font-bold text-lg text-gray-900">{rx.medication}</h5>
                                          </div>
                                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                                            <div>
                                              <span className="text-gray-500">Liều lượng:</span>
                                              <span className="ml-1 font-medium text-gray-900">{rx.dosage}</span>
                                            </div>
                                            <div>
                                              <span className="text-gray-500">Tần suất:</span>
                                              <span className="ml-1 font-medium text-gray-900">{rx.frequency}</span>
                                            </div>
                                            <div>
                                              <span className="text-gray-500">Thời gian:</span>
                                              <span className="ml-1 font-medium text-gray-900">{rx.duration || 'Chưa xác định'}</span>
                                            </div>
                                          </div>
                                          {rx.instructions && (
                                            <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                                              <span className="font-medium text-blue-900">Hướng dẫn:</span>
                                              <span className="ml-1 text-blue-700">{rx.instructions}</span>
                                            </div>
                                          )}
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleRemovePrescription(rx.id)}
                                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Hiển thị khi chưa có thuốc */}
                            {prescriptions.length === 0 && (
                              <div className="text-center py-8 text-gray-500">
                                <Pill className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p className="font-medium">Chưa có thuốc nào trong đơn</p>
                                <p className="text-sm mt-1">Thêm thuốc bằng form bên trên</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>

                    {/* Save Complete Medical Record Button */}
                    <Card className="mt-6 border-2 border-green-200 bg-green-50">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-bold text-lg text-green-900 mb-1">Hoàn tất khám bệnh</h3>
                            <p className="text-sm text-green-700">
                              Lưu toàn bộ ghi chú SOAP, chỉ định và đơn thuốc vào hồ sơ bệnh án
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Button
                              size="lg"
                              variant="outline"
                              className="bg-white hover:bg-gray-50 border-2 border-blue-600 text-blue-600 font-bold px-6"
                              onClick={handlePrintMedicalRecord}
                            >
                              <Printer className="h-5 w-5 mr-2" />
                              In hồ sơ
                            </Button>
                            <Button
                              size="lg"
                              className="bg-green-600 hover:bg-green-700 text-white font-bold px-8"
                              onClick={handleSaveCompleteRecord}
                              disabled={!clinicalNotes.assessment || !clinicalNotes.plan}
                            >
                              <Save className="h-5 w-5 mr-2" />
                              Lưu hồ sơ hoàn chỉnh
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Stethoscope className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Chọn bệnh nhân để bắt đầu khám</h3>
                      <p className="text-muted-foreground">Nhấp "Bắt đầu" từ lịch hẹn để mở hồ sơ bệnh nhân</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Inpatient Tab */}
              <TabsContent value="inpatient" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bed className="h-5 w-5 text-green-600" />
                      Bệnh nhân nội trú
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {inpatients && inpatients.length > 0 ? inpatients.map((patient: any) => (
                        <div key={patient.patient_id} className="p-4 rounded-lg border hover:bg-green-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="text-center">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                  <Bed className="h-6 w-6 text-green-600" />
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold">{patient.first_name} {patient.last_name}</h4>
                                <p className="text-sm text-muted-foreground">Mã BN: {patient.patient_code}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge className="bg-blue-100 text-blue-800">Nội trú</Badge>
                                  <Badge variant="outline">
                                    {patient.date_of_birth 
                                      ? `${new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()} tuổi`
                                      : 'Chưa rõ tuổi'
                                    }
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-center text-sm">
                              <div>
                                <p className="font-medium">Email</p>
                                <p className="text-xs">{patient.email || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="font-medium">Điện thoại</p>
                                <p>{patient.phone || 'N/A'}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleViewProgressNotes(patient)}
                              >
                                <FileText className="h-3 w-3 mr-1" />
                                Diễn biến
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleViewMedicalHistory(patient)}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Xem hồ sơ
                              </Button>
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleStartExamination(patient)}
                              >
                                <Stethoscope className="h-3 w-3 mr-1" />
                                Khám
                              </Button>
                            </div>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-12 text-gray-500">
                          <Bed className="h-16 w-16 mx-auto mb-4 opacity-30" />
                          <h3 className="text-lg font-medium mb-2">Không có bệnh nhân nội trú</h3>
                          <p>Hiện tại không có bệnh nhân nội trú nào.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Results Tab */}
              <TabsContent value="results" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TestTube className="h-5 w-5 text-green-600" />
                      Kết quả cận lâm sàng
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {pendingResults && pendingResults.length > 0 ? pendingResults.map((result) => (
                        <div key={result.id} className="p-4 rounded-lg border hover:bg-green-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold">{result.patient?.full_name || 'Không có tên'}</h4>
                              <p className="text-sm text-muted-foreground">{result.test_type || 'Xét nghiệm'}</p>
                              <p className="text-xs text-gray-500">
                                Ngày xét nghiệm: {new Date(result.test_date).toLocaleDateString('vi-VN')}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge
                                className={
                                  result.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : result.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-blue-100 text-blue-800"
                                }
                              >
                                {result.status === "completed" ? "Hoàn thành" : 
                                 result.status === "pending" ? "Chờ kết quả" : "Đang xử lý"}
                              </Badge>
                              {result.status === "completed" && (
                                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                  <Eye className="h-3 w-3 mr-1" />
                                  Xem kết quả
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-12 text-gray-500">
                          <TestTube className="h-16 w-16 mx-auto mb-4 opacity-30" />
                          <h3 className="text-lg font-medium mb-2">Không có kết quả xét nghiệm</h3>
                          <p>Chưa có kết quả cận lâm sàng nào.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Inbox Tab */}
              <TabsContent value="inbox" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-green-600" />
                      Hộp thư & Thông báo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {messages && messages.length > 0 ? messages.map((message) => (
                        <div key={message.id} className="p-4 rounded-lg border hover:bg-green-50 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{message.sender?.full_name || 'Hệ thống'}</h4>
                            <div className="flex items-center gap-2">
                              {getPriorityBadge(message.priority === "high" ? "Cao" : 
                                               message.priority === "medium" ? "Trung bình" : "Thấp")}
                              <span className="text-sm text-muted-foreground">
                                {new Date(message.created_at).toLocaleString('vi-VN')}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{message.message}</p>
                        </div>
                      )) : (
                        <div className="text-center py-12 text-gray-500">
                          <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-30" />
                          <h3 className="text-lg font-medium mb-2">Không có tin nhắn</h3>
                          <p>Chưa có tin nhắn hoặc thông báo nào.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="patients" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      Quản lý bệnh nhân
                    </CardTitle>
                    <CardDescription>Xem và quản lý thông tin bệnh nhân</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {inpatients && inpatients.length > 0 ? inpatients.map((patient: any) => (
                        <div key={patient.patient_id} className="p-4 rounded-lg border hover:bg-blue-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <Users className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold">{patient.first_name} {patient.last_name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {patient.date_of_birth ? 
                                    `${new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()} tuổi` : 
                                    'Chưa có thông tin tuổi'
                                  } • Mã BN: {patient.patient_code}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Điện thoại: {patient.phone || 'Chưa có'} • Email: {patient.email || 'Chưa có'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                Đang điều trị
                              </Badge>
                              <Button 
                                size="sm" 
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={() => handleViewPatientDetail(patient)}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Xem chi tiết
                              </Button>
                            </div>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-12 text-gray-500">
                          <Users className="h-16 w-16 mx-auto mb-4 opacity-30" />
                          <h3 className="text-lg font-medium mb-2">Không có bệnh nhân</h3>
                          <p>Chưa có bệnh nhân nào được phân công.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="doctors" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Stethoscope className="h-5 w-5 text-green-600" />
                      Danh sách bác sĩ ({allDoctors.length})
                    </CardTitle>
                    <CardDescription>Danh sách các bác sĩ trong hệ thống</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {allDoctors && allDoctors.length > 0 && (
                        <div className="grid grid-cols-3 gap-4 mb-6">
                          <Card className="p-4">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-green-600">{allDoctors.length}</p>
                              <p className="text-sm text-gray-600">Tổng bác sĩ</p>
                            </div>
                          </Card>
                          <Card className="p-4">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-blue-600">
                                {new Set(allDoctors.map(d => d.specialty)).size}
                              </p>
                              <p className="text-sm text-gray-600">Chuyên khoa</p>
                            </div>
                          </Card>
                          <Card className="p-4">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-purple-600">{allDoctors.length}</p>
                              <p className="text-sm text-gray-600">Đang hoạt động</p>
                            </div>
                          </Card>
                        </div>
                      )}

                      {allDoctors && allDoctors.length > 0 ? allDoctors.map((doctor) => (
                        <div key={doctor.doctor_id} className="p-4 rounded-lg border hover:bg-green-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <Stethoscope className="h-6 w-6 text-green-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-lg">
                                  Bác sĩ {doctor.first_name} {doctor.last_name}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Chuyên khoa: {doctor.specialty}
                                </p>
                                {doctor.department && (
                                  <p className="text-xs text-gray-500">
                                    Khoa: {doctor.department}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                Hoạt động
                              </Badge>
                              <Button size="sm" variant="outline">
                                <Eye className="h-3 w-3 mr-1" />
                                Xem hồ sơ
                              </Button>
                            </div>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-12 text-gray-500">
                          <Stethoscope className="h-16 w-16 mx-auto mb-4 opacity-30" />
                          <h3 className="text-lg font-medium mb-2">Không có dữ liệu bác sĩ</h3>
                          <p>Chưa có thông tin bác sĩ nào trong hệ thống.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="staff" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserCog className="h-5 w-5 text-purple-600" />
                      Danh sách nhân viên y tế ({staffList?.length || 0})
                    </CardTitle>
                    <CardDescription>Danh sách nhân viên y tế trong hệ thống</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {staffStats && (
                        <div className="grid grid-cols-4 gap-4 mb-6">
                          {Object.entries(staffStats.byRole || {}).map(([role, count]) => (
                            <Card key={role} className="p-4">
                              <div className="text-center">
                                <UserCog className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                                <p className="text-lg font-bold text-purple-600">{count as number}</p>
                                <p className="text-sm text-gray-600">{role}</p>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}

                      {staffList && staffList.length > 0 ? staffList.map((staff) => (
                        <div key={staff.staff_id} className="p-4 rounded-lg border hover:bg-purple-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <UserCog className="h-6 w-6 text-purple-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-lg">
                                  {staff.first_name} {staff.last_name}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Vị trí: {staff.position || 'Chưa xác định'}
                                </p>
                                {staff.department && (
                                  <p className="text-xs text-gray-500">
                                    Khoa: {staff.department.department_name}
                                  </p>
                                )}
                                {staff.contact_number && (
                                  <p className="text-xs text-gray-500">
                                    SĐT: {staff.contact_number}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className={staff.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                                {staff.is_active ? 'Hoạt động' : 'Không hoạt động'}
                              </Badge>
                              <Button size="sm" variant="outline">
                                <Eye className="h-3 w-3 mr-1" />
                                Xem chi tiết
                              </Button>
                            </div>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-12 text-gray-500">
                          <UserCog className="h-16 w-16 mx-auto mb-4 opacity-30" />
                          <h3 className="text-lg font-medium mb-2">Không có dữ liệu nhân viên</h3>
                          <p>Chưa có thông tin nhân viên nào trong hệ thống.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="appointments" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        Quản lý lịch hẹn
                      </CardTitle>
                      <CardDescription>
                        Xem và quản lý lịch hẹn bệnh nhân{mounted && currentDateFormatted ? ` - ${currentDateFormatted}` : ''}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {appointments && appointments.length > 0 && mounted && currentDate ? appointments.filter((appointment: any) => {
                        const appointmentDate = appointment.appointment_date?.split('T')[0]
                        // Chỉ hiển thị lịch hẹn đã xác nhận của hôm nay, loại bỏ đã hủy
                        return appointmentDate === currentDate && 
                               (appointment.status === "Confirmed" || appointment.status === "Đã xác nhận") &&
                               appointment.status !== "Cancelled" && appointment.status !== "Đã hủy"
                      }).map((appointment) => (
                        <div key={appointment.appointment_id} className="p-4 rounded-lg border hover:bg-blue-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="text-center min-w-16">
                                <div className="text-lg font-bold text-blue-800">
                                  {appointment.appointment_time 
                                    ? new Date(appointment.appointment_time).toLocaleTimeString('vi-VN', { 
                                        hour: '2-digit', 
                                        minute: '2-digit',
                                        hour12: false 
                                      })
                                    : new Date(appointment.appointment_date).toLocaleTimeString('vi-VN', { 
                                        hour: '2-digit', 
                                        minute: '2-digit',
                                        hour12: false 
                                      })
                                  }
                                </div>
                                <div className="text-xs text-blue-600">
                                  {new Date(appointment.appointment_date).toLocaleDateString('vi-VN')}
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold">
                                  {`${appointment.patient?.first_name || ''} ${appointment.patient?.last_name || ''}`.trim() || 'Không có tên'}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {appointment.purpose || 'Khám tổng quát'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(appointment.status)}
                              <Button size="sm" variant="outline">
                                <Eye className="h-3 w-3 mr-1" />
                                Xem
                              </Button>
                            </div>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-12 text-gray-500">
                          <Calendar className="h-16 w-16 mx-auto mb-4 opacity-30" />
                          <h3 className="text-lg font-medium mb-2">Không có lịch hẹn</h3>
                          <p>Chưa có lịch hẹn nào được lên lịch.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="medical-records" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-green-600" />
                      Hồ sơ y tế
                    </CardTitle>
                    <CardDescription>Xem và quản lý hồ sơ bệnh án</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {pendingResults && pendingResults.length > 0 ? pendingResults.map((record) => (
                        <div key={record.record_id} className="p-4 rounded-lg border hover:bg-green-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold">
                                {record.patient?.first_name && record.patient?.last_name 
                                  ? `${record.patient.first_name} ${record.patient.last_name}`
                                  : 'Bệnh nhân'}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {record.diagnosis || 'Chưa có chẩn đoán'}
                              </p>
                              <p className="text-xs text-gray-500">
                                Điều trị: {record.treatment || 'Chưa có'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">
                                Hồ sơ y tế
                              </Badge>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                <Eye className="h-3 w-3 mr-1" />
                                Xem chi tiết
                              </Button>
                            </div>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-12 text-gray-500">
                          <FileText className="h-16 w-16 mx-auto mb-4 opacity-30" />
                          <h3 className="text-lg font-medium mb-2">Không có hồ sơ y tế</h3>
                          <p>Chưa có hồ sơ bệnh án nào.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="billing" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-yellow-600" />
                      Thông tin thanh toán
                    </CardTitle>
                    <CardDescription>Xem thông tin thanh toán bệnh nhân</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center py-8 text-gray-500">
                        <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Thông tin thanh toán</p>
                        <p className="text-sm">Liên hệ phòng tài chính để xem chi tiết</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="medicine" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Pill className="h-5 w-5 text-red-600" />
                      Thông tin thuốc
                    </CardTitle>
                    <CardDescription>Xem thông tin thuốc và đơn thuốc</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center py-8 text-gray-500">
                        <Pill className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Thông tin thuốc</p>
                        <p className="text-sm">Liên hệ dược sĩ để xem thông tin chi tiết</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="pharmacy" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-green-600" />
                      Thông tin nhà thuốc
                    </CardTitle>
                    <CardDescription>Xem thông tin nhà thuốc</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center py-8 text-gray-500">
                        <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Thông tin nhà thuốc</p>
                        <p className="text-sm">Liên hệ dược sĩ để xem thông tin chi tiết</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="blood-bank" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Droplets className="h-5 w-5 text-red-600" />
                      Ngân hàng máu
                    </CardTitle>
                    <CardDescription>Xem thông tin ngân hàng máu</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center py-8 text-gray-500">
                        <Droplets className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Thông tin ngân hàng máu</p>
                        <p className="text-sm">Liên hệ bộ phận liên quan để xem thông tin chi tiết</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="rooms" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5 text-blue-600" />
                      Thông tin phòng bệnh
                    </CardTitle>
                    <CardDescription>Xem thông tin phòng bệnh</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center py-8 text-gray-500">
                        <Building className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Thông tin phòng bệnh</p>
                        <p className="text-sm">Liên hệ bộ phận quản lý để xem thông tin chi tiết</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="room-assignments" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bed className="h-5 w-5 text-purple-600" />
                      Phân giường bệnh
                    </CardTitle>
                    <CardDescription>Xem thông tin phân giường</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center py-8 text-gray-500">
                        <Bed className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Thông tin phân giường</p>
                        <p className="text-sm">Liên hệ bộ phận quản lý để xem thông tin chi tiết</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Patient Detail Dialog */}
      <Dialog open={showPatientDetail} onOpenChange={setShowPatientDetail}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Thông tin chi tiết bệnh nhân
            </DialogTitle>
          </DialogHeader>
          {selectedPatient && (
            <div className="space-y-6">
              {/* Patient Basic Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                <div>
                  <Label className="text-xs text-gray-500">Họ và tên</Label>
                  <p className="font-semibold text-lg">{selectedPatient.first_name} {selectedPatient.last_name}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Mã bệnh nhân</Label>
                  <p className="font-semibold">{selectedPatient.patient_code}</p>
                </div>
              </div>

              {/* Detailed Info */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Ngày sinh</Label>
                  <p className="font-medium">
                    {selectedPatient.date_of_birth ? 
                      new Date(selectedPatient.date_of_birth).toLocaleDateString('vi-VN') : 
                      'Chưa có'}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Tuổi</Label>
                  <p className="font-medium">
                    {selectedPatient.date_of_birth ? 
                      `${new Date().getFullYear() - new Date(selectedPatient.date_of_birth).getFullYear()} tuổi` : 
                      'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Trạng thái</Label>
                  <Badge className="bg-green-100 text-green-800">Đang điều trị</Badge>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Điện thoại</Label>
                  <p className="font-medium">{selectedPatient.phone || 'Chưa có'}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Email</Label>
                  <p className="font-medium">{selectedPatient.email || 'Chưa có'}</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setShowPatientDetail(false)
                    handleViewMedicalHistory(selectedPatient)
                  }}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Xem hồ sơ
                </Button>
                <Button 
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowPatientDetail(false)
                    handleViewProgressNotes(selectedPatient)
                  }}
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Diễn biến
                </Button>
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    setShowPatientDetail(false)
                    handleStartExamination(selectedPatient)
                  }}
                >
                  <Stethoscope className="h-4 w-4 mr-2" />
                  Khám bệnh
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPatientDetail(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Medical History Dialog */}
      <Dialog open={showMedicalHistory} onOpenChange={setShowMedicalHistory}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              Hồ sơ bệnh án
            </DialogTitle>
            <DialogDescription>
              Lịch sử khám chữa bệnh và điều trị
            </DialogDescription>
          </DialogHeader>
          {selectedPatient && (
            <div className="space-y-4">
              {/* Patient Header */}
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-lg">{selectedPatient.first_name} {selectedPatient.last_name}</h4>
                    <p className="text-sm text-gray-600">
                      Mã BN: {selectedPatient.patient_code} • 
                      {selectedPatient.date_of_birth && 
                        ` ${new Date().getFullYear() - new Date(selectedPatient.date_of_birth).getFullYear()} tuổi`}
                    </p>
                  </div>
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                    <Printer className="h-4 w-4 mr-2" />
                    In hồ sơ
                  </Button>
                </div>
              </div>

              {/* Medical Records Tabs */}
              <Tabs defaultValue="records" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="records">Lịch sử khám</TabsTrigger>
                  <TabsTrigger value="prescriptions">Đơn thuốc</TabsTrigger>
                  <TabsTrigger value="tests">Xét nghiệm</TabsTrigger>
                  <TabsTrigger value="diagnoses">Chẩn đoán</TabsTrigger>
                </TabsList>
                
                <TabsContent value="records" className="space-y-3">
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <h4 className="font-medium mb-2">Chưa có lịch sử khám bệnh</h4>
                    <p className="text-sm">Hệ thống sẽ lưu trữ toàn bộ lịch sử khám bệnh tại đây</p>
                  </div>
                </TabsContent>

                <TabsContent value="prescriptions" className="space-y-3">
                  <div className="text-center py-12 text-gray-500">
                    <Pill className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <h4 className="font-medium mb-2">Chưa có đơn thuốc</h4>
                    <p className="text-sm">Danh sách đơn thuốc đã kê sẽ hiển thị tại đây</p>
                  </div>
                </TabsContent>

                <TabsContent value="tests" className="space-y-3">
                  <div className="text-center py-12 text-gray-500">
                    <TestTube className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <h4 className="font-medium mb-2">Chưa có kết quả xét nghiệm</h4>
                    <p className="text-sm">Kết quả xét nghiệm sẽ được cập nhật tại đây</p>
                  </div>
                </TabsContent>

                <TabsContent value="diagnoses" className="space-y-3">
                  <div className="text-center py-12 text-gray-500">
                    <Stethoscope className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <h4 className="font-medium mb-2">Chưa có chẩn đoán</h4>
                    <p className="text-sm">Lịch sử chẩn đoán sẽ hiển thị tại đây</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowMedicalHistory(false)}>
              Đóng
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                setShowMedicalHistory(false)
                handleViewProgressNotes(selectedPatient)
              }}
            >
              <Activity className="h-4 w-4 mr-2" />
              Xem diễn biến
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => {
                setShowMedicalHistory(false)
                handleStartExamination(selectedPatient)
              }}
            >
              <Stethoscope className="h-4 w-4 mr-2" />
              Khám bệnh
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Progress Notes Dialog */}
      <Dialog open={showProgressNotes} onOpenChange={setShowProgressNotes}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Diễn biến bệnh
            </DialogTitle>
            <DialogDescription>
              Theo dõi diễn biến và tiến triển của bệnh nhân
            </DialogDescription>
          </DialogHeader>
          {selectedPatient && (
            <div className="space-y-4">
              {/* Patient Header */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-lg">{selectedPatient.first_name} {selectedPatient.last_name}</h4>
                    <p className="text-sm text-gray-600">Mã BN: {selectedPatient.patient_code}</p>
                  </div>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm ghi chú
                  </Button>
                </div>
              </div>

              {/* Progress Notes List */}
              <div className="space-y-3">
                <div className="text-center py-12 text-gray-500">
                  <Activity className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <h4 className="font-medium mb-2">Chưa có ghi chú diễn biến</h4>
                  <p className="text-sm">Thêm ghi chú để theo dõi tiến triển bệnh của bệnh nhân</p>
                  <Button size="sm" className="mt-4 bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm ghi chú đầu tiên
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowProgressNotes(false)}>
              Đóng
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                setShowProgressNotes(false)
                handleViewMedicalHistory(selectedPatient)
              }}
            >
              <FileText className="h-4 w-4 mr-2" />
              Xem hồ sơ
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => {
                setShowProgressNotes(false)
                handleStartExamination(selectedPatient)
              }}
            >
              <Stethoscope className="h-4 w-4 mr-2" />
              Khám bệnh
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Examination Dialog - SOAP Notes */}
      <Dialog open={showExamination} onOpenChange={setShowExamination}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-green-600" />
              Khám bệnh - SOAP Note
            </DialogTitle>
            <DialogDescription>
              Ghi chú khám bệnh theo phương pháp SOAP (Subjective, Objective, Assessment, Plan)
            </DialogDescription>
          </DialogHeader>
          {selectedPatient && (
            <div className="space-y-4">
              {/* Patient Info Banner */}
              <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-green-900 text-lg">
                      {selectedPatient.first_name} {selectedPatient.last_name}
                    </h4>
                    <p className="text-sm text-green-700">
                      Mã BN: {selectedPatient.patient_code} • 
                      {selectedPatient.date_of_birth && 
                        ` ${new Date().getFullYear() - new Date(selectedPatient.date_of_birth).getFullYear()} tuổi`}
                      {selectedPatient.phone && ` • ${selectedPatient.phone}`}
                    </p>
                  </div>
                  <Badge className="bg-green-600 text-white">Đang khám</Badge>
                </div>
              </div>

              {/* SOAP Form */}
              <div className="grid gap-4">
                {/* Subjective */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                      S - Subjective (Triệu chứng chủ quan)
                    </CardTitle>
                    <CardDescription>Lý do khám, triệu chứng bệnh nhân than phiền</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea 
                      placeholder="Bệnh nhân than phiền: đau đầu, sốt, ho..."
                      className="min-h-[100px]"
                      value={clinicalNotes.subjective}
                      onChange={(e) => setClinicalNotes({...clinicalNotes, subjective: e.target.value})}
                    />
                  </CardContent>
                </Card>

                {/* Objective */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-red-600" />
                      O - Objective (Khám lâm sàng)
                    </CardTitle>
                    <CardDescription>Dấu hiệu sinh tồn, khám thực thể</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Vital Signs */}
                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <Label className="text-xs">Nhiệt độ (°C)</Label>
                          <Input placeholder="37.0" />
                        </div>
                        <div>
                          <Label className="text-xs">Mạch (/phút)</Label>
                          <Input placeholder="80" />
                        </div>
                        <div>
                          <Label className="text-xs">Huyết áp (mmHg)</Label>
                          <Input placeholder="120/80" />
                        </div>
                        <div>
                          <Label className="text-xs">Nhịp thở (/phút)</Label>
                          <Input placeholder="20" />
                        </div>
                      </div>
                      <Textarea 
                        placeholder="Khám thực thể: tim, phổi, bụng, chi..."
                        className="min-h-[100px]"
                        value={clinicalNotes.objective}
                        onChange={(e) => setClinicalNotes({...clinicalNotes, objective: e.target.value})}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Assessment */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Stethoscope className="h-4 w-4 text-purple-600" />
                      A - Assessment (Chẩn đoán)
                    </CardTitle>
                    <CardDescription>Chẩn đoán sơ bộ hoặc xác định</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea 
                      placeholder="Chẩn đoán: Viêm họng cấp, Sốt virus..."
                      className="min-h-[80px]"
                      value={clinicalNotes.assessment}
                      onChange={(e) => setClinicalNotes({...clinicalNotes, assessment: e.target.value})}
                    />
                  </CardContent>
                </Card>

                {/* Plan */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Pill className="h-4 w-4 text-orange-600" />
                      P - Plan (Kế hoạch điều trị)
                    </CardTitle>
                    <CardDescription>Thuốc, xét nghiệm, tái khám</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea 
                      placeholder="Kế hoạch: Kê đơn thuốc, chỉ định xét nghiệm máu, tái khám sau 3 ngày..."
                      className="min-h-[100px]"
                      value={clinicalNotes.plan}
                      onChange={(e) => setClinicalNotes({...clinicalNotes, plan: e.target.value})}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions after SOAP */}
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Thao tác tiếp theo</CardTitle>
                  <CardDescription>Chọn hành động sau khi hoàn thành khám</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      className="justify-start"
                      onClick={() => {
                        setShowExamination(false)
                        handleViewMedicalHistory(selectedPatient)
                      }}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Xem hồ sơ
                    </Button>
                    <Button 
                      variant="outline"
                      className="justify-start"
                      onClick={() => {
                        setShowExamination(false)
                        handleViewProgressNotes(selectedPatient)
                      }}
                    >
                      <Activity className="h-4 w-4 mr-2" />
                      Ghi diễn biến
                    </Button>
                    <Button 
                      variant="outline"
                      className="justify-start"
                      onClick={() => {
                        toast({
                          title: "Chức năng đang phát triển",
                          description: "Kê đơn thuốc sẽ có trong phiên bản tiếp theo",
                        })
                      }}
                    >
                      <Pill className="h-4 w-4 mr-2" />
                      Kê đơn thuốc
                    </Button>
                    <Button 
                      variant="outline"
                      className="justify-start"
                      onClick={() => {
                        toast({
                          title: "Chức năng đang phát triển",
                          description: "Chỉ định xét nghiệm sẽ có trong phiên bản tiếp theo",
                        })
                      }}
                    >
                      <TestTube className="h-4 w-4 mr-2" />
                      Chỉ định XN
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowExamination(false)}>
              Hủy
            </Button>
            <Button variant="outline" className="bg-blue-50 hover:bg-blue-100">
              <Save className="h-4 w-4 mr-2" />
              Lưu nháp
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => {
                toast({
                  title: "Hoàn thành khám bệnh",
                  description: `Đã lưu hồ sơ khám bệnh cho BN ${selectedPatient?.first_name} ${selectedPatient?.last_name}`,
                })
                setShowExamination(false)
                setClinicalNotes({
                  subjective: "",
                  objective: "",
                  assessment: "",
                  plan: "",
                  template: "",
                })
              }}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Hoàn thành khám
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
