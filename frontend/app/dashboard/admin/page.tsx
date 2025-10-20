"use client"

import { useState, useEffect } from "react"
import { formatDateSafe, getVietnameseTimePeriod } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import {
  Shield,
  Users,
  Activity,
  Settings,
  BarChart3,
  Database,
  Server,
  HardDrive,
  LogOut,
  User,
  Home,
  FileText,
  UserCheck,
  Calendar,
  CreditCard,
  Pill,
  Bed,
  Droplets,
  Truck,
  Building2,
  Stethoscope,
  UserCog,
  ClipboardList,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { adminApi, AdminDashboardData, UserData, ActivityLog, SystemStatistics } from "@/lib/api"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  UsersTab,
  PatientsTab, 
  DoctorsTab, 
  StaffTab, 
  AppointmentsTab, 
  MedicalRecordsTab, 
  BillingTab,
  MedicineTab,
  PharmacyTab,
  BloodBankTab,
  RoomsTab,
  RoomAssignmentsTab,
  CleaningTab,
  AmbulancesTab,
  ReportsTab,
  HelpTab
} from "@/components/admin/tabs"

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

  const refreshDashboard = () => {
    loadDashboardData()
  }

  const loadDashboardData = async () => {
    setLoading(true)
    
    try {
      // Load admin dashboard data
      const dashboardResponse = await adminApi.getDashboard()
      setDashboardData(dashboardResponse)

      // Load system statistics
      const statsResponse = await adminApi.getSystemStatistics()
      setSystemStats(statsResponse)

      // Load users
      const usersResponse = await adminApi.getAllUsers({ limit: 50 })
      setUsers(usersResponse.data)

      // Load activity logs
      const logsResponse = await adminApi.getActivityLogs({ limit: 20 })
      setActivityLogs(logsResponse.data)

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

  // Define all navigation items
  const navigationItems = [
    { value: "overview", label: "Tổng quan", icon: Home },
    { value: "users", label: "Phân quyền", icon: UserCog },
    { value: "patients", label: "Bệnh nhân", icon: Users },
    { value: "doctors", label: "Bác sĩ", icon: Stethoscope },
    { value: "staff", label: "Nhân viên", icon: UserCheck },
    { value: "appointments", label: "Lịch hẹn", icon: Calendar },
    { value: "medical-records", label: "Hồ sơ y tế", icon: FileText },
    { value: "billing", label: "Thanh toán", icon: CreditCard },
    { value: "medicine", label: "Thuốc", icon: Pill },
    { value: "pharmacy", label: "Nhà thuốc", icon: Stethoscope },
    { value: "blood-bank", label: "Ngân hàng máu", icon: Droplets },
    { value: "rooms", label: "Phòng bệnh", icon: Building2 },
    { value: "room-assignments", label: "Phân giường", icon: Bed },
    { value: "cleaning", label: "Vệ sinh", icon: ClipboardList },
    { value: "ambulances", label: "Xe cứu thương", icon: Truck },
    { value: "reports", label: "Báo cáo", icon: BarChart3 },
  ]

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
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Quản Trị Hệ Thống</h1>
              <p className="text-sm text-gray-500">
                {user?.full_name || user?.email || "Admin"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
            Chức năng chính
          </h3>
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.value
            const badge = item.value === "appointments" ? dashboardData?.overview.todayAppointments : null

            return (
              <button
                key={item.value}
                onClick={() => setActiveTab(item.value)}
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
                <span className="flex-1 text-left">{item.label}</span>
                {badge && badge > 0 && (
                  <span
                    className={`
                    min-w-5 h-5 rounded-full text-xs font-bold
                    flex items-center justify-center px-2
                    ${isActive ? "bg-white text-red-600" : "bg-blue-500 text-white"}
                  `}
                  >
                    {badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-gray-200 sticky bottom-0 bg-white">
          <div className="p-4 bg-gray-50">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.full_name || user?.email || "Admin"}
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
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {navigationItems.find(item => item.value === activeTab)?.label || "Dashboard"}
              </h2>
              <p className="text-sm text-gray-500">
                Chào buổi {getVietnameseTimePeriod(new Date())}, {" "}
                {user?.full_name || user?.email || "Admin"}
              </p>
            </div>
          </div>
        </div>

        {/* Content Area - Scrollable */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
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

              {/* System Health & Recent Activities */}
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
                          formatDateSafe(dashboardData.systemHealth.lastBackup, 'date') : 
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
                                {formatDateSafe(activity.created_at, 'date')}
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
            </div>
          )}

          {/* Users/Roles Management Tab (Phân quyền) */}
          {activeTab === "users" && <UsersTab />}

          {/* Patients Tab */}
          {activeTab === "patients" && <PatientsTab onDataChange={refreshDashboard} />}

          {/* Doctors Tab */}
          {activeTab === "doctors" && <DoctorsTab onDataChange={refreshDashboard} />}

          {/* Staff Tab */}
          {activeTab === "staff" && <StaffTab onDataChange={refreshDashboard} />}

          {/* Appointments Tab */}
          {activeTab === "appointments" && <AppointmentsTab />}

          {/* Medical Records Tab */}
          {activeTab === "medical-records" && <MedicalRecordsTab />}

          {/* Billing Tab */}
          {activeTab === "billing" && <BillingTab />}

          {/* Medicine Tab */}
          {activeTab === "medicine" && <MedicineTab />}

          {/* Pharmacy Tab */}
          {activeTab === "pharmacy" && <PharmacyTab />}

          {/* Blood Bank Tab */}
          {activeTab === "blood-bank" && <BloodBankTab />}

          {/* Rooms Tab */}
          {activeTab === "rooms" && <RoomsTab />}

          {/* Room Assignments Tab */}
          {activeTab === "room-assignments" && <RoomAssignmentsTab />}

          {/* Cleaning Tab */}
          {activeTab === "cleaning" && <CleaningTab />}

          {/* Ambulances Tab */}
          {activeTab === "ambulances" && <AmbulancesTab />}

          {/* Reports Tab */}
          {activeTab === "reports" && <ReportsTab />}

          {/* Help Tab */}
          {activeTab === "help" && <HelpTab />}
        </div>
      </div>
    </div>
  )
}
