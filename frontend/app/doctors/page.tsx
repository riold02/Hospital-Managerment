"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { Plus, Search, Edit, Trash2, Stethoscope, Users } from "lucide-react"
import { DataTable } from "@/components/shared/DataTable"
import { SearchBar } from "@/components/shared/SearchBar"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { RBACButton } from "@/components/shared/RBACButton"
import { RBACRoute } from "@/components/shared/RBACRoute"
import { useAuth } from "@/lib/auth-context"

// Mock data - replace with actual API calls
const mockDoctors = [
  {
    doctor_id: "D001",
    first_name: "Nguyễn",
    last_name: "Thị Hoa",
    full_name: "Nguyễn Thị Hoa",
    specialty: "Tim mạch",
    contact_number: "0901234567",
    email: "hoa.nguyen@medicareplus.vn",
    available_schedule: "Thứ 2-6: 8:00-17:00\nThứ 7: 8:00-12:00",
    created_at: "2024-01-15",
  },
  {
    doctor_id: "D002",
    first_name: "Trần",
    last_name: "Minh Tuấn",
    full_name: "Trần Minh Tuấn",
    specialty: "Cấp cứu",
    contact_number: "0901234568",
    email: "tuan.tran@medicareplus.vn",
    available_schedule: "24/7 - Trực cấp cứu",
    created_at: "2024-01-10",
  },
  {
    doctor_id: "D003",
    first_name: "Lê",
    last_name: "Thị Mai",
    full_name: "Lê Thị Mai",
    specialty: "Nhi khoa",
    contact_number: "0901234569",
    email: "mai.le@medicareplus.vn",
    available_schedule: "Thứ 2-6: 8:00-16:00",
    created_at: "2024-01-05",
  },
]

const specialties = [
  "Tim mạch",
  "Cấp cứu",
  "Nhi khoa",
  "Nội tổng quát",
  "Phẫu thuật",
  "Da liễu",
  "Mắt",
  "Tai mũi họng",
  "Thần kinh",
  "Ung bướu",
]

interface Doctor {
  doctor_id: string
  first_name: string
  last_name: string
  full_name: string
  specialty: string
  contact_number: string
  email: string
  available_schedule: string
  created_at: string
}

export default function DoctorsPage() {
  const { role, user } = useAuth()
  const [doctors, setDoctors] = useState<Doctor[]>(mockDoctors)
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>(mockDoctors)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [specialtyFilter, setSpecialtyFilter] = useState("all")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)

  // Form state
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    specialty: "",
    contact_number: "",
    email: "",
    available_schedule: "",
  })

  useEffect(() => {
    loadDoctors()
  }, [])

  useEffect(() => {
    filterDoctors()
  }, [doctors, searchQuery, specialtyFilter])

  const loadDoctors = async () => {
    setLoading(true)
    try {
      console.log("[v0] Loading doctors data")
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setDoctors(mockDoctors)
    } catch (error) {
      console.error("[v0] Error loading doctors:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách bác sĩ",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterDoctors = () => {
    let filtered = doctors

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (doctor) =>
          doctor.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doctor.doctor_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doctor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Specialty filter
    if (specialtyFilter && specialtyFilter !== "all") {
      filtered = filtered.filter((doctor) => doctor.specialty === specialtyFilter)
    }

    setFilteredDoctors(filtered)
    setCurrentPage(1)
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateForm = () => {
    if (!formData.first_name.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tên",
        variant: "destructive",
      })
      return false
    }
    if (!formData.last_name.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập họ",
        variant: "destructive",
      })
      return false
    }
    if (!formData.specialty) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn chuyên khoa",
        variant: "destructive",
      })
      return false
    }
    if (!formData.contact_number.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập số điện thoại",
        variant: "destructive",
      })
      return false
    }
    if (!formData.email.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập email",
        variant: "destructive",
      })
      return false
    }
    if (!validateEmail(formData.email)) {
      toast({
        title: "Lỗi",
        description: "Email không hợp lệ",
        variant: "destructive",
      })
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      const doctorData = {
        ...formData,
        full_name: `${formData.first_name} ${formData.last_name}`,
      }

      if (editingDoctor) {
        console.log("[v0] Updating doctor:", editingDoctor.doctor_id, doctorData)
        setDoctors((prev) =>
          prev.map((doctor) => (doctor.doctor_id === editingDoctor.doctor_id ? { ...doctor, ...doctorData } : doctor)),
        )
        toast({
          title: "Thành công",
          description: "Đã cập nhật thông tin bác sĩ",
        })
      } else {
        const newDoctor: Doctor = {
          doctor_id: `D${String(doctors.length + 1).padStart(3, "0")}`,
          ...doctorData,
          created_at: new Date().toISOString().split("T")[0],
        }

        console.log("[v0] Creating new doctor:", newDoctor)
        setDoctors((prev) => [...prev, newDoctor])
        toast({
          title: "Thành công",
          description: "Đã thêm bác sĩ mới",
        })
      }

      resetForm()
    } catch (error) {
      console.error("[v0] Error saving doctor:", error)
      toast({
        title: "Lỗi",
        description: "Không thể lưu thông tin bác sĩ",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor)
    setFormData({
      first_name: doctor.first_name,
      last_name: doctor.last_name,
      specialty: doctor.specialty,
      contact_number: doctor.contact_number,
      email: doctor.email,
      available_schedule: doctor.available_schedule,
    })
    setIsFormOpen(true)
  }

  const handleDelete = async () => {
    if (!doctorToDelete) return

    try {
      console.log("[v0] Deleting doctor:", doctorToDelete.doctor_id)
      setDoctors((prev) => prev.filter((doctor) => doctor.doctor_id !== doctorToDelete.doctor_id))
      toast({
        title: "Thành công",
        description: "Đã xóa bác sĩ",
      })
    } catch (error) {
      console.error("[v0] Error deleting doctor:", error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa bác sĩ",
        variant: "destructive",
      })
    } finally {
      setDeleteConfirmOpen(false)
      setDoctorToDelete(null)
    }
  }

  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      specialty: "",
      contact_number: "",
      email: "",
      available_schedule: "",
    })
    setEditingDoctor(null)
    setIsFormOpen(false)
  }

  const columns = [
    { key: "doctor_id", label: "ID Bác sĩ", sortable: true },
    { key: "full_name", label: "Họ tên", sortable: true },
    { key: "specialty", label: "Chuyên khoa", sortable: true },
    { key: "contact_number", label: "Số điện thoại", sortable: false },
    { key: "email", label: "Email", sortable: false },
    { key: "created_at", label: "Ngày tạo", sortable: true },
    { key: "actions", label: "Hành động", sortable: false },
  ]

  const tableData = filteredDoctors.map((doctor) => ({
    ...doctor,
    actions: (
      <div className="flex gap-2">
        <RBACButton
          action="edit"
          module="doctors"
          context={{ user_id: user?.user_id, doctor_id: doctor.doctor_id }}
          row={doctor}
          size="sm"
          variant="outline"
          onClick={() => handleEdit(doctor)}
        >
          <Edit className="h-3 w-3 mr-1" />
          Sửa
        </RBACButton>
        <RBACButton
          action="delete"
          module="doctors"
          context={{ user_id: user?.user_id, doctor_id: doctor.doctor_id }}
          row={doctor}
          size="sm"
          variant="destructive"
          onClick={() => {
            setDoctorToDelete(doctor)
            setDeleteConfirmOpen(true)
          }}
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Xóa
        </RBACButton>
      </div>
    ),
  }))

  const paginatedData = tableData.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <RBACRoute route="/doctors">
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Quản lý Bác sĩ</h1>
              <p className="text-muted-foreground">Quản lý thông tin bác sĩ và chuyên khoa</p>
              {role && (
                <p className="text-sm text-muted-foreground mt-1">
                  Quyền truy cập: <span className="font-medium">{role}</span>
                  {role === "Admin" && " (Toàn quyền)"}
                  {role === "Doctor" && " (Chỉ xem)"}
                  {role === "Nurse" && " (Chỉ xem)"}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Stethoscope className="h-8 w-8 text-primary" />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng số bác sĩ</CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{doctors.length}</div>
                <p className="text-xs text-muted-foreground">bác sĩ đang hoạt động</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chuyên khoa</CardTitle>
                <Stethoscope className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{new Set(doctors.map((d) => d.specialty)).size}</div>
                <p className="text-xs text-muted-foreground">chuyên khoa khác nhau</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Kết quả tìm kiếm</CardTitle>
                <Search className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{filteredDoctors.length}</div>
                <p className="text-xs text-muted-foreground">bác sĩ phù hợp</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Danh sách Bác sĩ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <SearchBar placeholder="Tìm kiếm theo tên, ID, email, chuyên khoa..." onSearch={setSearchQuery} />
                </div>
                <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Lọc theo chuyên khoa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả chuyên khoa</SelectItem>
                    {specialties.map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <RBACButton action="create" module="doctors" context={{ user_id: user?.user_id }}>
                  <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => resetForm()}>
                        <Plus className="h-4 w-4 mr-2" />
                        Thêm bác sĩ mới
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{editingDoctor ? "Chỉnh sửa thông tin bác sĩ" : "Thêm bác sĩ mới"}</DialogTitle>
                        <DialogDescription>
                          {editingDoctor
                            ? "Cập nhật thông tin bác sĩ trong hệ thống"
                            : "Nhập thông tin bác sĩ mới vào hệ thống"}
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="first_name">Tên *</Label>
                            <Input
                              id="first_name"
                              value={formData.first_name}
                              onChange={(e) => setFormData((prev) => ({ ...prev, first_name: e.target.value }))}
                              placeholder="Nhập tên"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="last_name">Họ *</Label>
                            <Input
                              id="last_name"
                              value={formData.last_name}
                              onChange={(e) => setFormData((prev) => ({ ...prev, last_name: e.target.value }))}
                              placeholder="Nhập họ"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="specialty">Chuyên khoa *</Label>
                          <Select
                            value={formData.specialty}
                            onValueChange={(value) => setFormData((prev) => ({ ...prev, specialty: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn chuyên khoa" />
                            </SelectTrigger>
                            <SelectContent>
                              {specialties.map((specialty) => (
                                <SelectItem key={specialty} value={specialty}>
                                  {specialty}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="contact_number">Số điện thoại *</Label>
                            <Input
                              id="contact_number"
                              value={formData.contact_number}
                              onChange={(e) => setFormData((prev) => ({ ...prev, contact_number: e.target.value }))}
                              placeholder="Nhập số điện thoại"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                              id="email"
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                              placeholder="Nhập email"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="available_schedule">Lịch làm việc</Label>
                          <Textarea
                            id="available_schedule"
                            value={formData.available_schedule}
                            onChange={(e) => setFormData((prev) => ({ ...prev, available_schedule: e.target.value }))}
                            placeholder="Nhập lịch làm việc (ví dụ: Thứ 2-6: 8:00-17:00)"
                            rows={3}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={resetForm}>
                            Hủy
                          </Button>
                          <Button type="submit">{editingDoctor ? "Cập nhật" : "Thêm mới"}</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </RBACButton>
              </div>

              <DataTable
                columns={columns}
                data={paginatedData}
                total={filteredDoctors.length}
                page={currentPage}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                loading={loading}
                emptyMessage="Không tìm thấy bác sĩ nào"
              />
            </CardContent>
          </Card>

          {/* Delete Confirmation Dialog */}
          <ConfirmDialog
            open={deleteConfirmOpen}
            onOpenChange={setDeleteConfirmOpen}
            onConfirm={handleDelete}
            title="Xác nhận xóa bác sĩ"
            description={`Bạn có chắc chắn muốn xóa bác sĩ "${doctorToDelete?.full_name}"? Hành động này không thể hoàn tác.`}
            confirmText="Xóa"
            cancelText="Hủy"
          />
        </div>
      </div>
    </RBACRoute>
  )
}
