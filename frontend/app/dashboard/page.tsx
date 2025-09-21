"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { useAuth } from "@/lib/auth-context"
import { RBACManager } from "@/lib/rbac"
import {
  Users,
  Calendar,
  Bed,
  AlertCircle,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle,
  Heart,
  FileText,
  Stethoscope,
  Pill,
  Building,
  Droplets,
  Truck,
  Settings,
} from "lucide-react"

export default function HospitalDashboard() {
  const { user } = useAuth()
  const rbac = new RBACManager()

  const stats = [
    {
      title: "Bệnh nhân hôm nay",
      value: "247",
      change: "+12%",
      trend: "up",
      icon: Users,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Lịch hẹn sắp tới",
      value: "89",
      change: "+5%",
      trend: "up",
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Giường trống",
      value: "23",
      change: "-3",
      trend: "down",
      icon: Bed,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Ca cấp cứu",
      value: "12",
      change: "+2",
      trend: "up",
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ]

  const recentActivity = [
    {
      patient: "Nguyễn Thị Hoa",
      action: "Nhập viện ICU",
      time: "2 phút trước",
      status: "critical",
      avatar: "NH",
    },
    {
      patient: "Trần Minh Tuấn",
      action: "Phẫu thuật hoàn thành",
      time: "15 phút trước",
      status: "success",
      avatar: "TT",
    },
    {
      patient: "Lê Thị Mai",
      action: "Kết quả xét nghiệm sẵn sàng",
      time: "32 phút trước",
      status: "pending",
      avatar: "LM",
    },
    {
      patient: "Phạm Văn Nam",
      action: "Xuất viện",
      time: "1 giờ trước",
      status: "success",
      avatar: "PN",
    },
  ]

  const quickActions = [
    {
      href: "/patients",
      icon: Users,
      label: "Quản lý bệnh nhân",
      module: "patients" as const,
      action: "read" as const,
      color: "emerald",
      gradient: true,
    },
    {
      href: "/appointments",
      icon: Calendar,
      label: "Lịch hẹn",
      module: "appointments" as const,
      action: "read" as const,
      color: "blue",
    },
    {
      href: "/medical-records",
      icon: FileText,
      label: "Hồ sơ y tế",
      module: "medical_records" as const,
      action: "read" as const,
      color: "purple",
    },
    {
      href: "/doctors",
      icon: Stethoscope,
      label: "Quản lý bác sĩ",
      module: "doctors" as const,
      action: "read" as const,
      color: "teal",
    },
    {
      href: "/medicine",
      icon: Pill,
      label: "Kho thuốc",
      module: "medicine" as const,
      action: "read" as const,
      color: "green",
    },
    {
      href: "/rooms",
      icon: Building,
      label: "Phòng bệnh",
      module: "rooms" as const,
      action: "read" as const,
      color: "orange",
    },
    {
      href: "/blood-bank",
      icon: Droplets,
      label: "Ngân hàng máu",
      module: "blood_bank" as const,
      action: "read" as const,
      color: "red",
    },
    {
      href: "/ambulances",
      icon: Truck,
      label: "Xe cứu thương",
      module: "ambulances" as const,
      action: "read" as const,
      color: "yellow",
    },
    {
      href: "/dashboard/admin",
      icon: Settings,
      label: "Dashboard quản trị",
      module: "dashboard" as const,
      action: "read" as const,
      color: "gray",
      requiresRole: "Admin" as const,
    },
  ]

  const availableActions = quickActions.filter((action) => {
    if (action.requiresRole && user?.role !== action.requiresRole) {
      return false
    }
    return user ? rbac.hasPermission(user.role, action.module, action.action) : false
  })

  return (
    <DashboardLayout
      title={`Chào mừng, ${user?.full_name || "Người dùng"}`}
      description={`Dashboard ${user?.role || ""} - Hệ thống quản lý bệnh viện MediCare Plus`}
      currentPath="/dashboard"
    >
      <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
            <Heart className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-emerald-900">Chào mừng trở lại, {user?.full_name}!</h2>
            <p className="text-emerald-700">
              Vai trò: <span className="font-medium">{user?.role}</span> | Bộ phận:{" "}
              <span className="font-medium">{user?.department || "Chung"}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-all duration-200 border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
              <div className="flex items-center gap-1 text-sm">
                <TrendingUp className={`w-4 h-4 ${stat.trend === "up" ? "text-emerald-500" : "text-red-500"}`} />
                <span className={stat.trend === "up" ? "text-emerald-600" : "text-red-600"}>{stat.change}</span>
                <span className="text-muted-foreground">từ tuần trước</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              Hoạt động gần đây
            </CardTitle>
            <CardDescription>Cập nhật mới nhất về bệnh nhân và hoạt động bệnh viện</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-muted/30 transition-colors border border-border/50"
                >
                  <Avatar className="w-12 h-12 border-2 border-background shadow-sm">
                    <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700">
                      {activity.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground">{activity.patient}</p>
                    <p className="text-sm text-muted-foreground">{activity.action}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        activity.status === "critical"
                          ? "destructive"
                          : activity.status === "success"
                            ? "default"
                            : "secondary"
                      }
                      className="shadow-sm"
                    >
                      {activity.status === "critical" && <AlertCircle className="w-3 h-3 mr-1" />}
                      {activity.status === "success" && <CheckCircle className="w-3 h-3 mr-1" />}
                      {activity.status === "pending" && <Clock className="w-3 h-3 mr-1" />}
                      {activity.status === "critical"
                        ? "Nghiêm trọng"
                        : activity.status === "success"
                          ? "Thành công"
                          : "Đang chờ"}
                    </Badge>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-emerald-600" />
              Thao tác nhanh
            </CardTitle>
            <CardDescription>Các tác vụ bạn có quyền truy cập ({availableActions.length} mục)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {availableActions.length > 0 ? (
              availableActions.map((action, index) => (
                <Link key={index} href={action.href}>
                  <Button
                    className={`w-full justify-start gap-3 h-12 ${
                      action.gradient
                        ? `bg-gradient-to-r from-${action.color}-500 to-${action.color}-600 hover:from-${action.color}-600 hover:to-${action.color}-700 shadow-md text-white`
                        : `border-${action.color}-200 hover:bg-${action.color}-50 bg-transparent`
                    }`}
                    variant={action.gradient ? "default" : "outline"}
                  >
                    <action.icon className={`w-5 h-5 ${action.gradient ? "text-white" : `text-${action.color}-600`}`} />
                    {action.label}
                  </Button>
                </Link>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                <p>Không có thao tác nào khả dụng cho vai trò của bạn.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
