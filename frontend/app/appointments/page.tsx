"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { DataTable } from "@/components/shared/DataTable"
import { SearchBar } from "@/components/shared/SearchBar"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { CalendarDays, Clock, Plus, Filter } from "lucide-react"

interface Appointment {
  appointment_id: string
  patient: string
  doctor: string
  appointment_date: string
  appointment_time: string
  purpose: string
  status: "Scheduled" | "Completed" | "Cancelled" | "No Show"
  created_at: string
  patient_id: string
  doctor_id: string
}

interface AppointmentForm {
  patient_id: string
  doctor_id: string
  appointment_date: string
  appointment_time: string
  purpose: string
}

// Mock data
const mockAppointments: Appointment[] = [
  {
    appointment_id: "APT001",
    patient: "Nguyễn Văn An",
    doctor: "BS. Trần Thị Bình",
    appointment_date: "2024-01-15",
    appointment_time: "09:00",
    purpose: "Khám tổng quát",
    status: "Scheduled",
    created_at: "2024-01-10T08:00:00Z",
    patient_id: "P001",
    doctor_id: "D001",
  },
  {
    appointment_id: "APT002",
    patient: "Lê Thị Cẩm",
    doctor: "BS. Phạm Văn Đức",
    appointment_date: "2024-01-15",
    appointment_time: "10:30",
    purpose: "Khám tim mạch",
    status: "Completed",
    created_at: "2024-01-12T10:15:00Z",
    patient_id: "P002",
    doctor_id: "D002",
  },
  {
    appointment_id: "APT003",
    patient: "Hoàng Minh Đức",
    doctor: "BS. Nguyễn Thị Em",
    appointment_date: "2024-01-16",
    appointment_time: "14:00",
    purpose: "Khám da liễu",
    status: "Cancelled",
    created_at: "2024-01-13T14:30:00Z",
    patient_id: "P003",
    doctor_id: "D003",
  },
]

const mockPatients = [
  { id: "P001", name: "Nguyễn Văn An" },
  { id: "P002", name: "Lê Thị Cẩm" },
  { id: "P003", name: "Hoàng Minh Đức" },
]

const mockDoctors = [
  { id: "D001", name: "BS. Trần Thị Bình", specialty: "Nội khoa" },
  { id: "D002", name: "BS. Phạm Văn Đức", specialty: "Tim mạch" },
  { id: "D003", name: "BS. Nguyễn Thị Em", specialty: "Da liễu" },
]

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments)
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>(mockAppointments)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDoctor, setSelectedDoctor] = useState("all")
  const [selectedPatient, setSelectedPatient] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [deleteAppointment, setDeleteAppointment] = useState<Appointment | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)

  const [formData, setFormData] = useState<AppointmentForm>({
    patient_id: "",
    doctor_id: "",
    appointment_date: "",
    appointment_time: "",
    purpose: "",
  })

  // Filter appointments
  useEffect(() => {
    const filtered = appointments.filter((appointment) => {
      const matchesSearch =
        searchQuery === "" ||
        appointment.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.purpose.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesDoctor = selectedDoctor === "all" || appointment.doctor_id === selectedDoctor
      const matchesPatient = selectedPatient === "all" || appointment.patient_id === selectedPatient
      const matchesStatus = selectedStatus === "all" || appointment.status === selectedStatus

      const appointmentDate = new Date(appointment.appointment_date)
      const matchesDateFrom = !dateFrom || appointmentDate >= new Date(dateFrom)
      const matchesDateTo = !dateTo || appointmentDate <= new Date(dateTo)

      return matchesSearch && matchesDoctor && matchesPatient && matchesStatus && matchesDateFrom && matchesDateTo
    })

    setFilteredAppointments(filtered)
    setCurrentPage(1)
  }, [appointments, searchQuery, selectedDoctor, selectedPatient, selectedStatus, dateFrom, dateTo])

  // Check for doctor time conflicts
  const checkTimeConflict = (doctorId: string, date: string, time: string, excludeId?: string): boolean => {
    return appointments.some(
      (apt) =>
        apt.doctor_id === doctorId &&
        apt.appointment_date === date &&
        apt.appointment_time === time &&
        apt.status !== "Cancelled" &&
        apt.appointment_id !== excludeId,
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (
      !formData.patient_id ||
      !formData.doctor_id ||
      !formData.appointment_date ||
      !formData.appointment_time ||
      !formData.purpose
    ) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin",
        variant: "destructive",
      })
      return
    }

    // Check for time conflicts
    if (
      checkTimeConflict(
        formData.doctor_id,
        formData.appointment_date,
        formData.appointment_time,
        editingAppointment?.appointment_id,
      )
    ) {
      toast({
        title: "Lỗi",
        description: "Bác sĩ đã có lịch hẹn vào thời gian này",
        variant: "destructive",
      })
      return
    }

    if (editingAppointment) {
      // Update appointment
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.appointment_id === editingAppointment.appointment_id
            ? {
                ...apt,
                patient_id: formData.patient_id,
                doctor_id: formData.doctor_id,
                patient: mockPatients.find((p) => p.id === formData.patient_id)?.name || "",
                doctor: mockDoctors.find((d) => d.id === formData.doctor_id)?.name || "",
                appointment_date: formData.appointment_date,
                appointment_time: formData.appointment_time,
                purpose: formData.purpose,
              }
            : apt,
        ),
      )
      toast({
        title: "Thành công",
        description: "Cập nhật lịch hẹn thành công",
      })
    } else {
      // Create new appointment
      const newAppointment: Appointment = {
        appointment_id: `APT${String(appointments.length + 1).padStart(3, "0")}`,
        patient_id: formData.patient_id,
        doctor_id: formData.doctor_id,
        patient: mockPatients.find((p) => p.id === formData.patient_id)?.name || "",
        doctor: mockDoctors.find((d) => d.id === formData.doctor_id)?.name || "",
        appointment_date: formData.appointment_date,
        appointment_time: formData.appointment_time,
        purpose: formData.purpose,
        status: "Scheduled",
        created_at: new Date().toISOString(),
      }

      setAppointments((prev) => [...prev, newAppointment])
      toast({
        title: "Thành công",
        description: "Tạo lịch hẹn thành công",
      })
    }

    resetForm()
  }

  const resetForm = () => {
    setFormData({
      patient_id: "",
      doctor_id: "",
      appointment_date: "",
      appointment_time: "",
      purpose: "",
    })
    setEditingAppointment(null)
    setIsFormOpen(false)
  }

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment)
    setFormData({
      patient_id: appointment.patient_id,
      doctor_id: appointment.doctor_id,
      appointment_date: appointment.appointment_date,
      appointment_time: appointment.appointment_time,
      purpose: appointment.purpose,
    })
    setIsFormOpen(true)
  }

  const handleStatusUpdate = (
    appointmentId: string,
    newStatus: "Scheduled" | "Completed" | "Cancelled" | "No Show",
  ) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.appointment_id === appointmentId ? { ...apt, status: newStatus } : apt)),
    )
    toast({
      title: "Thành công",
      description: "Cập nhật trạng thái thành công",
    })
  }

  const handleDelete = () => {
    if (deleteAppointment) {
      setAppointments((prev) => prev.filter((apt) => apt.appointment_id !== deleteAppointment.appointment_id))
      toast({
        title: "Thành công",
        description: "Hủy lịch hẹn thành công",
      })
      setDeleteAppointment(null)
    }
  }

  const clearFilters = () => {
    setSelectedDoctor("all")
    setSelectedPatient("all")
    setSelectedStatus("all")
    setDateFrom("")
    setDateTo("")
    setSearchQuery("")
  }

  const columns = [
    {
      key: "appointment_id",
      label: "Mã lịch hẹn",
      sortable: true,
    },
    {
      key: "patient",
      label: "Bệnh nhân",
      sortable: true,
    },
    {
      key: "doctor",
      label: "Bác sĩ",
      sortable: true,
    },
    {
      key: "appointment_date",
      label: "Ngày hẹn",
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString("vi-VN"),
    },
    {
      key: "appointment_time",
      label: "Giờ hẹn",
      sortable: true,
    },
    {
      key: "purpose",
      label: "Mục đích",
      sortable: false,
    },
    {
      key: "status",
      label: "Trạng thái",
      sortable: true,
      render: (value: string) => <StatusBadge status={value} type="appointment" />,
    },
    {
      key: "created_at",
      label: "Ngày tạo",
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString("vi-VN"),
    },
    {
      key: "actions",
      label: "Hành động",
      sortable: false,
      render: (_: any, appointment: Appointment) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => handleEdit(appointment)}>
            Sửa
          </Button>
          <Select
            value={appointment.status}
            onValueChange={(value) => handleStatusUpdate(appointment.appointment_id, value as any)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Scheduled">Đã lên lịch</SelectItem>
              <SelectItem value="Completed">Hoàn thành</SelectItem>
              <SelectItem value="Cancelled">Đã hủy</SelectItem>
              <SelectItem value="No Show">Không đến</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="destructive" onClick={() => setDeleteAppointment(appointment)}>
            Hủy
          </Button>
        </div>
      ),
    },
  ]

  const totalPages = Math.ceil(filteredAppointments.length / pageSize)
  const paginatedData = filteredAppointments.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quản lý Lịch hẹn</h1>
          <p className="text-muted-foreground">Quản lý và theo dõi lịch hẹn của bệnh viện</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingAppointment(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Tạo lịch hẹn mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingAppointment ? "Cập nhật lịch hẹn" : "Tạo lịch hẹn mới"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="patient_id">Bệnh nhân *</Label>
                <Select
                  value={formData.patient_id}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, patient_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn bệnh nhân" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockPatients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="doctor_id">Bác sĩ *</Label>
                <Select
                  value={formData.doctor_id}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, doctor_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn bác sĩ" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockDoctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.name} - {doctor.specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="appointment_date">Ngày hẹn *</Label>
                  <Input
                    id="appointment_date"
                    type="date"
                    value={formData.appointment_date}
                    onChange={(e) => setFormData((prev) => ({ ...prev, appointment_date: e.target.value }))}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div>
                  <Label htmlFor="appointment_time">Giờ hẹn *</Label>
                  <Input
                    id="appointment_time"
                    type="time"
                    value={formData.appointment_time}
                    onChange={(e) => setFormData((prev) => ({ ...prev, appointment_time: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="purpose">Mục đích khám *</Label>
                <Textarea
                  id="purpose"
                  value={formData.purpose}
                  onChange={(e) => setFormData((prev) => ({ ...prev, purpose: e.target.value }))}
                  placeholder="Nhập mục đích khám..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingAppointment ? "Cập nhật" : "Tạo lịch hẹn"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Hủy
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng lịch hẹn</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hôm nay</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {appointments.filter((apt) => apt.appointment_date === new Date().toISOString().split("T")[0]).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã hoàn thành</CardTitle>
            <CalendarDays className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointments.filter((apt) => apt.status === "Completed").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã hủy</CardTitle>
            <CalendarDays className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointments.filter((apt) => apt.status === "Cancelled").length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <Label>Bác sĩ</Label>
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả bác sĩ</SelectItem>
                  {mockDoctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Bệnh nhân</Label>
              <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả bệnh nhân</SelectItem>
                  {mockPatients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Trạng thái</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="Scheduled">Đã lên lịch</SelectItem>
                  <SelectItem value="Completed">Hoàn thành</SelectItem>
                  <SelectItem value="Cancelled">Đã hủy</SelectItem>
                  <SelectItem value="No Show">Không đến</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Từ ngày</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>

            <div>
              <Label>Đến ngày</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters} className="w-full bg-transparent">
                Xóa bộ lọc
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Danh sách lịch hẹn</CardTitle>
            <div className="w-80">
              <SearchBar placeholder="Tìm kiếm theo bệnh nhân, bác sĩ, mục đích..." onSearch={setSearchQuery} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={paginatedData}
            total={filteredAppointments.length}
            page={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onSort={() => {}}
            onFilter={() => {}}
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteAppointment}
        onOpenChange={() => setDeleteAppointment(null)}
        onConfirm={handleDelete}
        title="Xác nhận hủy lịch hẹn"
        description={`Bạn có chắc chắn muốn hủy lịch hẹn ${deleteAppointment?.appointment_id}? Hành động này không thể hoàn tác.`}
      />
    </div>
  )
}
