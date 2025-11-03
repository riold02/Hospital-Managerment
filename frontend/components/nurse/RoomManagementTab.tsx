"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import {
  Home,
  Users,
  Bed,
  Plus,
  Eye,
  UserPlus,
  LogOut,
  Search,
  Filter
} from "lucide-react"
import { Room, RoomAssignment, roomsApi } from "@/lib/api"

interface RoomManagementTabProps {
  rooms: Room[]
  roomAssignments: RoomAssignment[]
  patients: any[]
  onRefresh: () => void
}

// Helper functions - moved outside component to be accessible by child modals
const getStatusColor = (status: string) => {
  // API returns lowercase status
  const statusLower = status.toLowerCase()
  switch (statusLower) {
    case 'available':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'occupied':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'maintenance':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'cleaning':
      return 'bg-purple-100 text-purple-800 border-purple-200'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusLabel = (status: string) => {
  // API returns lowercase status
  const statusLower = status.toLowerCase()
  switch (statusLower) {
    case 'available': return 'Trống'
    case 'occupied': return 'Đang sử dụng'
    case 'maintenance': return 'Bảo trì'
    case 'cleaning': return 'Đang dọn'
    default: return status
  }
}

export default function RoomManagementTab({
  rooms,
  roomAssignments,
  patients,
  onRefresh
}: RoomManagementTabProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [showRoomDetail, setShowRoomDetail] = useState(false)
  const [showAssignmentModal, setShowAssignmentModal] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<RoomAssignment | null>(null)
  const [showAssignmentDetail, setShowAssignmentDetail] = useState(false)
  const [showDischargeConfirm, setShowDischargeConfirm] = useState(false)
  const [dischargingAssignmentId, setDischargingAssignmentId] = useState<number | null>(null)

  // Filter rooms
  const filteredRooms = (rooms || []).filter(room => {
    const matchesSearch = room.room_number.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || room.status.toLowerCase() === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

  const getRoomAssignments = (roomId: number) => {
    return (roomAssignments || []).filter(
      assignment => assignment.room_id === roomId && !assignment.end_date
    )
  }

  const handleViewRoom = (room: Room) => {
    setSelectedRoom(room)
    setShowRoomDetail(true)
  }

  const handleAssignPatient = (room: Room) => {
    setSelectedRoom(room)
    setShowAssignmentModal(true)
  }

  const handleViewAssignment = (assignment: RoomAssignment) => {
    setSelectedAssignment(assignment)
    setShowAssignmentDetail(true)
  }

  const handleEndAssignment = (assignmentId: number) => {
    setDischargingAssignmentId(assignmentId)
    setShowDischargeConfirm(true)
  }

  const confirmDischarge = async () => {
    if (!dischargingAssignmentId) return

    try {
      await roomsApi.endRoomAssignment(dischargingAssignmentId)
      toast({
        title: "Thành công",
        description: "Đã xuất viện bệnh nhân",
      })
      setShowDischargeConfirm(false)
      setDischargingAssignmentId(null)
      setShowAssignmentDetail(false)
      onRefresh()
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xuất viện",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[250px]">
              <Label className="text-xs mb-2">Tìm kiếm phòng</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Nhập số phòng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="w-[200px]">
              <Label className="text-xs mb-2">Trạng thái</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="available">Trống</SelectItem>
                  <SelectItem value="occupied">Đang sử dụng</SelectItem>
                  <SelectItem value="maintenance">Bảo trì</SelectItem>
                  <SelectItem value="cleaning">Đang dọn</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <p className="text-sm text-muted-foreground">
                Hiển thị <span className="font-semibold text-primary">{filteredRooms.length}</span> / <span className="font-semibold">{rooms?.length || 0}</span> phòng
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRooms.map((room) => {
          const assignments = getRoomAssignments(room.room_id)
          const isOccupied = assignments.length > 0

          return (
            <Card key={room.room_id} className={`hover:shadow-lg transition-all ${isOccupied ? 'border-blue-200' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Home className="h-5 w-5 text-blue-600" />
                    Phòng {room.room_number}
                  </CardTitle>
                  <Badge className={getStatusColor(room.status)}>
                    {getStatusLabel(room.status)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {room.room_type?.type_name || 'Phòng thường'}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Sức chứa:</span>
                  <span className="font-medium">{assignments.length}/{room.capacity} giường</span>
                </div>

                {isOccupied && (
                  <div className="border-t pt-3 space-y-2">
                    <p className="text-xs font-semibold text-blue-600">Bệnh nhân hiện tại:</p>
                    {assignments.map((assignment) => (
                      <div key={assignment.assignment_id} className="flex items-center justify-between bg-blue-50 p-2 rounded">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium">
                            {assignment.patient?.first_name} {assignment.patient?.last_name}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewAssignment(assignment)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleViewRoom(room)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Chi tiết
                  </Button>
                  {(room.status.toLowerCase() === 'available' || assignments.length < room.capacity) && (
                    <Button
                      size="sm"
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleAssignPatient(room)}
                      disabled={assignments.length >= room.capacity}
                    >
                      <UserPlus className="h-3 w-3 mr-1" />
                      Phân công
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredRooms.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Home className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Không tìm thấy phòng nào</p>
          </CardContent>
        </Card>
      )}

      {/* Room Detail Modal */}
      <RoomDetailModal
        room={selectedRoom}
        assignments={selectedRoom ? getRoomAssignments(selectedRoom.room_id) : []}
        open={showRoomDetail}
        onClose={() => setShowRoomDetail(false)}
        onViewAssignment={handleViewAssignment}
      />

      {/* Assignment Modal */}
      <AssignPatientModal
        room={selectedRoom}
        patients={patients}
        open={showAssignmentModal}
        onClose={() => setShowAssignmentModal(false)}
        onSuccess={() => {
          setShowAssignmentModal(false)
          onRefresh()
        }}
      />

      {/* Assignment Detail Modal */}
      <AssignmentDetailModal
        assignment={selectedAssignment}
        open={showAssignmentDetail}
        onClose={() => setShowAssignmentDetail(false)}
        onEndAssignment={handleEndAssignment}
      />

      {/* Discharge Confirmation Dialog */}
      <Dialog open={showDischargeConfirm} onOpenChange={setShowDischargeConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogOut className="h-5 w-5 text-red-600" />
              Xác nhận xuất viện
            </DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn kết thúc phân công này và xuất viện bệnh nhân không?
              Hành động này sẽ cập nhật trạng thái phòng và số giường đang sử dụng.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDischargeConfirm(false)
                setDischargingAssignmentId(null)
              }}
            >
              Hủy
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmDischarge}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Xác nhận xuất viện
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Room Detail Modal Component
function RoomDetailModal({
  room,
  assignments,
  open,
  onClose,
  onViewAssignment
}: {
  room: Room | null
  assignments: RoomAssignment[]
  open: boolean
  onClose: () => void
  onViewAssignment: (assignment: RoomAssignment) => void
}) {
  if (!room) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Chi tiết Phòng {room.room_number}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Loại phòng</Label>
              <p className="font-medium">{room.room_type?.type_name || 'Phòng thường'}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Trạng thái</Label>
              <Badge className={`mt-1 ${getStatusColor(room.status)}`}>
                {getStatusLabel(room.status)}
              </Badge>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Sức chứa</Label>
              <p className="font-medium">{room.capacity} giường</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Đang sử dụng</Label>
              <p className="font-medium">{assignments.length} giường</p>
            </div>
          </div>

          {assignments.length > 0 && (
            <div>
              <Label className="text-sm font-semibold mb-2 block">Bệnh nhân hiện tại:</Label>
              <div className="space-y-2">
                {assignments.map((assignment) => (
                  <div key={assignment.assignment_id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">
                          {assignment.patient?.first_name} {assignment.patient?.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Ngày nhập viện: {new Date(assignment.start_date).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewAssignment(assignment)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Xem
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Assign Patient Modal Component
function AssignPatientModal({
  room,
  patients,
  open,
  onClose,
  onSuccess
}: {
  room: Room | null
  patients: any[]
  open: boolean
  onClose: () => void
  onSuccess: () => void
}) {
  const [selectedPatientId, setSelectedPatientId] = useState<string>("")
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!room || !selectedPatientId) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn bệnh nhân",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      await roomsApi.createRoomAssignment({
        room_id: room.room_id,
        assignment_type: 'PATIENT',
        patient_id: parseInt(selectedPatientId),
        start_date: startDate
      })

      toast({
        title: "Thành công",
        description: "Đã phân công bệnh nhân vào phòng",
      })
      onSuccess()
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể phân công phòng",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!room) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Phân công bệnh nhân - Phòng {room.room_number}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Chọn bệnh nhân</Label>
            <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn bệnh nhân" />
              </SelectTrigger>
              <SelectContent>
                {(patients || []).map((patient) => (
                  <SelectItem key={patient.patient_id} value={patient.patient_id.toString()}>
                    {patient.first_name} {patient.last_name} - {patient.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Ngày nhập viện</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Đang xử lý..." : "Phân công"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Assignment Detail Modal
function AssignmentDetailModal({
  assignment,
  open,
  onClose,
  onEndAssignment
}: {
  assignment: RoomAssignment | null
  open: boolean
  onClose: () => void
  onEndAssignment: (id: number) => void
}) {
  if (!assignment) return null

  const daysSinceAdmission = Math.floor(
    (new Date().getTime() - new Date(assignment.start_date).getTime()) / (1000 * 60 * 60 * 24)
  )

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bed className="h-5 w-5" />
            Chi tiết phân công phòng
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Phòng</Label>
            <p className="font-medium text-lg">
              Phòng {assignment.room?.room_number} - {assignment.room?.room_type?.type_name}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Bệnh nhân</Label>
              <p className="font-medium">
                {assignment.patient?.first_name} {assignment.patient?.last_name}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Giới tính</Label>
              <p className="font-medium">{assignment.patient?.gender === 'male' ? 'Nam' : 'Nữ'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Ngày nhập viện</Label>
              <p className="font-medium">{new Date(assignment.start_date).toLocaleDateString('vi-VN')}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Số ngày nằm viện</Label>
              <p className="font-medium text-blue-600">{daysSinceAdmission} ngày</p>
            </div>
          </div>

          {assignment.patient?.phone && (
            <div>
              <Label className="text-xs text-muted-foreground">Số điện thoại</Label>
              <p className="font-medium">{assignment.patient.phone}</p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
          <Button
            variant="destructive"
            onClick={() => onEndAssignment(assignment.assignment_id)}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Xuất viện
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
