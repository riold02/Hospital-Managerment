"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Clock, User, FileText, Edit3, Search, LogOut, Activity, Users, Pill, Building2 } from "lucide-react"
import AppointmentsPage from "@/app/appointments/page"
import MedicinePage from "@/app/medicine/page"
import PharmacyPage from "@/app/pharmacy/page"
import StaffPage from "@/app/staff/page"
import { apiClient, ApiError } from "@/lib/api-client"

interface Appointment {
  id: string
  time: string
  patient_name: string
  doctor_name: string
  purpose: string
  status: "Scheduled" | "In Progress" | "Completed" | "Cancelled"
  priority: "Low" | "Medium" | "High"
}

interface MedicalRecord {
  id: string
  patient_name: string
  doctor_name: string
  diagnosis: string
  treatment: string
  created_at: string
  status: "Draft" | "Completed" | "Under Review"
}

export default function LabDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null)
  const [internalNotes, setInternalNotes] = useState("")
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        console.log("[v0] Loading lab dashboard data from API")

        // Fetch today's lab appointments
        const appointmentsData = await apiClient.getAppointments(new Date().toISOString().split("T")[0])
        const labAppointments = appointmentsData.filter(
          (apt: any) =>
            apt.purpose?.toLowerCase().includes("xét nghiệm") ||
            apt.purpose?.toLowerCase().includes("x-quang") ||
            apt.purpose?.toLowerCase().includes("siêu âm"),
        )
        setAppointments(labAppointments)

        // Fetch recent medical records for review
        const recordsData = await apiClient.getMedicalRecords()
        setMedicalRecords(recordsData.slice(0, 20)) // Get latest 20 records
      } catch (error) {
        console.error("[v0] Error fetching lab data:", error)
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

    fetchData()
  }, [toast])

  const handleAddInternalNotes = async () => {
    if (!selectedRecord || !internalNotes.trim()) return

    try {
      console.log("[v0] Adding internal notes to medical record:", selectedRecord.id)

      const updatedTreatment = `${selectedRecord.treatment}\n\nGhi chú nội bộ: ${internalNotes}`

      await apiClient.put(`/medical-records/${selectedRecord.id}`, {
        ...selectedRecord,
        treatment: updatedTreatment,
      })

      setMedicalRecords((prev) =>
        prev.map((record) => (record.id === selectedRecord.id ? { ...record, treatment: updatedTreatment } : record)),
      )

      toast({
        title: "Thành công",
        description: "Đã thêm ghi chú nội bộ vào hồ sơ y tế.",
      })

      setInternalNotes("")
      setIsNotesDialogOpen(false)
      setSelectedRecord(null)
    } catch (error) {
      console.error("[v0] Error adding internal notes:", error)
      toast({
        title: "Lỗi",
        description: "Không thể thêm ghi chú. Vui lòng thử lại.",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "bg-blue-100 text-blue-800"
      case "In Progress":
        return "bg-yellow-100 text-yellow-800"
      case "Completed":
        return "bg-green-100 text-green-800"
      case "Cancelled":
        return "bg-red-100 text-red-800"
      case "Under Review":
        return "bg-orange-100 text-orange-800"
      case "Draft":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800"
      case "Medium":
        return "bg-yellow-100 text-yellow-800"
      case "Low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredRecords = medicalRecords.filter(
    (record) =>
      record.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.doctor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải dữ liệu từ server...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Vertical Sidebar */}
      <div className="w-64 bg-purple-50 border-r border-purple-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-purple-200">
          <h2 className="text-xl font-bold text-purple-900">Phòng Lab</h2>
          <p className="text-sm text-purple-600">Hỗ trợ xét nghiệm</p>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4">
          <div className="space-y-2">
            <Button
              variant={activeTab === "overview" ? "secondary" : "ghost"}
              className={`w-full justify-start h-12 px-4 ${
                activeTab === "overview" ? "bg-purple-100 text-purple-900" : "hover:bg-purple-50 text-gray-700"
              }`}
              onClick={() => setActiveTab("overview")}
            >
              <Activity className="h-4 w-4 mr-3" />
              Tổng quan
            </Button>
            <Button
              variant={activeTab === "appointments" ? "secondary" : "ghost"}
              className={`w-full justify-start h-12 px-4 ${
                activeTab === "appointments" ? "bg-purple-100 text-purple-900" : "hover:bg-purple-50 text-gray-700"
              }`}
              onClick={() => setActiveTab("appointments")}
            >
              <Clock className="h-4 w-4 mr-3" />
              Lịch hẹn hỗ trợ
            </Button>
            <Button
              variant={activeTab === "medical-records" ? "secondary" : "ghost"}
              className={`w-full justify-start h-12 px-4 ${
                activeTab === "medical-records" ? "bg-purple-100 text-purple-900" : "hover:bg-purple-50 text-gray-700"
              }`}
              onClick={() => setActiveTab("medical-records")}
            >
              <FileText className="h-4 w-4 mr-3" />
              Hồ sơ y tế
            </Button>
            <Button
              variant={activeTab === "admin-appointments" ? "secondary" : "ghost"}
              className={`w-full justify-start h-12 px-4 ${
                activeTab === "admin-appointments"
                  ? "bg-purple-100 text-purple-900"
                  : "hover:bg-purple-50 text-gray-700"
              }`}
              onClick={() => setActiveTab("admin-appointments")}
            >
              <Calendar className="h-4 w-4 mr-3" />
              Lịch hẹn
              <Badge className="ml-auto bg-purple-100 text-purple-700 text-xs">Chỉ đọc</Badge>
            </Button>
            <Button
              variant={activeTab === "medicine" ? "secondary" : "ghost"}
              className={`w-full justify-start h-12 px-4 ${
                activeTab === "medicine" ? "bg-purple-100 text-purple-900" : "hover:bg-purple-50 text-gray-700"
              }`}
              onClick={() => setActiveTab("medicine")}
            >
              <Pill className="h-4 w-4 mr-3" />
              Thuốc
              <Badge className="ml-auto bg-purple-100 text-purple-700 text-xs">Chỉ đọc</Badge>
            </Button>
            <Button
              variant={activeTab === "pharmacy" ? "secondary" : "ghost"}
              className={`w-full justify-start h-12 px-4 ${
                activeTab === "pharmacy" ? "bg-purple-100 text-purple-900" : "hover:bg-purple-50 text-gray-700"
              }`}
              onClick={() => setActiveTab("pharmacy")}
            >
              <Building2 className="h-4 w-4 mr-3" />
              Nhà thuốc
              <Badge className="ml-auto bg-purple-100 text-purple-700 text-xs">Chỉ đọc</Badge>
            </Button>
            <Button
              variant={activeTab === "staff" ? "secondary" : "ghost"}
              className={`w-full justify-start h-12 px-4 ${
                activeTab === "staff" ? "bg-purple-100 text-purple-900" : "hover:bg-purple-50 text-gray-700"
              }`}
              onClick={() => setActiveTab("staff")}
            >
              <Users className="h-4 w-4 mr-3" />
              Nhân viên
              <Badge className="ml-auto bg-purple-100 text-purple-700 text-xs">Chỉ đọc</Badge>
            </Button>
          </div>
        </div>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-purple-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-purple-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-purple-900">Kỹ thuật viên Lab</p>
              <p className="text-xs text-purple-600">lab@hospital.com</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full border-purple-200 text-purple-700 hover:bg-purple-50 bg-transparent"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Đăng xuất
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Bảng Điều Khiển Phòng Lab</h1>
                <p className="text-muted-foreground">Quản lý hỗ trợ xét nghiệm và hồ sơ y tế</p>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{new Date().toLocaleDateString("vi-VN")}</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Hẹn hôm nay</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{appointments.length}</div>
                  <p className="text-xs text-muted-foreground">Cần hỗ trợ</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Hồ sơ mới</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{medicalRecords.length}</div>
                  <p className="text-xs text-muted-foreground">Cần xem xét</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Ưu tiên cao</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {appointments.filter((a) => a.priority === "High").length}
                  </div>
                  <p className="text-xs text-muted-foreground">Cần xử lý ngay</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === "appointments" && (
          <div className="p-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Hẹn Cần Hỗ Trợ Hôm Nay
                </CardTitle>
                <CardDescription>Danh sách các cuộc hẹn cần hỗ trợ từ phòng lab</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Giờ</th>
                        <th className="text-left p-2">Bệnh nhân</th>
                        <th className="text-left p-2">Bác sĩ</th>
                        <th className="text-left p-2">Mục đích</th>
                        <th className="text-left p-2">Ưu tiên</th>
                        <th className="text-left p-2">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((appointment) => (
                        <tr key={appointment.id} className="border-b hover:bg-muted/50">
                          <td className="p-2 font-medium">{appointment.time}</td>
                          <td className="p-2">{appointment.patient_name}</td>
                          <td className="p-2">{appointment.doctor_name}</td>
                          <td className="p-2">{appointment.purpose}</td>
                          <td className="p-2">
                            <Badge className={getPriorityColor(appointment.priority)}>
                              {appointment.priority === "High"
                                ? "Cao"
                                : appointment.priority === "Medium"
                                  ? "Trung bình"
                                  : "Thấp"}
                            </Badge>
                          </td>
                          <td className="p-2">
                            <Badge className={getStatusColor(appointment.status)}>
                              {appointment.status === "Scheduled"
                                ? "Đã lên lịch"
                                : appointment.status === "In Progress"
                                  ? "Đang thực hiện"
                                  : appointment.status === "Completed"
                                    ? "Hoàn thành"
                                    : "Đã hủy"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Medical Records Tab */}
        {activeTab === "medical-records" && (
          <div className="p-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Hồ Sơ Y Tế Mới
                </CardTitle>
                <CardDescription>Danh sách 20 hồ sơ y tế mới nhất</CardDescription>
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm kiếm hồ sơ..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredRecords.map((record) => (
                    <div key={record.id} className="border rounded-lg p-4 hover:bg-muted/50">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{record.patient_name}</span>
                            <Badge className={getStatusColor(record.status)}>
                              {record.status === "Draft"
                                ? "Bản nháp"
                                : record.status === "Under Review"
                                  ? "Đang xem xét"
                                  : "Hoàn thành"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">Bác sĩ: {record.doctor_name}</p>
                          <p className="text-sm">
                            <span className="font-medium">Chẩn đoán:</span> {record.diagnosis}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Điều trị:</span> {record.treatment}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(record.created_at).toLocaleString("vi-VN")}
                          </p>
                        </div>
                        <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedRecord(record)}
                              className="ml-4"
                            >
                              <Edit3 className="h-4 w-4 mr-1" />
                              Ghi chú nội bộ
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Thêm Ghi Chú Nội Bộ</DialogTitle>
                              <DialogDescription>
                                Thêm ghi chú nội bộ cho hồ sơ của {selectedRecord?.patient_name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="notes">Ghi chú</Label>
                                <Textarea
                                  id="notes"
                                  placeholder="Nhập ghi chú nội bộ..."
                                  value={internalNotes}
                                  onChange={(e) => setInternalNotes(e.target.value)}
                                  rows={4}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setIsNotesDialogOpen(false)
                                  setInternalNotes("")
                                  setSelectedRecord(null)
                                }}
                              >
                                Hủy
                              </Button>
                              <Button onClick={handleAddInternalNotes}>Thêm Ghi Chú</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "admin-appointments" && (
          <div className="p-6">
            <div className="mb-4">
              <Badge className="bg-purple-100 text-purple-700">Chế độ chỉ đọc - Không thể chỉnh sửa</Badge>
            </div>
            <div className="lab-readonly-mode">
              <AppointmentsPage />
            </div>
          </div>
        )}

        {activeTab === "medicine" && (
          <div className="p-6">
            <div className="mb-4">
              <Badge className="bg-purple-100 text-purple-700">Chế độ chỉ đọc - Không thể chỉnh sửa</Badge>
            </div>
            <div className="lab-readonly-mode">
              <MedicinePage />
            </div>
          </div>
        )}

        {activeTab === "pharmacy" && (
          <div className="p-6">
            <div className="mb-4">
              <Badge className="bg-purple-100 text-purple-700">Chế độ chỉ đọc - Không thể chỉnh sửa</Badge>
            </div>
            <div className="lab-readonly-mode">
              <PharmacyPage />
            </div>
          </div>
        )}

        {activeTab === "staff" && (
          <div className="p-6">
            <div className="mb-4">
              <Badge className="bg-purple-100 text-purple-700">Chế độ chỉ đọc - Không thể chỉnh sửa</Badge>
            </div>
            <div className="lab-readonly-mode">
              <StaffPage />
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .lab-readonly-mode button:not(.lucide):not([role="tab"]):not([role="combobox"]):not([aria-haspopup="listbox"]) {
          display: none !important;
        }
        .lab-readonly-mode input:not([type="search"]):not([placeholder*="tìm"]):not([placeholder*="Tìm"]) {
          pointer-events: none !important;
          background-color: #f3f4f6 !important;
        }
        .lab-readonly-mode textarea {
          pointer-events: none !important;
          background-color: #f3f4f6 !important;
        }
        .lab-readonly-mode select {
          pointer-events: none !important;
          background-color: #f3f4f6 !important;
        }
        .lab-readonly-mode [role="dialog"] {
          display: none !important;
        }
        .lab-readonly-mode .lucide-plus,
        .lab-readonly-mode .lucide-edit,
        .lab-readonly-mode .lucide-trash,
        .lab-readonly-mode .lucide-edit-3 {
          display: none !important;
        }
      `}</style>
    </div>
  )
}
