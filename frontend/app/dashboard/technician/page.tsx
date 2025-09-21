"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Wrench, Calendar, Search, Filter, RefreshCw, Home, LogOut, User, Building, Bed, Users } from "lucide-react"
import RoomsPage from "@/app/rooms/page"
import RoomAssignmentsPage from "@/app/room-assignments/page"
import StaffPage from "@/app/staff/page"
import { useAuth } from "@/lib/auth-context"
import { apiClient, ApiError } from "@/lib/api-client"

interface Room {
  id: string
  room_number: string
  type: string
  status: "Under Maintenance" | "Occupied" | "Available"
  last_serviced: string
  issue_description?: string
}

interface CleaningService {
  id: string
  room_number: string
  service_type: string
  assigned_staff: string
  scheduled_time: string
  status: "Scheduled" | "In Progress" | "Completed"
  notes?: string
}

export default function TechnicianDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [rooms, setRooms] = useState<Room[]>([])
  const [cleaningServices, setCleaningServices] = useState<CleaningService[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const { toast } = useToast()
  const { logout } = useAuth()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        console.log("[v0] Loading technician dashboard data from API")

        // Fetch rooms that need maintenance or are occupied
        const roomsData = await apiClient.getRooms("maintenance_needed")
        setRooms(roomsData)

        // Fetch today's cleaning services
        const cleaningData = await apiClient.get("/cleaning-services?date=today")
        setCleaningServices(cleaningData)
      } catch (error) {
        console.error("[v0] Error fetching technician data:", error)
        if (error instanceof ApiError) {
          toast({
            title: "Lỗi",
            description: `Không thể tải dữ liệu: ${error.message}`,
            variant: "destructive",
          })
        } else {
          toast({
            title: "Lỗi",
            description: "Không thể tải dữ liệu",
            variant: "destructive",
          })
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const updateRoomStatus = async (roomId: string, newStatus: string) => {
    try {
      console.log(`[v0] Updating room ${roomId} to status: ${newStatus}`)

      await apiClient.updateRoomStatus(roomId, newStatus)

      setRooms((prev) =>
        prev.map((room) => (room.id === roomId ? { ...room, status: newStatus as Room["status"] } : room)),
      )

      toast({
        title: "Thành công",
        description: "Đã cập nhật trạng thái phòng",
      })
    } catch (error) {
      console.error("[v0] Error updating room status:", error)
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái phòng",
        variant: "destructive",
      })
    }
  }

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || room.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const variants = {
      "Under Maintenance": "destructive",
      Occupied: "secondary",
      Available: "default",
      Scheduled: "secondary",
      "In Progress": "default",
      Completed: "outline",
    } as const

    return <Badge variant={variants[status as keyof typeof variants] || "default"}>{status}</Badge>
  }

  const maintenanceRooms = rooms.filter((room) => room.status === "Under Maintenance").length
  const lastMaintenanceDate = rooms.reduce((latest, room) => {
    return new Date(room.last_serviced) > new Date(latest) ? room.last_serviced : latest
  }, "2024-01-01")

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Đang tải dữ liệu từ server...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Vertical sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-orange-600">Kỹ thuật viên</h2>
          <p className="text-sm text-gray-600">Bảng điều khiển</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeTab === "overview"
                ? "bg-orange-100 text-orange-700 border border-orange-200"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Home className="h-5 w-5" />
            Tổng quan
          </button>

          <button
            onClick={() => setActiveTab("rooms")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeTab === "rooms"
                ? "bg-orange-100 text-orange-700 border border-orange-200"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Wrench className="h-5 w-5" />
            Phòng cần xử lý
          </button>

          <button
            onClick={() => setActiveTab("cleaning")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeTab === "cleaning"
                ? "bg-orange-100 text-orange-700 border border-orange-200"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Calendar className="h-5 w-5" />
            Vệ sinh hôm nay
          </button>

          <button
            onClick={() => setActiveTab("room-management")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeTab === "room-management"
                ? "bg-orange-100 text-orange-700 border border-orange-200"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Building className="h-5 w-5" />
            Phòng bệnh
          </button>

          <button
            onClick={() => setActiveTab("room-assignments")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeTab === "room-assignments"
                ? "bg-orange-100 text-orange-700 border border-orange-200"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Bed className="h-5 w-5" />
            Phân giường
          </button>

          <button
            onClick={() => setActiveTab("staff")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeTab === "staff"
                ? "bg-orange-100 text-orange-700 border border-orange-200"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Users className="h-5 w-5" />
            Nhân viên
          </button>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Kỹ thuật viên</p>
              <p className="text-xs text-gray-500">Đang hoạt động</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full bg-transparent" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" />
            Đăng xuất
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <Tabs value={activeTab} className="h-full">
          <TabsContent value="overview" className="space-y-6 p-6 m-0">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Bảng điều khiển Kỹ thuật viên</h1>
              <p className="text-muted-foreground">Quản lý bảo trì và vệ sinh cơ sở vật chất</p>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Phòng bảo trì</CardTitle>
                  <Wrench className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{maintenanceRooms}</div>
                  <p className="text-xs text-muted-foreground">Phòng đang cần bảo trì</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Lần bảo trì gần nhất</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{new Date(lastMaintenanceDate).toLocaleDateString("vi-VN")}</div>
                  <p className="text-xs text-muted-foreground">Ngày bảo trì gần đây nhất</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="rooms" className="space-y-4 p-6 m-0">
            {/* Filters */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo số phòng hoặc loại..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Lọc theo trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="Under Maintenance">Đang bảo trì</SelectItem>
                  <SelectItem value="Occupied">Đang sử dụng</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Rooms Table */}
            <Card>
              <CardHeader>
                <CardTitle>Phòng cần xử lý</CardTitle>
                <CardDescription>Danh sách các phòng cần bảo trì hoặc xử lý sự cố</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Số phòng</TableHead>
                      <TableHead>Loại phòng</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Lần bảo trì cuối</TableHead>
                      <TableHead>Mô tả sự cố</TableHead>
                      <TableHead>Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRooms.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Không có phòng nào cần xử lý
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRooms.map((room) => (
                        <TableRow key={room.id}>
                          <TableCell className="font-medium">{room.room_number}</TableCell>
                          <TableCell>{room.type}</TableCell>
                          <TableCell>{getStatusBadge(room.status)}</TableCell>
                          <TableCell>{new Date(room.last_serviced).toLocaleDateString("vi-VN")}</TableCell>
                          <TableCell>{room.issue_description || "-"}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {room.status === "Under Maintenance" && (
                                <Button size="sm" onClick={() => updateRoomStatus(room.id, "Available")}>
                                  Hoàn thành
                                </Button>
                              )}
                              {room.status === "Occupied" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateRoomStatus(room.id, "Under Maintenance")}
                                >
                                  Bảo trì
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cleaning" className="space-y-4 p-6 m-0">
            {/* Cleaning Services Table */}
            <Card>
              <CardHeader>
                <CardTitle>Lịch vệ sinh hôm nay</CardTitle>
                <CardDescription>Danh sách các công việc vệ sinh được lên lịch cho hôm nay</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Số phòng</TableHead>
                      <TableHead>Loại dịch vụ</TableHead>
                      <TableHead>Nhân viên phụ trách</TableHead>
                      <TableHead>Giờ lên lịch</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ghi chú</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cleaningServices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Không có lịch vệ sinh nào hôm nay
                        </TableCell>
                      </TableRow>
                    ) : (
                      cleaningServices.map((service) => (
                        <TableRow key={service.id}>
                          <TableCell className="font-medium">{service.room_number}</TableCell>
                          <TableCell>{service.service_type}</TableCell>
                          <TableCell>{service.assigned_staff}</TableCell>
                          <TableCell>{service.scheduled_time}</TableCell>
                          <TableCell>{getStatusBadge(service.status)}</TableCell>
                          <TableCell>{service.notes || "-"}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="room-management" className="space-y-4 p-6 m-0">
            <div className="mb-4">
              <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
                Quản lý phòng bệnh
              </Badge>
            </div>
            <div className="technician-admin-content">
              <RoomsPage />
            </div>
          </TabsContent>

          <TabsContent value="room-assignments" className="space-y-4 p-6 m-0">
            <div className="mb-4">
              <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
                Quản lý phân giường
              </Badge>
            </div>
            <div className="technician-admin-content">
              <RoomAssignmentsPage />
            </div>
          </TabsContent>

          <TabsContent value="staff" className="space-y-4 p-6 m-0">
            <div className="mb-4">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Chỉ đọc - Thông tin nhân viên
              </Badge>
            </div>
            <div className="technician-admin-content staff-readonly">
              <StaffPage />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <style jsx global>{`
        .technician-admin-content .staff-readonly button:not([data-keep]),
        .technician-admin-content .staff-readonly .lucide-plus,
        .technician-admin-content .staff-readonly .lucide-edit,
        .technician-admin-content .staff-readonly .lucide-trash-2,
        .technician-admin-content .staff-readonly [data-admin-action] {
          display: none !important;
        }
        
        .technician-admin-content .staff-readonly input,
        .technician-admin-content .staff-readonly select,
        .technician-admin-content .staff-readonly textarea {
          pointer-events: none;
          background-color: #f9fafb;
        }
      `}</style>
    </div>
  )
}
