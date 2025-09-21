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
  CreditCard,
  Building2,
  Droplets,
  DoorOpen,
  BedDouble,
  Building,
} from "lucide-react"
import AppointmentsPage from "@/app/appointments/page"
import MedicalRecordsPage from "@/app/medical-records/page"
import BillingPage from "@/app/billing/page"
import MedicinePage from "@/app/medicine/page"
import PharmacyPage from "@/app/pharmacy/page"
import BloodBankPage from "@/app/blood-bank/page"
import RoomsPage from "@/app/rooms/page"
import RoomAssignmentsPage from "@/app/room-assignments/page"
import PatientsPage from "@/app/patients/page"
import DoctorsPage from "@/app/doctors/page"
import StaffPage from "@/app/staff/page"

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
  const [activeTab, setActiveTab] = useState("timeline")
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null)
  const [showPatientChart, setShowPatientChart] = useState(false)
  const [kpiData] = useState(mockKPIData)
  const [filterStatus, setFilterStatus] = useState("all")
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState({ full_name: "Nguyễn Văn A" }) // Mock user data

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

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      //setAppointments(mockAppointments)
      //setKPIData(mockKPIData)
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

  const getStatusBadge = (status: string) => {
    const config = {
      "Đã đến": { variant: "default" as const, color: "bg-green-100 text-green-800", icon: CheckCircle },
      "Đang chờ": { variant: "secondary" as const, color: "bg-blue-100 text-blue-800", icon: Clock },
      "Đang khám": { variant: "outline" as const, color: "bg-yellow-100 text-yellow-800", icon: Stethoscope },
      "Hoàn thành": { variant: "default" as const, color: "bg-green-100 text-green-800", icon: CheckCircle },
      "Trễ hẹn": { variant: "destructive" as const, color: "bg-red-100 text-red-800", icon: AlertTriangle },
    }

    const { color, icon: Icon } = config[status] || config["Đang chờ"]

    return (
      <Badge className={`${color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status}
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
    setSelectedPatient(appointment)
    setActiveTab("chart")
    toast({
      title: "Bắt đầu khám",
      description: `Đã mở hồ sơ bệnh nhân ${appointment.patient}`,
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
              <p className="text-sm text-gray-500">Dr. {user?.full_name || "Nguyễn Văn A"}</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {[
            {
              value: "timeline",
              label: "Tổng quan",
              icon: Home,
              badge: null,
            },
            {
              value: "chart",
              label: "Hồ sơ bệnh nhân",
              icon: UserCheck,
              badge: selectedPatient ? 1 : null,
            },
            {
              value: "inpatient",
              label: "Nội trú",
              icon: Bed,
              badge: kpiData.inpatients,
            },
            {
              value: "results",
              label: "Kết quả",
              icon: FlaskConical,
              badge: kpiData.pendingResults,
            },
            {
              value: "inbox",
              label: "Hộp thư",
              icon: Inbox,
              badge: kpiData.newMessages,
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
              value: "billing",
              label: "Thanh toán",
              icon: CreditCard,
              badge: null,
            },
            {
              value: "medicine",
              label: "Thuốc",
              icon: Pill,
              badge: null,
            },
            {
              value: "pharmacy",
              label: "Nhà thuốc",
              icon: Building2,
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
              icon: DoorOpen,
              badge: null,
            },
            {
              value: "room-assignments",
              label: "Phân giường",
              icon: BedDouble,
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
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg"
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

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-green-600">{user?.full_name?.charAt(0) || "N"}</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{user?.full_name || "Nguyễn Văn A"}</p>
              <p className="text-xs text-gray-500">Khoa Tim Mạch</p>
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
                Chào buổi {new Date().getHours() < 12 ? "sáng" : new Date().getHours() < 18 ? "chiều" : "tối"}, Dr.{" "}
                {user?.full_name || "Nguyễn Văn A"}
              </p>
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
                          <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-green-600" />
                            Lịch hẹn hôm nay
                          </CardTitle>
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
                            {mockAppointments.map((appointment, index) => (
                              <div
                                key={appointment.id}
                                className="flex items-center gap-4 p-4 rounded-lg border hover:bg-green-50 transition-colors"
                              >
                                <div className="text-center min-w-16">
                                  <div className="text-lg font-bold text-green-800">{appointment.time}</div>
                                  <div className="text-xs text-green-600">
                                    {index === 0 ? "Tiếp theo" : `+${index * 45}m`}
                                  </div>
                                </div>

                                <div className="flex-1">
                                  <div className="flex items-center gap-3">
                                    <img
                                      src={appointment.avatar || "/placeholder.svg"}
                                      alt={appointment.patient}
                                      className="w-8 h-8 rounded-full"
                                    />
                                    <div>
                                      <HoverCard>
                                        <HoverCardTrigger asChild>
                                          <Button variant="link" className="p-0 h-auto font-semibold text-green-800">
                                            {appointment.patient}
                                          </Button>
                                        </HoverCardTrigger>
                                        <HoverCardContent className="w-80">
                                          <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                              <img
                                                src={appointment.avatar || "/placeholder.svg"}
                                                alt=""
                                                className="w-12 h-12 rounded-full"
                                              />
                                              <div>
                                                <h4 className="font-semibold">{appointment.patient}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                  {appointment.age} tuổi • {appointment.gender}
                                                </p>
                                              </div>
                                            </div>

                                            {appointment.allergies.length > 0 && (
                                              <div>
                                                <p className="text-sm font-medium text-red-600 mb-1">Dị ứng:</p>
                                                <div className="flex flex-wrap gap-1">
                                                  {appointment.allergies.map((allergy) => (
                                                    <Badge key={allergy} className="bg-red-100 text-red-800">
                                                      {allergy}
                                                    </Badge>
                                                  ))}
                                                </div>
                                              </div>
                                            )}

                                            <div>
                                              <p className="text-sm font-medium mb-1">Bệnh nền:</p>
                                              <div className="flex flex-wrap gap-1">
                                                {appointment.conditions.map((condition) => (
                                                  <Badge key={condition} variant="outline">
                                                    {condition}
                                                  </Badge>
                                                ))}
                                              </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-2 text-sm">
                                              <div>
                                                <p className="font-medium">Huyết áp</p>
                                                <p>{appointment.vitals.bp}</p>
                                              </div>
                                              <div>
                                                <p className="font-medium">Mạch</p>
                                                <p>{appointment.vitals.hr}</p>
                                              </div>
                                              <div>
                                                <p className="font-medium">Nhiệt độ</p>
                                                <p>{appointment.vitals.temp}°C</p>
                                              </div>
                                            </div>

                                            <p className="text-xs text-muted-foreground">
                                              Lần khám gần nhất: {appointment.lastVisit}
                                            </p>
                                          </div>
                                        </HoverCardContent>
                                      </HoverCard>
                                      <p className="text-sm text-muted-foreground">{appointment.purpose}</p>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3">
                                  {getStatusBadge(appointment.status)}
                                  {appointment.status === "Đã đến" && (
                                    <Button
                                      size="sm"
                                      onClick={() => startVisit(appointment)}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <Play className="h-3 w-3 mr-1" />
                                      Bắt đầu
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
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
                            {mockMessages.map((message) => (
                              <div key={message.id} className="p-3 rounded-lg border-l-4 border-l-blue-500 bg-blue-50">
                                <div className="flex items-center justify-between mb-1">
                                  <p className="text-sm font-medium">{message.from}</p>
                                  <Badge
                                    className={
                                      message.priority === "Cao"
                                        ? "bg-red-100 text-red-800"
                                        : message.priority === "Trung bình"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : "bg-green-100 text-green-800"
                                    }
                                  >
                                    {message.priority}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-1">{message.message}</p>
                                <p className="text-xs text-muted-foreground">{message.time}</p>
                              </div>
                            ))}
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
                              src={selectedPatient.avatar || "/placeholder.svg"}
                              alt=""
                              className="w-16 h-16 rounded-full"
                            />
                            <div>
                              <h2 className="text-2xl font-bold text-green-800">{selectedPatient.patient}</h2>
                              <p className="text-green-600">
                                {selectedPatient.age} tuổi • {selectedPatient.gender} • ID: {selectedPatient.patient_id}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                {selectedPatient.allergies.length > 0 && (
                                  <div className="flex items-center gap-1">
                                    <AlertTriangle className="h-4 w-4 text-red-500" />
                                    {selectedPatient.allergies.map((allergy) => (
                                      <Badge key={allergy} className="bg-red-100 text-red-800">
                                        {allergy}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

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
                        </div>

                        <div className="flex items-center gap-2 mt-4">
                          <Button className="bg-green-600 hover:bg-green-700">
                            <FileText className="h-4 w-4 mr-2" />
                            Ghi chú khám
                          </Button>
                          <Button variant="outline">
                            <TestTube className="h-4 w-4 mr-2" />
                            Chỉ định
                          </Button>
                          <Button variant="outline">
                            <Pill className="h-4 w-4 mr-2" />
                            Kê đơn
                          </Button>
                          <Button variant="outline">
                            <Printer className="h-4 w-4 mr-2" />
                            In hồ sơ
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Clinical Workflow Tabs */}
                    <Tabs defaultValue="notes" className="space-y-4">
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
                              <Button className="bg-green-600 hover:bg-green-700">
                                <Save className="h-4 w-4 mr-2" />
                                Lưu ghi chú
                              </Button>
                              <Button variant="outline">
                                <Printer className="h-4 w-4 mr-2" />
                                In
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
                                <Button className="w-full bg-green-600 hover:bg-green-700">
                                  <Plus className="h-4 w-4 mr-2" />
                                  Thêm chỉ định
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="prescriptions">
                        <Card>
                          <CardHeader>
                            <CardTitle>Kê đơn thuốc điện tử</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-5 gap-4">
                              <div className="space-y-2">
                                <Label>Tên thuốc</Label>
                                <Input
                                  placeholder="Tìm thuốc..."
                                  value={prescription.medication}
                                  onChange={(e) => setPrescription((prev) => ({ ...prev, medication: e.target.value }))}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Liều lượng</Label>
                                <Input
                                  placeholder="500mg"
                                  value={prescription.dosage}
                                  onChange={(e) => setPrescription((prev) => ({ ...prev, dosage: e.target.value }))}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Tần suất</Label>
                                <Input
                                  placeholder="2 lần/ngày"
                                  value={prescription.frequency}
                                  onChange={(e) => setPrescription((prev) => ({ ...prev, frequency: e.target.value }))}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Thời gian</Label>
                                <Input
                                  placeholder="7 ngày"
                                  value={prescription.duration}
                                  onChange={(e) => setPrescription((prev) => ({ ...prev, duration: e.target.value }))}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>&nbsp;</Label>
                                <Button className="w-full bg-green-600 hover:bg-green-700">
                                  <Plus className="h-4 w-4 mr-2" />
                                  Thêm thuốc
                                </Button>
                              </div>
                            </div>

                            {selectedPatient.allergies.length > 0 && (
                              <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <AlertTriangle className="h-5 w-5 text-red-500" />
                                  <p className="font-medium text-red-800">Cảnh báo dị ứng</p>
                                </div>
                                <p className="text-sm text-red-700">
                                  Bệnh nhân dị ứng với: {selectedPatient.allergies.join(", ")}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
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
                      {mockInpatients.map((patient) => (
                        <div key={patient.id} className="p-4 rounded-lg border hover:bg-green-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="text-center">
                                <p className="font-bold text-green-800">{patient.room}</p>
                                <p className="text-sm text-green-600">Giường {patient.bed}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold">{patient.patient}</h4>
                                <p className="text-sm text-muted-foreground">{patient.condition}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  {getPriorityBadge(patient.priority)}
                                  <Badge variant="outline">{patient.orders} y lệnh chờ</Badge>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-4 gap-3 text-center text-sm">
                              <div>
                                <p className="font-medium">BP</p>
                                <p>{patient.vitals.bp}</p>
                              </div>
                              <div>
                                <p className="font-medium">HR</p>
                                <p>{patient.vitals.hr}</p>
                              </div>
                              <div>
                                <p className="font-medium">Temp</p>
                                <p>{patient.vitals.temp}</p>
                              </div>
                              <div>
                                <p className="font-medium">SpO₂</p>
                                <p>{patient.vitals.spo2}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline">
                                <FileText className="h-3 w-3 mr-1" />
                                Diễn biến
                              </Button>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                <Eye className="h-3 w-3 mr-1" />
                                Xem hồ sơ
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
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
                      {mockPendingResults.map((result) => (
                        <div key={result.id} className="p-4 rounded-lg border hover:bg-green-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold">{result.patient}</h4>
                              <p className="text-sm text-muted-foreground">{result.test}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              {getPriorityBadge(result.priority)}
                              <Badge
                                className={
                                  result.status === "Hoàn thành"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }
                              >
                                {result.status}
                              </Badge>
                              {result.status === "Hoàn thành" && (
                                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                  <Eye className="h-3 w-3 mr-1" />
                                  Xem kết quả
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
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
                      {mockMessages.map((message) => (
                        <div key={message.id} className="p-4 rounded-lg border hover:bg-green-50 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{message.from}</h4>
                            <div className="flex items-center gap-2">
                              {getPriorityBadge(message.priority)}
                              <span className="text-sm text-muted-foreground">{message.time}</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{message.message}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="patients" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      Quản lý bệnh nhân (Chỉ đọc)
                    </CardTitle>
                    <CardDescription>Xem thông tin bệnh nhân - Chế độ chỉ đọc</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <p className="text-blue-800 text-sm">
                        <strong>Chế độ chỉ đọc:</strong> Bạn có thể tìm kiếm và lọc dữ liệu, nhưng không thể chỉnh sửa
                        hoặc thêm mới.
                      </p>
                    </div>
                    <div className="opacity-95 [&_button:has(svg.lucide-plus)]:hidden [&_button:has(svg.lucide-edit)]:hidden [&_button:has(svg.lucide-trash)]:hidden [&_button:has(svg.lucide-user-plus)]:hidden [&_button[aria-label*='Tạo']]:hidden [&_button[aria-label*='Thêm']]:hidden [&_button[aria-label*='Sửa']]:hidden [&_button[aria-label*='Xóa']]:hidden [&_button:contains('Tạo')]:hidden [&_button:contains('Thêm')]:hidden [&_button:contains('Sửa')]:hidden [&_button:contains('Xóa')]:hidden">
                      <PatientsPage />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="doctors" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Stethoscope className="h-5 w-5 text-green-600" />
                      Quản lý bác sĩ (Chỉ đọc)
                    </CardTitle>
                    <CardDescription>Xem thông tin bác sĩ - Chế độ chỉ đọc</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <p className="text-green-800 text-sm">
                        <strong>Chế độ chỉ đọc:</strong> Bạn có thể tìm kiếm và lọc dữ liệu, nhưng không thể chỉnh sửa
                        hoặc thêm mới.
                      </p>
                    </div>
                    <div className="opacity-95 [&_button:has(svg.lucide-plus)]:hidden [&_button:has(svg.lucide-edit)]:hidden [&_button:has(svg.lucide-trash)]:hidden [&_button:has(svg.lucide-user-plus)]:hidden [&_button[aria-label*='Tạo']]:hidden [&_button[aria-label*='Thêm']]:hidden [&_button[aria-label*='Sửa']]:hidden [&_button[aria-label*='Xóa']]:hidden [&_button:contains('Tạo')]:hidden [&_button:contains('Thêm')]:hidden [&_button:contains('Sửa')]:hidden [&_button:contains('Xóa')]:hidden">
                      <DoctorsPage />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="staff" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserCog className="h-5 w-5 text-purple-600" />
                      Quản lý nhân viên (Chỉ đọc)
                    </CardTitle>
                    <CardDescription>Xem thông tin nhân viên - Chế độ chỉ đọc</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                      <p className="text-purple-800 text-sm">
                        <strong>Chế độ chỉ đọc:</strong> Bạn có thể tìm kiếm và lọc dữ liệu, nhưng không thể chỉnh sửa
                        hoặc thêm mới.
                      </p>
                    </div>
                    <div className="opacity-95 [&_button:has(svg.lucide-plus)]:hidden [&_button:has(svg.lucide-edit)]:hidden [&_button:has(svg.lucide-trash)]:hidden [&_button:has(svg.lucide-user-plus)]:hidden [&_button[aria-label*='Tạo']]:hidden [&_button[aria-label*='Thêm']]:hidden [&_button[aria-label*='Sửa']]:hidden [&_button[aria-label*='Xóa']]:hidden [&_button:contains('Tạo')]:hidden [&_button:contains('Thêm')]:hidden [&_button:contains('Sửa')]:hidden [&_button:contains('Xóa')]:hidden">
                      <StaffPage />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="appointments" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      Quản lý lịch hẹn (Chỉ đọc)
                    </CardTitle>
                    <CardDescription>Xem lịch hẹn - Chế độ chỉ đọc</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <p className="text-blue-800 text-sm">
                        <strong>Chế độ chỉ đọc:</strong> Bạn có thể tìm kiếm và lọc dữ liệu, nhưng không thể chỉnh sửa
                        hoặc thêm mới.
                      </p>
                    </div>
                    <div className="opacity-95 [&_button:has(svg.lucide-plus)]:hidden [&_button:has(svg.lucide-edit)]:hidden [&_button:has(svg.lucide-trash)]:hidden [&_button:has(svg.lucide-user-plus)]:hidden [&_button[aria-label*='Tạo']]:hidden [&_button[aria-label*='Thêm']]:hidden [&_button[aria-label*='Sửa']]:hidden [&_button[aria-label*='Xóa']]:hidden [&_button:contains('Tạo')]:hidden [&_button:contains('Thêm')]:hidden [&_button:contains('Sửa')]:hidden [&_button:contains('Xóa')]:hidden">
                      <AppointmentsPage />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="medical-records" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-green-600" />
                      Hồ sơ y tế (Chỉ đọc)
                    </CardTitle>
                    <CardDescription>Xem hồ sơ y tế - Chế độ chỉ đọc</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <p className="text-green-800 text-sm">
                        <strong>Chế độ chỉ đọc:</strong> Bạn có thể tìm kiếm và lọc dữ liệu, nhưng không thể chỉnh sửa
                        hoặc thêm mới.
                      </p>
                    </div>
                    <div className="opacity-95 [&_button:has(svg.lucide-plus)]:hidden [&_button:has(svg.lucide-edit)]:hidden [&_button:has(svg.lucide-trash)]:hidden [&_button:has(svg.lucide-user-plus)]:hidden [&_button[aria-label*='Tạo']]:hidden [&_button[aria-label*='Thêm']]:hidden [&_button[aria-label*='Sửa']]:hidden [&_button[aria-label*='Xóa']]:hidden [&_button:contains('Tạo')]:hidden [&_button:contains('Thêm')]:hidden [&_button:contains('Sửa')]:hidden [&_button:contains('Xóa')]:hidden">
                      <MedicalRecordsPage />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="billing" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-yellow-600" />
                      Thanh toán (Chỉ đọc)
                    </CardTitle>
                    <CardDescription>Xem thông tin thanh toán - Chế độ chỉ đọc</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <p className="text-yellow-800 text-sm">
                        <strong>Chế độ chỉ đọc:</strong> Bạn có thể tìm kiếm và lọc dữ liệu, nhưng không thể chỉnh sửa
                        hoặc thêm mới.
                      </p>
                    </div>
                    <div className="opacity-95 [&_button:has(svg.lucide-plus)]:hidden [&_button:has(svg.lucide-edit)]:hidden [&_button:has(svg.lucide-trash)]:hidden [&_button:has(svg.lucide-user-plus)]:hidden [&_button[aria-label*='Tạo']]:hidden [&_button[aria-label*='Thêm']]:hidden [&_button[aria-label*='Sửa']]:hidden [&_button[aria-label*='Xóa']]:hidden [&_button:contains('Tạo')]:hidden [&_button:contains('Thêm')]:hidden [&_button:contains('Sửa')]:hidden [&_button:contains('Xóa')]:hidden">
                      <BillingPage />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="medicine" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Pill className="h-5 w-5 text-red-600" />
                      Quản lý thuốc (Chỉ đọc)
                    </CardTitle>
                    <CardDescription>Xem thông tin thuốc - Chế độ chỉ đọc</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <p className="text-red-800 text-sm">
                        <strong>Chế độ chỉ đọc:</strong> Bạn có thể tìm kiếm và lọc dữ liệu, nhưng không thể chỉnh sửa
                        hoặc thêm mới.
                      </p>
                    </div>
                    <div className="opacity-95 [&_button:has(svg.lucide-plus)]:hidden [&_button:has(svg.lucide-edit)]:hidden [&_button:has(svg.lucide-trash)]:hidden [&_button:has(svg.lucide-user-plus)]:hidden [&_button[aria-label*='Tạo']]:hidden [&_button[aria-label*='Thêm']]:hidden [&_button[aria-label*='Sửa']]:hidden [&_button[aria-label*='Xóa']]:hidden [&_button:contains('Tạo')]:hidden [&_button:contains('Thêm')]:hidden [&_button:contains('Sửa')]:hidden [&_button:contains('Xóa')]:hidden">
                      <MedicinePage />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="pharmacy" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-green-600" />
                      Nhà thuốc (Chỉ đọc)
                    </CardTitle>
                    <CardDescription>Xem thông tin nhà thuốc - Chế độ chỉ đọc</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <p className="text-green-800 text-sm">
                        <strong>Chế độ chỉ đọc:</strong> Bạn có thể tìm kiếm và lọc dữ liệu, nhưng không thể chỉnh sửa
                        hoặc thêm mới.
                      </p>
                    </div>
                    <div className="opacity-95 [&_button:has(svg.lucide-plus)]:hidden [&_button:has(svg.lucide-edit)]:hidden [&_button:has(svg.lucide-trash)]:hidden [&_button:has(svg.lucide-user-plus)]:hidden [&_button[aria-label*='Tạo']]:hidden [&_button[aria-label*='Thêm']]:hidden [&_button[aria-label*='Sửa']]:hidden [&_button[aria-label*='Xóa']]:hidden [&_button:contains('Tạo')]:hidden [&_button:contains('Thêm')]:hidden [&_button:contains('Sửa')]:hidden [&_button:contains('Xóa')]:hidden">
                      <PharmacyPage />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="blood-bank" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Droplets className="h-5 w-5 text-red-600" />
                      Ngân hàng máu (Chỉ đọc)
                    </CardTitle>
                    <CardDescription>Xem thông tin ngân hàng máu - Chế độ chỉ đọc</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <p className="text-red-800 text-sm">
                        <strong>Chế độ chỉ đọc:</strong> Bạn có thể tìm kiếm và lọc dữ liệu, nhưng không thể chỉnh sửa
                        hoặc thêm mới.
                      </p>
                    </div>
                    <div className="opacity-95 [&_button:has(svg.lucide-plus)]:hidden [&_button:has(svg.lucide-edit)]:hidden [&_button:has(svg.lucide-trash)]:hidden [&_button:has(svg.lucide-user-plus)]:hidden [&_button[aria-label*='Tạo']]:hidden [&_button[aria-label*='Thêm']]:hidden [&_button[aria-label*='Sửa']]:hidden [&_button[aria-label*='Xóa']]:hidden [&_button:contains('Tạo')]:hidden [&_button:contains('Thêm')]:hidden [&_button:contains('Sửa')]:hidden [&_button:contains('Xóa')]:hidden">
                      <BloodBankPage />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="rooms" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5 text-blue-600" />
                      Phòng bệnh (Chỉ đọc)
                    </CardTitle>
                    <CardDescription>Xem thông tin phòng bệnh - Chế độ chỉ đọc</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <p className="text-blue-800 text-sm">
                        <strong>Chế độ chỉ đọc:</strong> Bạn có thể tìm kiếm và lọc dữ liệu, nhưng không thể chỉnh sửa
                        hoặc thêm mới.
                      </p>
                    </div>
                    <div className="opacity-95 [&_button:has(svg.lucide-plus)]:hidden [&_button:has(svg.lucide-edit)]:hidden [&_button:has(svg.lucide-trash)]:hidden [&_button:has(svg.lucide-user-plus)]:hidden [&_button[aria-label*='Tạo']]:hidden [&_button[aria-label*='Thêm']]:hidden [&_button[aria-label*='Sửa']]:hidden [&_button[aria-label*='Xóa']]:hidden [&_button:contains('Tạo')]:hidden [&_button:contains('Thêm')]:hidden [&_button:contains('Sửa')]:hidden [&_button:contains('Xóa')]:hidden">
                      <RoomsPage />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="room-assignments" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bed className="h-5 w-5 text-purple-600" />
                      Phân giường (Chỉ đọc)
                    </CardTitle>
                    <CardDescription>Xem thông tin phân giường - Chế độ chỉ đọc</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                      <p className="text-purple-800 text-sm">
                        <strong>Chế độ chỉ đọc:</strong> Bạn có thể tìm kiếm và lọc dữ liệu, nhưng không thể chỉnh sửa
                        hoặc thêm mới.
                      </p>
                    </div>
                    <div className="opacity-95 [&_button:has(svg.lucide-plus)]:hidden [&_button:has(svg.lucide-edit)]:hidden [&_button:has(svg.lucide-trash)]:hidden [&_button:has(svg.lucide-user-plus)]:hidden [&_button[aria-label*='Tạo']]:hidden [&_button[aria-label*='Thêm']]:hidden [&_button[aria-label*='Sửa']]:hidden [&_button[aria-label*='Xóa']]:hidden [&_button:contains('Tạo')]:hidden [&_button:contains('Thêm')]:hidden [&_button:contains('Sửa')]:hidden [&_button:contains('Xóa')]:hidden">
                      <RoomAssignmentsPage />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
