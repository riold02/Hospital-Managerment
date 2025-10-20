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
import { UserCheck, Search, Eye, Plus, Edit, Trash2 } from "lucide-react"
import staffApi from "@/lib/api/staff-api"
import { toast } from "@/hooks/use-toast"

export function StaffTab() {
  const [staff, setStaff] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<any>(null)
  const [addForm, setAddForm] = useState({
    first_name: "",
    last_name: "",
    position: "",
    department_id: "",
    phone: "",
    email: "",
    password: "",
    confirm_password: "",
    hire_date: new Date().toISOString().split('T')[0],
  })
  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    position: "",
    department_id: "",
    phone: "",
    email: "",
    hire_date: "",
  })

  useEffect(() => {
    loadStaff()
  }, [])

  const loadStaff = async () => {
    setLoading(true)
    try {
      const response = await staffApi.getAllStaff({ limit: 100 })
      setStaff(response.data || [])
    } catch (error) {
      console.error("Error loading staff:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách nhân viên",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddStaff = async () => {
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
      // Map position to role for backend validation
      const roleMap: any = {
        'nurse': 'Nurse',
        'technician': 'Technician', 
        'pharmacist': 'Pharmacist',
        'lab_assistant': 'Lab Assistant',
        'cleaner': 'Worker'
      }
      
      // Remove confirm_password before sending to API
      const { confirm_password, ...staffData } = addForm
      const dataToSend = {
        ...staffData,
        role: roleMap[addForm.position] || 'Worker'
      }
      
      await staffApi.createStaff(dataToSend)
      toast({
        title: "Thành công",
        description: "Đã thêm nhân viên mới và tạo tài khoản đăng nhập",
      })
      setShowAddDialog(false)
      setAddForm({
        first_name: "",
        last_name: "",
        position: "",
        department_id: "",
        phone: "",
        email: "",
        password: "",
        confirm_password: "",
        hire_date: new Date().toISOString().split('T')[0],
      })
      loadStaff()
    } catch (error) {
      console.error("Error adding staff:", error)
      toast({
        title: "Lỗi",
        description: "Không thể thêm nhân viên",
        variant: "destructive",
      })
    }
  }

  const handleViewDetail = (member: any) => {
    setSelectedStaff(member)
    setShowDetailDialog(true)
  }

  const handleEditStaff = (member: any) => {
    setSelectedStaff(member)
    setEditForm({
      first_name: member.first_name,
      last_name: member.last_name,
      position: member.position || "",
      department_id: member.department_id?.toString() || "",
      phone: member.phone || "",
      email: member.email || "",
      hire_date: member.hire_date ? new Date(member.hire_date).toISOString().split('T')[0] : "",
    })
    setShowEditDialog(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedStaff) return
    
    try {
      // Map position to role for backend validation
      const roleMap: any = {
        'nurse': 'Nurse',
        'technician': 'Technician', 
        'pharmacist': 'Pharmacist',
        'lab_assistant': 'Lab Assistant',
        'cleaner': 'Worker'
      }
      
      const dataToSend = {
        ...editForm,
        role: roleMap[editForm.position] || 'Worker'
      }
      
      await staffApi.updateStaff(selectedStaff.staff_id, dataToSend)
      toast({
        title: "Thành công",
        description: "Đã cập nhật thông tin nhân viên",
      })
      setShowEditDialog(false)
      loadStaff()
    } catch (error) {
      console.error("Error updating staff:", error)
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật thông tin nhân viên",
        variant: "destructive",
      })
    }
  }

  const handleDeleteStaff = async (staffId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) return
    
    try {
      await staffApi.deleteStaff(staffId)
      toast({
        title: "Thành công",
        description: "Đã xóa nhân viên",
      })
      loadStaff()
    } catch (error) {
      console.error("Error deleting staff:", error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa nhân viên",
        variant: "destructive",
      })
    }
  }

  const filteredStaff = staff.filter(member =>
    member.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.position?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getPositionBadge = (position: string) => {
    const map: any = {
      'nurse': { label: 'Y tá', color: 'bg-green-100 text-green-800' },
      'technician': { label: 'Kỹ thuật viên', color: 'bg-blue-100 text-blue-800' },
      'pharmacist': { label: 'Dược sĩ', color: 'bg-pink-100 text-pink-800' },
      'lab_assistant': { label: 'Trợ lý XN', color: 'bg-indigo-100 text-indigo-800' },
      'cleaner': { label: 'Nhân viên vệ sinh', color: 'bg-gray-100 text-gray-800' },
      'quản trị hệ thống': { label: 'Quản trị hệ thống', color: 'bg-red-100 text-red-800' },
    }
    return map[position?.toLowerCase()] || { label: position || 'Khác', color: 'bg-gray-100 text-gray-800' }
  }

  return (
    <div className="space-y-6">
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-purple-600" />
            Quản lý nhân viên ({filteredStaff.length})
          </CardTitle>
          <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm nhân viên
          </Button>
        </div>
        <div className="flex items-center gap-4 mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm theo tên, vị trí..."
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
        ) : filteredStaff.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <UserCheck className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-medium mb-2">Không có nhân viên</h3>
            <p>Chưa có nhân viên nào trong hệ thống.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Họ và tên</TableHead>
                  <TableHead>Vị trí</TableHead>
                  <TableHead>Khoa</TableHead>
                  <TableHead>Số điện thoại</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Ngày vào làm</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((member) => {
                  const positionBadge = getPositionBadge(member.position)
                  
                  return (
                    <TableRow key={member.staff_id}>
                      <TableCell className="font-medium">#{member.staff_id}</TableCell>
                      <TableCell className="font-medium">
                        {member.first_name} {member.last_name}
                      </TableCell>
                      <TableCell>
                        <Badge className={positionBadge.color}>{positionBadge.label}</Badge>
                        <div className="text-xs text-gray-500 mt-1">Role: {member.role || 'N/A'}</div>
                      </TableCell>
                      <TableCell>{member.department?.department_name || 'N/A'}</TableCell>
                      <TableCell>{member.phone || 'N/A'}</TableCell>
                      <TableCell>{member.email || 'N/A'}</TableCell>
                      <TableCell>
                        {member.hire_date ? new Date(member.hire_date).toLocaleDateString('vi-VN') : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleViewDetail(member)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleEditStaff(member)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteStaff(member.staff_id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>

    {/* Add Staff Dialog */}
    <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thêm nhân viên mới</DialogTitle>
          <DialogDescription>Nhập thông tin nhân viên để thêm vào hệ thống</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Thông tin cá nhân</h3>
            <div className="grid grid-cols-2 gap-3">
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
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="position">Vị trí <span className="text-red-500">*</span></Label>
                <Select value={addForm.position} onValueChange={(value) => setAddForm({...addForm, position: value})}>
                  <SelectTrigger id="position">
                    <SelectValue placeholder="Chọn vị trí" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nurse">Y tá</SelectItem>
                    <SelectItem value="technician">Kỹ thuật viên</SelectItem>
                    <SelectItem value="pharmacist">Dược sĩ</SelectItem>
                    <SelectItem value="lab_assistant">Trợ lý xét nghiệm</SelectItem>
                    <SelectItem value="cleaner">Nhân viên vệ sinh</SelectItem>
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
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="hire_date">Ngày vào làm</Label>
                <Input
                  id="hire_date"
                  type="date"
                  value={addForm.hire_date}
                  onChange={(e) => setAddForm({...addForm, hire_date: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="department_id">ID Khoa (tùy chọn)</Label>
                <Input
                  id="department_id"
                  type="number"
                  value={addForm.department_id}
                  onChange={(e) => setAddForm({...addForm, department_id: e.target.value})}
                  placeholder="Nhập ID khoa"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Thông tin đăng nhập</h3>
            <div>
              <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
              <Input
                id="email"
                type="email"
                value={addForm.email}
                onChange={(e) => setAddForm({...addForm, email: e.target.value})}
                placeholder="email@example.com"
              />
              <p className="text-xs text-gray-500 mt-1">Email này sẽ dùng để đăng nhập vào hệ thống</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
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
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowAddDialog(false)}>Hủy</Button>
          <Button onClick={handleAddStaff} className="bg-purple-600 hover:bg-purple-700">Thêm nhân viên</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Detail Dialog */}
    <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chi tiết nhân viên</DialogTitle>
        </DialogHeader>
        {selectedStaff && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">ID</label>
                <p className="font-semibold">#{selectedStaff.staff_id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Họ và tên</label>
                <p className="font-semibold">{selectedStaff.first_name} {selectedStaff.last_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Vị trí</label>
                <Badge className={getPositionBadge(selectedStaff.position).color}>
                  {getPositionBadge(selectedStaff.position).label}
                </Badge>
                <div className="text-xs text-gray-500 mt-1">Role: {selectedStaff.role || 'N/A'}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Khoa</label>
                <p>{selectedStaff.department?.department_name || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Số điện thoại</label>
                <p>{selectedStaff.phone || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p>{selectedStaff.email || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Ngày vào làm</label>
                <p>{selectedStaff.hire_date ? new Date(selectedStaff.hire_date).toLocaleDateString('vi-VN') : 'N/A'}</p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>

    {/* Edit Dialog */}
    <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa thông tin nhân viên</DialogTitle>
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
            <Label htmlFor="edit_position">Vị trí</Label>
            <Select value={editForm.position} onValueChange={(value) => setEditForm({...editForm, position: value})}>
              <SelectTrigger id="edit_position">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nurse">Y tá</SelectItem>
                <SelectItem value="technician">Kỹ thuật viên</SelectItem>
                <SelectItem value="pharmacist">Dược sĩ</SelectItem>
                <SelectItem value="lab_assistant">Trợ lý xét nghiệm</SelectItem>
                <SelectItem value="cleaner">Nhân viên vệ sinh</SelectItem>
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
          <div>
            <Label htmlFor="edit_hire_date">Ngày vào làm</Label>
            <Input
              id="edit_hire_date"
              type="date"
              value={editForm.hire_date}
              onChange={(e) => setEditForm({...editForm, hire_date: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="edit_department_id">ID Khoa</Label>
            <Input
              id="edit_department_id"
              type="number"
              value={editForm.department_id}
              onChange={(e) => setEditForm({...editForm, department_id: e.target.value})}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowEditDialog(false)}>Hủy</Button>
          <Button onClick={handleSaveEdit} className="bg-purple-600 hover:bg-purple-700">Lưu thay đổi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </div>
  )
}
