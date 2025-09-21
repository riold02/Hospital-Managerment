"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { DataTable } from "@/components/shared/DataTable"
import { SearchBar } from "@/components/shared/SearchBar"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { RBACButton } from "@/components/shared/RBACButton"
import { RBACRoute } from "@/components/shared/RBACRoute"
import { useAuth } from "@/lib/auth-context"
import { Plus, Edit, Trash2, Eye, User } from "lucide-react"

interface Patient {
  patient_id: string
  full_name: string
  date_of_birth: string
  gender: "M" | "F" | "O"
  contact_number: string
  email: string
  created_at: string
  first_name?: string
  last_name?: string
  address?: string
  medical_history?: string
}

interface PatientFormData {
  first_name: string
  last_name: string
  date_of_birth: string
  gender: "M" | "F" | "O"
  contact_number: string
  address: string
  email: string
  medical_history: string
}

const initialFormData: PatientFormData = {
  first_name: "",
  last_name: "",
  date_of_birth: "",
  gender: "M",
  contact_number: "",
  address: "",
  email: "",
  medical_history: "",
}

export default function PatientsPage() {
  const { role, user } = useAuth()
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [formData, setFormData] = useState<PatientFormData>(initialFormData)
  const [formErrors, setFormErrors] = useState<Partial<PatientFormData>>({})
  const [deletePatient, setDeletePatient] = useState<Patient | null>(null)
  const { toast } = useToast()

  const mockPatients: Patient[] = [
    {
      patient_id: "P001",
      full_name: "Nguyễn Văn An",
      date_of_birth: "1985-03-15",
      gender: "M",
      contact_number: "0901234567",
      email: "nguyen.van.an@email.com",
      created_at: "2024-01-15T08:30:00Z",
      first_name: "An",
      last_name: "Nguyễn Văn",
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
      first_name: "Bình",
      last_name: "Trần Thị",
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
      first_name: "Cường",
      last_name: "Lê Minh",
      address: "789 Đường DEF, Quận 7, TP.HCM",
      medical_history: "Tiền sử đái tháo đường type 2",
    },
  ]

  useEffect(() => {
    fetchPatients()
  }, [currentPage, pageSize])

  const fetchPatients = async () => {
    try {
      setLoading(true)
      setError(null)

      await new Promise((resolve) => setTimeout(resolve, 1000))
      setPatients(mockPatients)
    } catch (err) {
      setError("Không thể tải danh sách bệnh nhân")
      console.error("Error fetching patients:", err)
    } finally {
      setLoading(false)
    }
  }

  const filteredPatients = useMemo(() => {
    if (!searchQuery) return patients

    const query = searchQuery.toLowerCase()
    return patients.filter(
      (patient) =>
        patient.full_name.toLowerCase().includes(query) ||
        patient.first_name?.toLowerCase().includes(query) ||
        patient.last_name?.toLowerCase().includes(query) ||
        patient.patient_id.toLowerCase().includes(query) ||
        patient.email.toLowerCase().includes(query) ||
        patient.contact_number.includes(query),
    )
  }, [patients, searchQuery])

  const paginatedPatients = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredPatients.slice(startIndex, startIndex + pageSize)
  }, [filteredPatients, currentPage, pageSize])

  const validateForm = (data: PatientFormData): Partial<PatientFormData> => {
    const errors: Partial<PatientFormData> = {}

    if (!data.first_name.trim()) errors.first_name = "Tên là bắt buộc"
    if (!data.last_name.trim()) errors.last_name = "Họ là bắt buộc"
    if (!data.date_of_birth) errors.date_of_birth = "Ngày sinh là bắt buộc"
    if (!data.contact_number.trim()) errors.contact_number = "Số điện thoại là bắt buộc"
    if (!data.email.trim()) {
      errors.email = "Email là bắt buộc"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = "Email không hợp lệ"
    }
    if (!data.address.trim()) errors.address = "Địa chỉ là bắt buộc"

    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const errors = validateForm(formData)
    setFormErrors(errors)

    if (Object.keys(errors).length > 0) return

    try {
      const patientData = {
        ...formData,
        full_name: `${formData.last_name} ${formData.first_name}`,
        patient_id: editingPatient?.patient_id || `P${String(patients.length + 1).padStart(3, "0")}`,
        created_at: editingPatient?.created_at || new Date().toISOString(),
      }

      if (editingPatient) {
        setPatients((prev) =>
          prev.map((p) =>
            p.patient_id === editingPatient.patient_id ? { ...patientData, patient_id: editingPatient.patient_id } : p,
          ),
        )
        toast({
          title: "Thành công",
          description: "Cập nhật thông tin bệnh nhân thành công",
        })
      } else {
        setPatients((prev) => [...prev, patientData as Patient])
        toast({
          title: "Thành công",
          description: "Thêm bệnh nhân mới thành công",
        })
      }

      setIsFormOpen(false)
      setEditingPatient(null)
      setFormData(initialFormData)
      setFormErrors({})
    } catch (err) {
      toast({
        title: "Lỗi",
        description: "Không thể lưu thông tin bệnh nhân",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient)
    setFormData({
      first_name: patient.first_name || "",
      last_name: patient.last_name || "",
      date_of_birth: patient.date_of_birth,
      gender: patient.gender,
      contact_number: patient.contact_number,
      address: patient.address || "",
      email: patient.email,
      medical_history: patient.medical_history || "",
    })
    setFormErrors({})
    setIsFormOpen(true)
  }

  const handleDelete = async () => {
    if (!deletePatient) return

    try {
      setPatients((prev) => prev.filter((p) => p.patient_id !== deletePatient.patient_id))
      toast({
        title: "Thành công",
        description: "Xóa bệnh nhân thành công",
      })
    } catch (err) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa bệnh nhân",
        variant: "destructive",
      })
    } finally {
      setDeletePatient(null)
    }
  }

  const columns = [
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
      key: "created_at",
      label: "Ngày tạo",
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString("vi-VN"),
    },
    {
      key: "actions",
      label: "Hành động",
      render: (_: any, patient: Patient) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              /* View patient details */
            }}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <RBACButton
            action="edit"
            module="patients"
            context={{ user_id: user?.user_id, patient_id: patient.patient_id }}
            row={patient}
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(patient)}
          >
            <Edit className="w-4 h-4" />
          </RBACButton>
          <RBACButton
            action="delete"
            module="patients"
            context={{ user_id: user?.user_id, patient_id: patient.patient_id }}
            row={patient}
            variant="ghost"
            size="sm"
            onClick={() => setDeletePatient(patient)}
          >
            <Trash2 className="w-4 h-4" />
          </RBACButton>
        </div>
      ),
    },
  ]

  return (
    <RBACRoute route="/patients">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Quản lý Bệnh nhân</h1>
            <p className="text-muted-foreground">Quản lý thông tin bệnh nhân trong hệ thống</p>
            {role && (
              <p className="text-sm text-muted-foreground mt-1">
                Quyền truy cập: <span className="font-medium">{role}</span>
                {role === "Patient" && " (Chỉ xem thông tin cá nhân)"}
                {role === "Doctor" && " (Xem tất cả bệnh nhân)"}
                {role === "Nurse" && " (Xem tất cả bệnh nhân)"}
                {role === "Admin" && " (Toàn quyền)"}
              </p>
            )}
          </div>
          <RBACButton action="create" module="patients" context={{ user_id: user?.user_id }}>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditingPatient(null)
                    setFormData(initialFormData)
                    setFormErrors({})
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm bệnh nhân mới
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingPatient ? "Chỉnh sửa bệnh nhân" : "Thêm bệnh nhân mới"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="last_name">Họ *</Label>
                      <Input
                        id="last_name"
                        value={formData.last_name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, last_name: e.target.value }))}
                        className={formErrors.last_name ? "border-destructive" : ""}
                      />
                      {formErrors.last_name && <p className="text-sm text-destructive mt-1">{formErrors.last_name}</p>}
                    </div>
                    <div>
                      <Label htmlFor="first_name">Tên *</Label>
                      <Input
                        id="first_name"
                        value={formData.first_name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, first_name: e.target.value }))}
                        className={formErrors.first_name ? "border-destructive" : ""}
                      />
                      {formErrors.first_name && (
                        <p className="text-sm text-destructive mt-1">{formErrors.first_name}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date_of_birth">Ngày sinh *</Label>
                      <Input
                        id="date_of_birth"
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => setFormData((prev) => ({ ...prev, date_of_birth: e.target.value }))}
                        className={formErrors.date_of_birth ? "border-destructive" : ""}
                      />
                      {formErrors.date_of_birth && (
                        <p className="text-sm text-destructive mt-1">{formErrors.date_of_birth}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="gender">Giới tính *</Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value: "M" | "F" | "O") => setFormData((prev) => ({ ...prev, gender: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="M">Nam</SelectItem>
                          <SelectItem value="F">Nữ</SelectItem>
                          <SelectItem value="O">Khác</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contact_number">Số điện thoại *</Label>
                      <Input
                        id="contact_number"
                        value={formData.contact_number}
                        onChange={(e) => setFormData((prev) => ({ ...prev, contact_number: e.target.value }))}
                        className={formErrors.contact_number ? "border-destructive" : ""}
                      />
                      {formErrors.contact_number && (
                        <p className="text-sm text-destructive mt-1">{formErrors.contact_number}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                        className={formErrors.email ? "border-destructive" : ""}
                      />
                      {formErrors.email && <p className="text-sm text-destructive mt-1">{formErrors.email}</p>}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Địa chỉ *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                      className={formErrors.address ? "border-destructive" : ""}
                    />
                    {formErrors.address && <p className="text-sm text-destructive mt-1">{formErrors.address}</p>}
                  </div>

                  <div>
                    <Label htmlFor="medical_history">Tiền sử bệnh án</Label>
                    <Textarea
                      id="medical_history"
                      value={formData.medical_history}
                      onChange={(e) => setFormData((prev) => ({ ...prev, medical_history: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                      Hủy
                    </Button>
                    <Button type="submit">{editingPatient ? "Cập nhật" : "Thêm mới"}</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </RBACButton>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Danh sách Bệnh nhân
              {role === "Patient" && (
                <span className="text-sm font-normal text-muted-foreground">(Hiển thị thông tin cá nhân)</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <SearchBar onSearch={setSearchQuery} placeholder="Tìm kiếm theo tên, ID, email hoặc số điện thoại..." />
            </div>

            <DataTable
              columns={columns}
              data={paginatedPatients}
              total={filteredPatients.length}
              page={currentPage}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              loading={loading}
              error={error}
              emptyMessage="Không có bệnh nhân nào"
            />
          </CardContent>
        </Card>

        <ConfirmDialog
          open={!!deletePatient}
          onOpenChange={() => setDeletePatient(null)}
          title="Xác nhận xóa bệnh nhân"
          description={`Bạn có chắc chắn muốn xóa bệnh nhân "${deletePatient?.full_name}"? Hành động này không thể hoàn tác.`}
          onConfirm={handleDelete}
        />
      </div>
    </RBACRoute>
  )
}
