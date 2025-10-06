"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/hooks/use-toast"
import {
  Shield,
  Users,
  Activity,
  Settings,
  BarChart3,
  Database,
  AlertTriangle,
  CheckCircle,
  Clock,
  Server,
  HardDrive,
  LogOut,
  User,
  Home,
  FileText,
  Download,
  Wrench
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { adminApi, AdminDashboardData, UserData, ActivityLog, SystemStatistics } from "@/lib/api"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(false)
  
  // Dashboard Data States
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null)
  const [systemStats, setSystemStats] = useState<SystemStatistics | null>(null)
  const [users, setUsers] = useState<UserData[]>([])
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  
  // Filters
  const [userFilter, setUserFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    setLoading(true)
    console.log('Loading admin dashboard data for user:', user)
    
    try {
      // Load admin dashboard data
      const dashboardResponse = await adminApi.getDashboard()
      console.log('Admin Dashboard API Response:', dashboardResponse)
      setDashboardData(dashboardResponse)

      // Load system statistics
      const statsResponse = await adminApi.getSystemStatistics()
      console.log('System Statistics API Response:', statsResponse)
      setSystemStats(statsResponse)

      // Load users
      const usersResponse = await adminApi.getAllUsers({ limit: 50 })
      console.log('Users API Response:', usersResponse)
      setUsers(usersResponse.data)

      // Load activity logs
      const logsResponse = await adminApi.getActivityLogs({ limit: 20 })
      console.log('Activity Logs API Response:', logsResponse)
      setActivityLogs(logsResponse.data)

      console.log('Admin dashboard data loaded successfully')

    } catch (error) {
      console.error("Error loading admin dashboard data:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu dashboard",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await adminApi.updateUserStatus(userId, { is_active: !currentStatus })
      
      toast({
        title: "Thành công",
        description: `Đã ${!currentStatus ? 'kích hoạt' : 'vô hiệu hóa'} tài khoản`,
      })
      
      loadDashboardData()

    } catch (error) {
      console.error("Error updating user status:", error)
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái tài khoản",
        variant: "destructive",
      })
    }
  }

  const handleCreateBackup = async () => {
    try {
      await adminApi.createBackup({ backup_type: 'full' })
      
      toast({
        title: "Thành công",
        description: "Đã tạo backup hệ thống thành công",
      })

    } catch (error) {
      console.error("Error creating backup:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tạo backup hệ thống",
        variant: "destructive",
      })
    }
  }

  const handleToggleMaintenanceMode = async (enabled: boolean) => {
    try {
      await adminApi.toggleMaintenanceMode({ 
        enabled,
        message: enabled ? 'Hệ thống đang bảo trì, vui lòng quay lại sau' : ''
      })
      
      toast({
        title: "Thành công",
        description: `Đã ${enabled ? 'bật' : 'tắt'} chế độ bảo trì`,
      })

    } catch (error) {
      console.error("Error toggling maintenance mode:", error)
      toast({
        title: "Lỗi",
        description: "Không thể thay đổi chế độ bảo trì",
        variant: "destructive",
      })
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/auth')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesEmail = user.email.toLowerCase().includes(userFilter.toLowerCase())
    const matchesStatus = statusFilter === "" || 
      (statusFilter === "active" && user.is_active) ||
      (statusFilter === "inactive" && !user.is_active)
    return matchesEmail && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Dashboard Quản trị</h1>
              <p className="text-sm text-gray-500">
                {user?.full_name || user?.email || "Quản trị viên"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {[
            { value: "overview", label: "Tổng quan", icon: Home },
            { value: "users", label: "Người dùng", icon: Users, badge: users.length },
            { value: "system", label: "Hệ thống", icon: Server },
            { value: "activity", label: "Hoạt động", icon: Activity, badge: activityLogs.length },
            { value: "backup", label: "Sao lưu", icon: Database },
            { value: "maintenance", label: "Bảo trì", icon: Wrench },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.value

            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm
                  transition-all duration-200 ease-in-out
                  ${
                    isActive
                      ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg"
                      : "text-gray-600 hover:text-red-600 hover:bg-red-50"
                  }
                `}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-white" : ""}`} />
                <span className="flex-1 text-left">{tab.label}</span>
                {tab.badge && tab.badge > 0 && (
                  <span
                    className={`
                    min-w-5 h-5 rounded-full text-xs font-bold
                    flex items-center justify-center
                    ${isActive ? "bg-white text-red-600" : "bg-blue-500 text-white"}
                  `}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-gray-200">
          <div className="p-4 bg-gray-50">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-user.jpg" alt="Admin Avatar" />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.full_name || user?.email || "Quản trị viên"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || "admin@hospital.vn"}
                </p>
                <Badge variant="destructive" className="text-xs mt-1">
                  ADMIN
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="p-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {activeTab === "overview" && "Tổng quan hệ thống"}
                {activeTab === "users" && "Quản lý người dùng"}
                {activeTab === "system" && "Thống kê hệ thống"}
                {activeTab === "activity" && "Nhật ký hoạt động"}
                {activeTab === "backup" && "Sao lưu dữ liệu"}
                {activeTab === "maintenance" && "Bảo trì hệ thống"}
              </h2>
              <p className="text-sm text-gray-500">
                Chào buổi {new Date().getHours() < 12 ? "sáng" : new Date().getHours() < 18 ? "chiều" : "tối"}, {" "}
                {user?.full_name || user?.email || "Quản trị viên"}
              </p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Users className="h-8 w-8 text-blue-600 mb-2" />
                        <p className="text-3xl font-bold text-blue-800">
                          {dashboardData?.overview.totalUsers || 0}
                        </p>
                        <p className="text-sm font-medium text-blue-600">Tổng người dùng</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Activity className="h-8 w-8 text-green-600 mb-2" />
                        <p className="text-3xl font-bold text-green-800">
                          {dashboardData?.overview.totalAppointments || 0}
                        </p>
                        <p className="text-sm font-medium text-green-600">Tổng cuộc hẹn</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Settings className="h-8 w-8 text-purple-600 mb-2" />
                        <p className="text-3xl font-bold text-purple-800">
                          {dashboardData?.overview.totalDepartments || 0}
                        </p>
                        <p className="text-sm font-medium text-purple-600">Tổng khoa</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <HardDrive className="h-8 w-8 text-orange-600 mb-2" />
                        <p className="text-3xl font-bold text-orange-800">
                          {dashboardData?.overview.totalRooms || 0}
                        </p>
                        <p className="text-sm font-medium text-orange-600">Tổng phòng</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* System Health */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Server className="h-5 w-5 text-green-600" />
                      Tình trạng hệ thống
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Database</span>
                      <Badge variant={dashboardData?.systemHealth.database === 'healthy' ? 'default' : 'destructive'}>
                        {dashboardData?.systemHealth.database === 'healthy' ? 'Hoạt động tốt' : 'Có vấn đề'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Server</span>
                      <Badge variant={dashboardData?.systemHealth.server === 'running' ? 'default' : 'destructive'}>
                        {dashboardData?.systemHealth.server === 'running' ? 'Đang chạy' : 'Dừng hoạt động'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Backup cuối</span>
                      <span className="text-sm text-gray-500">
                        {dashboardData?.systemHealth.lastBackup ? 
                          new Date(dashboardData.systemHealth.lastBackup).toLocaleDateString('vi-VN') : 
                          'Chưa có'
                        }
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-blue-600" />
                      Hoạt động gần đây
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {dashboardData?.recentActivities && dashboardData.recentActivities.length > 0 ? 
                        dashboardData.recentActivities.slice(0, 5).map((activity) => (
                          <div key={activity.user_id} className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{activity.email}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(activity.created_at).toLocaleDateString('vi-VN')}
                              </p>
                            </div>
                          </div>
                        )) : (
                          <p className="text-sm text-gray-500">Không có hoạt động gần đây</p>
                        )
                      }
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Users Management Tab */}
            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Quản lý người dùng ({filteredUsers.length})
                  </CardTitle>
                  <div className="flex items-center gap-4">
                    <Input
                      placeholder="Tìm kiếm email..."
                      value={userFilter}
                      onChange={(e) => setUserFilter(e.target.value)}
                      className="max-w-sm"
                    />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 border rounded-md"
                    >
                      <option value="">Tất cả trạng thái</option>
                      <option value="active">Đang hoạt động</option>
                      <option value="inactive">Đã vô hiệu hóa</option>
                    </select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Trạng thái</TableHead>
                          <TableHead>Ngày tạo</TableHead>
                          <TableHead>Đăng nhập cuối</TableHead>
                          <TableHead>Thao tác</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user) => (
                          <TableRow key={user.user_id}>
                            <TableCell className="font-medium">{user.email}</TableCell>
                            <TableCell>
                              <Badge variant={user.is_active ? "default" : "secondary"}>
                                {user.is_active ? "Hoạt động" : "Vô hiệu"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(user.created_at).toLocaleDateString('vi-VN')}
                            </TableCell>
                            <TableCell>
                              {user.last_login ? 
                                new Date(user.last_login).toLocaleDateString('vi-VN') : 
                                'Chưa đăng nhập'
                              }
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant={user.is_active ? "destructive" : "default"}
                                onClick={() => handleToggleUserStatus(user.user_id, user.is_active)}
                              >
                                {user.is_active ? "Vô hiệu hóa" : "Kích hoạt"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* System Statistics Tab */}
            <TabsContent value="system" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    Thống kê hệ thống
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-600">{systemStats?.totalUsers || 0}</p>
                      <p className="text-sm text-gray-600">Người dùng</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-600">{systemStats?.totalAppointments || 0}</p>
                      <p className="text-sm text-gray-600">Cuộc hẹn</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-purple-600">{systemStats?.totalDepartments || 0}</p>
                      <p className="text-sm text-gray-600">Khoa</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-orange-600">{systemStats?.totalRooms || 0}</p>
                      <p className="text-sm text-gray-600">Phòng</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Logs Tab */}
            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    Nhật ký hoạt động ({activityLogs.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activityLogs && activityLogs.length > 0 ? activityLogs.map((log) => (
                      <div key={log.log_id} className="p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{log.action}</h4>
                            <p className="text-sm text-muted-foreground">
                              {log.user?.email || 'Hệ thống'} - {log.resource}
                            </p>
                            {log.details && (
                              <p className="text-xs text-gray-500 mt-1">{log.details}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">
                              {new Date(log.timestamp).toLocaleString('vi-VN')}
                            </p>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-12 text-gray-500">
                        <Activity className="h-16 w-16 mx-auto mb-4 opacity-30" />
                        <h3 className="text-lg font-medium mb-2">Không có nhật ký hoạt động</h3>
                        <p>Chưa có hoạt động nào được ghi lại.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Backup Tab */}
            <TabsContent value="backup" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-blue-600" />
                    Sao lưu dữ liệu
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Button onClick={handleCreateBackup} className="bg-blue-600 hover:bg-blue-700">
                      <Download className="h-4 w-4 mr-2" />
                      Tạo backup đầy đủ
                    </Button>
                    <p className="text-sm text-gray-600">
                      Backup cuối: {dashboardData?.systemHealth.lastBackup ? 
                        new Date(dashboardData.systemHealth.lastBackup).toLocaleString('vi-VN') : 
                        'Chưa có'
                      }
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Lưu ý:</strong> Quá trình backup có thể mất vài phút. Hệ thống sẽ tiếp tục hoạt động bình thường.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Maintenance Tab */}
            <TabsContent value="maintenance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-orange-600" />
                    Bảo trì hệ thống
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Button 
                      onClick={() => handleToggleMaintenanceMode(true)}
                      variant="destructive"
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Bật chế độ bảo trì
                    </Button>
                    <Button 
                      onClick={() => handleToggleMaintenanceMode(false)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Tắt chế độ bảo trì
                    </Button>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-orange-800">
                      <strong>Cảnh báo:</strong> Khi bật chế độ bảo trì, người dùng sẽ không thể truy cập hệ thống.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
