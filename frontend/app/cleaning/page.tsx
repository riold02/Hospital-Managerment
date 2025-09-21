"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { useToast } from "@/hooks/use-toast"
import { DataTable } from "@/components/shared/DataTable"
import { SearchBar } from "@/components/shared/SearchBar"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { KpiCard } from "@/components/shared/KpiCard"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { Sparkles, Calendar, Users, Clock, Plus } from "lucide-react"

interface CleaningService {
  service_id: string
  room: string
  service_date: string
  service_time: string
  staff: string
  notes: string
  status: "Pending" | "In Progress" | "Completed"
  priority: "Low" | "Normal" | "High" | "Urgent"
  service_type: string
  created_at: string
}

interface Room {
  id: string
  room_number: string
  type: string
}

interface Staff {
  id: string
  name: string
  role: string
}

export default function CleaningPage() {
  const [cleaningServices, setCleaningServices] = useState<CleaningService[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [roomFilter, setRoomFilter] = useState("all")
  const [staffFilter, setStaffFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<CleaningService | null>(null)
  const [deleteServiceId, setDeleteServiceId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    room: "",
    service_date: new Date().toISOString().split("T")[0],
    service_time: "",
    staff: "",
    service_type: "",
    priority: "Normal",
    notes: "",
  })

  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Simulate API calls
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock cleaning services data
      const mockServices: CleaningService[] = [
        {
          service_id: "CS001",
          room: "P101",
          service_date: "2024-01-15",
          service_time: "08:00",
          staff: "Nguyễn Văn A",
          notes: "Vệ sinh tổng quát sau ca phẫu thuật",
          status: "Completed",
          priority: "High",
          service_type: "Khử trùng đặc biệt",
          created_at: "2024-01-15T07:30:00Z",
        },
        {
          service_id: "CS002",
          room: "P205",
          service_date: "2024-01-15",
          service_time: "10:30",
          staff: "Trần Thị B",
          notes: "Vệ sinh phòng VIP",
          status: "In Progress",
          priority: "Normal",
          service_type: "Vệ sinh tổng quát",
          created_at: "2024-01-15T09:00:00Z",
        },
        {
          service_id: "CS003",
          room: "ICU-03",
          service_date: "2024-01-15",
          service_time: "14:00",
          staff: "Lê Văn C",
          notes: "Khử trùng phòng ICU",
          status: "Pending",
          priority: "Urgent",
          service_type: "Khử trùng UV",
          created_at: "2024-01-15T13:00:00Z",
        },
        {
          service_id: "CS004",
          room: "P312",
          service_date: "2024-01-16",
          service_time: "09:00",
          staff: "Phạm Thị D",
          notes: "Vệ sinh định kỳ",
          status: "Pending",
          priority: "Low",
          service_type: "Vệ sinh thường",
          created_at: "2024-01-15T16:00:00Z",
        },
      ]

      // Mock rooms data
      const mockRooms: Room[] = [
        { id: "R001", room_number: "P101", type: "Phòng bệnh" },
        { id: "R002", room_number: "P205", type: "Phòng VIP" },
        { id: "R003", room_number: "ICU-03", type: "Phòng ICU" },
        { id: "R004", room_number: "P312", type: "Phòng bệnh" },
      ]

      // Mock staff data
      const mockStaff: Staff[] = [
        { id: "S001", name: "Nguyễn Văn A", role: "Nhân viên vệ sinh" },
        { id: "S002", name: "Trần Thị B", role: "Nhân viên vệ sinh" },
        { id: "S003", name: "Lê Văn C", role: "Nhân viên vệ sinh" },
        { id: "S004", name: "Phạm Thị D", role: "Nhân viên vệ sinh" },
      ]

      setCleaningServices(mockServices)
      setRooms(mockRooms)
      setStaff(mockStaff)
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

  const handleCreateService = async () => {
    try {
      // Simulate API call: POST /cleaning-service
      await new Promise((resolve) => setTimeout(resolve, 500))

      const newService: CleaningService = {
        service_id: `CS${String(cleaningServices.length + 1).padStart(3, "0")}`,
        room: formData.room,
        service_date: formData.service_date,
        service_time: formData.service_time,
        staff: formData.staff,
        notes: formData.notes,
        status: "Pending",
        priority: formData.priority as CleaningService["priority"],
        service_type: formData.service_type,
        created_at: new Date().toISOString(),
      }

      setCleaningServices((prev) => [newService, ...prev])
      setIsCreateModalOpen(false)
      resetForm()

      toast({
        title: "Thành công",
        description: "Đã tạo dịch vụ vệ sinh mới",
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tạo dịch vụ vệ sinh",
        variant: "destructive",
      })
    }
  }

  const handleEditService = async () => {
    if (!selectedService) return

    try {
      // Simulate API call: PUT /cleaning-service/{id}
      await new Promise((resolve) => setTimeout(resolve, 500))

      setCleaningServices((prev) =>
        prev.map((service) =>
          service.service_id === selectedService.service_id
            ? {
                ...service,
                room: formData.room,
                service_date: formData.service_date,
                service_time: formData.service_time,
                staff: formData.staff,
                notes: formData.notes,
                priority: formData.priority as CleaningService["priority"],
                service_type: formData.service_type,
              }
            : service,
        ),
      )

      setIsEditModalOpen(false)
      setSelectedService(null)
      resetForm()

      toast({
        title: "Thành công",
        description: "Đã cập nhật dịch vụ vệ sinh",
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật dịch vụ vệ sinh",
        variant: "destructive",
      })
    }
  }

  const handleDeleteService = async () => {
    if (!deleteServiceId) return

    try {
      // Simulate API call: DELETE /cleaning-service/{id}
      await new Promise((resolve) => setTimeout(resolve, 500))

      setCleaningServices((prev) => prev.filter((service) => service.service_id !== deleteServiceId))
      setDeleteServiceId(null)

      toast({
        title: "Thành công",
        description: "Đã xóa dịch vụ vệ sinh",
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa dịch vụ vệ sinh",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      room: "",
      service_date: new Date().toISOString().split("T")[0],
      service_time: "",
      staff: "",
      service_type: "",
      priority: "Normal",
      notes: "",
    })
  }

  const openEditModal = (service: CleaningService) => {
    setSelectedService(service)
    setFormData({
      room: service.room,
      service_date: service.service_date,
      service_time: service.service_time,
      staff: service.staff,
      service_type: service.service_type,
      priority: service.priority,
      notes: service.notes,
    })
    setIsEditModalOpen(true)
  }

  // Filter data
  const filteredServices = cleaningServices.filter((service) => {
    const matchesSearch =
      service.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.staff.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.service_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.notes.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesDate = !dateFilter || service.service_date === dateFilter
    const matchesRoom = roomFilter === "all" || service.room === roomFilter
    const matchesStaff = staffFilter === "all" || service.staff === staffFilter
    const matchesStatus = statusFilter === "all" || service.status === statusFilter

    return matchesSearch && matchesDate && matchesRoom && matchesStaff && matchesStatus
  })

  // Pagination
  const totalItems = filteredServices.length
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedServices = filteredServices.slice(startIndex, endIndex)

  // Table columns
  const columns = [
    {
      key: "service_id",
      label: "Mã dịch vụ",
      sortable: true,
    },
    {
      key: "room",
      label: "Phòng",
      sortable: true,
    },
    {
      key: "service_date",
      label: "Ngày",
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString("vi-VN"),
    },
    {
      key: "service_time",
      label: "Giờ",
      sortable: true,
    },
    {
      key: "staff",
      label: "Nhân viên",
      sortable: true,
    },
    {
      key: "service_type",
      label: "Loại dịch vụ",
      sortable: true,
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (value: string) => <StatusBadge status={value} type="cleaning" />,
    },
    {
      key: "priority",
      label: "Ưu tiên",
      render: (value: string) => {
        const colors = {
          Low: "bg-green-100 text-green-800",
          Normal: "bg-blue-100 text-blue-800",
          High: "bg-orange-100 text-orange-800",
          Urgent: "bg-red-100 text-red-800",
        }
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[value as keyof typeof colors]}`}>
            {value === "Low" ? "Thấp" : value === "Normal" ? "Bình thường" : value === "High" ? "Cao" : "Khẩn cấp"}
          </span>
        )
      },
    },
    {
      key: "actions",
      label: "Hành động",
      render: (_: any, service: CleaningService) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => openEditModal(service)}>
            Sửa
          </Button>
          <Button variant="outline" size="sm" onClick={() => setDeleteServiceId(service.service_id)}>
            Xóa
          </Button>
        </div>
      ),
    },
  ]

  // Calculate KPIs
  const totalServices = cleaningServices.length
  const todayServices = cleaningServices.filter((s) => s.service_date === new Date().toISOString().split("T")[0]).length
  const completedServices = cleaningServices.filter((s) => s.status === "Completed").length
  const pendingServices = cleaningServices.filter((s) => s.status === "Pending").length

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quản lý Dịch vụ Vệ sinh</h1>
          <p className="text-muted-foreground">Quản lý lịch vệ sinh và theo dõi tiến độ</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Tạo dịch vụ vệ sinh
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Tạo dịch vụ vệ sinh mới</DialogTitle>
              <DialogDescription>Thêm dịch vụ vệ sinh mới vào hệ thống</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="room">Phòng *</Label>
                <Select
                  value={formData.room}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, room: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn phòng" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={room.room_number}>
                        {room.room_number} - {room.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="service_date">Ngày *</Label>
                  <Input
                    type="date"
                    value={formData.service_date}
                    onChange={(e) => setFormData((prev) => ({ ...prev, service_date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="service_time">Giờ *</Label>
                  <Input
                    type="time"
                    value={formData.service_time}
                    onChange={(e) => setFormData((prev) => ({ ...prev, service_time: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="staff">Nhân viên *</Label>
                <Select
                  value={formData.staff}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, staff: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn nhân viên" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map((member) => (
                      <SelectItem key={member.id} value={member.name}>
                        {member.name} - {member.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="service_type">Loại dịch vụ *</Label>
                <Select
                  value={formData.service_type}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, service_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại dịch vụ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Vệ sinh thường">Vệ sinh thường</SelectItem>
                    <SelectItem value="Vệ sinh tổng quát">Vệ sinh tổng quát</SelectItem>
                    <SelectItem value="Khử trùng đặc biệt">Khử trùng đặc biệt</SelectItem>
                    <SelectItem value="Khử trùng UV">Khử trùng UV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Mức độ ưu tiên</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Thấp</SelectItem>
                    <SelectItem value="Normal">Bình thường</SelectItem>
                    <SelectItem value="High">Cao</SelectItem>
                    <SelectItem value="Urgent">Khẩn cấp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="notes">Ghi chú</Label>
                <Textarea
                  placeholder="Ghi chú về dịch vụ vệ sinh..."
                  value={formData.notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleCreateService}>Tạo dịch vụ</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KpiCard label="Tổng dịch vụ" value={totalServices.toString()} icon={<Sparkles className="h-4 w-4" />} />
        <KpiCard label="Hôm nay" value={todayServices.toString()} icon={<Calendar className="h-4 w-4" />} />
        <KpiCard label="Hoàn thành" value={completedServices.toString()} icon={<Clock className="h-4 w-4" />} />
        <KpiCard label="Chờ thực hiện" value={pendingServices.toString()} icon={<Users className="h-4 w-4" />} />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <SearchBar onSearch={setSearchQuery} placeholder="Tìm kiếm dịch vụ..." />
            </div>
            <div>
              <Label>Ngày</Label>
              <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
            </div>
            <div>
              <Label>Phòng</Label>
              <Select value={roomFilter} onValueChange={setRoomFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả phòng</SelectItem>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.room_number}>
                      {room.room_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Nhân viên</Label>
              <Select value={staffFilter} onValueChange={setStaffFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả nhân viên</SelectItem>
                  {staff.map((member) => (
                    <SelectItem key={member.id} value={member.name}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Trạng thái</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="Pending">Chờ thực hiện</SelectItem>
                  <SelectItem value="In Progress">Đang thực hiện</SelectItem>
                  <SelectItem value="Completed">Hoàn thành</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách Dịch vụ Vệ sinh</CardTitle>
          <CardDescription>
            Hiển thị {startIndex + 1}-{Math.min(endIndex, totalItems)} của {totalItems} dịch vụ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={paginatedServices}
            total={totalItems}
            page={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa dịch vụ vệ sinh</DialogTitle>
            <DialogDescription>Cập nhật thông tin dịch vụ vệ sinh</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="room">Phòng *</Label>
              <Select
                value={formData.room}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, room: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn phòng" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.room_number}>
                      {room.room_number} - {room.type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="service_date">Ngày *</Label>
                <Input
                  type="date"
                  value={formData.service_date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, service_date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="service_time">Giờ *</Label>
                <Input
                  type="time"
                  value={formData.service_time}
                  onChange={(e) => setFormData((prev) => ({ ...prev, service_time: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="staff">Nhân viên *</Label>
              <Select
                value={formData.staff}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, staff: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn nhân viên" />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((member) => (
                    <SelectItem key={member.id} value={member.name}>
                      {member.name} - {member.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="service_type">Loại dịch vụ *</Label>
              <Select
                value={formData.service_type}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, service_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại dịch vụ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Vệ sinh thường">Vệ sinh thường</SelectItem>
                  <SelectItem value="Vệ sinh tổng quát">Vệ sinh tổng quát</SelectItem>
                  <SelectItem value="Khử trùng đặc biệt">Khử trùng đặc biệt</SelectItem>
                  <SelectItem value="Khử trùng UV">Khử trùng UV</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Mức độ ưu tiên</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Thấp</SelectItem>
                  <SelectItem value="Normal">Bình thường</SelectItem>
                  <SelectItem value="High">Cao</SelectItem>
                  <SelectItem value="Urgent">Khẩn cấp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="notes">Ghi chú</Label>
              <Textarea
                placeholder="Ghi chú về dịch vụ vệ sinh..."
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleEditService}>Cập nhật</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteServiceId}
        onOpenChange={() => setDeleteServiceId(null)}
        onConfirm={handleDeleteService}
        title="Xác nhận xóa"
        description="Bạn có chắc chắn muốn xóa dịch vụ vệ sinh này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
      />
    </div>
  )
}
