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
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Sparkles, Search, Plus, Clock, CheckCircle, AlertTriangle } from "lucide-react"

interface CleaningService {
  id: string
  room_number: string
  room_type: string
  assigned_staff: string
  scheduled_date: string
  scheduled_time: string
  priority: "High" | "Medium" | "Low"
  status: "Pending" | "In Progress" | "Completed"
  notes?: string
  completed_at?: string
}

interface Staff {
  id: string
  name: string
  role: string
}

interface Room {
  id: string
  room_number: string
  room_type: string
}

export function CleaningManagement() {
  const [services, setServices] = useState<CleaningService[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    room_id: "",
    staff_id: "",
    scheduled_date: "",
    scheduled_time: "",
    priority: "Medium" as const,
    notes: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Mock data
        setServices([
          {
            id: "1",
            room_number: "P101",
            room_type: "Phòng bệnh",
            assigned_staff: "Nguyễn Văn A",
            scheduled_date: "2024-01-15",
            scheduled_time: "08:00",
            priority: "High",
            status: "Pending",
            notes: "Khử trùng đặc biệt sau ca phẫu thuật",
          },
          {
            id: "2",
            room_number: "P205",
            room_type: "Phòng VIP",
            assigned_staff: "Trần Thị B",
            scheduled_date: "2024-01-15",
            scheduled_time: "09:30",
            priority: "Medium",
            status: "In Progress",
          },
          {
            id: "3",
            room_number: "ICU-03",
            room_type: "Phòng ICU",
            assigned_staff: "Lê Văn C",
            scheduled_date: "2024-01-14",
            scheduled_time: "14:00",
            priority: "High",
            status: "Completed",
            completed_at: "2024-01-14T15:30:00",
          },
        ])

        setStaff([
          { id: "1", name: "Nguyễn Văn A", role: "Nhân viên vệ sinh" },
          { id: "2", name: "Trần Thị B", role: "Nhân viên vệ sinh" },
          { id: "3", name: "Lê Văn C", role: "Nhân viên vệ sinh" },
        ])

        setRooms([
          { id: "1", room_number: "P101", room_type: "Phòng bệnh" },
          { id: "2", room_number: "P205", room_type: "Phòng VIP" },
          { id: "3", room_number: "ICU-03", room_type: "Phòng ICU" },
          { id: "4", room_number: "P312", room_type: "Phòng đôi" },
        ])
      } catch (error) {
        toast({
          title: "Lỗi",
          description: "Không thể tải dữ liệu dịch vụ vệ sinh",
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
      const selectedStaff = staff.find((s) => s.id === formData.staff_id)

      if (!selectedRoom || !selectedStaff) return

      const newService: CleaningService = {
        id: Date.now().toString(),
        room_number: selectedRoom.room_number,
        room_type: selectedRoom.room_type,
        assigned_staff: selectedStaff.name,
        scheduled_date: formData.scheduled_date,
        scheduled_time: formData.scheduled_time,
        priority: formData.priority,
        status: "Pending",
        notes: formData.notes,
      }

      setServices((prev) => [...prev, newService])
      setIsDialogOpen(false)
      setFormData({
        room_id: "",
        staff_id: "",
        scheduled_date: "",
        scheduled_time: "",
        priority: "Medium",
        notes: "",
      })

      toast({
        title: "Thành công",
        description: "Đã tạo lịch vệ sinh mới",
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tạo lịch vệ sinh",
        variant: "destructive",
      })
    }
  }

  const handleStatusUpdate = async (serviceId: string, newStatus: CleaningService["status"]) => {
    try {
      setServices((prev) =>
        prev.map((service) =>
          service.id === serviceId
            ? {
                ...service,
                status: newStatus,
                completed_at: newStatus === "Completed" ? new Date().toISOString() : undefined,
              }
            : service,
        ),
      )

      toast({
        title: "Thành công",
        description: `Đã cập nhật trạng thái thành ${newStatus === "Completed" ? "Hoàn thành" : newStatus === "In Progress" ? "Đang thực hiện" : "Chờ xử lý"}`,
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái",
        variant: "destructive",
      })
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800 border-red-200"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "In Progress":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.room_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.assigned_staff.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === "all" || service.status === filterStatus

    return matchesSearch && matchesStatus
  })

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng lịch vệ sinh</CardTitle>
            <Sparkles className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{services.length}</div>
            <p className="text-xs text-gray-600">lịch trong hệ thống</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chờ xử lý</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {services.filter((s) => s.status === "Pending").length}
            </div>
            <p className="text-xs text-gray-600">lịch chờ thực hiện</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang thực hiện</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {services.filter((s) => s.status === "In Progress").length}
            </div>
            <p className="text-xs text-gray-600">lịch đang thực hiện</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoàn thành</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {services.filter((s) => s.status === "Completed").length}
            </div>
            <p className="text-xs text-gray-600">lịch đã hoàn thành</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center justify-between space-x-4">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Tìm kiếm theo phòng, nhân viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="Pending">Chờ xử lý</SelectItem>
              <SelectItem value="In Progress">Đang thực hiện</SelectItem>
              <SelectItem value="Completed">Hoàn thành</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Tạo lịch vệ sinh
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo lịch vệ sinh mới</DialogTitle>
              <DialogDescription>Tạo lịch vệ sinh cho phòng và phân công nhân viên</DialogDescription>
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
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.room_number} - {room.room_type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="staff">Nhân viên</Label>
                <Select
                  value={formData.staff_id}
                  onValueChange={(value) => setFormData({ ...formData, staff_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn nhân viên" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name} - {member.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Ngày</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="time">Giờ</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.scheduled_time}
                    onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="priority">Mức độ ưu tiên</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: "High" | "Medium" | "Low") => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">Cao</SelectItem>
                    <SelectItem value="Medium">Trung bình</SelectItem>
                    <SelectItem value="Low">Thấp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="notes">Ghi chú</Label>
                <Textarea
                  id="notes"
                  placeholder="Ghi chú đặc biệt..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Tạo lịch
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Services Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <span>Danh sách lịch vệ sinh</span>
          </CardTitle>
          <CardDescription>Quản lý lịch vệ sinh và phân công nhân viên</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredServices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Không có lịch vệ sinh nào</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Phòng</TableHead>
                  <TableHead>Loại phòng</TableHead>
                  <TableHead>Nhân viên</TableHead>
                  <TableHead>Ngày/Giờ</TableHead>
                  <TableHead>Ưu tiên</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.room_number}</TableCell>
                    <TableCell>{service.room_type}</TableCell>
                    <TableCell>{service.assigned_staff}</TableCell>
                    <TableCell>
                      {new Date(service.scheduled_date).toLocaleDateString("vi-VN")} {service.scheduled_time}
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(service.priority)}>
                        {service.priority === "High" ? "Cao" : service.priority === "Medium" ? "Trung bình" : "Thấp"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(service.status)}>
                        {service.status === "Pending"
                          ? "Chờ xử lý"
                          : service.status === "In Progress"
                            ? "Đang thực hiện"
                            : "Hoàn thành"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {service.status === "Pending" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(service.id, "In Progress")}
                            className="bg-orange-50 hover:bg-orange-100"
                          >
                            Bắt đầu
                          </Button>
                        )}
                        {service.status === "In Progress" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(service.id, "Completed")}
                            className="bg-green-50 hover:bg-green-100"
                          >
                            Hoàn thành
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
