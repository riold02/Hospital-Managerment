"use client"

import { useState, useEffect } from "react"
import { formatDateSafe } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Users, Search, Eye, Plus, Edit, Trash2 } from "lucide-react"
import { patientsApi } from "@/lib/api"
import { toast } from "@/hooks/use-toast"

export function PatientsTab({ onDataChange }: { onDataChange?: () => void }) {
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [addForm, setAddForm] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "",
    phone: "",
    email: "",
    password: "",
    confirm_password: "",
    address: "",
    blood_type: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
  })
  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    blood_type: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
  })

  useEffect(() => {
    loadPatients()
  }, [])

  const loadPatients = async () => {
    setLoading(true)
    try {
      const response = await patientsApi.getAllPatients({ limit: 50 })
      setPatients(response.data || [])
    } catch (error) {
      console.error("Error loading patients:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách bệnh nhân",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddPatient = async () => {
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
      const { confirm_password, ...patientData } = addForm
      await patientsApi.createPatient(patientData)
      toast({
        title: "Thành công",
        description: "Đã thêm bệnh nhân mới và tạo tài khoản đăng nhập",
      })
      setShowAddDialog(false)
      setAddForm({
        first_name: "",
        last_name: "",
        date_of_birth: "",
        gender: "",
        phone: "",
        email: "",
        password: "",
        confirm_password: "",
        address: "",
        blood_type: "",
        emergency_contact_name: "",
        emergency_contact_phone: "",
      })
      loadPatients()
      // Refresh dashboard data
      if (onDataChange) {
        onDataChange()
      }
    } catch (error) {
      console.error("Error adding patient:", error)
      toast({
        title: "Lỗi",
        description: "Không thể thêm bệnh nhân",
        variant: "destructive",
      })
    }
  }

  const handleViewDetail = (patient: any) => {
    setSelectedPatient(patient)
    setShowDetailDialog(true)
  }

  const handleEditPatient = (patient: any) => {
    setSelectedPatient(patient)
    setEditForm({
      first_name: patient.first_name,
      last_name: patient.last_name,
      date_of_birth: patient.date_of_birth ? new Date(patient.date_of_birth).toISOString().split('T')[0] : "",
      gender: patient.gender || "",
      phone: patient.phone || "",
      email: patient.email || "",
      address: patient.address || "",
      blood_type: patient.blood_type || "",
      emergency_contact_name: patient.emergency_contact_name || "",
      emergency_contact_phone: patient.emergency_contact_phone || "",
    })
    setShowEditDialog(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedPatient) return
    
    try {
      await patientsApi.updatePatient(selectedPatient.patient_id, editForm)
      toast({
        title: "Thành công",
        description: "Đã cập nhật thông tin bệnh nhân",
      })
      setShowEditDialog(false)
      loadPatients()
      // Refresh dashboard data
      if (onDataChange) {
        onDataChange()
      }
    } catch (error) {
      console.error("Error updating patient:", error)
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật thông tin bệnh nhân",
        variant: "destructive",
      })
    }
  }

  const handleDeletePatient = async (patientId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bệnh nhân này?')) return
    
    try {
      await patientsApi.deletePatient(patientId)
      toast({
        title: "Thành công",
        description: "Đã xóa bệnh nhân",
      })
      loadPatients()
      // Refresh dashboard data
      if (onDataChange) {
        onDataChange()
      }
    } catch (error) {
      console.error("Error deleting patient:", error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa bệnh nhân",
        variant: "destructive",
      })
    }
  }

  const filteredPatients = patients.filter(patient =>
    patient.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.patient_code?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Quản lý bệnh nhân ({filteredPatients.length})
          </CardTitle>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm bệnh nhân
          </Button>
        </div>
        <div className="flex items-center gap-4 mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm theo tên, mã BN, email..."
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
        ) : filteredPatients.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Users className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-medium mb-2">Không có bệnh nhân</h3>
            <p>Chưa có bệnh nhân nào trong hệ thống.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã BN</TableHead>
                  <TableHead>Họ và tên</TableHead>
                  <TableHead>Ngày sinh</TableHead>
                  <TableHead>Giới tính</TableHead>
                  <TableHead>Số điện thoại</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Nhóm máu</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow key={patient.patient_id}>
                    <TableCell className="font-medium">{patient.patient_code}</TableCell>
                    <TableCell className="font-medium">
                      {patient.first_name} {patient.last_name}
                    </TableCell>
                    <TableCell>
                      {formatDateSafe(patient.date_of_birth, 'date')}
                    </TableCell>
                    <TableCell>
                      {patient.gender === 'male' ? 'Nam' : patient.gender === 'female' ? 'Nữ' : 'Khác'}
                    </TableCell>
                    <TableCell>{patient.phone || 'N/A'}</TableCell>
                    <TableCell>{patient.email || 'N/A'}</TableCell>
                    <TableCell>
                      {patient.blood_type ? (
                        <Badge variant="outline">{patient.blood_type}</Badge>
                      ) : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={patient.is_active ? "default" : "secondary"}>
                        {patient.is_active ? "Hoạt động" : "Ngừng"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleViewDetail(patient)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEditPatient(patient)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeletePatient(patient.patient_id)}>
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

    {/* Add Patient Dialog */}
    <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thêm bệnh nhân mới</DialogTitle>
          <DialogDescription>Nhập thông tin bệnh nhân để thêm vào hệ thống</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Thông tin cá nhân */}
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
                <Label htmlFor="date_of_birth">Ngày sinh <span className="text-red-500">*</span></Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={addForm.date_of_birth}
                  onChange={(e) => setAddForm({...addForm, date_of_birth: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="gender">Giới tính <span className="text-red-500">*</span></Label>
                <Select value={addForm.gender} onValueChange={(value) => setAddForm({...addForm, gender: value})}>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Chọn giới tính" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Nam</SelectItem>
                    <SelectItem value="female">Nữ</SelectItem>
                    <SelectItem value="other">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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

            <div>
              <Label htmlFor="address">Địa chỉ</Label>
              <Input
                id="address"
                value={addForm.address}
                onChange={(e) => setAddForm({...addForm, address: e.target.value})}
                placeholder="Nhập địa chỉ đầy đủ"
              />
            </div>

            <div>
              <Label htmlFor="blood_type">Nhóm máu</Label>
              <Select value={addForm.blood_type} onValueChange={(value) => setAddForm({...addForm, blood_type: value})}>
                <SelectTrigger id="blood_type">
                  <SelectValue placeholder="Chọn nhóm máu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Thông tin đăng nhập */}
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

          {/* Liên hệ khẩn cấp */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Liên hệ khẩn cấp</h3>
            <div>
              <Label htmlFor="emergency_contact_name">Tên người liên hệ</Label>
              <Input
                id="emergency_contact_name"
                value={addForm.emergency_contact_name}
                onChange={(e) => setAddForm({...addForm, emergency_contact_name: e.target.value})}
                placeholder="VD: Nguyễn Văn A (Bố/Mẹ/Anh/Chị)"
              />
            </div>
            <div>
              <Label htmlFor="emergency_contact_phone">Số điện thoại liên hệ</Label>
              <Input
                id="emergency_contact_phone"
                value={addForm.emergency_contact_phone}
                onChange={(e) => setAddForm({...addForm, emergency_contact_phone: e.target.value})}
                placeholder="VD: 0987654321"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowAddDialog(false)}>Hủy</Button>
          <Button onClick={handleAddPatient} className="bg-blue-600 hover:bg-blue-700">Thêm bệnh nhân</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Detail Dialog */}
    <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết bệnh nhân</DialogTitle>
        </DialogHeader>
        {selectedPatient && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Mã bệnh nhân</label>
                <p className="font-semibold">{selectedPatient.patient_code}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Họ và tên</label>
                <p className="font-semibold">{selectedPatient.first_name} {selectedPatient.last_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Ngày sinh</label>
                <p>{formatDateSafe(selectedPatient.date_of_birth, 'date')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Giới tính</label>
                <p>{selectedPatient.gender === 'male' ? 'Nam' : selectedPatient.gender === 'female' ? 'Nữ' : 'Khác'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Số điện thoại</label>
                <p>{selectedPatient.phone || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p>{selectedPatient.email || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Nhóm máu</label>
                <p>{selectedPatient.blood_type || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Địa chỉ</label>
                <p>{selectedPatient.address || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Người liên hệ khẩn cấp</label>
                <p>{selectedPatient.emergency_contact_name || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">SĐT liên hệ khẩn cấp</label>
                <p>{selectedPatient.emergency_contact_phone || 'N/A'}</p>
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
          <DialogTitle>Chỉnh sửa thông tin bệnh nhân</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-3">
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
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="edit_date_of_birth">Ngày sinh</Label>
              <Input
                id="edit_date_of_birth"
                type="date"
                value={editForm.date_of_birth}
                onChange={(e) => setEditForm({...editForm, date_of_birth: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit_gender">Giới tính</Label>
              <Select value={editForm.gender} onValueChange={(value) => setEditForm({...editForm, gender: value})}>
                <SelectTrigger id="edit_gender">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Nam</SelectItem>
                  <SelectItem value="female">Nữ</SelectItem>
                  <SelectItem value="other">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="edit_phone">Số điện thoại</Label>
              <Input
                id="edit_phone"
                value={editForm.phone}
                onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit_email">Email</Label>
              <Input
                id="edit_email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="edit_address">Địa chỉ</Label>
            <Input
              id="edit_address"
              value={editForm.address}
              onChange={(e) => setEditForm({...editForm, address: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="edit_blood_type">Nhóm máu</Label>
            <Select value={editForm.blood_type} onValueChange={(value) => setEditForm({...editForm, blood_type: value})}>
              <SelectTrigger id="edit_blood_type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A+">A+</SelectItem>
                <SelectItem value="A-">A-</SelectItem>
                <SelectItem value="B+">B+</SelectItem>
                <SelectItem value="B-">B-</SelectItem>
                <SelectItem value="AB+">AB+</SelectItem>
                <SelectItem value="AB-">AB-</SelectItem>
                <SelectItem value="O+">O+</SelectItem>
                <SelectItem value="O-">O-</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="edit_emergency_contact_name">Người liên hệ khẩn cấp</Label>
              <Input
                id="edit_emergency_contact_name"
                value={editForm.emergency_contact_name}
                onChange={(e) => setEditForm({...editForm, emergency_contact_name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit_emergency_contact_phone">SĐT liên hệ khẩn cấp</Label>
              <Input
                id="edit_emergency_contact_phone"
                value={editForm.emergency_contact_phone}
                onChange={(e) => setEditForm({...editForm, emergency_contact_phone: e.target.value})}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowEditDialog(false)}>Hủy</Button>
          <Button onClick={handleSaveEdit} className="bg-blue-600 hover:bg-blue-700">Lưu thay đổi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </div>
  )
}
