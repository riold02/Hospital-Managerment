"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import { DataTable } from "@/components/shared/DataTable"
import { SearchBar } from "@/components/shared/SearchBar"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { KpiCard } from "@/components/shared/KpiCard"
import { Users, Plus, Edit, Trash2, UserCheck } from "lucide-react"

interface Staff {
  staff_id: string
  first_name: string
  last_name: string
  full_name: string
  role: "Doctor" | "Nurse" | "Technician" | "Admin" | "Driver" | "Worker"
  department_id: string
  department_name: string
  contact_number: string
  email: string
  address: string
  hire_date: string
  created_at: string
}

interface Nurse extends Staff {
  specialization: string
  shift_hours: string
}

interface Worker extends Staff {
  job_title: string
  work_schedule: string
}

// Mock data
const mockStaff: Staff[] = [
  {
    staff_id: "STF001",
    first_name: "Nguyễn",
    last_name: "Văn An",
    full_name: "Nguyễn Văn An",
    role: "Doctor",
    department_id: "DEPT001",
    department_name: "Khoa Tim mạch",
    contact_number: "0901234567",
    email: "nguyen.van.an@hospital.com",
    address: "123 Đường ABC, Quận 1",
    hire_date: "2023-01-15",
    created_at: "2023-01-15",
  },
  {
    staff_id: "STF002",
    first_name: "Trần",
    last_name: "Thị Bình",
    full_name: "Trần Thị Bình",
    role: "Nurse",
    department_id: "DEPT002",
    department_name: "Khoa Nhi",
    contact_number: "0901234568",
    email: "tran.thi.binh@hospital.com",
    address: "456 Đường DEF, Quận 3",
    hire_date: "2023-02-01",
    created_at: "2023-02-01",
  },
]

const mockNurses: Nurse[] = [
  {
    ...(mockStaff[1] as Staff),
    specialization: "Chăm sóc trẻ em",
    shift_hours: "7:00 - 19:00",
  },
]

const mockWorkers: Worker[] = [
  {
    staff_id: "STF003",
    first_name: "Lê",
    last_name: "Văn Cường",
    full_name: "Lê Văn Cường",
    role: "Worker",
    department_id: "DEPT003",
    department_name: "Bộ phận Vệ sinh",
    contact_number: "0901234569",
    email: "le.van.cuong@hospital.com",
    address: "789 Đường GHI, Quận 5",
    hire_date: "2023-03-01",
    created_at: "2023-03-01",
    job_title: "Nhân viên vệ sinh",
    work_schedule: "Ca sáng: 6:00 - 14:00",
  },
]

const mockDepartments = [
  { id: "DEPT001", name: "Khoa Tim mạch" },
  { id: "DEPT002", name: "Khoa Nhi" },
  { id: "DEPT003", name: "Bộ phận Vệ sinh" },
  { id: "DEPT004", name: "Khoa Ngoại" },
  { id: "DEPT005", name: "Khoa Nội" },
]

const roles = [
  { value: "Doctor", label: "Bác sĩ" },
  { value: "Nurse", label: "Y tá" },
  { value: "Technician", label: "Kỹ thuật viên" },
  { value: "Admin", label: "Quản trị" },
  { value: "Driver", label: "Tài xế" },
  { value: "Worker", label: "Công nhân" },
]

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>(mockStaff)
  const [nurses, setNurses] = useState<Nurse[]>(mockNurses)
  const [workers, setWorkers] = useState<Worker[]>(mockWorkers)
  const [filteredStaff, setFilteredStaff] = useState<Staff[]>(mockStaff)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("staff")

  // Form state
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    role: "Doctor" as Staff["role"],
    department_id: "",
    contact_number: "",
    email: "",
    address: "",
    hire_date: "",
    // Nurse specific
    specialization: "",
    shift_hours: "",
    // Worker specific
    job_title: "",
    work_schedule: "",
  })

  // Filter staff
  useEffect(() => {
    let filtered = staff

    if (searchQuery) {
      filtered = filtered.filter(
        (s) =>
          s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.contact_number.includes(searchQuery),
      )
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((s) => s.role === roleFilter)
    }

    if (departmentFilter !== "all") {
      filtered = filtered.filter((s) => s.department_id === departmentFilter)
    }

    setFilteredStaff(filtered)
  }, [staff, searchQuery, roleFilter, departmentFilter])

  // Calculate KPIs
  const totalStaff = staff.length
  const doctorsCount = staff.filter((s) => s.role === "Doctor").length
  const nursesCount = staff.filter((s) => s.role === "Nurse").length
  const activeStaff = staff.length // Assuming all are active

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const department = mockDepartments.find((d) => d.id === formData.department_id)

      if (editingStaff) {
        // Update staff
        const updatedStaff = staff.map((s) =>
          s.staff_id === editingStaff.staff_id
            ? {
                ...s,
                ...formData,
                full_name: `${formData.first_name} ${formData.last_name}`,
                department_name: department?.name || "",
              }
            : s,
        )
        setStaff(updatedStaff)
        toast({ title: "Thành công", description: "Cập nhật nhân viên thành công!" })
      } else {
        // Create new staff
        const newStaff: Staff = {
          staff_id: `STF${String(staff.length + 1).padStart(3, "0")}`,
          ...formData,
          full_name: `${formData.first_name} ${formData.last_name}`,
          department_name: department?.name || "",
          created_at: new Date().toISOString().split("T")[0],
        }
        setStaff([...staff, newStaff])

        // Add to specialized lists if applicable
        if (formData.role === "Nurse") {
          const newNurse: Nurse = {
            ...newStaff,
            specialization: formData.specialization,
            shift_hours: formData.shift_hours,
          }
          setNurses([...nurses, newNurse])
        } else if (formData.role === "Worker") {
          const newWorker: Worker = {
            ...newStaff,
            job_title: formData.job_title,
            work_schedule: formData.work_schedule,
          }
          setWorkers([...workers, newWorker])
        }

        toast({ title: "Thành công", description: "Thêm nhân viên mới thành công!" })
      }

      setIsFormOpen(false)
      setEditingStaff(null)
      resetForm()
    } catch (error) {
      toast({ title: "Lỗi", description: "Có lỗi xảy ra!", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      role: "Doctor",
      department_id: "",
      contact_number: "",
      email: "",
      address: "",
      hire_date: "",
      specialization: "",
      shift_hours: "",
      job_title: "",
      work_schedule: "",
    })
  }

  const handleEdit = (staffMember: Staff) => {
    setEditingStaff(staffMember)
    setFormData({
      first_name: staffMember.first_name,
      last_name: staffMember.last_name,
      role: staffMember.role,
      department_id: staffMember.department_id,
      contact_number: staffMember.contact_number,
      email: staffMember.email,
      address: staffMember.address,
      hire_date: staffMember.hire_date,
      specialization: "",
      shift_hours: "",
      job_title: "",
      work_schedule: "",
    })
    setIsFormOpen(true)
  }

  const handleDelete = async (staffId: string) => {
    try {
      setStaff(staff.filter((s) => s.staff_id !== staffId))
      setNurses(nurses.filter((n) => n.staff_id !== staffId))
      setWorkers(workers.filter((w) => w.staff_id !== staffId))
      toast({ title: "Thành công", description: "Xóa nhân viên thành công!" })
    } catch (error) {
      toast({ title: "Lỗi", description: "Có lỗi xảy ra!", variant: "destructive" })
    }
  }

  const staffColumns = [
    {
      key: "staff_id",
      label: "Mã NV",
      sortable: true,
    },
    {
      key: "full_name",
      label: "Họ tên",
      sortable: true,
    },
    {
      key: "role",
      label: "Vai trò",
      render: (staff: Staff) =>
        staff?.role ? (
          <Badge variant="outline">{roles.find((r) => r.value === staff.role)?.label}</Badge>
        ) : (
          <span>N/A</span>
        ),
    },
    {
      key: "department_name",
      label: "Khoa/Phòng ban",
      sortable: true,
    },
    {
      key: "contact_number",
      label: "Điện thoại",
    },
    {
      key: "email",
      label: "Email",
    },
    {
      key: "hire_date",
      label: "Ngày vào làm",
      render: (staff: Staff) =>
        staff?.hire_date ? <span>{new Date(staff.hire_date).toLocaleDateString("vi-VN")}</span> : <span>N/A</span>,
    },
    {
      key: "actions",
      label: "Hành động",
      render: (staff: Staff) =>
        staff ? (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => handleEdit(staff)}>
              <Edit className="h-4 w-4" />
            </Button>
            <ConfirmDialog
              title="Xác nhận xóa"
              description={`Bạn có chắc chắn muốn xóa nhân viên ${staff.full_name}?`}
              onConfirm={() => handleDelete(staff.staff_id)}
            >
              <Button variant="ghost" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </ConfirmDialog>
          </div>
        ) : null,
    },
  ]

  const nurseColumns = [
    ...staffColumns.slice(0, -1),
    {
      key: "specialization",
      label: "Chuyên môn",
    },
    {
      key: "shift_hours",
      label: "Ca làm việc",
    },
    staffColumns[staffColumns.length - 1],
  ]

  const workerColumns = [
    ...staffColumns.slice(0, -1),
    {
      key: "job_title",
      label: "Chức danh",
    },
    {
      key: "work_schedule",
      label: "Lịch làm việc",
    },
    staffColumns[staffColumns.length - 1],
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Nhân viên</h1>
          <p className="text-muted-foreground">Quản lý thông tin nhân viên và phân quyền</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingStaff(null)
                resetForm()
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm nhân viên
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingStaff ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}</DialogTitle>
                <DialogDescription>
                  {editingStaff ? "Cập nhật thông tin nhân viên" : "Nhập thông tin nhân viên mới"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="first_name">Họ *</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="last_name">Tên *</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="role">Vai trò *</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value: Staff["role"]) => setFormData({ ...formData, role: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="department_id">Khoa/Phòng ban *</Label>
                    <Select
                      value={formData.department_id}
                      onValueChange={(value) => setFormData({ ...formData, department_id: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn khoa/phòng ban" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockDepartments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="contact_number">Điện thoại *</Label>
                    <Input
                      id="contact_number"
                      value={formData.contact_number}
                      onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Địa chỉ</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="hire_date">Ngày vào làm *</Label>
                  <Input
                    id="hire_date"
                    type="date"
                    value={formData.hire_date}
                    onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                    required
                  />
                </div>

                {/* Role-specific fields */}
                {formData.role === "Nurse" && (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="specialization">Chuyên môn</Label>
                      <Input
                        id="specialization"
                        value={formData.specialization}
                        onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                        placeholder="VD: Chăm sóc trẻ em"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="shift_hours">Ca làm việc</Label>
                      <Input
                        id="shift_hours"
                        value={formData.shift_hours}
                        onChange={(e) => setFormData({ ...formData, shift_hours: e.target.value })}
                        placeholder="VD: 7:00 - 19:00"
                      />
                    </div>
                  </>
                )}

                {formData.role === "Worker" && (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="job_title">Chức danh</Label>
                      <Input
                        id="job_title"
                        value={formData.job_title}
                        onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                        placeholder="VD: Nhân viên vệ sinh"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="work_schedule">Lịch làm việc</Label>
                      <Input
                        id="work_schedule"
                        value={formData.work_schedule}
                        onChange={(e) => setFormData({ ...formData, work_schedule: e.target.value })}
                        placeholder="VD: Ca sáng: 6:00 - 14:00"
                      />
                    </div>
                  </>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Đang xử lý..." : editingStaff ? "Cập nhật" : "Thêm mới"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Tổng nhân viên" value={totalStaff.toString()} icon={<Users className="h-4 w-4" />} />
        <KpiCard label="Bác sĩ" value={doctorsCount.toString()} icon={<UserCheck className="h-4 w-4" />} />
        <KpiCard label="Y tá" value={nursesCount.toString()} />
        <KpiCard label="Đang làm việc" value={activeStaff.toString()} trend="up" />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="staff">Tất cả nhân viên</TabsTrigger>
          <TabsTrigger value="nurses">Y tá</TabsTrigger>
          <TabsTrigger value="workers">Công nhân</TabsTrigger>
        </TabsList>

        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Danh sách nhân viên</CardTitle>
              <CardDescription>Quản lý thông tin tất cả nhân viên trong bệnh viện</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <SearchBar placeholder="Tìm kiếm theo tên, email, điện thoại..." onSearch={setSearchQuery} />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Lọc theo vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả vai trò</SelectItem>
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Lọc theo khoa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả khoa</SelectItem>
                    {mockDepartments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <DataTable
                columns={staffColumns}
                data={filteredStaff}
                total={filteredStaff.length}
                page={1}
                pageSize={10}
                onPageChange={() => {}}
                onSort={() => {}}
                onFilter={() => {}}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nurses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Danh sách Y tá</CardTitle>
              <CardDescription>Quản lý thông tin y tá với chuyên môn và ca làm việc</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={nurseColumns}
                data={nurses}
                total={nurses.length}
                page={1}
                pageSize={10}
                onPageChange={() => {}}
                onSort={() => {}}
                onFilter={() => {}}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Danh sách Công nhân</CardTitle>
              <CardDescription>Quản lý thông tin công nhân với chức danh và lịch làm việc</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={workerColumns}
                data={workers}
                total={workers.length}
                page={1}
                pageSize={10}
                onPageChange={() => {}}
                onSort={() => {}}
                onFilter={() => {}}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
