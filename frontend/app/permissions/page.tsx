"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Search, Edit, Users, Stethoscope, Activity, Truck, Settings, Shield, Loader2 } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  role: string
  status: string
  created_at: string
  last_login: string
}

const roleOptions = [
  { value: "Admin", label: "Quản trị viên", icon: Shield },
  { value: "Doctor", label: "Bác sĩ", icon: Stethoscope },
  { value: "Nurse", label: "Y tá", icon: Activity },
  { value: "Pharmacist", label: "Dược sĩ", icon: Activity },
  { value: "Technician", label: "Kỹ thuật viên", icon: Settings },
  { value: "Driver", label: "Tài xế", icon: Truck },
  { value: "Patient", label: "Bệnh nhân", icon: Users },
]

const statusOptions = [
  { value: "Active", label: "Hoạt động", color: "bg-green-100 text-green-800" },
  { value: "Inactive", label: "Không hoạt động", color: "bg-red-100 text-red-800" },
  { value: "Suspended", label: "Tạm khóa", color: "bg-yellow-100 text-yellow-800" },
]

export default function PermissionsManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // Mock data for demonstration
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const mockUsers: User[] = [
          {
            id: "1",
            name: "Dr. Nguyễn Văn An",
            email: "dr.an@hospital.com",
            role: "Doctor",
            status: "Active",
            created_at: "2024-01-15",
            last_login: "2024-01-20",
          },
          {
            id: "2",
            name: "Y tá Trần Thị Bình",
            email: "nurse.binh@hospital.com",
            role: "Nurse",
            status: "Active",
            created_at: "2024-01-10",
            last_login: "2024-01-19",
          },
          {
            id: "3",
            name: "Dược sĩ Lê Văn Cường",
            email: "pharm.cuong@hospital.com",
            role: "Pharmacist",
            status: "Active",
            created_at: "2024-01-08",
            last_login: "2024-01-18",
          },
          {
            id: "4",
            name: "Bệnh nhân Phạm Thị Dung",
            email: "patient.dung@email.com",
            role: "Patient",
            status: "Active",
            created_at: "2024-01-12",
            last_login: "2024-01-17",
          },
          {
            id: "5",
            name: "Tài xế Hoàng Văn Em",
            email: "driver.em@hospital.com",
            role: "Driver",
            status: "Inactive",
            created_at: "2024-01-05",
            last_login: "2024-01-15",
          },
        ]

        setUsers(mockUsers)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching users:", error)
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      // Simulate API call to update user role
      console.log(`[v0] Updating user ${userId} role to ${newRole}`)

      setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, role: newRole } : user)))

      setIsEditDialogOpen(false)
      setSelectedUser(null)
    } catch (error) {
      console.error("Error updating user role:", error)
    }
  }

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      // Simulate API call to update user status
      console.log(`[v0] Updating user ${userId} status to ${newStatus}`)

      setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, status: newStatus } : user)))
    } catch (error) {
      console.error("Error updating user status:", error)
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesStatus = statusFilter === "all" || user.status === statusFilter

    return matchesSearch && matchesRole && matchesStatus
  })

  const getRoleLabel = (role: string) => {
    return roleOptions.find((option) => option.value === role)?.label || role
  }

  const getStatusBadge = (status: string) => {
    const statusOption = statusOptions.find((option) => option.value === status)
    return <Badge className={statusOption?.color || "bg-gray-100 text-gray-800"}>{statusOption?.label || status}</Badge>
  }

  if (loading) {
    return (
      <DashboardLayout
        title="Quản Lý Phân Quyền"
        description="Quản lý vai trò và quyền hạn người dùng"
        currentPath="/permissions"
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Đang tải dữ liệu...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Quản Lý Phân Quyền"
      description="Quản lý vai trò và quyền hạn người dùng"
      currentPath="/permissions"
    >
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Người Dùng</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{users.length}</div>
            <p className="text-xs text-muted-foreground">người dùng trong hệ thống</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nhân Viên Y Tế</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {users.filter((u) => ["Doctor", "Nurse", "Pharmacist", "Technician"].includes(u.role)).length}
            </div>
            <p className="text-xs text-muted-foreground">bác sĩ, y tá, dược sĩ</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bệnh Nhân</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{users.filter((u) => u.role === "Patient").length}</div>
            <p className="text-xs text-muted-foreground">bệnh nhân đã đăng ký</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoạt Động</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{users.filter((u) => u.status === "Active").length}</div>
            <p className="text-xs text-muted-foreground">người dùng đang hoạt động</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Lọc theo vai trò" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả vai trò</SelectItem>
            {roleOptions.map((role) => (
              <SelectItem key={role.value} value={role.value}>
                {role.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            {statusOptions.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh Sách Người Dùng</CardTitle>
          <CardDescription>Quản lý vai trò và quyền hạn của {filteredUsers.length} người dùng</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Vai Trò</TableHead>
                <TableHead>Trạng Thái</TableHead>
                <TableHead>Đăng Nhập Cuối</TableHead>
                <TableHead>Hành Động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{getRoleLabel(user.role)}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell>{new Date(user.last_login).toLocaleDateString("vi-VN")}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog
                        open={isEditDialogOpen && selectedUser?.id === user.id}
                        onOpenChange={(open) => {
                          setIsEditDialogOpen(open)
                          if (!open) setSelectedUser(null)
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" onClick={() => setSelectedUser(user)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Chỉnh Sửa Quyền Hạn</DialogTitle>
                            <DialogDescription>Thay đổi vai trò và trạng thái của {user.name}</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="role">Vai Trò</Label>
                              <Select
                                value={selectedUser?.role}
                                onValueChange={(value) =>
                                  setSelectedUser((prev) => (prev ? { ...prev, role: value } : null))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {roleOptions.map((role) => (
                                    <SelectItem key={role.value} value={role.value}>
                                      {role.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="status">Trạng Thái</Label>
                              <Select
                                value={selectedUser?.status}
                                onValueChange={(value) =>
                                  setSelectedUser((prev) => (prev ? { ...prev, status: value } : null))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {statusOptions.map((status) => (
                                    <SelectItem key={status.value} value={status.value}>
                                      {status.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex gap-2 pt-4">
                              <Button
                                onClick={() => {
                                  if (selectedUser) {
                                    handleRoleChange(selectedUser.id, selectedUser.role)
                                    handleStatusChange(selectedUser.id, selectedUser.status)
                                  }
                                }}
                                className="flex-1"
                              >
                                Lưu Thay Đổi
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setIsEditDialogOpen(false)
                                  setSelectedUser(null)
                                }}
                              >
                                Hủy
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
