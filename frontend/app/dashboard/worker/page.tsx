"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
import { useToast } from "@/hooks/use-toast"
import {
  CheckCircle,
  MapPin,
  Search,
  Calendar,
  ClipboardCheck,
  LogOut,
  User,
  BedDouble,
  Sparkles,
  Users,
  Heart,
  RefreshCw,
} from "lucide-react"
import { RoomAssignmentManagement } from "@/components/admin/room-assignment-management"
import { CleaningManagement } from "@/components/admin/cleaning-management"
import { StaffManagement } from "@/components/admin/staff-management"
import { NurseManagement } from "@/components/admin/nurse-management"
import { apiClient, ApiError } from "@/lib/api-client"

interface CleaningTask {
  id: string
  room_number: string
  room_type: string
  scheduled_time: string
  priority: "Cao" | "Trung bình" | "Thấp"
  status: "Chờ xử lý" | "Đang thực hiện" | "Hoàn thành"
  estimated_duration: number
  special_instructions?: string
}

interface RoomAssignment {
  id: string
  room_number: string
  room_type: string
  patient_name?: string
  assigned_staff: string[]
  last_cleaned: string
  next_cleaning: string
  status: "Có người" | "Trống" | "Bảo trì"
}

export default function WorkerDashboard() {
  const [cleaningTasks, setCleaningTasks] = useState<CleaningTask[]>([])
  const [roomAssignments, setRoomAssignments] = useState<RoomAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTask, setSelectedTask] = useState<CleaningTask | null>(null)
  const [completionNotes, setCompletionNotes] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        console.log("[v0] Loading worker dashboard data from API")

        // Fetch today's cleaning tasks
        const tasksData = await apiClient.get("/cleaning-services?date=today")
        setCleaningTasks(tasksData)

        // Fetch room assignments for cleaning staff
        const assignmentsData = await apiClient.getRoomAssignments()
        setRoomAssignments(assignmentsData)
      } catch (error) {
        console.error("[v0] Error fetching worker data:", error)
        if (error instanceof ApiError) {
          toast({
            title: "Lỗi",
            description: `Không thể tải dữ liệu: ${error.message}`,
            variant: "destructive",
          })
        } else {
          toast({
            title: "Lỗi",
            description: "Không thể tải dữ liệu. Vui lòng thử lại.",
            variant: "destructive",
          })
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const handleCompleteTask = async (taskId: string) => {
    try {
      console.log("[v0] Completing cleaning task:", taskId)

      await apiClient.updateCleaningServiceStatus(taskId, "Completed")

      // Also record completion notes if provided
      if (completionNotes.trim()) {
        await apiClient.post(`/cleaning-services/${taskId}/notes`, {
          notes: completionNotes,
          completed_at: new Date().toISOString(),
        })
      }

      setCleaningTasks((prev) =>
        prev.map((task) => (task.id === taskId ? { ...task, status: "Hoàn thành" as const } : task)),
      )

      toast({
        title: "Thành công",
        description: "Đã ghi nhận hoàn thành vệ sinh phòng.",
      })

      setSelectedTask(null)
      setCompletionNotes("")
    } catch (error) {
      console.error("[v0] Error completing task:", error)
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái. Vui lòng thử lại.",
        variant: "destructive",
      })
    }
  }

  const handleStartTask = async (taskId: string) => {
    try {
      console.log("[v0] Starting cleaning task:", taskId)

      await apiClient.updateCleaningServiceStatus(taskId, "In Progress")

      setCleaningTasks((prev) =>
        prev.map((task) => (task.id === taskId ? { ...task, status: "Đang thực hiện" as const } : task)),
      )

      toast({
        title: "Đã bắt đầu",
        description: "Đã bắt đầu thực hiện nhiệm vụ vệ sinh.",
      })
    } catch (error) {
      console.error("[v0] Error starting task:", error)
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái.",
        variant: "destructive",
      })
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Cao":
        return "bg-red-100 text-red-800 border-red-200"
      case "Trung bình":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Thấp":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Chờ xử lý":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Đang thực hiện":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "Hoàn thành":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getRoomStatusColor = (status: string) => {
    switch (status) {
      case "Có người":
        return "bg-red-100 text-red-800 border-red-200"
      case "Trống":
        return "bg-green-100 text-green-800 border-green-200"
      case "Bảo trì":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const filteredTasks = cleaningTasks.filter(
    (task) =>
      task.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.room_type.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredRooms = roomAssignments.filter(
    (room) =>
      room.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.room_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (room.patient_name && room.patient_name.toLowerCase().includes(searchTerm.toLowerCase())),
  )

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

  const todayTasks = cleaningTasks.length
  const completedTasks = cleaningTasks.filter((task) => task.status === "Hoàn thành").length
  const completionRate = todayTasks > 0 ? Math.round((completedTasks / todayTasks) * 100) : 0

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-gray-900">Nhân viên Vệ sinh</h1>
          <p className="text-sm text-gray-600 mt-1">Quản lý vệ sinh</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <Button
            variant={activeTab === "overview" ? "default" : "ghost"}
            className={`w-full justify-start ${
              activeTab === "overview"
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("overview")}
          >
            <ClipboardCheck className="mr-2 h-4 w-4" />
            Tổng quan
          </Button>
          <Button
            variant={activeTab === "tasks" ? "default" : "ghost"}
            className={`w-full justify-start ${
              activeTab === "tasks"
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("tasks")}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Lịch vệ sinh
          </Button>
          <Button
            variant={activeTab === "rooms" ? "default" : "ghost"}
            className={`w-full justify-start ${
              activeTab === "rooms"
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("rooms")}
          >
            <MapPin className="mr-2 h-4 w-4" />
            Phân công phòng
          </Button>
          <Button
            variant={activeTab === "room-assignments" ? "default" : "ghost"}
            className={`w-full justify-start ${
              activeTab === "room-assignments"
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("room-assignments")}
          >
            <BedDouble className="mr-2 h-4 w-4" />
            Phân giường
            <Badge className="ml-auto bg-emerald-100 text-emerald-800 text-xs">Chỉ đọc</Badge>
          </Button>
          <Button
            variant={activeTab === "cleaning" ? "default" : "ghost"}
            className={`w-full justify-start ${
              activeTab === "cleaning"
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("cleaning")}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Vệ sinh
          </Button>
          <Button
            variant={activeTab === "staff" ? "default" : "ghost"}
            className={`w-full justify-start ${
              activeTab === "staff"
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("staff")}
          >
            <Users className="mr-2 h-4 w-4" />
            Nhân viên
            <Badge className="ml-auto bg-emerald-100 text-emerald-800 text-xs">Chỉ đọc</Badge>
          </Button>
          <Button
            variant={activeTab === "nurses" ? "default" : "ghost"}
            className={`w-full justify-start ${
              activeTab === "nurses"
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("nurses")}
          >
            <Heart className="mr-2 h-4 w-4" />Y tá
            <Badge className="ml-auto bg-emerald-100 text-emerald-800 text-xs">Chỉ đọc</Badge>
          </Button>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Nhân viên vệ sinh</p>
              <p className="text-xs text-gray-500 truncate">worker@hospital.com</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full bg-transparent">
            <LogOut className="mr-2 h-4 w-4" />
            Đăng xuất
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {activeTab === "overview" && "Tổng quan"}
                {activeTab === "tasks" && "Lịch vệ sinh hôm nay"}
                {activeTab === "rooms" && "Phân công phòng"}
                {activeTab === "room-assignments" && "Phân giường"}
                {activeTab === "cleaning" && "Vệ sinh"}
                {activeTab === "staff" && "Nhân viên"}
                {activeTab === "nurses" && "Y tá"}
              </h1>
              <p className="text-gray-600 mt-1">
                {activeTab === "overview" && "Xem tổng quan về công việc hôm nay"}
                {activeTab === "tasks" && "Danh sách nhiệm vụ vệ sinh cần thực hiện"}
                {activeTab === "rooms" && "Xem thông tin phân công và lịch vệ sinh các phòng"}
                {activeTab === "room-assignments" && "Xem thông tin phân công giường"}
                {activeTab === "cleaning" && "Quản lý các nhiệm vụ vệ sinh"}
                {activeTab === "staff" && "Xem thông tin nhân viên"}
                {activeTab === "nurses" && "Xem thông tin y tá"}
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date().toLocaleDateString("vi-VN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Nhiệm vụ hôm nay</CardTitle>
                    <ClipboardCheck className="h-4 w-4 text-emerald-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-emerald-600">{todayTasks}</div>
                    <p className="text-xs text-gray-600">
                      {cleaningTasks.filter((t) => t.status === "Chờ xử lý").length} chờ xử lý
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Đã hoàn thành</CardTitle>
                    <CardDescription>Trạng thái hoàn thành nhiệm vụ</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
                    <p className="text-xs text-gray-600">
                      {cleaningTasks.filter((t) => t.status === "Đang thực hiện").length} đang thực hiện
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Tỷ lệ hoàn thành</CardTitle>
                    <CardDescription>Tỷ lệ hoàn thành nhiệm vụ hôm nay</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{completionRate}%</div>
                    <p className="text-xs text-gray-600">Tiến độ hôm nay</p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Hành động nhanh</CardTitle>
                  <CardDescription>Truy cập nhanh các chức năng chính</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button onClick={() => setActiveTab("tasks")} className="bg-emerald-600 hover:bg-emerald-700">
                      <ClipboardCheck className="mr-2 h-4 w-4" />
                      Xem lịch vệ sinh
                    </Button>
                    <Button onClick={() => setActiveTab("rooms")} variant="outline">
                      <MapPin className="mr-2 h-4 w-4" />
                      Xem phân công phòng
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tasks Tab */}
          {activeTab === "tasks" && (
            <div className="space-y-6">
              {/* Search */}
              <div className="flex items-center space-x-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Tìm kiếm theo phòng, loại phòng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Cleaning Schedule */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ClipboardCheck className="h-5 w-5 text-emerald-600" />
                    <span>Lịch vệ sinh hôm nay</span>
                  </CardTitle>
                  <CardDescription>Danh sách nhiệm vụ vệ sinh cần thực hiện</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredTasks.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <ClipboardCheck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Không có nhiệm vụ vệ sinh nào</p>
                      </div>
                    ) : (
                      filteredTasks.map((task) => (
                        <div key={task.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="font-medium text-lg">{task.room_number}</div>
                              <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                              <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                            </div>
                            <div className="text-sm text-gray-500">
                              {task.scheduled_time} • {task.estimated_duration}p
                            </div>
                          </div>

                          <div className="text-sm text-gray-600">
                            <div>
                              <strong>Loại phòng:</strong> {task.room_type}
                            </div>
                            {task.special_instructions && (
                              <div>
                                <strong>Ghi chú đặc biệt:</strong> {task.special_instructions}
                              </div>
                            )}
                          </div>

                          <div className="flex space-x-2">
                            {task.status === "Chờ xử lý" && (
                              <Button
                                size="sm"
                                onClick={() => handleStartTask(task.id)}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                Bắt đầu
                              </Button>
                            )}
                            {task.status === "Đang thực hiện" && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    onClick={() => setSelectedTask(task)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    Ghi nhận đã vệ sinh
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Hoàn thành vệ sinh phòng {task.room_number}</DialogTitle>
                                    <DialogDescription>
                                      Ghi nhận việc hoàn thành vệ sinh và thêm ghi chú nếu cần
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label htmlFor="notes">Ghi chú (tùy chọn)</Label>
                                      <Textarea
                                        id="notes"
                                        placeholder="Nhập ghi chú về quá trình vệ sinh..."
                                        value={completionNotes}
                                        onChange={(e) => setCompletionNotes(e.target.value)}
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button
                                      onClick={() => handleCompleteTask(task.id)}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      Xác nhận hoàn thành
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            )}
                            {task.status === "Hoàn thành" && (
                              <Badge className="bg-green-100 text-green-800 border-green-200">✓ Đã hoàn thành</Badge>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Rooms Tab */}
          {activeTab === "rooms" && (
            <div className="space-y-6">
              {/* Search */}
              <div className="flex items-center space-x-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Tìm kiếm theo phòng, loại phòng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Room Assignments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <span>Phân công phòng</span>
                  </CardTitle>
                  <CardDescription>Xem thông tin phân công và lịch vệ sinh các phòng</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredRooms.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Không có thông tin phân công</p>
                      </div>
                    ) : (
                      filteredRooms.map((room) => (
                        <div key={room.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="font-medium text-lg">{room.room_number}</div>
                              <Badge className={getRoomStatusColor(room.status)}>{room.status}</Badge>
                            </div>
                            <div className="text-sm text-gray-500">{room.room_type}</div>
                          </div>

                          <div className="text-sm text-gray-600 space-y-1">
                            {room.patient_name && (
                              <div>
                                <strong>Bệnh nhân:</strong> {room.patient_name}
                              </div>
                            )}
                            <div>
                              <strong>Nhân viên phụ trách:</strong> {room.assigned_staff.join(", ")}
                            </div>
                            <div>
                              <strong>Vệ sinh lần cuối:</strong> {new Date(room.last_cleaned).toLocaleString("vi-VN")}
                            </div>
                            <div>
                              <strong>Vệ sinh tiếp theo:</strong> {new Date(room.next_cleaning).toLocaleString("vi-VN")}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Room Assignments Tab - Read Only */}
          {activeTab === "room-assignments" && (
            <div className="worker-read-only">
              <RoomAssignmentManagement />
            </div>
          )}

          {/* Cleaning Tab - Full Access */}
          {activeTab === "cleaning" && (
            <div>
              <CleaningManagement />
            </div>
          )}

          {/* Staff Tab - Read Only */}
          {activeTab === "staff" && (
            <div className="worker-read-only">
              <StaffManagement />
            </div>
          )}

          {/* Nurses Tab - Read Only */}
          {activeTab === "nurses" && (
            <div className="worker-read-only">
              <NurseManagement />
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .worker-read-only button:not([class*="ghost"]):not([class*="outline"]) {
          display: none !important;
        }
        .worker-read-only [role="dialog"] {
          display: none !important;
        }
        .worker-read-only input:not([type="search"]):not([placeholder*="Tìm"]) {
          pointer-events: none !important;
          background-color: #f9fafb !important;
        }
        .worker-read-only textarea {
          pointer-events: none !important;
          background-color: #f9fafb !important;
        }
        .worker-read-only select {
          pointer-events: none !important;
        }
      `}</style>
    </div>
  )
}
