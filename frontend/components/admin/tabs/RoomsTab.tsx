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
import { Textarea } from "@/components/ui/textarea"
import { Building2, Search, Eye, Plus, Edit, Trash2, Settings } from "lucide-react"
import { roomsApi } from "@/lib/api"
import { toast } from "@/hooks/use-toast"
import { formatDateSafe } from "@/lib/utils"

export function RoomsTab() {
  const [rooms, setRooms] = useState<any[]>([])
  const [roomTypes, setRoomTypes] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<any>(null)
  const [addForm, setAddForm] = useState({
    room_number: "",
    room_type_id: "",
    department_id: "",
    capacity: 1,
    floor_number: "",
    building: "",
    description: "",
    is_active: true
  })
  const [editForm, setEditForm] = useState({
    room_number: "",
    room_type_id: "",
    department_id: "",
    capacity: 1,
    floor_number: "",
    building: "",
    description: "",
    is_active: true
  })

  useEffect(() => {
    loadRooms()
    loadRoomTypes()
    loadDepartments()
  }, [])

  const loadRooms = async () => {
    setLoading(true)
    try {
      const response = await roomsApi.getAllRooms({ limit: 100 })
      setRooms(response.data || [])
    } catch (error) {
      console.error("Error loading rooms:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách phòng",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadRoomTypes = async () => {
    try {
      const response = await roomsApi.getAllRoomTypes()
      setRoomTypes(response.data || [])
    } catch (error) {
      console.error("Error loading room types:", error)
    }
  }

  const loadDepartments = async () => {
    try {
      const response = await roomsApi.getAllDepartments()
      setDepartments(response.data || [])
    } catch (error) {
      console.error("Error loading departments:", error)
    }
  }

  const handleAddRoom = async () => {
    try {
      const roomData = {
        ...addForm,
        capacity: parseInt(addForm.capacity.toString()),
        floor_number: addForm.floor_number ? parseInt(addForm.floor_number.toString()) : null,
        room_type_id: addForm.room_type_id ? parseInt(addForm.room_type_id) : null,
        department_id: addForm.department_id ? parseInt(addForm.department_id) : null
      }
      
      await roomsApi.createRoom(roomData)
      toast({
        title: "Thành công",
        description: "Đã thêm phòng mới",
      })
      setShowAddDialog(false)
      resetAddForm()
      loadRooms()
    } catch (error) {
      console.error("Error adding room:", error)
      toast({
        title: "Lỗi",
        description: "Không thể thêm phòng",
        variant: "destructive",
      })
    }
  }

  const handleEditRoom = async () => {
    if (!selectedRoom) return
    
    try {
      const roomData = {
        ...editForm,
        capacity: parseInt(editForm.capacity.toString()),
        floor_number: editForm.floor_number ? parseInt(editForm.floor_number.toString()) : null,
        room_type_id: editForm.room_type_id ? parseInt(editForm.room_type_id) : null,
        department_id: editForm.department_id ? parseInt(editForm.department_id) : null
      }
      
      await roomsApi.updateRoom(selectedRoom.room_id, roomData)
      toast({
        title: "Thành công",
        description: "Đã cập nhật phòng",
      })
      setShowEditDialog(false)
      setSelectedRoom(null)
      loadRooms()
    } catch (error) {
      console.error("Error updating room:", error)
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật phòng",
        variant: "destructive",
      })
    }
  }

  const handleDeleteRoom = async (roomId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa phòng này?")) return
    
    try {
      await roomsApi.deleteRoom(roomId)
      toast({
        title: "Thành công",
        description: "Đã xóa phòng",
      })
      loadRooms()
    } catch (error) {
      console.error("Error deleting room:", error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa phòng",
        variant: "destructive",
      })
    }
  }

  const handleViewDetail = (room: any) => {
    setSelectedRoom(room)
    setShowDetailDialog(true)
  }

  const handleEdit = (room: any) => {
    setSelectedRoom(room)
    setEditForm({
      room_number: room.room_number || "",
      room_type_id: room.room_type_id?.toString() || "",
      department_id: room.department_id?.toString() || "",
      capacity: room.capacity || 1,
      floor_number: room.floor_number?.toString() || "",
      building: room.building || "",
      description: room.description || "",
      is_active: room.is_active !== false
    })
    setShowEditDialog(true)
  }

  const resetAddForm = () => {
    setAddForm({
      room_number: "",
      room_type_id: "",
      department_id: "",
      capacity: 1,
      floor_number: "",
      building: "",
      description: "",
      is_active: true
    })
  }

  const filteredRooms = rooms.filter(room =>
    room.room_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.room_type?.type_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getRoomStatus = (room: any) => {
    if (!room.is_available) return { label: 'Không khả dụng', variant: 'destructive' as const }
    if (room.current_occupancy >= room.capacity) return { label: 'Đầy', variant: 'destructive' as const }
    if (room.current_occupancy > 0) return { label: 'Đang sử dụng', variant: 'default' as const }
    return { label: 'Trống', variant: 'secondary' as const }
  }

  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-indigo-600" />
            Quản lý phòng bệnh ({filteredRooms.length})
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={() => setShowAddDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm phòng
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Loại phòng
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm số phòng, loại phòng..."
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
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Building2 className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-medium mb-2">Không có phòng</h3>
            <p>Chưa có phòng nào trong hệ thống.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Số phòng</TableHead>
                  <TableHead>Loại phòng</TableHead>
                  <TableHead>Khoa</TableHead>
                  <TableHead>Sức chứa</TableHead>
                  <TableHead>Đang sử dụng</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRooms.map((room) => {
                  const status = getRoomStatus(room)
                  const occupancyRate = room.capacity > 0 
                    ? Math.round((room.current_occupancy / room.capacity) * 100) 
                    : 0
                  
                  return (
                    <TableRow key={room.room_id}>
                      <TableCell className="font-medium">{room.room_number}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{room.room_type?.type_name || 'Chung'}</Badge>
                      </TableCell>
                      <TableCell>{room.department?.name || 'N/A'}</TableCell>
                      <TableCell>{room.capacity || 0}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{room.current_occupancy || 0}/{room.capacity || 0}</span>
                          <span className="text-xs text-gray-500">({occupancyRate}%)</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewDetail(room)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEdit(room)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDeleteRoom(room.room_id)}
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

    {/* Add Room Dialog */}
    <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Thêm phòng mới</DialogTitle>
          <DialogDescription>
            Nhập thông tin phòng bệnh mới
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div>
            <Label htmlFor="room_number">Số phòng *</Label>
            <Input
              id="room_number"
              value={addForm.room_number}
              onChange={(e) => setAddForm({ ...addForm, room_number: e.target.value })}
              placeholder="VD: P101"
            />
          </div>
          <div>
            <Label htmlFor="capacity">Sức chứa *</Label>
            <Input
              id="capacity"
              type="number"
              min="1"
              value={addForm.capacity}
              onChange={(e) => setAddForm({ ...addForm, capacity: parseInt(e.target.value) || 1 })}
            />
          </div>
          <div>
            <Label htmlFor="room_type">Loại phòng</Label>
            <Select value={addForm.room_type_id} onValueChange={(value) => setAddForm({ ...addForm, room_type_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại phòng" />
              </SelectTrigger>
              <SelectContent>
                {roomTypes.map((type) => (
                  <SelectItem key={type.room_type_id} value={type.room_type_id.toString()}>
                    {type.type_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="department">Khoa</Label>
            <Select value={addForm.department_id} onValueChange={(value) => setAddForm({ ...addForm, department_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn khoa" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.department_id} value={dept.department_id.toString()}>
                    {dept.department_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="floor_number">Tầng</Label>
            <Input
              id="floor_number"
              type="number"
              value={addForm.floor_number}
              onChange={(e) => setAddForm({ ...addForm, floor_number: e.target.value })}
              placeholder="VD: 1"
            />
          </div>
          <div>
            <Label htmlFor="building">Tòa nhà</Label>
            <Input
              id="building"
              value={addForm.building}
              onChange={(e) => setAddForm({ ...addForm, building: e.target.value })}
              placeholder="VD: Tòa A"
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={addForm.description}
              onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
              placeholder="Mô tả về phòng..."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowAddDialog(false)}>
            Hủy
          </Button>
          <Button onClick={handleAddRoom}>
            Thêm phòng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Edit Room Dialog */}
    <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa phòng</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin phòng bệnh
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div>
            <Label htmlFor="edit_room_number">Số phòng *</Label>
            <Input
              id="edit_room_number"
              value={editForm.room_number}
              onChange={(e) => setEditForm({ ...editForm, room_number: e.target.value })}
              placeholder="VD: P101"
            />
          </div>
          <div>
            <Label htmlFor="edit_capacity">Sức chứa *</Label>
            <Input
              id="edit_capacity"
              type="number"
              min="1"
              value={editForm.capacity}
              onChange={(e) => setEditForm({ ...editForm, capacity: parseInt(e.target.value) || 1 })}
            />
          </div>
          <div>
            <Label htmlFor="edit_room_type">Loại phòng</Label>
            <Select value={editForm.room_type_id} onValueChange={(value) => setEditForm({ ...editForm, room_type_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại phòng" />
              </SelectTrigger>
              <SelectContent>
                {roomTypes.map((type) => (
                  <SelectItem key={type.room_type_id} value={type.room_type_id.toString()}>
                    {type.type_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="edit_department">Khoa</Label>
            <Select value={editForm.department_id} onValueChange={(value) => setEditForm({ ...editForm, department_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn khoa" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.department_id} value={dept.department_id.toString()}>
                    {dept.department_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="edit_floor_number">Tầng</Label>
            <Input
              id="edit_floor_number"
              type="number"
              value={editForm.floor_number}
              onChange={(e) => setEditForm({ ...editForm, floor_number: e.target.value })}
              placeholder="VD: 1"
            />
          </div>
          <div>
            <Label htmlFor="edit_building">Tòa nhà</Label>
            <Input
              id="edit_building"
              value={editForm.building}
              onChange={(e) => setEditForm({ ...editForm, building: e.target.value })}
              placeholder="VD: Tòa A"
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor="edit_description">Mô tả</Label>
            <Textarea
              id="edit_description"
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              placeholder="Mô tả về phòng..."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowEditDialog(false)}>
            Hủy
          </Button>
          <Button onClick={handleEditRoom}>
            Cập nhật
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Room Detail Dialog */}
    <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Chi tiết phòng</DialogTitle>
          <DialogDescription>
            Thông tin chi tiết về phòng bệnh
          </DialogDescription>
        </DialogHeader>
        {selectedRoom && (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Số phòng</Label>
                <p className="font-semibold">{selectedRoom.room_number}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Loại phòng</Label>
                <p>{selectedRoom.room_type?.type_name || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Khoa</Label>
                <p>{selectedRoom.department?.department_name || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Sức chứa</Label>
                <p>{selectedRoom.capacity || 0} giường</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Đang sử dụng</Label>
                <p>{selectedRoom.current_occupancy || 0}/{selectedRoom.capacity || 0}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Tầng</Label>
                <p>{selectedRoom.floor_number || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Tòa nhà</Label>
                <p>{selectedRoom.building || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Giá thuê/ngày</Label>
                <p>{selectedRoom.daily_rate ? `${selectedRoom.daily_rate.toLocaleString()} VNĐ` : 'N/A'}</p>
              </div>
            </div>
            {selectedRoom.description && (
              <div>
                <Label className="text-sm font-medium text-gray-500">Mô tả</Label>
                <p className="text-sm">{selectedRoom.description}</p>
              </div>
            )}
            <div>
              <Label className="text-sm font-medium text-gray-500">Ngày tạo</Label>
              <p>{formatDateSafe(selectedRoom.created_at, 'datetime')}</p>
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
