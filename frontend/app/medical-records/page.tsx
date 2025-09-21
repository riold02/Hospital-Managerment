"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "@/hooks/use-toast"
import { CalendarIcon, Plus, Edit, Trash2, FileText, Pill } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

import { DataTable } from "@/components/shared/DataTable"
import { SearchBar } from "@/components/shared/SearchBar"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { KpiCard } from "@/components/shared/KpiCard"

interface MedicalRecord {
  record_id: string
  patient_name: string
  patient_id: string
  doctor_name: string
  doctor_id: string
  appointment_id?: string
  diagnosis: string
  treatment: string
  prescription: string
  created_at: string
  status: "Draft" | "Completed" | "Under Review"
}

interface MedicalRecordMedicine {
  id: string
  record_id: string
  medicine_id: string
  medicine_name: string
  dosage: string
}

interface Patient {
  id: string
  name: string
}

interface Doctor {
  id: string
  name: string
}

interface Medicine {
  id: string
  name: string
  type: string
}

interface Appointment {
  id: string
  patient_name: string
  doctor_name: string
  date: string
  time: string
}

export default function MedicalRecordsPage() {
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [recordMedicines, setRecordMedicines] = useState<MedicalRecordMedicine[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<string>("all")
  const [selectedDoctor, setSelectedDoctor] = useState<string>("all")
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null)
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null)
  const [isMedicineDialogOpen, setIsMedicineDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)

  // Form states
  const [formData, setFormData] = useState({
    patient_id: "",
    doctor_id: "",
    appointment_id: "none",
    diagnosis: "",
    treatment: "",
    prescription: "",
  })

  // Medicine form states
  const [medicineForm, setMedicineForm] = useState({
    medicine_id: "",
    dosage: "",
  })

  // Mock data
  useEffect(() => {
    const mockRecords: MedicalRecord[] = [
      {
        record_id: "MR001",
        patient_name: "Nguyễn Văn An",
        patient_id: "P001",
        doctor_name: "BS. Trần Thị Bình",
        doctor_id: "D001",
        appointment_id: "A001",
        diagnosis: "Viêm họng cấp",
        treatment: "Nghỉ ngơi, uống nhiều nước, dùng thuốc kháng sinh",
        prescription: "Amoxicillin 500mg x 3 lần/ngày x 7 ngày",
        created_at: "2024-01-15T10:30:00Z",
        status: "Completed",
      },
      {
        record_id: "MR002",
        patient_name: "Lê Thị Cẩm",
        patient_id: "P002",
        doctor_name: "BS. Phạm Văn Dũng",
        doctor_id: "D002",
        appointment_id: "A002",
        diagnosis: "Tăng huyết áp",
        treatment: "Chế độ ăn ít muối, tập thể dục nhẹ",
        prescription: "Amlodipine 5mg x 1 lần/ngày",
        created_at: "2024-01-14T14:15:00Z",
        status: "Under Review",
      },
    ]

    const mockPatients: Patient[] = [
      { id: "P001", name: "Nguyễn Văn An" },
      { id: "P002", name: "Lê Thị Cẩm" },
      { id: "P003", name: "Trần Văn Bình" },
    ]

    const mockDoctors: Doctor[] = [
      { id: "D001", name: "BS. Trần Thị Bình" },
      { id: "D002", name: "BS. Phạm Văn Dũng" },
      { id: "D003", name: "BS. Lê Văn Cường" },
    ]

    const mockMedicines: Medicine[] = [
      { id: "M001", name: "Amoxicillin 500mg", type: "Kháng sinh" },
      { id: "M002", name: "Amlodipine 5mg", type: "Hạ huyết áp" },
      { id: "M003", name: "Paracetamol 500mg", type: "Giảm đau" },
    ]

    const mockAppointments: Appointment[] = [
      {
        id: "A001",
        patient_name: "Nguyễn Văn An",
        doctor_name: "BS. Trần Thị Bình",
        date: "2024-01-15",
        time: "10:00",
      },
      { id: "A002", patient_name: "Lê Thị Cẩm", doctor_name: "BS. Phạm Văn Dũng", date: "2024-01-14", time: "14:00" },
    ]

    const mockRecordMedicines: MedicalRecordMedicine[] = [
      {
        id: "RM001",
        record_id: "MR001",
        medicine_id: "M001",
        medicine_name: "Amoxicillin 500mg",
        dosage: "3 lần/ngày x 7 ngày",
      },
      { id: "RM002", record_id: "MR002", medicine_id: "M002", medicine_name: "Amlodipine 5mg", dosage: "1 lần/ngày" },
    ]

    setTimeout(() => {
      setRecords(mockRecords)
      setPatients(mockPatients)
      setDoctors(mockDoctors)
      setMedicines(mockMedicines)
      setAppointments(mockAppointments)
      setRecordMedicines(mockRecordMedicines)
      setLoading(false)
    }, 1000)
  }, [])

  // Filter records
  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      searchQuery === "" ||
      record.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.doctor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.record_id.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesPatient = selectedPatient === "all" || record.patient_id === selectedPatient
    const matchesDoctor = selectedDoctor === "all" || record.doctor_id === selectedDoctor

    const recordDate = new Date(record.created_at)
    const matchesDateRange =
      (!dateRange.from || recordDate >= dateRange.from) && (!dateRange.to || recordDate <= dateRange.to)

    return matchesSearch && matchesPatient && matchesDoctor && matchesDateRange
  })

  // Pagination
  const totalRecords = filteredRecords.length
  const totalPages = Math.ceil(totalRecords / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedRecords = filteredRecords.slice(startIndex, startIndex + pageSize)

  // Table columns
  const columns = [
    { key: "record_id", label: "Mã hồ sơ", sortable: true },
    { key: "patient_name", label: "Bệnh nhân", sortable: true },
    { key: "doctor_name", label: "Bác sĩ", sortable: true },
    { key: "appointment_id", label: "Mã cuộc hẹn", sortable: false },
    { key: "diagnosis", label: "Chẩn đoán", sortable: false },
    { key: "created_at", label: "Ngày tạo", sortable: true },
    { key: "actions", label: "Hành động", sortable: false },
  ]

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.patient_id || !formData.doctor_id || !formData.diagnosis) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc",
        variant: "destructive",
      })
      return
    }

    const patient = patients.find((p) => p.id === formData.patient_id)
    const doctor = doctors.find((d) => d.id === formData.doctor_id)

    const recordData: MedicalRecord = {
      record_id: editingRecord ? editingRecord.record_id : `MR${String(records.length + 1).padStart(3, "0")}`,
      patient_name: patient?.name || "",
      patient_id: formData.patient_id,
      doctor_name: doctor?.name || "",
      doctor_id: formData.doctor_id,
      appointment_id: formData.appointment_id === "none" ? undefined : formData.appointment_id || undefined,
      diagnosis: formData.diagnosis,
      treatment: formData.treatment,
      prescription: formData.prescription,
      created_at: editingRecord ? editingRecord.created_at : new Date().toISOString(),
      status: "Draft",
    }

    if (editingRecord) {
      setRecords(records.map((r) => (r.record_id === editingRecord.record_id ? recordData : r)))
      toast({
        title: "Thành công",
        description: "Cập nhật hồ sơ y tế thành công",
      })
    } else {
      setRecords([...records, recordData])
      toast({
        title: "Thành công",
        description: "Tạo hồ sơ y tế mới thành công",
      })
    }

    setIsFormOpen(false)
    setEditingRecord(null)
    setFormData({
      patient_id: "",
      doctor_id: "",
      appointment_id: "none",
      diagnosis: "",
      treatment: "",
      prescription: "",
    })
  }

  // Handle delete
  const handleDelete = async (recordId: string) => {
    setRecords(records.filter((r) => r.record_id !== recordId))
    setRecordMedicines(recordMedicines.filter((rm) => rm.record_id !== recordId))
    toast({
      title: "Thành công",
      description: "Xóa hồ sơ y tế thành công",
    })
  }

  // Handle edit
  const handleEdit = (record: MedicalRecord) => {
    setEditingRecord(record)
    setFormData({
      patient_id: record.patient_id,
      doctor_id: record.doctor_id,
      appointment_id: record.appointment_id || "none",
      diagnosis: record.diagnosis,
      treatment: record.treatment,
      prescription: record.prescription,
    })
    setIsFormOpen(true)
  }

  // Handle add medicine to record
  const handleAddMedicine = async () => {
    if (!selectedRecord || !medicineForm.medicine_id || !medicineForm.dosage) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn thuốc và nhập liều dùng",
        variant: "destructive",
      })
      return
    }

    const medicine = medicines.find((m) => m.id === medicineForm.medicine_id)
    const newRecordMedicine: MedicalRecordMedicine = {
      id: `RM${String(recordMedicines.length + 1).padStart(3, "0")}`,
      record_id: selectedRecord.record_id,
      medicine_id: medicineForm.medicine_id,
      medicine_name: medicine?.name || "",
      dosage: medicineForm.dosage,
    }

    setRecordMedicines([...recordMedicines, newRecordMedicine])
    setMedicineForm({ medicine_id: "", dosage: "" })
    toast({
      title: "Thành công",
      description: "Thêm thuốc vào hồ sơ thành công",
    })
  }

  // Handle remove medicine from record
  const handleRemoveMedicine = async (medicineId: string) => {
    setRecordMedicines(recordMedicines.filter((rm) => rm.id !== medicineId))
    toast({
      title: "Thành công",
      description: "Xóa thuốc khỏi hồ sơ thành công",
    })
  }

  // Render table row
  const renderRow = (record: MedicalRecord) => (
    <tr key={record.record_id} className="border-b hover:bg-muted/50">
      <td className="px-4 py-3 font-medium">{record.record_id}</td>
      <td className="px-4 py-3">{record.patient_name}</td>
      <td className="px-4 py-3">{record.doctor_name}</td>
      <td className="px-4 py-3">{record.appointment_id || "-"}</td>
      <td className="px-4 py-3 max-w-xs truncate">{record.diagnosis}</td>
      <td className="px-4 py-3">{format(new Date(record.created_at), "dd/MM/yyyy", { locale: vi })}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedRecord(record)
              setIsMedicineDialogOpen(true)
            }}
          >
            <FileText className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleEdit(record)}>
            <Edit className="h-4 w-4" />
          </Button>
          <ConfirmDialog
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa hồ sơ y tế này không?"
            onConfirm={() => handleDelete(record.record_id)}
          >
            <Button variant="outline" size="sm">
              <Trash2 className="h-4 w-4" />
            </Button>
          </ConfirmDialog>
        </div>
      </td>
    </tr>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Hồ sơ Y tế</h1>
          <p className="text-muted-foreground">Quản lý hồ sơ khám bệnh và điều trị</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingRecord(null)
                setFormData({
                  patient_id: "",
                  doctor_id: "",
                  appointment_id: "none",
                  diagnosis: "",
                  treatment: "",
                  prescription: "",
                })
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Tạo hồ sơ mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingRecord ? "Chỉnh sửa hồ sơ y tế" : "Tạo hồ sơ y tế mới"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patient_id">Bệnh nhân *</Label>
                  <Select
                    value={formData.patient_id}
                    onValueChange={(value) => setFormData({ ...formData, patient_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn bệnh nhân" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
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
                    onValueChange={(value) => setFormData({ ...formData, doctor_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn bác sĩ" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          {doctor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="appointment_id">Cuộc hẹn</Label>
                <Select
                  value={formData.appointment_id}
                  onValueChange={(value) => setFormData({ ...formData, appointment_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn cuộc hẹn (tùy chọn)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Không liên kết</SelectItem>
                    {appointments.map((appointment) => (
                      <SelectItem key={appointment.id} value={appointment.id}>
                        {appointment.patient_name} - {appointment.doctor_name} ({appointment.date} {appointment.time})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="diagnosis">Chẩn đoán *</Label>
                <Textarea
                  id="diagnosis"
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  placeholder="Nhập chẩn đoán..."
                  required
                />
              </div>
              <div>
                <Label htmlFor="treatment">Điều trị</Label>
                <Textarea
                  id="treatment"
                  value={formData.treatment}
                  onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                  placeholder="Nhập phương pháp điều trị..."
                />
              </div>
              <div>
                <Label htmlFor="prescription">Đơn thuốc</Label>
                <Textarea
                  id="prescription"
                  value={formData.prescription}
                  onChange={(e) => setFormData({ ...formData, prescription: e.target.value })}
                  placeholder="Nhập đơn thuốc..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit">{editingRecord ? "Cập nhật" : "Tạo mới"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard label="Tổng hồ sơ" value={records.length.toString()} />
        <KpiCard
          label="Hồ sơ hôm nay"
          value={records
            .filter((r) => format(new Date(r.created_at), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd"))
            .length.toString()}
        />
        <KpiCard label="Đang xem xét" value={records.filter((r) => r.status === "Under Review").length.toString()} />
        <KpiCard label="Hoàn thành" value={records.filter((r) => r.status === "Completed").length.toString()} />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Tìm kiếm</Label>
              <SearchBar onSearch={setSearchQuery} placeholder="Tìm theo tên, chẩn đoán..." />
            </div>
            <div>
              <Label>Bệnh nhân</Label>
              <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn bệnh nhân" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả bệnh nhân</SelectItem>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Bác sĩ</Label>
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn bác sĩ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả bác sĩ</SelectItem>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Khoảng ngày</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd/MM/yyyy", { locale: vi })} -{" "}
                          {format(dateRange.to, "dd/MM/yyyy", { locale: vi })}
                        </>
                      ) : (
                        format(dateRange.from, "dd/MM/yyyy", { locale: vi })
                      )
                    ) : (
                      "Chọn khoảng ngày"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    locale={vi}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={paginatedRecords}
        total={totalRecords}
        page={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        renderRow={renderRow}
        emptyMessage="Không có hồ sơ y tế nào"
      />

      {/* Medicine Management Dialog */}
      <Dialog open={isMedicineDialogOpen} onOpenChange={setIsMedicineDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Chi tiết hồ sơ - {selectedRecord?.patient_name}</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Thông tin chi tiết</TabsTrigger>
                <TabsTrigger value="medicines">Thuốc điều trị</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Mã hồ sơ</Label>
                    <p className="font-medium">{selectedRecord.record_id}</p>
                  </div>
                  <div>
                    <Label>Trạng thái</Label>
                    <StatusBadge status={selectedRecord.status} type="medical-record" />
                  </div>
                  <div>
                    <Label>Bệnh nhân</Label>
                    <p className="font-medium">{selectedRecord.patient_name}</p>
                  </div>
                  <div>
                    <Label>Bác sĩ</Label>
                    <p className="font-medium">{selectedRecord.doctor_name}</p>
                  </div>
                  <div>
                    <Label>Cuộc hẹn</Label>
                    <p className="font-medium">{selectedRecord.appointment_id || "Không liên kết"}</p>
                  </div>
                  <div>
                    <Label>Ngày tạo</Label>
                    <p className="font-medium">
                      {format(new Date(selectedRecord.created_at), "dd/MM/yyyy HH:mm", { locale: vi })}
                    </p>
                  </div>
                </div>
                <div>
                  <Label>Chẩn đoán</Label>
                  <p className="mt-1 p-3 bg-muted rounded-md">{selectedRecord.diagnosis}</p>
                </div>
                <div>
                  <Label>Điều trị</Label>
                  <p className="mt-1 p-3 bg-muted rounded-md">{selectedRecord.treatment || "Chưa có thông tin"}</p>
                </div>
                <div>
                  <Label>Đơn thuốc</Label>
                  <p className="mt-1 p-3 bg-muted rounded-md">{selectedRecord.prescription || "Chưa có đơn thuốc"}</p>
                </div>
              </TabsContent>
              <TabsContent value="medicines" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Danh sách thuốc</h3>
                </div>

                {/* Add Medicine Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Thêm thuốc</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Thuốc</Label>
                        <Select
                          value={medicineForm.medicine_id}
                          onValueChange={(value) => setMedicineForm({ ...medicineForm, medicine_id: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn thuốc" />
                          </SelectTrigger>
                          <SelectContent>
                            {medicines.map((medicine) => (
                              <SelectItem key={medicine.id} value={medicine.id}>
                                {medicine.name} ({medicine.type})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Liều dùng</Label>
                        <Input
                          value={medicineForm.dosage}
                          onChange={(e) => setMedicineForm({ ...medicineForm, dosage: e.target.value })}
                          placeholder="VD: 2 lần/ngày x 7 ngày"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button onClick={handleAddMedicine} className="w-full">
                          <Plus className="h-4 w-4 mr-2" />
                          Thêm
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Medicines Table */}
                <div className="border rounded-lg">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-4 py-3 text-left">Tên thuốc</th>
                        <th className="px-4 py-3 text-left">Liều dùng</th>
                        <th className="px-4 py-3 text-left">Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recordMedicines
                        .filter((rm) => rm.record_id === selectedRecord.record_id)
                        .map((medicine) => (
                          <tr key={medicine.id} className="border-b hover:bg-muted/50">
                            <td className="px-4 py-3 font-medium">{medicine.medicine_name}</td>
                            <td className="px-4 py-3">{medicine.dosage}</td>
                            <td className="px-4 py-3">
                              <ConfirmDialog
                                title="Xác nhận xóa"
                                description="Bạn có chắc chắn muốn xóa thuốc này khỏi hồ sơ không?"
                                onConfirm={() => handleRemoveMedicine(medicine.id)}
                              >
                                <Button variant="outline" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </ConfirmDialog>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  {recordMedicines.filter((rm) => rm.record_id === selectedRecord.record_id).length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                      <Pill className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Chưa có thuốc nào được thêm vào hồ sơ này</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
