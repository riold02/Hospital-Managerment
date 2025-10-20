"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Stethoscope, Search, Eye, Plus, Edit, Trash2 } from "lucide-react"
import { doctorApi } from "@/lib/api"
import { toast } from "@/hooks/use-toast"

export function DoctorsTab() {
  const [doctors, setDoctors] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null)
  const [addForm, setAddForm] = useState({
    first_name: "",
    last_name: "",
    specialty: "",
    phone: "",
    email: "",
    password: "",
    confirm_password: "",
    available_schedule: "",
  })
  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    specialty: "",
    phone: "",
    email: "",
    available_schedule: "",
  })

  useEffect(() => {
    loadDoctors()
    loadDepartments()
  }, [])

  const loadDepartments = async () => {
    try {
      const response = await doctorApi.getDepartments()
      setDepartments(response || [])
    } catch (error) {
      console.error("Error loading departments:", error)
      setDepartments([])
    }
  }

  const loadDoctors = async () => {
    setLoading(true)
    try {
      const response = await doctorApi.getAllDoctors({ limit: 50 })
      setDoctors(response.data || [])
    } catch (error) {
      console.error("Error loading doctors:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách bác sĩ",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddDoctor = async () => {
    // Validate password
    if (addForm.password !== addForm.confirm_password) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu xác nhận không khớp",
        variant: "destructive",
      })
      return
    }
    
    if (addForm.password.length < 6) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu phải có ít nhất 6 ký tự",
        variant: "destructive",
      })
      return
    }
    
    try {
      // Remove confirm_password before sending to API
      const { confirm_password, ...doctorData } = addForm
      await doctorApi.createDoctor(doctorData)
      toast({
        title: "Thành công",
        description: "Đã thêm bác sĩ mới và tạo tài khoản đăng nhập",
      })
      setShowAddDialog(false)
      setAddForm({
        first_name: "",
        last_name: "",
        specialty: "",
        phone: "",
        email: "",
        password: "",
        confirm_password: "",
        available_schedule: "",
      })
      loadDoctors()
    } catch (error) {
      console.error("Error adding doctor:", error)
      toast({
        title: "Lỗi",
        description: "Không thể thêm bác sĩ",
        variant: "destructive",
      })
    }
  }

  const handleViewDetail = (doctor: any) => {
    setSelectedDoctor(doctor)
    setShowDetailDialog(true)
  }

  const handleEditDoctor = (doctor: any) => {
    setSelectedDoctor(doctor)
    setEditForm({
      first_name: doctor.first_name,
      last_name: doctor.last_name,
      specialty: doctor.specialty,
      phone: doctor.phone || "",
      email: doctor.email || "",
      available_schedule: doctor.available_schedule || "",
    })
    setShowEditDialog(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedDoctor) return
    
    try {
      await doctorApi.updateDoctor(selectedDoctor.doctor_id, editForm)
      toast({
        title: "Thành công",
        description: "Đã cập nhật thông tin bác sĩ",
      })
      setShowEditDialog(false)
      loadDoctors()
    } catch (error) {
      console.error("Error updating doctor:", error)
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật thông tin bác sĩ",
        variant: "destructive",
      })
    }
  }

  const handleDeleteDoctor = async (doctorId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bác sĩ này?')) return
    
    try {
      await doctorApi.deleteDoctor(doctorId)
      toast({
        title: "Thành công",
        description: "Đã xóa bác sĩ",
      })
      loadDoctors()
    } catch (error) {
      console.error("Error deleting doctor:", error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa bác sĩ",
        variant: "destructive",
      })
    }
  }

  const filteredDoctors = doctors.filter(doctor =>
    doctor.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialty?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-teal-600" />
            Quản lý bác sĩ ({filteredDoctors.length})
          </CardTitle>
          <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm bác sĩ
          </Button>
        </div>
        <div className="flex items-center gap-4 mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm theo tên, chuyên khoa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Đang tải...</p>
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Stethoscope className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-medium mb-2">Không có bác sĩ</h3>
            <p>Chưa có bác sĩ nào trong hệ thống.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Họ và tên</TableHead>
                  <TableHead>Chuyên khoa</TableHead>
                  <TableHead>Số điện thoại</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDoctors.map((doctor) => (
                  <TableRow key={doctor.doctor_id}>
                    <TableCell className="font-medium">#{doctor.doctor_id}</TableCell>
                    <TableCell className="font-medium">
                      {doctor.first_name} {doctor.last_name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{doctor.specialty || 'Chưa xác định'}</Badge>
                    </TableCell>
                    <TableCell>{doctor.phone || 'N/A'}</TableCell>
                    <TableCell>{doctor.email || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant="default">Đang hoạt động</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleViewDetail(doctor)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEditDoctor(doctor)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteDoctor(doctor.doctor_id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>

    {/* Add Doctor Dialog */}
    <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Thêm bác sĩ mới</DialogTitle>
          <DialogDescription>Nhập thông tin bác sĩ để thêm vào hệ thống</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div>
            <Label htmlFor="first_name">Tên <span className="text-red-500">*</span></Label>
            <Input
              id="first_name"
              value={addForm.first_name}
              onChange={(e) => setAddForm({...addForm, first_name: e.target.value})}
              placeholder="Nhập tên"
            />
          </div>
          <div>
            <Label htmlFor="last_name">Họ <span className="text-red-500">*</span></Label>
            <Input
              id="last_name"
              value={addForm.last_name}
              onChange={(e) => setAddForm({...addForm, last_name: e.target.value})}
              placeholder="Nhập họ"
            />
          </div>
          <div>
            <Label htmlFor="specialty">Chuyên khoa <span className="text-red-500">*</span></Label>
            <Select value={addForm.specialty} onValueChange={(value) => setAddForm({...addForm, specialty: value})}>
              <SelectTrigger id="specialty">
                <SelectValue placeholder="Chọn chuyên khoa" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.department_id} value={dept.department_name}>
                    {dept.department_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="phone">Số điện thoại <span className="text-red-500">*</span></Label>
            <Input
              id="phone"
              value={addForm.phone}
              onChange={(e) => setAddForm({...addForm, phone: e.target.value})}
              placeholder="VD: 0123456789"
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor="email">Email (dùng để đăng nhập) <span className="text-red-500">*</span></Label>
            <Input
              id="email"
              type="email"
              value={addForm.email}
              onChange={(e) => setAddForm({...addForm, email: e.target.value})}
              placeholder="email@example.com"
            />
          </div>
          <div>
            <Label htmlFor="password">Mật khẩu <span className="text-red-500">*</span></Label>
            <Input
              id="password"
              type="password"
              value={addForm.password}
              onChange={(e) => setAddForm({...addForm, password: e.target.value})}
              placeholder="Tối thiểu 6 ký tự"
            />
          </div>
          <div>
            <Label htmlFor="confirm_password">Xác nhận mật khẩu <span className="text-red-500">*</span></Label>
            <Input
              id="confirm_password"
              type="password"
              value={addForm.confirm_password}
              onChange={(e) => setAddForm({...addForm, confirm_password: e.target.value})}
              placeholder="Nhập lại mật khẩu"
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor="available_schedule">Lịch làm việc</Label>
            <Input
              id="available_schedule"
              value={addForm.available_schedule}
              onChange={(e) => setAddForm({...addForm, available_schedule: e.target.value})}
              placeholder="VD: Thứ 2-6, 8:00-17:00"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowAddDialog(false)}>Hủy</Button>
          <Button onClick={handleAddDoctor} className="bg-teal-600 hover:bg-teal-700">Thêm bác sĩ</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Detail Dialog */}
    <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chi tiết bác sĩ</DialogTitle>
        </DialogHeader>
        {selectedDoctor && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">ID</label>
                <p className="font-semibold">#{selectedDoctor.doctor_id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Họ và tên</label>
                <p className="font-semibold">{selectedDoctor.first_name} {selectedDoctor.last_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Chuyên khoa</label>
                <p>{selectedDoctor.specialty}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Số điện thoại</label>
                <p>{selectedDoctor.phone || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p>{selectedDoctor.email || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Lịch làm việc</label>
                <p>{selectedDoctor.available_schedule || 'Chưa cập nhật'}</p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>

    {/* Edit Dialog */}
    <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa thông tin bác sĩ</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div>
            <Label htmlFor="edit_first_name">Tên</Label>
            <Input
              id="edit_first_name"
              value={editForm.first_name}
              onChange={(e) => setEditForm({...editForm, first_name: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="edit_last_name">Họ</Label>
            <Input
              id="edit_last_name"
              value={editForm.last_name}
              onChange={(e) => setEditForm({...editForm, last_name: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="edit_specialty">Chuyên khoa</Label>
            <Select value={editForm.specialty} onValueChange={(value) => setEditForm({...editForm, specialty: value})}>
              <SelectTrigger id="edit_specialty">
                <SelectValue placeholder="Chọn chuyên khoa" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.department_id} value={dept.department_name}>
                    {dept.department_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="edit_phone">Số điện thoại</Label>
            <Input
              id="edit_phone"
              value={editForm.phone}
              onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor="edit_email">Email</Label>
            <Input
              id="edit_email"
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({...editForm, email: e.target.value})}
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor="edit_available_schedule">Lịch làm việc</Label>
            <Input
              id="edit_available_schedule"
              value={editForm.available_schedule}
              onChange={(e) => setEditForm({...editForm, available_schedule: e.target.value})}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowEditDialog(false)}>Hủy</Button>
          <Button onClick={handleSaveEdit} className="bg-teal-600 hover:bg-teal-700">Lưu thay đổi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </div>
  )
}

