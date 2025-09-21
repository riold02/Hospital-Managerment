"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { BedDouble, Search, Plus, Users, Building2 } from "lucide-react"

interface RoomAssignment {
  id: string
  room_number: string
  room_type: string
  patient_name?: string
  patient_id?: string
  assigned_date: string
  checkout_date?: string
  status: "Occupied" | "Available" | "Maintenance"
  notes?: string
}

interface Patient {
  id: string
  name: string
  phone: string
}

interface Room {
  id: string
  room_number: string
  room_type: string
  status: string
}

export function RoomAssignmentManagement() {
  const [assignments, setAssignments] = useState<RoomAssignment[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAssignment, setSelectedAssignment] = useState<RoomAssignment | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    room_id: "",
    patient_id: "",
    notes: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Mock data
        setAssignments([
          {
            id: "1",
            room_number: "P101",
            room_type: "Phòng đơn",
            patient_name: "Nguyễn Văn A",
            patient_id: "1",
            assigned_date: "2024-01-10",
            status: "Occupied",
            notes: "Bệnh nhân cần theo dõi đặc biệt",
          },
          {
            id: "2",
            room_number: "P205",
            room_type: "Phòng VIP",
            patient_name: "Trần Thị B",
            patient_id: "2",
            assigned_date: "2024-01-12",
            status: "Occupied",
          },
          {
            id: "3",
            room_number: "ICU-03",
            room_type: "Phòng ICU",
            assigned_date: "2024-01-08",
            checkout_date: "2024-01-14",
            status: "Available",
          },
        ])

        setPatients([
          { id: "1", name: "Nguyễn Văn A", phone: "0901234567" },
          { id: "2", name: "Trần Thị B", phone: "0912345678" },
          { id: "3", name: "Lê Văn C", phone: "0923456789" },
        ])

        setRooms([
          { id: "1", room_number: "P101", room_type: "Phòng đơn", status: "Occupied" },
          { id: "2", room_number: "P205", room_type: "Phòng VIP", status: "Occupied" },
          { id: "3", room_number: "ICU-03", room_type: "Phòng ICU", status: "Available" },
          { id: "4", room_number: "P312", room_type: "Phòng đôi", status: "Available" },
        ])
      } catch (error) {
        toast({
          title: "Lỗi",
          description: "Không thể tải dữ liệu phân phòng",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const selectedRoom = rooms.find((r) => r.id === formData.room_id)
      const selectedPatient = patients.find((p) => p.id === formData.patient_id)

      if (!selectedRoom || !selectedPatient) return

      const newAssignment: RoomAssignment = {
        id: Date.now().toString(),
        room_number: selectedRoom.room_number,
        room_type: selectedRoom.room_type,
        patient_name: selectedPatient.name,
        patient_id: selectedPatient.id,
        assigned_date: new Date().toISOString().split("T")[0],
        status: "Occupied",
        notes: formData.notes,
      }

      setAssignments((prev) => [...prev, newAssignment])
      setIsDialogOpen(false)
      setFormData({ room_id: "", patient_id: "", notes: "" })

      toast({
        title: "Thành công",
        description: "Đã phân phòng cho bệnh nhân",
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể phân phòng",
        variant: "destructive",
      })
    }
  }

  const handleCheckout = async (assignmentId: string) => {
    try {
      setAssignments((prev) =>
        prev.map((assignment) =>
          assignment.id === assignmentId
            ? {
                ...assignment,
                checkout_date: new Date().toISOString().split("T")[0],
                status: "Available" as const,
              }
            : assignment,
        ),
      )

      toast({
        title: "Thành công",
        description: "Đã trả phòng cho bệnh nhân",
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể trả phòng",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Occupied":
        return "bg-red-100 text-red-800 border-red-200"
      case "Available":
        return "bg-green-100 text-green-800 border-green-200"
      case "Maintenance":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const filteredAssignments = assignments.filter(
    (assignment) =>
      assignment.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.room_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (assignment.patient_name && assignment.patient_name.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số phòng</CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{rooms.length}</div>
            <p className="text-xs text-gray-600">phòng trong hệ thống</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Phòng có người</CardTitle>
            <BedDouble className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {assignments.filter((a) => a.status === "Occupied").length}
            </div>
            <p className="text-xs text-gray-600">phòng đang sử dụng</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Phòng trống</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {rooms.length - assignments.filter((a) => a.status === "Occupied").length}
            </div>
            <p className="text-xs text-gray-600">phòng có thể sử dụng</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Add */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Tìm kiếm theo phòng, bệnh nhân..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Phân phòng mới
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Phân phòng cho bệnh nhân</DialogTitle>
              <DialogDescription>Chọn phòng và bệnh nhân để thực hiện phân phòng</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="room">Phòng</Label>
                <Select
                  value={formData.room_id}
                  onValueChange={(value) => setFormData({ ...formData, room_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn phòng" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms
                      .filter((room) => room.status === "Available")
                      .map((room) => (
                        <SelectItem key={room.id} value={room.id}>
                          {room.room_number} - {room.room_type}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="patient">Bệnh nhân</Label>
                <Select
                  value={formData.patient_id}
                  onValueChange={(value) => setFormData({ ...formData, patient_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn bệnh nhân" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name} - {patient.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="notes">Ghi chú</Label>
                <Input
                  id="notes"
                  placeholder="Ghi chú đặc biệt..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Phân phòng
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Assignments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BedDouble className="h-5 w-5 text-blue-600" />
            <span>Danh sách phân phòng</span>
          </CardTitle>
          <CardDescription>Quản lý việc phân phòng cho bệnh nhân</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAssignments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BedDouble className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Không có dữ liệu phân phòng</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Phòng</TableHead>
                  <TableHead>Loại phòng</TableHead>
                  <TableHead>Bệnh nhân</TableHead>
                  <TableHead>Ngày nhận</TableHead>
                  <TableHead>Ngày trả</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">{assignment.room_number}</TableCell>
                    <TableCell>{assignment.room_type}</TableCell>
                    <TableCell>{assignment.patient_name || "Không có"}</TableCell>
                    <TableCell>{new Date(assignment.assigned_date).toLocaleDateString("vi-VN")}</TableCell>
                    <TableCell>
                      {assignment.checkout_date
                        ? new Date(assignment.checkout_date).toLocaleDateString("vi-VN")
                        : "Chưa trả"}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(assignment.status)}>
                        {assignment.status === "Occupied" ? "Có người" : "Trống"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {assignment.status === "Occupied" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCheckout(assignment.id)}
                            className="bg-green-50 hover:bg-green-100"
                          >
                            Trả phòng
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
