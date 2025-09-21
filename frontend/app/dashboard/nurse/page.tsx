"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"
import {
  ClipboardList,
  Sparkles,
  Pill,
  Activity,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  Heart,
  Users,
  Calendar,
  Settings,
  UserCheck,
  Droplets,
  Building,
  Plus,
  Eye,
  User,
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useUser } from "@/hooks/useUser"
import { DataTable } from "@/components/shared/DataTable"
import { SearchBar } from "@/components/shared/SearchBar"
// Remove these imports that cause routing issues
// import PatientsPage from "../../patients/page"
// import DoctorsPage from "../../doctors/page"
import StaffPage from "../../staff/page"
import AppointmentsPage from "../../appointments/page"
import MedicalRecordsPage from "../../medical-records/page"
import BloodBankPage from "../../blood-bank/page"
import RoomsPage from "../../rooms/page"

interface RoomAssignment {
  id: string
  room_number: string
  room_type: string
  patient_name: string
  patient_id: string
  admission_date: string
  status: "Active" | "Checkout Pending"
}

interface Patient {
  id: string
  name: string
  phone: string
  full_name: string
}

interface Room {
  id: string
  room_number: string
  type: string
  status: "Available" | "Occupied" | "Under Maintenance"
}

interface MedicalOrder {
  id: string
  patient_id: string
  patient_name: string
  room_number: string
  order_type: "medication" | "iv_fluid" | "test" | "special_care"
  description: string
  dosage?: string
  frequency: string
  scheduled_time: string
  status: "pending" | "completed" | "overdue"
  prescribed_by: string
  notes?: string
}

interface VitalSigns {
  id: string
  patient_id: string
  patient_name: string
  room_number: string
  recorded_time: string
  pulse: number
  blood_pressure_systolic: number
  blood_pressure_diastolic: number
  temperature: number
  respiratory_rate: number
  spo2: number
  notes: string
  recorded_by: string
}

interface CareNote {
  id: string
  patient_id: string
  patient_name: string
  room_number: string
  care_type: "dressing" | "hygiene" | "feeding" | "mobility" | "other"
  description: string
  timestamp: string
  nurse_id: string
}

interface ShiftReport {
  id: string
  shift_date: string
  shift_type: "day" | "night"
  nurse_id: string
  patient_updates: Array<{
    patient_id: string
    patient_name: string
    condition: string
    events: string
  }>
  incomplete_tasks: string[]
  handover_notes: string
  confirmed: boolean
}

export default function NurseDashboard() {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState("orders")
  const [medicalOrders, setMedicalOrders] = useState<MedicalOrder[]>([])
  const [vitalSigns, setVitalSigns] = useState<VitalSigns[]>([])
  const [careNotes, setCareNotes] = useState<CareNote[]>([])
  const [shiftReports, setShiftReports] = useState<ShiftReport[]>([])
  const [roomAssignments, setRoomAssignments] = useState<RoomAssignment[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [availableRooms, setAvailableRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  // KPI States
  const [availableBeds, setAvailableBeds] = useState(0)
  const [newAdmissions, setNewAdmissions] = useState(0)
  const [pendingOrders, setPendingOrders] = useState(0)
  const [overdueOrders, setOverdueOrders] = useState(0)
  const [patientsUnderCare, setPatientsUnderCare] = useState(0)
  const [completedTasks, setCompletedTasks] = useState(0)

  // Modal states
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [transferModalOpen, setTransferModalOpen] = useState(false)
  const [cleaningModalOpen, setCleaningModalOpen] = useState(false)
  const [vitalSignsModalOpen, setVitalSignsModalOpen] = useState(false)
  const [careNoteModalOpen, setCareNoteModalOpen] = useState(false)
  const [shiftReportModalOpen, setShiftReportModalOpen] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<RoomAssignment | null>(null)

  // Form states
  const [assignForm, setAssignForm] = useState({
    patient_id: "",
    room_id: "",
    admission_date: new Date().toISOString().split("T")[0],
  })
  const [transferForm, setTransferForm] = useState({
    new_room_id: "",
  })
  const [cleaningForm, setCleaningForm] = useState({
    room_id: "",
    service_type: "",
    priority: "Normal",
    notes: "",
  })
  const [vitalSignsForm, setVitalSignsForm] = useState({
    patient_id: "",
    pulse: "",
    blood_pressure_systolic: "",
    blood_pressure_diastolic: "",
    temperature: "",
    respiratory_rate: "",
    spo2: "",
    notes: "",
  })

  const [careNoteForm, setCareNoteForm] = useState({
    patient_id: "",
    care_type: "",
    description: "",
  })

  const [shiftReportForm, setShiftReportForm] = useState({
    patient_updates: [{ patient_id: "", patient_name: "", condition: "", events: "" }],
    incomplete_tasks: [""],
    handover_notes: "",
  })

  const mockPatients = [
    {
      patient_id: "P001",
      full_name: "Nguyễn Văn An",
      date_of_birth: "1985-03-15",
      gender: "M",
      contact_number: "0901234567",
      email: "nguyen.van.an@email.com",
      created_at: "2024-01-15T08:30:00Z",
      address: "123 Đường ABC, Quận 1, TP.HCM",
      medical_history: "Tiền sử cao huyết áp",
    },
    {
      patient_id: "P002",
      full_name: "Trần Thị Bình",
      date_of_birth: "1990-07-22",
      gender: "F",
      contact_number: "0912345678",
      email: "tran.thi.binh@email.com",
      created_at: "2024-01-16T09:15:00Z",
      address: "456 Đường XYZ, Quận 3, TP.HCM",
      medical_history: "Không có tiền sử bệnh lý đặc biệt",
    },
    {
      patient_id: "P003",
      full_name: "Lê Minh Cường",
      date_of_birth: "1978-12-08",
      gender: "M",
      contact_number: "0923456789",
      email: "le.minh.cuong@email.com",
      created_at: "2024-01-17T10:45:00Z",
      address: "789 Đường DEF, Quận 7, TP.HCM",
      medical_history: "Tiền sử đái tháo đường type 2",
    },
  ]

  const mockDoctors = [
    {
      doctor_id: "D001",
      full_name: "BS. Nguyễn Thành Nam",
      specialization: "Tim mạch",
      department: "Khoa Tim mạch",
      contact_number: "0901111111",
      email: "bs.nam@hospital.com",
      experience_years: 15,
      status: "active",
    },
    {
      doctor_id: "D002",
      full_name: "BS. Trần Thị Lan",
      specialization: "Nhi khoa",
      department: "Khoa Nhi",
      contact_number: "0902222222",
      email: "bs.lan@hospital.com",
      experience_years: 12,
      status: "active",
    },
    {
      doctor_id: "D003",
      full_name: "BS. Lê Văn Hùng",
      specialization: "Ngoại khoa",
      department: "Khoa Ngoại",
      contact_number: "0903333333",
      email: "bs.hung@hospital.com",
      experience_years: 20,
      status: "active",
    },
  ]

  const [searchQuery, setSearchQuery] = useState("")
  const [doctorSearchQuery, setDoctorSearchQuery] = useState("")

  const filteredPatients = useMemo(() => {
    if (!searchQuery) return mockPatients
    const query = searchQuery.toLowerCase()
    return mockPatients.filter(
      (patient) =>
        patient.full_name.toLowerCase().includes(query) ||
        patient.patient_id.toLowerCase().includes(query) ||
        patient.email.toLowerCase().includes(query) ||
        patient.contact_number.includes(query),
    )
  }, [searchQuery])

  const filteredDoctors = useMemo(() => {
    if (!doctorSearchQuery) return mockDoctors
    const query = doctorSearchQuery.toLowerCase()
    return mockDoctors.filter(
      (doctor) =>
        doctor.full_name.toLowerCase().includes(query) ||
        doctor.doctor_id.toLowerCase().includes(query) ||
        doctor.specialization.toLowerCase().includes(query) ||
        doctor.department.toLowerCase().includes(query),
    )
  }, [mockDoctors, doctorSearchQuery])

  const patientColumns = [
    {
      key: "patient_id",
      label: "ID Bệnh nhân",
      sortable: true,
    },
    {
      key: "full_name",
      label: "Họ và tên",
      sortable: true,
    },
    {
      key: "date_of_birth",
      label: "Ngày sinh",
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString("vi-VN"),
    },
    {
      key: "gender",
      label: "Giới tính",
      render: (value: string) => (value === "M" ? "Nam" : value === "F" ? "Nữ" : "Khác"),
    },
    {
      key: "contact_number",
      label: "Liên hệ",
    },
    {
      key: "email",
      label: "Email",
    },
    {
      key: "actions",
      label: "Hành động",
      render: (_: any, patient: any) => (
        <Button variant="ghost" size="sm">
          <Eye className="w-4 h-4" />
        </Button>
      ),
    },
  ]

  const doctorColumns = [
    {
      key: "doctor_id",
      label: "ID Bác sĩ",
      sortable: true,
    },
    {
      key: "full_name",
      label: "Họ và tên",
      sortable: true,
    },
    {
      key: "specialization",
      label: "Chuyên khoa",
      sortable: true,
    },
    {
      key: "department",
      label: "Khoa",
      sortable: true,
    },
    {
      key: "experience_years",
      label: "Kinh nghiệm",
      render: (value: number) => `${value} năm`,
    },
    {
      key: "contact_number",
      label: "Liên hệ",
    },
    {
      key: "actions",
      label: "Hành động",
      render: (_: any, doctor: any) => (
        <Button variant="ghost" size="sm">
          <Eye className="w-4 h-4" />
        </Button>
      ),
    },
  ]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Simulate API calls
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock data for room assignments
      const mockAssignments: RoomAssignment[] = [
        {
          id: "1",
          room_number: "101",
          room_type: "Phòng đơn",
          patient_name: "Nguyễn Văn An",
          patient_id: "P001",
          admission_date: "2024-01-15",
          status: "Active",
        },
        {
          id: "2",
          room_number: "102",
          room_type: "Phòng đôi",
          patient_name: "Trần Thị Bình",
          patient_id: "P002",
          admission_date: "2024-01-16",
          status: "Active",
        },
        {
          id: "3",
          room_number: "103",
          room_type: "ICU",
          patient_name: "Lê Văn Cường",
          patient_id: "P003",
          admission_date: "2024-01-17",
          status: "Checkout Pending",
        },
      ]

      // Mock patients data
      const mockPatientsData: Patient[] = [
        { id: "P004", name: "Phạm Thị Dung", phone: "0901234567", full_name: "Phạm Thị Dung" },
        { id: "P005", name: "Hoàng Văn Em", phone: "0912345678", full_name: "Hoàng Văn Em" },
        { id: "P006", name: "Vũ Thị Phương", phone: "0923456789", full_name: "Vũ Thị Phương" },
      ]

      // Mock available rooms
      const mockRooms: Room[] = [
        { id: "R104", room_number: "104", type: "Phòng đơn", status: "Available" },
        { id: "R105", room_number: "105", type: "Phòng đôi", status: "Available" },
        { id: "R106", room_number: "106", type: "ICU", status: "Available" },
      ]

      const mockOrders: MedicalOrder[] = [
        {
          id: "1",
          patient_id: "P001",
          patient_name: "Nguyễn Văn An",
          room_number: "101",
          order_type: "medication",
          description: "Paracetamol 500mg",
          dosage: "500mg",
          frequency: "3 lần/ngày",
          scheduled_time: "08:00",
          status: "pending",
          prescribed_by: "BS. Trần Văn B",
        },
        {
          id: "2",
          patient_id: "P002",
          patient_name: "Trần Thị Bình",
          room_number: "102",
          order_type: "iv_fluid",
          description: "Dung dịch NaCl 0.9%",
          frequency: "Liên tục",
          scheduled_time: "06:00",
          status: "overdue",
          prescribed_by: "BS. Lê Thị C",
        },
        {
          id: "3",
          patient_id: "P003",
          patient_name: "Lê Văn Cường",
          room_number: "103",
          order_type: "test",
          description: "Xét nghiệm máu",
          frequency: "1 lần",
          scheduled_time: "07:00",
          status: "completed",
          prescribed_by: "BS. Phạm Văn D",
        },
      ]

      const mockVitalSigns: VitalSigns[] = [
        {
          id: "1",
          patient_id: "P001",
          patient_name: "Nguyễn Văn An",
          room_number: "101",
          recorded_time: "2024-01-20T08:00:00",
          pulse: 72,
          blood_pressure_systolic: 120,
          blood_pressure_diastolic: 80,
          temperature: 36.5,
          respiratory_rate: 18,
          spo2: 98,
          notes: "Bình thường",
          recorded_by: "Y tá Nguyễn Thị E",
        },
      ]

      setRoomAssignments(mockAssignments)
      setPatients(mockPatientsData)
      setAvailableRooms(mockRooms)
      setAvailableBeds(15)
      setNewAdmissions(8)
      setMedicalOrders(mockOrders)
      setVitalSigns(mockVitalSigns)
      setPendingOrders(5)
      setOverdueOrders(2)
      setPatientsUnderCare(12)
      setCompletedTasks(18)
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAssignRoom = async () => {
    try {
      // Simulate API call: POST /room-assignments
      await new Promise((resolve) => setTimeout(resolve, 500))

      const selectedPatient = patients.find((p) => p.id === assignForm.patient_id)
      const selectedRoom = availableRooms.find((r) => r.id === assignForm.room_id)

      if (selectedPatient && selectedRoom) {
        const newAssignment: RoomAssignment = {
          id: Date.now().toString(),
          room_number: selectedRoom.room_number,
          room_type: selectedRoom.type,
          patient_name: selectedPatient.name,
          patient_id: selectedPatient.id,
          admission_date: assignForm.admission_date,
          status: "Active",
        }

        setRoomAssignments((prev) => [...prev, newAssignment])
        setAssignModalOpen(false)
        setAssignForm({ patient_id: "", room_id: "", admission_date: new Date().toISOString().split("T")[0] })

        toast({
          title: "Thành công",
          description: "Đã phân giường cho bệnh nhân",
        })
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể phân giường",
        variant: "destructive",
      })
    }
  }

  const handleCheckout = async (assignmentId: string) => {
    try {
      // Simulate API call: PUT /room-assignments/{id} with end_date
      await new Promise((resolve) => setTimeout(resolve, 500))

      setRoomAssignments((prev) => prev.filter((a) => a.id !== assignmentId))

      toast({
        title: "Thành công",
        description: "Đã xuất viện bệnh nhân",
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xuất viện",
        variant: "destructive",
      })
    }
  }

  const handleTransfer = async () => {
    if (!selectedAssignment) return

    try {
      // Simulate API call: PUT /room-assignments/{id} with new room_id
      await new Promise((resolve) => setTimeout(resolve, 500))

      const newRoom = availableRooms.find((r) => r.id === transferForm.new_room_id)
      if (newRoom) {
        setRoomAssignments((prev) =>
          prev.map((a) =>
            a.id === selectedAssignment.id ? { ...a, room_number: newRoom.room_number, room_type: newRoom.type } : a,
          ),
        )

        setTransferModalOpen(false)
        setTransferForm({ new_room_id: "" })

        toast({
          title: "Thành công",
          description: "Đã chuyển phòng cho bệnh nhân",
        })
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể chuyển phòng",
        variant: "destructive",
      })
    }
  }

  const handleCreateCleaningService = async () => {
    try {
      // Simulate API call: POST /cleaning-service
      await new Promise((resolve) => setTimeout(resolve, 500))

      setCleaningModalOpen(false)
      setCleaningForm({ room_id: "", service_type: "", priority: "Normal", notes: "" })

      toast({
        title: "Thành công",
        description: "Đã tạo yêu cầu dọn dẹp",
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tạo yêu cầu dọn dẹp",
        variant: "destructive",
      })
    }
  }

  const handleCompleteOrder = async (orderId: string) => {
    try {
      setMedicalOrders((prev) =>
        prev.map((order) => (order.id === orderId ? { ...order, status: "completed" as const } : order)),
      )
      toast({
        title: "Thành công",
        description: "Đã đánh dấu hoàn thành y lệnh",
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật y lệnh",
        variant: "destructive",
      })
    }
  }

  const handleAddVitalSigns = async () => {
    try {
      const newVitalSigns: VitalSigns = {
        id: Date.now().toString(),
        patient_id: vitalSignsForm.patient_id,
        patient_name: "Bệnh nhân",
        room_number: "101",
        recorded_time: new Date().toISOString(),
        pulse: Number.parseInt(vitalSignsForm.pulse),
        blood_pressure_systolic: Number.parseInt(vitalSignsForm.blood_pressure_systolic),
        blood_pressure_diastolic: Number.parseInt(vitalSignsForm.blood_pressure_diastolic),
        temperature: Number.parseFloat(vitalSignsForm.temperature),
        respiratory_rate: Number.parseInt(vitalSignsForm.respiratory_rate),
        spo2: Number.parseInt(vitalSignsForm.spo2),
        notes: vitalSignsForm.notes,
        recorded_by: "Y tá hiện tại",
      }

      setVitalSigns((prev) => [...prev, newVitalSigns])
      setVitalSignsModalOpen(false)
      setVitalSignsForm({
        patient_id: "",
        pulse: "",
        blood_pressure_systolic: "",
        blood_pressure_diastolic: "",
        temperature: "",
        respiratory_rate: "",
        spo2: "",
        notes: "",
      })

      toast({
        title: "Thành công",
        description: "Đã ghi nhận dấu hiệu sinh tồn",
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể ghi nhận dấu hiệu sinh tồn",
        variant: "destructive",
      })
    }
  }

  const handleAddCareNote = async () => {
    try {
      const newCareNote: CareNote = {
        id: Date.now().toString(),
        patient_id: careNoteForm.patient_id,
        patient_name: "Bệnh nhân",
        room_number: "101",
        care_type: careNoteForm.care_type,
        description: careNoteForm.description,
        timestamp: new Date().toISOString(),
        nurse_id: "N001",
      }

      setCareNotes((prev) => [...prev, newCareNote])
      setCareNoteModalOpen(false)
      setCareNoteForm({
        patient_id: "",
        care_type: "",
        description: "",
      })

      toast({
        title: "Thành công",
        description: "Đã thêm ghi chú chăm sóc",
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể thêm ghi chú chăm sóc",
        variant: "destructive",
      })
    }
  }

  const handleCreateShiftReport = async () => {
    try {
      const newShiftReport: ShiftReport = {
        id: Date.now().toString(),
        shift_date: new Date().toISOString().split("T")[0],
        shift_type: "day",
        nurse_id: "N001",
        patient_updates: shiftReportForm.patient_updates,
        incomplete_tasks: shiftReportForm.incomplete_tasks,
        handover_notes: shiftReportForm.handover_notes,
        confirmed: false,
      }

      setShiftReports((prev) => [...prev, newShiftReport])
      setShiftReportModalOpen(false)
      setShiftReportForm({
        patient_updates: [{ patient_id: "", patient_name: "", condition: "", events: "" }],
        incomplete_tasks: [""],
        handover_notes: "",
      })

      toast({
        title: "Thành công",
        description: "Đã tạo báo cáo ca",
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tạo báo cáo ca",
        variant: "destructive",
      })
    }
  }

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Đã hoàn thành</Badge>
      case "overdue":
        return <Badge variant="destructive">Quá hạn</Badge>
      default:
        return <Badge variant="secondary">Chờ thực hiện</Badge>
    }
  }

  const getOrderTypeIcon = (type: string) => {
    switch (type) {
      case "medication":
        return <Pill className="h-4 w-4" />
      case "iv_fluid":
        return <Activity className="h-4 w-4" />
      case "test":
        return <FileText className="h-4 w-4" />
      default:
        return <ClipboardList className="h-4 w-4" />
    }
  }

  const filteredAssignments = roomAssignments.filter(
    (assignment) =>
      assignment.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.room_number.includes(searchTerm),
  )

  // Mock vital signs chart data
  const vitalSignsChartData = [
    { time: "06:00", temperature: 36.2, pulse: 68, bp_systolic: 115 },
    { time: "08:00", temperature: 36.5, pulse: 72, bp_systolic: 120 },
    { time: "10:00", temperature: 36.8, pulse: 75, bp_systolic: 118 },
    { time: "12:00", temperature: 37.0, pulse: 78, bp_systolic: 122 },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải dữ liệu...</p>
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
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Dashboard Y tá</h1>
              <p className="text-sm text-gray-500">Y tá {user?.full_name || "Nguyễn Thị B"}</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {[
            {
              value: "orders",
              label: "Y lệnh",
              icon: ClipboardList,
              badge: pendingOrders,
            },
            {
              value: "vitals",
              label: "Dấu hiệu sinh tồn",
              icon: Activity,
              badge: null,
            },
            {
              value: "care",
              label: "Chăm sóc",
              icon: Heart,
              badge: null,
            },
            {
              value: "reports",
              label: "Báo cáo ca",
              icon: FileText,
              badge: null,
            },
            {
              value: "patients",
              label: "Bệnh nhân",
              icon: Users,
              badge: null,
            },
            {
              value: "doctors",
              label: "Bác sĩ",
              icon: UserCheck,
              badge: null,
            },
            {
              value: "staff",
              label: "Nhân viên",
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
              value: "medical-records",
              label: "Hồ sơ y tế",
              icon: FileText,
              badge: null,
            },
            {
              value: "blood-bank",
              label: "Ngân hàng máu",
              icon: Droplets,
              badge: null,
            },
            {
              value: "rooms",
              label: "Phòng bệnh",
              icon: Building,
              badge: null,
            },
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
                {tab.badge && tab.badge > 0 && (
                  <span
                    className={`
                    min-w-5 h-5 rounded-full text-xs font-bold
                    flex items-center justify-center
                    ${isActive ? "bg-white text-blue-600" : "bg-red-500 text-white"}
                  `}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-blue-600">{user?.full_name?.charAt(0) || "N"}</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{user?.full_name || "Nguyễn Thị B"}</p>
              <p className="text-xs text-gray-500">Khoa Nội</p>
            </div>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Quản lý chăm sóc bệnh nhân</h2>
              <p className="text-sm text-gray-500">Theo dõi và thực hiện y lệnh</p>
            </div>
            <div className="flex gap-2">
              <Dialog open={cleaningModalOpen} onOpenChange={setCleaningModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2 bg-transparent">
                    <Sparkles className="h-4 w-4" />
                    Yêu cầu dọn dẹp
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Tạo yêu cầu dọn dẹp</DialogTitle>
                    <DialogDescription>Tạo yêu cầu dọn dẹp cho phòng bệnh</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="room_id">Phòng</Label>
                      <Select
                        value={cleaningForm.room_id}
                        onValueChange={(value) => setCleaningForm((prev) => ({ ...prev, room_id: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn phòng" />
                        </SelectTrigger>
                        <SelectContent>
                          {roomAssignments.map((assignment) => (
                            <SelectItem key={assignment.id} value={assignment.room_number}>
                              Phòng {assignment.room_number} - {assignment.room_type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="service_type">Loại dịch vụ</Label>
                      <Select
                        value={cleaningForm.service_type}
                        onValueChange={(value) => setCleaningForm((prev) => ({ ...prev, service_type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn loại dịch vụ" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">Dọn dẹp tổng quát</SelectItem>
                          <SelectItem value="deep">Dọn dẹp sâu</SelectItem>
                          <SelectItem value="disinfection">Khử trùng</SelectItem>
                          <SelectItem value="maintenance">Bảo trì</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="priority">Mức độ ưu tiên</Label>
                      <Select
                        value={cleaningForm.priority}
                        onValueChange={(value) => setCleaningForm((prev) => ({ ...prev, priority: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Thấp</SelectItem>
                          <SelectItem value="Normal">Bình thường</SelectItem>
                          <SelectItem value="High">Cao</SelectItem>
                          <SelectItem value="Urgent">Khẩn cấp</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="notes">Ghi chú</Label>
                      <Textarea
                        value={cleaningForm.notes}
                        onChange={(e) => setCleaningForm((prev) => ({ ...prev, notes: e.target.value }))}
                        placeholder="Ghi chú thêm về yêu cầu dọn dẹp..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setCleaningModalOpen(false)}>
                      Hủy
                    </Button>
                    <Button onClick={handleCreateCleaningService}>Tạo yêu cầu</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Y lệnh chờ thực hiện</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{pendingOrders}</div>
                <p className="text-xs text-muted-foreground">Cần thực hiện trong ca</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Y lệnh quá hạn</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{overdueOrders}</div>
                <p className="text-xs text-muted-foreground">Cần xử lý ngay</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bệnh nhân phụ trách</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{patientsUnderCare}</div>
                <p className="text-xs text-muted-foreground">Trong ca hiện tại</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Công việc hoàn thành</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
                <p className="text-xs text-muted-foreground">Trong ca này</p>
              </CardContent>
            </Card>
          </div>

          {/* Tab Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            {/* Tab Contents */}
            <TabsContent value="orders" className="mt-0 h-full">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="h-5 w-5" />Y lệnh cần thực hiện
                  </CardTitle>
                  <CardDescription>Danh sách y lệnh từ bác sĩ và trạng thái thực hiện</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Loại</TableHead>
                        <TableHead>Bệnh nhân</TableHead>
                        <TableHead>Phòng</TableHead>
                        <TableHead>Y lệnh</TableHead>
                        <TableHead>Thời gian</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Hành động</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {medicalOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>{getOrderTypeIcon(order.order_type)}</TableCell>
                          <TableCell>{order.patient_name}</TableCell>
                          <TableCell>{order.room_number}</TableCell>
                          <TableCell>{order.description}</TableCell>
                          <TableCell>{order.scheduled_time}</TableCell>
                          <TableCell>{getOrderStatusBadge(order.status)}</TableCell>
                          <TableCell>
                            <Button variant="outline" onClick={() => handleCompleteOrder(order.id)}>
                              Hoàn thành
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            {/* Vital Signs Tab */}
            <TabsContent value="vitals" className="mt-0 h-full">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Dấu hiệu sinh tồn
                  </CardTitle>
                  <CardDescription>Danh sách dấu hiệu sinh tồn của bệnh nhân</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={vitalSignsChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="temperature" stroke="#8884d8" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="pulse" stroke="#82ca9d" />
                      <Line type="monotone" dataKey="bp_systolic" stroke="#ffc658" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
            {/* Care Notes Tab */}
            <TabsContent value="care" className="mt-0 h-full">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Chăm sóc
                  </CardTitle>
                  <CardDescription>Ghi chú chăm sóc của bệnh nhân</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button onClick={() => setCareNoteModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm ghi chú chăm sóc
                    </Button>

                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Bệnh nhân</TableHead>
                            <TableHead>Phòng</TableHead>
                            <TableHead>Loại chăm sóc</TableHead>
                            <TableHead>Mô tả</TableHead>
                            <TableHead>Thời gian</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {careNotes.map((note) => (
                            <TableRow key={note.id}>
                              <TableCell>{note.patient_name}</TableCell>
                              <TableCell>{note.room_number}</TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {note.care_type === "dressing" && "Thay băng"}
                                  {note.care_type === "hygiene" && "Vệ sinh"}
                                  {note.care_type === "feeding" && "Cho ăn"}
                                  {note.care_type === "mobility" && "Di chuyển"}
                                  {note.care_type === "other" && "Khác"}
                                </Badge>
                              </TableCell>
                              <TableCell>{note.description}</TableCell>
                              <TableCell>{new Date(note.timestamp).toLocaleString("vi-VN")}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            {/* Shift Reports Tab */}
            <TabsContent value="reports" className="mt-0 h-full">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Báo cáo ca
                  </CardTitle>
                  <CardDescription>Báo cáo tình trạng ca của y tá</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button onClick={() => setShiftReportModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Tạo báo cáo ca
                    </Button>

                    <div className="grid gap-4">
                      {shiftReports.map((report) => (
                        <Card key={report.id} className="border-l-4 border-l-blue-500">
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-lg">
                                  Báo cáo ca {report.shift_type === "day" ? "Ngày" : "Đêm"}
                                </CardTitle>
                                <CardDescription>
                                  {new Date(report.shift_date).toLocaleDateString("vi-VN")}
                                </CardDescription>
                              </div>
                              <Badge variant={report.confirmed ? "default" : "secondary"}>
                                {report.confirmed ? "Đã xác nhận" : "Chờ xác nhận"}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div>
                                <h4 className="font-medium mb-2">Cập nhật bệnh nhân:</h4>
                                {report.patient_updates.map((update, index) => (
                                  <div key={index} className="bg-gray-50 p-3 rounded-lg mb-2">
                                    <p className="font-medium">{update.patient_name}</p>
                                    <p className="text-sm text-gray-600">Tình trạng: {update.condition}</p>
                                    <p className="text-sm">{update.events}</p>
                                  </div>
                                ))}
                              </div>

                              <div>
                                <h4 className="font-medium mb-2">Công việc chưa hoàn thành:</h4>
                                <ul className="list-disc list-inside space-y-1">
                                  {report.incomplete_tasks.map((task, index) => (
                                    <li key={index} className="text-sm">
                                      {task}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div>
                                <h4 className="font-medium mb-2">Ghi chú bàn giao:</h4>
                                <p className="text-sm bg-gray-50 p-3 rounded-lg">{report.handover_notes}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="patients" className="mt-0 h-full">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-blue-800 text-sm font-medium">
                  📖 Chế độ chỉ đọc - Bạn có thể tìm kiếm và lọc dữ liệu nhưng không thể chỉnh sửa
                </p>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Danh sách Bệnh nhân
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <SearchBar
                      onSearch={setSearchQuery}
                      placeholder="Tìm kiếm theo tên, ID, email hoặc số điện thoại..."
                    />
                  </div>
                  <DataTable
                    columns={patientColumns}
                    data={filteredPatients}
                    total={filteredPatients.length}
                    page={1}
                    pageSize={10}
                    onPageChange={() => {}}
                    loading={false}
                    error={null}
                    emptyMessage="Không có bệnh nhân nào"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="doctors" className="mt-0 h-full">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-blue-800 text-sm font-medium">
                  📖 Chế độ chỉ đọc - Bạn có thể tìm kiếm và lọc dữ liệu nhưng không thể chỉnh sửa
                </p>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5" />
                    Danh sách Bác sĩ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <SearchBar onSearch={setDoctorSearchQuery} placeholder="Tìm kiếm theo tên, chuyên khoa, khoa..." />
                  </div>
                  <DataTable
                    columns={doctorColumns}
                    data={filteredDoctors}
                    total={filteredDoctors.length}
                    page={1}
                    pageSize={10}
                    onPageChange={() => {}}
                    loading={false}
                    error={null}
                    emptyMessage="Không có bác sĩ nào"
                  />
                </CardContent>
              </Card>
            </TabsContent>
            {/* Staff Tab */}
            <TabsContent value="staff" className="mt-0 h-full">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-blue-800 text-sm font-medium">
                  📖 Chế độ chỉ đọc - Bạn có thể tìm kiếm và lọc dữ liệu nhưng không thể chỉnh sửa
                </p>
              </div>
              <div className="nurse-readonly-content">
                <StaffPage />
              </div>
            </TabsContent>
            {/* Appointments Tab */}
            <TabsContent value="appointments" className="mt-0 h-full">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-blue-800 text-sm font-medium">
                  📖 Chế độ chỉ đọc - Bạn có thể tìm kiếm và lọc dữ liệu nhưng không thể chỉnh sửa
                </p>
              </div>
              <div className="nurse-readonly-content">
                <AppointmentsPage />
              </div>
            </TabsContent>
            {/* Medical Records Tab */}
            <TabsContent value="medical-records" className="mt-0 h-full">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-blue-800 text-sm font-medium">
                  📖 Chế độ chỉ đọc - Bạn có thể tìm kiếm và lọc dữ liệu nhưng không thể chỉnh sửa
                </p>
              </div>
              <div className="nurse-readonly-content">
                <MedicalRecordsPage />
              </div>
            </TabsContent>
            {/* Blood Bank Tab */}
            <TabsContent value="blood-bank" className="mt-0 h-full">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-blue-800 text-sm font-medium">
                  📖 Chế độ chỉ đọc - Bạn có thể tìm kiếm và lọc dữ liệu nhưng không thể chỉnh sửa
                </p>
              </div>
              <div className="nurse-readonly-content">
                <BloodBankPage />
              </div>
            </TabsContent>
            {/* Rooms Tab */}
            <TabsContent value="rooms" className="mt-0 h-full">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-blue-800 text-sm font-medium">
                  📖 Chế độ chỉ đọc - Bạn có thể tìm kiếm và lọc dữ liệu nhưng không thể chỉnh sửa
                </p>
              </div>
              <div className="nurse-readonly-content">
                <RoomsPage />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      {/* Care Note Modal */}
      <Dialog open={careNoteModalOpen} onOpenChange={setCareNoteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm ghi chú chăm sóc</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="care-patient">Bệnh nhân</Label>
              <Select
                value={careNoteForm.patient_id}
                onValueChange={(value) => setCareNoteForm((prev) => ({ ...prev, patient_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn bệnh nhân" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="care-type">Loại chăm sóc</Label>
              <Select
                value={careNoteForm.care_type}
                onValueChange={(value) => setCareNoteForm((prev) => ({ ...prev, care_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại chăm sóc" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dressing">Thay băng</SelectItem>
                  <SelectItem value="hygiene">Vệ sinh</SelectItem>
                  <SelectItem value="feeding">Cho ăn</SelectItem>
                  <SelectItem value="mobility">Di chuyển</SelectItem>
                  <SelectItem value="other">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="care-description">Mô tả</Label>
              <Textarea
                id="care-description"
                value={careNoteForm.description}
                onChange={(e) => setCareNoteForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Mô tả chi tiết về việc chăm sóc..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCareNoteModalOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleAddCareNote} className="bg-blue-600 hover:bg-blue-700">
              Lưu ghi chú
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shift Report Modal */}
      <Dialog open={shiftReportModalOpen} onOpenChange={setShiftReportModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tạo báo cáo ca</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div>
              <Label>Cập nhật bệnh nhân</Label>
              {shiftReportForm.patient_updates.map((update, index) => (
                <div key={index} className="border p-3 rounded-lg space-y-2 mt-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Bệnh nhân</Label>
                      <Select
                        value={update.patient_id}
                        onValueChange={(value) => {
                          const newUpdates = [...shiftReportForm.patient_updates]
                          const patient = patients.find((p) => p.id === value)
                          newUpdates[index] = { ...update, patient_id: value, patient_name: patient?.full_name || "" }
                          setShiftReportForm((prev) => ({ ...prev, patient_updates: newUpdates }))
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn bệnh nhân" />
                        </SelectTrigger>
                        <SelectContent>
                          {patients.map((patient) => (
                            <SelectItem key={patient.id} value={patient.id}>
                              {patient.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Tình trạng</Label>
                      <Input
                        value={update.condition}
                        onChange={(e) => {
                          const newUpdates = [...shiftReportForm.patient_updates]
                          newUpdates[index] = { ...update, condition: e.target.value }
                          setShiftReportForm((prev) => ({ ...prev, patient_updates: newUpdates }))
                        }}
                        placeholder="Tình trạng hiện tại"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Sự kiện</Label>
                    <Textarea
                      value={update.events}
                      onChange={(e) => {
                        const newUpdates = [...shiftReportForm.patient_updates]
                        newUpdates[index] = { ...update, events: e.target.value }
                        setShiftReportForm((prev) => ({ ...prev, patient_updates: newUpdates }))
                      }}
                      placeholder="Các sự kiện trong ca..."
                    />
                  </div>
                </div>
              ))}
            </div>

            <div>
              <Label>Công việc chưa hoàn thành</Label>
              {shiftReportForm.incomplete_tasks.map((task, index) => (
                <Input
                  key={index}
                  value={task}
                  onChange={(e) => {
                    const newTasks = [...shiftReportForm.incomplete_tasks]
                    newTasks[index] = e.target.value
                    setShiftReportForm((prev) => ({ ...prev, incomplete_tasks: newTasks }))
                  }}
                  placeholder="Công việc chưa hoàn thành..."
                  className="mt-2"
                />
              ))}
            </div>

            <div>
              <Label htmlFor="handover-notes">Ghi chú bàn giao</Label>
              <Textarea
                id="handover-notes"
                value={shiftReportForm.handover_notes}
                onChange={(e) => setShiftReportForm((prev) => ({ ...prev, handover_notes: e.target.value }))}
                placeholder="Ghi chú quan trọng cho ca tiếp theo..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShiftReportModalOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreateShiftReport} className="bg-blue-600 hover:bg-blue-700">
              Tạo báo cáo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <style jsx global>{`
        .nurse-readonly-content button:has(svg.lucide-plus),
        .nurse-readonly-content button:has(svg.lucide-edit),
        .nurse-readonly-content button:has(svg.lucide-trash),
        .nurse-readonly-content button:has(svg.lucide-trash-2),
        .nurse-readonly-content button[aria-label*="Tạo"],
        .nurse-readonly-content button[aria-label*="Thêm"],
        .nurse-readonly-content button[aria-label*="Sửa"],
        .nurse-readonly-content button[aria-label*="Xóa"],
        .nurse-readonly-content button:contains("Tạo"),
        .nurse-readonly-content button:contains("Thêm"),
        .nurse-readonly-content button:contains("Sửa"),
        .nurse-readonly-content button:contains("Xóa"),
        .nurse-readonly-content [role="button"]:has(svg.lucide-plus),
        .nurse-readonly-content [role="button"]:has(svg.lucide-edit),
        .nurse-readonly-content [role="button"]:has(svg.lucide-trash) {
          display: none !important;
        }
      `}</style>
    </div>
  )
}
