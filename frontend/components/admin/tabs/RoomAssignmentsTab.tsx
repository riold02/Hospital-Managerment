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
import { UserPlus, Search, Eye, Plus, Bed, Edit, Trash2 } from "lucide-react"
import { roomsApi, patientsApi } from "@/lib/api"
import { toast } from "@/hooks/use-toast"
import { formatDateSafe } from "@/lib/utils"

export function RoomAssignmentsTab() {
  const [assignments, setAssignments] = useState<any[]>([])
  const [rooms, setRooms] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null)
  const [addForm, setAddForm] = useState({
    room_id: "",
    patient_id: "",
    assignment_type: "Patient",
    start_date: "",
    end_date: "",
    notes: ""
  })
  const [editForm, setEditForm] = useState({
    room_id: "",
    patient_id: "",
    assignment_type: "Patient",
    start_date: "",
    end_date: "",
    notes: ""
  })

  useEffect(() => {
    loadAssignments()
    loadRooms()
    loadPatients()
  }, [])

  const loadAssignments = async () => {
    setLoading(true)
    try {
      const response = await roomsApi.getAllRoomAssignments({ limit: 100 })
      setAssignments(response.data || [])
    } catch (error) {
      console.error("Error loading room assignments:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách phân giường",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadRooms = async () => {
    try {
      const response = await roomsApi.getAllRooms({ limit: 100 })
      setRooms(response.data || [])
    } catch (error) {
      console.error("Error loading rooms:", error)
    }
  }

  const loadPatients = async () => {
    try {
      const response = await patientsApi.getAllPatients({ limit: 100 })
      setPatients(response.data || [])
    } catch (error) {
      console.error("Error loading patients:", error)
    }
  }

  const handleAddAssignment = async () => {
    try {
      const assignmentData = {
        ...addForm,
        room_id: parseInt(addForm.room_id),
        patient_id: parseInt(addForm.patient_id),
        start_date: new Date(addForm.start_date).toISOString(),
        end_date: addForm.end_date ? new Date(addForm.end_date).toISOString() : null
      }
      
      await roomsApi.createRoomAssignment(assignmentData)
      toast({
        title: "Thành công",
        description: "Đã thêm phân giường mới",
      })
      setShowAddDialog(false)
      resetAddForm()
      loadAssignments()
    } catch (error) {
      console.error("Error adding assignment:", error)
      toast({
        title: "Lỗi",
        description: "Không thể thêm phân giường",
        variant: "destructive",
      })
    }
  }

  const handleEditAssignment = async () => {
    if (!selectedAssignment) return
    
    try {
      const assignmentData = {
        ...editForm,
        room_id: parseInt(editForm.room_id),
        patient_id: parseInt(editForm.patient_id),
        start_date: new Date(editForm.start_date).toISOString(),
        end_date: editForm.end_date ? new Date(editForm.end_date).toISOString() : null
      }
      
      await roomsApi.updateRoomAssignment(selectedAssignment.assignment_id, assignmentData)
      toast({
        title: "Thành công",
        description: "Đã cập nhật phân giường",
      })
      setShowEditDialog(false)
      setSelectedAssignment(null)
      loadAssignments()
    } catch (error) {
      console.error("Error updating assignment:", error)
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật phân giường",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAssignment = async (assignmentId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa phân giường này?")) return
    
    try {
      await roomsApi.deleteRoomAssignment(assignmentId)
      toast({
        title: "Thành công",
        description: "Đã xóa phân giường",
      })
      loadAssignments()
    } catch (error) {
      console.error("Error deleting assignment:", error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa phân giường",
        variant: "destructive",
      })
    }
  }

  const handleViewDetail = (assignment: any) => {
    setSelectedAssignment(assignment)
    setShowDetailDialog(true)
  }

  const handleEdit = (assignment: any) => {
    setSelectedAssignment(assignment)
    setEditForm({
      room_id: assignment.room_id?.toString() || "",
      patient_id: assignment.patient_id?.toString() || "",
      assignment_type: assignment.assignment_type || "Patient",
      start_date: assignment.start_date ? new Date(assignment.start_date).toISOString().split('T')[0] : "",
      end_date: assignment.end_date ? new Date(assignment.end_date).toISOString().split('T')[0] : "",
      notes: assignment.notes || ""
    })
    setShowEditDialog(true)
  }

  const resetAddForm = () => {
    setAddForm({
      room_id: "",
      patient_id: "",
      assignment_type: "Patient",
      start_date: "",
      end_date: "",
      notes: ""
    })
  }

  const filteredAssignments = assignments.filter(assignment =>
    (assignment.patient ? `${assignment.patient.first_name} ${assignment.patient.last_name}` : '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.room?.room_number?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    const statusMap: any = {
      'active': { label: 'Đang điều trị', variant: 'default' },
      'discharged': { label: 'Đã xuất viện', variant: 'secondary' },
      'transferred': { label: 'Chuyển phòng', variant: 'outline' }
    }
    return statusMap[status] || { label: status, variant: 'outline' }
  }

  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bed className="h-5 w-5 text-purple-600" />
            Phân công phòng bệnh ({filteredAssignments.length})
          </CardTitle>
          <Button 
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Thêm phân công
          </Button>
        </div>
        <div className="flex items-center gap-4 mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm bệnh nhân, phòng..."
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
        ) : filteredAssignments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Bed className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-medium mb-2">Không có phân công</h3>
            <p>Chưa có phân công phòng bệnh nào.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bệnh nhân</TableHead>
                  <TableHead>Phòng</TableHead>
                  <TableHead>Giường</TableHead>
                  <TableHead>Ngày nhập</TableHead>
                  <TableHead>Ngày xuất dự kiến</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments.map((assignment) => {
                  const status = getStatusBadge(assignment.status || 'active')
                  
                  return (
                    <TableRow key={assignment.assignment_id}>
                      <TableCell className="font-medium">
                        {assignment.patient ? `${assignment.patient.first_name} ${assignment.patient.last_name}` : 'N/A'}
                      </TableCell>
                      <TableCell>{assignment.room?.room_number || 'N/A'}</TableCell>
                      <TableCell>{assignment.bed_number || 'N/A'}</TableCell>
                      <TableCell>
                        {assignment.start_date 
                          ? formatDateSafe(assignment.start_date, 'date')
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {assignment.end_date 
                          ? formatDateSafe(assignment.end_date, 'date')
                          : 'Chưa xác định'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewDetail(assignment)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEdit(assignment)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDeleteAssignment(assignment.assignment_id)}
                          >
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

    {/* Add Assignment Dialog */}
    <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Thêm phân giường mới</DialogTitle>
          <DialogDescription>
            Phân công bệnh nhân vào phòng bệnh
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div>
            <Label htmlFor="patient">Bệnh nhân *</Label>
            <Select value={addForm.patient_id} onValueChange={(value) => setAddForm({ ...addForm, patient_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn bệnh nhân" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.patient_id} value={patient.patient_id.toString()}>
                    {patient.first_name} {patient.last_name} - {patient.patient_code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="room">Phòng *</Label>
            <Select value={addForm.room_id} onValueChange={(value) => setAddForm({ ...addForm, room_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn phòng" />
              </SelectTrigger>
              <SelectContent>
                {rooms.map((room) => (
                  <SelectItem key={room.room_id} value={room.room_id.toString()}>
                    {room.room_number} - {room.room_type?.type_name || 'Chung'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="assignment_type">Loại phân công</Label>
            <Select value={addForm.assignment_type} onValueChange={(value) => setAddForm({ ...addForm, assignment_type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Patient">Bệnh nhân</SelectItem>
                <SelectItem value="Staff">Nhân viên</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="start_date">Ngày bắt đầu *</Label>
            <Input
              id="start_date"
              type="date"
              value={addForm.start_date}
              onChange={(e) => setAddForm({ ...addForm, start_date: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="end_date">Ngày kết thúc</Label>
            <Input
              id="end_date"
              type="date"
              value={addForm.end_date}
              onChange={(e) => setAddForm({ ...addForm, end_date: e.target.value })}
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor="notes">Ghi chú</Label>
            <Input
              id="notes"
              value={addForm.notes}
              onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })}
              placeholder="Ghi chú về phân công..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowAddDialog(false)}>
            Hủy
          </Button>
          <Button onClick={handleAddAssignment}>
            Thêm phân công
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Edit Assignment Dialog */}
    <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa phân giường</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin phân công phòng bệnh
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div>
            <Label htmlFor="edit_patient">Bệnh nhân *</Label>
            <Select value={editForm.patient_id} onValueChange={(value) => setEditForm({ ...editForm, patient_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn bệnh nhân" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.patient_id} value={patient.patient_id.toString()}>
                    {patient.first_name} {patient.last_name} - {patient.patient_code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="edit_room">Phòng *</Label>
            <Select value={editForm.room_id} onValueChange={(value) => setEditForm({ ...editForm, room_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn phòng" />
              </SelectTrigger>
              <SelectContent>
                {rooms.map((room) => (
                  <SelectItem key={room.room_id} value={room.room_id.toString()}>
                    {room.room_number} - {room.room_type?.type_name || 'Chung'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="edit_assignment_type">Loại phân công</Label>
            <Select value={editForm.assignment_type} onValueChange={(value) => setEditForm({ ...editForm, assignment_type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Patient">Bệnh nhân</SelectItem>
                <SelectItem value="Staff">Nhân viên</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="edit_start_date">Ngày bắt đầu *</Label>
            <Input
              id="edit_start_date"
              type="date"
              value={editForm.start_date}
              onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="edit_end_date">Ngày kết thúc</Label>
            <Input
              id="edit_end_date"
              type="date"
              value={editForm.end_date}
              onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })}
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor="edit_notes">Ghi chú</Label>
            <Input
              id="edit_notes"
              value={editForm.notes}
              onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              placeholder="Ghi chú về phân công..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowEditDialog(false)}>
            Hủy
          </Button>
          <Button onClick={handleEditAssignment}>
            Cập nhật
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Assignment Detail Dialog */}
    <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Chi tiết phân giường</DialogTitle>
          <DialogDescription>
            Thông tin chi tiết về phân công phòng bệnh
          </DialogDescription>
        </DialogHeader>
        {selectedAssignment && (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Bệnh nhân</Label>
                <p className="font-semibold">
                  {selectedAssignment.patient?.first_name} {selectedAssignment.patient?.last_name}
                </p>
                <p className="text-sm text-gray-500">{selectedAssignment.patient?.patient_code}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Phòng</Label>
                <p className="font-semibold">{selectedAssignment.room?.room_number}</p>
                <p className="text-sm text-gray-500">{selectedAssignment.room?.room_type?.type_name || 'Chung'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Loại phân công</Label>
                <p>{selectedAssignment.assignment_type || 'Patient'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Ngày bắt đầu</Label>
                <p>{formatDateSafe(selectedAssignment.start_date, 'date')}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Ngày kết thúc</Label>
                <p>{selectedAssignment.end_date ? formatDateSafe(selectedAssignment.end_date, 'date') : 'Chưa xác định'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Trạng thái</Label>
                <Badge variant={getStatusBadge(selectedAssignment.status || 'active').variant}>
                  {getStatusBadge(selectedAssignment.status || 'active').label}
                </Badge>
              </div>
            </div>
            {selectedAssignment.notes && (
              <div>
                <Label className="text-sm font-medium text-gray-500">Ghi chú</Label>
                <p className="text-sm">{selectedAssignment.notes}</p>
              </div>
            )}
            <div>
              <Label className="text-sm font-medium text-gray-500">Ngày tạo</Label>
              <p>{formatDateSafe(selectedAssignment.created_at, 'datetime')}</p>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </>
  )
}
