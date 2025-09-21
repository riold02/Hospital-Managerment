"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DataTable } from "@/components/shared/DataTable"
import { SearchBar } from "@/components/shared/SearchBar"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { useToast } from "@/hooks/use-toast"
import { Bed, Plus, Edit, Trash2, Building } from "lucide-react"

interface Room {
  room_id: string
  room_number: string
  room_type: string
  capacity: number
  status: "Available" | "Occupied" | "Under Maintenance"
  last_serviced: string
}

interface RoomType {
  id: string
  name: string
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    room_number: "",
    room_type_id: "",
    capacity: 1,
    status: "Available" as Room["status"],
    last_serviced: new Date().toISOString().split("T")[0],
  })

  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Mock API calls - replace with actual endpoints
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockRooms: Room[] = [
        {
          room_id: "R001",
          room_number: "101",
          room_type: "Phòng đơn",
          capacity: 1,
          status: "Available",
          last_serviced: "2024-01-15",
        },
        {
          room_id: "R002",
          room_number: "102",
          room_type: "Phòng đôi",
          capacity: 2,
          status: "Occupied",
          last_serviced: "2024-01-14",
        },
        {
          room_id: "R003",
          room_number: "201",
          room_type: "ICU",
          capacity: 1,
          status: "Under Maintenance",
          last_serviced: "2024-01-10",
        },
        {
          room_id: "R004",
          room_number: "202",
          room_type: "Phòng VIP",
          capacity: 1,
          status: "Available",
          last_serviced: "2024-01-16",
        },
      ]

      const mockRoomTypes: RoomType[] = [
        { id: "1", name: "Phòng đơn" },
        { id: "2", name: "Phòng đôi" },
        { id: "3", name: "ICU" },
        { id: "4", name: "Phòng VIP" },
      ]

      setRooms(mockRooms)
      setRoomTypes(mockRoomTypes)
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu phòng",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRoom = async () => {
    try {
      // Validate unique room number
      const existingRoom = rooms.find((r) => r.room_number === formData.room_number)
      if (existingRoom) {
        toast({
          title: "Lỗi",
          description: "Số phòng đã tồn tại",
          variant: "destructive",
        })
        return
      }

      const roomType = roomTypes.find((t) => t.id === formData.room_type_id)
      const newRoom: Room = {
        room_id: `R${Date.now()}`,
        room_number: formData.room_number,
        room_type: roomType?.name || "",
        capacity: formData.capacity,
        status: formData.status,
        last_serviced: formData.last_serviced,
      }

      setRooms((prev) => [...prev, newRoom])
      setIsCreateModalOpen(false)
      resetForm()

      toast({
        title: "Thành công",
        description: "Đã tạo phòng mới",
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tạo phòng",
        variant: "destructive",
      })
    }
  }

  const handleEditRoom = async () => {
    if (!selectedRoom) return

    try {
      const roomType = roomTypes.find((t) => t.id === formData.room_type_id)
      const updatedRoom: Room = {
        ...selectedRoom,
        room_number: formData.room_number,
        room_type: roomType?.name || selectedRoom.room_type,
        capacity: formData.capacity,
        status: formData.status,
        last_serviced: formData.last_serviced,
      }

      setRooms((prev) => prev.map((r) => (r.room_id === selectedRoom.room_id ? updatedRoom : r)))
      setIsEditModalOpen(false)
      setSelectedRoom(null)
      resetForm()

      toast({
        title: "Thành công",
        description: "Đã cập nhật thông tin phòng",
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật phòng",
        variant: "destructive",
      })
    }
  }

  const handleDeleteRoom = async () => {
    if (!roomToDelete) return

    try {
      setRooms((prev) => prev.filter((r) => r.room_id !== roomToDelete.room_id))
      setDeleteDialogOpen(false)
      setRoomToDelete(null)

      toast({
        title: "Thành công",
        description: "Đã xóa phòng",
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa phòng",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      room_number: "",
      room_type_id: "",
      capacity: 1,
      status: "Available",
      last_serviced: new Date().toISOString().split("T")[0],
    })
  }

  const openEditModal = (room: Room) => {
    setSelectedRoom(room)
    const roomType = roomTypes.find((t) => t.name === room.room_type)
    setFormData({
      room_number: room.room_number,
      room_type_id: roomType?.id || "",
      capacity: room.capacity,
      status: room.status,
      last_serviced: room.last_serviced,
    })
    setIsEditModalOpen(true)
  }

  // Filter rooms
  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.room_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.room_type.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || room.status === statusFilter
    const matchesType = typeFilter === "all" || room.room_type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const columns = [
    {
      key: "room_number",
      label: "Số phòng",
      sortable: true,
    },
    {
      key: "room_type",
      label: "Loại phòng",
      sortable: true,
    },
    {
      key: "capacity",
      label: "Sức chứa",
      sortable: true,
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (room: Room) => <StatusBadge status={room.status} type="room" />,
    },
    {
      key: "last_serviced",
      label: "Bảo trì lần cuối",
      render: (room: Room) => new Date(room.last_serviced).toLocaleDateString("vi-VN"),
    },
    {
      key: "actions",
      label: "Hành động",
      render: (room: Room) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => openEditModal(room)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setRoomToDelete(room)
              setDeleteDialogOpen(true)
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  const availableRooms = rooms.filter((r) => r.status === "Available").length
  const occupiedRooms = rooms.filter((r) => r.status === "Occupied").length
  const maintenanceRooms = rooms.filter((r) => r.status === "Under Maintenance").length

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Phòng</h1>
          <p className="text-muted-foreground">Quản lý thông tin và trạng thái các phòng bệnh viện</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Thêm phòng mới
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm phòng mới</DialogTitle>
              <DialogDescription>Nhập thông tin phòng mới</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="room_number">Số phòng *</Label>
                <Input
                  id="room_number"
                  value={formData.room_number}
                  onChange={(e) => setFormData((prev) => ({ ...prev, room_number: e.target.value }))}
                  placeholder="Nhập số phòng"
                />
              </div>
              <div>
                <Label htmlFor="room_type">Loại phòng *</Label>
                <Select
                  value={formData.room_type_id}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, room_type_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại phòng" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="capacity">Sức chứa *</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData((prev) => ({ ...prev, capacity: Number.parseInt(e.target.value) || 1 }))}
                />
              </div>
              <div>
                <Label htmlFor="status">Trạng thái *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: Room["status"]) => setFormData((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Có sẵn</SelectItem>
                    <SelectItem value="Occupied">Đã sử dụng</SelectItem>
                    <SelectItem value="Under Maintenance">Đang bảo trì</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="last_serviced">Bảo trì lần cuối</Label>
                <Input
                  id="last_serviced"
                  type="date"
                  value={formData.last_serviced}
                  onChange={(e) => setFormData((prev) => ({ ...prev, last_serviced: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleCreateRoom}>Tạo phòng</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số phòng</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rooms.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Phòng trống</CardTitle>
            <Bed className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{availableRooms}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Phòng đang sử dụng</CardTitle>
            <Bed className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{occupiedRooms}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Phòng bảo trì</CardTitle>
            <Bed className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{maintenanceRooms}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách phòng</CardTitle>
          <div className="flex gap-4 items-center">
            <SearchBar onSearch={setSearchQuery} placeholder="Tìm kiếm phòng..." />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="Available">Có sẵn</SelectItem>
                <SelectItem value="Occupied">Đã sử dụng</SelectItem>
                <SelectItem value="Under Maintenance">Đang bảo trì</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Lọc theo loại phòng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại phòng</SelectItem>
                {roomTypes.map((type) => (
                  <SelectItem key={type.id} value={type.name}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filteredRooms} loading={loading} emptyMessage="Không có phòng nào" />
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa phòng</DialogTitle>
            <DialogDescription>Cập nhật thông tin phòng</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit_room_number">Số phòng *</Label>
              <Input
                id="edit_room_number"
                value={formData.room_number}
                onChange={(e) => setFormData((prev) => ({ ...prev, room_number: e.target.value }))}
                placeholder="Nhập số phòng"
              />
            </div>
            <div>
              <Label htmlFor="edit_room_type">Loại phòng *</Label>
              <Select
                value={formData.room_type_id}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, room_type_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại phòng" />
                </SelectTrigger>
                <SelectContent>
                  {roomTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit_capacity">Sức chứa *</Label>
              <Input
                id="edit_capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) => setFormData((prev) => ({ ...prev, capacity: Number.parseInt(e.target.value) || 1 }))}
              />
            </div>
            <div>
              <Label htmlFor="edit_status">Trạng thái *</Label>
              <Select
                value={formData.status}
                onValueChange={(value: Room["status"]) => setFormData((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Available">Có sẵn</SelectItem>
                  <SelectItem value="Occupied">Đã sử dụng</SelectItem>
                  <SelectItem value="Under Maintenance">Đang bảo trì</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit_last_serviced">Bảo trì lần cuối</Label>
              <Input
                id="edit_last_serviced"
                type="date"
                value={formData.last_serviced}
                onChange={(e) => setFormData((prev) => ({ ...prev, last_serviced: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleEditRoom}>Cập nhật</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteRoom}
        title="Xác nhận xóa phòng"
        description={`Bạn có chắc chắn muốn xóa phòng ${roomToDelete?.room_number}? Hành động này không thể hoàn tác.`}
      />
    </div>
  )
}
