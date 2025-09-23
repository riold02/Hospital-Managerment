"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import DashboardLayout from "@/components/layout/DashboardLayout"
import {
  Calendar,
  Users,
  DollarSign,
  AlertTriangle,
  Building2,
  Pill,
  Droplets,
  Truck,
  Loader2,
  Search,
  Filter,
  FileText,
  Stethoscope,
  ClipboardList,
  BedDouble,
  Sparkles,
  Newspaper,
  HelpCircle,
  Activity,
  UserCog,
} from "lucide-react"
import Link from "next/link"

interface KPIData {
  todayAppointments: number
  roomOccupancy: number
  monthlyRevenue: number
  expiringMedicine: number
}

interface BillingItem {
  bill_id: string
  patient: string
  amount: number
  created_at: string
}

interface RoomItem {
  room_number: string
  type: string
  status: string
  last_serviced: string
}

export default function AdminDashboard() {
  const [kpiData, setKpiData] = useState<KPIData | null>(null)
  const [billingData, setBillingData] = useState<BillingItem[]>([])
  const [roomData, setRoomData] = useState<RoomItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split("T")[0])
  const [searchTerm, setSearchTerm] = useState("")

  // Mock data for demonstration
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("[v0] Loading admin dashboard data")
        setLoading(true)

        // Simulate API calls
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock KPI data
        setKpiData({
          todayAppointments: 24,
          roomOccupancy: 78,
          monthlyRevenue: 2450000,
          expiringMedicine: 12,
        })

        // Mock billing data
        setBillingData([
          { bill_id: "BL001", patient: "Nguyễn Văn An", amount: 850000, created_at: "2024-01-15" },
          { bill_id: "BL002", patient: "Trần Thị Bình", amount: 1200000, created_at: "2024-01-14" },
          { bill_id: "BL003", patient: "Lê Văn Cường", amount: 650000, created_at: "2024-01-13" },
          { bill_id: "BL004", patient: "Phạm Thị Dung", amount: 950000, created_at: "2024-01-12" },
        ])

        // Mock room data
        setRoomData([
          { room_number: "P101", type: "Phòng đơn", status: "Occupied", last_serviced: "2024-01-10" },
          { room_number: "P205", type: "Phòng ICU", status: "Under Maintenance", last_serviced: "2024-01-08" },
          { room_number: "P312", type: "Phòng đôi", status: "Occupied", last_serviced: "2024-01-09" },
        ])

        setLoading(false)
      } catch (err) {
        setError("Không thể tải dữ liệu. Vui lòng thử lại.")
        setLoading(false)
      }
    }

    fetchData()
  }, [dateFilter])

  const handleMarkPaid = async (billId: string) => {
    try {
      // Simulate API call: PUT /billing/{id}
      console.log(`[v0] Marking bill ${billId} as paid`)
      setBillingData((prev) => prev.filter((item) => item.bill_id !== billId))
    } catch (err) {
      console.error("Error marking bill as paid:", err)
    }
  }

  const handleSetAvailable = async (roomNumber: string) => {
    try {
      // Simulate API call: PUT /rooms/{id}
      console.log(`[v0] Setting room ${roomNumber} as available`)
      setRoomData((prev) => prev.filter((item) => item.room_number !== roomNumber))
    } catch (err) {
      console.error("Error setting room as available:", err)
    }
  }

  const filteredBilling = billingData.filter(
    (item) =>
      item.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.bill_id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredRooms = roomData.filter(
    (item) =>
      item.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <DashboardLayout
        title="Bảng Điều Khiển Quản Trị"
        description="Tổng quan hệ thống bệnh viện"
        currentPath="/dashboard/admin"
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Đang tải dữ liệu...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout
        title="Bảng Điều Khiển Quản Trị"
        description="Tổng quan hệ thống bệnh viện"
        currentPath="/dashboard/admin"
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-4" />
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Thử lại</Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Bảng Điều Khiển Quản Trị"
      description="Tổng quan hệ thống bệnh viện"
      currentPath="/dashboard/admin"
    >
      {/* Date Filter */}
      <div className="flex items-center justify-end gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-auto" />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hẹn Hôm Nay</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{kpiData?.todayAppointments}</div>
            <p className="text-xs text-muted-foreground">cuộc hẹn đã đặt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Công Suất Phòng</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{kpiData?.roomOccupancy}%</div>
            <p className="text-xs text-muted-foreground">phòng đang sử dụng</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doanh Thu Tháng</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{kpiData?.monthlyRevenue?.toLocaleString("vi-VN")}₫</div>
            <p className="text-xs text-muted-foreground">tháng này</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Thuốc Sắp Hết Hạn</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{kpiData?.expiringMedicine}</div>
            <p className="text-xs text-muted-foreground">trong 30 ngày tới</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Lọc
        </Button>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Billing Pending Table */}
        <Card>
          <CardHeader>
            <CardTitle>Hóa Đơn Chờ Thanh Toán</CardTitle>
            <CardDescription>Danh sách hóa đơn chưa được thanh toán</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredBilling.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Không có hóa đơn chờ thanh toán</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã HĐ</TableHead>
                    <TableHead>Bệnh Nhân</TableHead>
                    <TableHead>Số Tiền</TableHead>
                    <TableHead>Ngày Tạo</TableHead>
                    <TableHead>Hành Động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBilling.map((bill) => (
                    <TableRow key={bill.bill_id}>
                      <TableCell className="font-medium">{bill.bill_id}</TableCell>
                      <TableCell>{bill.patient}</TableCell>
                      <TableCell>{bill.amount.toLocaleString("vi-VN")}₫</TableCell>
                      <TableCell>{new Date(bill.created_at).toLocaleDateString("vi-VN")}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleMarkPaid(bill.bill_id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Đánh Dấu Đã Trả
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Unavailable Rooms Table */}
        <Card>
          <CardHeader>
            <CardTitle>Phòng Không Khả Dụng</CardTitle>
            <CardDescription>Phòng đang bảo trì hoặc có người</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredRooms.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Tất cả phòng đều khả dụng</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Số Phòng</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead>Trạng Thái</TableHead>
                    <TableHead>Bảo Trì Cuối</TableHead>
                    <TableHead>Hành Động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRooms.map((room) => (
                    <TableRow key={room.room_number}>
                      <TableCell className="font-medium">{room.room_number}</TableCell>
                      <TableCell>{room.type}</TableCell>
                      <TableCell>
                        <Badge variant={room.status === "Occupied" ? "destructive" : "secondary"}>
                          {room.status === "Occupied" ? "Có Người" : "Bảo Trì"}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(room.last_serviced).toLocaleDateString("vi-VN")}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => handleSetAvailable(room.room_number)}>
                          Đặt Khả Dụng
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-8">
        {/* Core Management */}
        <Card>
          <CardHeader>
            <CardTitle>Quản Lý Cốt Lõi</CardTitle>
            <CardDescription>Các chức năng quản lý chính của hệ thống</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/patients" className="block">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2 bg-transparent hover:bg-primary/5">
                  <Users className="h-6 w-6" />
                  <span>Bệnh Nhân</span>
                </Button>
              </Link>
              <Link href="/doctors" className="block">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2 bg-transparent hover:bg-primary/5">
                  <Stethoscope className="h-6 w-6" />
                  <span>Bác Sĩ</span>
                </Button>
              </Link>
              <Link href="/staff" className="block">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2 bg-transparent hover:bg-primary/5">
                  <UserCog className="h-6 w-6" />
                  <span>Nhân Viên</span>
                </Button>
              </Link>
              <Link href="/appointments" className="block">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2 bg-transparent hover:bg-primary/5">
                  <Calendar className="h-6 w-6" />
                  <span>Lịch Hẹn</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Medical & Records */}
        <Card>
          <CardHeader>
            <CardTitle>Y Tế & Hồ Sơ</CardTitle>
            <CardDescription>Quản lý hồ sơ y tế và dược phẩm</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/medical-records" className="block">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2 bg-transparent hover:bg-primary/5">
                  <FileText className="h-6 w-6" />
                  <span>Hồ Sơ Y Tế</span>
                </Button>
              </Link>
              <Link href="/medicine" className="block">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2 bg-transparent hover:bg-primary/5">
                  <Pill className="h-6 w-6" />
                  <span>Thuốc</span>
                </Button>
              </Link>
              <Link href="/pharmacy" className="block">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2 bg-transparent hover:bg-primary/5">
                  <Activity className="h-6 w-6" />
                  <span>Nhà Thuốc</span>
                </Button>
              </Link>
              <Link href="/blood-bank" className="block">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2 bg-transparent hover:bg-primary/5">
                  <Droplets className="h-6 w-6" />
                  <span>Ngân Hàng Máu</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Facility Management */}
        <Card>
          <CardHeader>
            <CardTitle>Quản Lý Cơ Sở</CardTitle>
            <CardDescription>Quản lý phòng và dịch vụ cơ sở vật chất</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/rooms" className="block">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2 bg-transparent hover:bg-primary/5">
                  <Building2 className="h-6 w-6" />
                  <span>Phòng</span>
                </Button>
              </Link>
              <Link href="/room-assignments" className="block">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2 bg-transparent hover:bg-primary/5">
                  <BedDouble className="h-6 w-6" />
                  <span>Phân Phòng</span>
                </Button>
              </Link>
              <Link href="/cleaning" className="block">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2 bg-transparent hover:bg-primary/5">
                  <Sparkles className="h-6 w-6" />
                  <span>Vệ Sinh</span>
                </Button>
              </Link>
              <Link href="/ambulances" className="block">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2 bg-transparent hover:bg-primary/5">
                  <Truck className="h-6 w-6" />
                  <span>Xe Cứu Thương</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Financial & Operations */}
        <Card>
          <CardHeader>
            <CardTitle>Tài Chính & Vận Hành</CardTitle>
            <CardDescription>Quản lý tài chính và hoạt động vận hành</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/billing" className="block">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2 bg-transparent hover:bg-primary/5">
                  <DollarSign className="h-6 w-6" />
                  <span>Hóa Đơn</span>
                </Button>
              </Link>
              <Link href="/ambulance-log" className="block">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2 bg-transparent hover:bg-primary/5">
                  <ClipboardList className="h-6 w-6" />
                  <span>Nhật Ký Xe</span>
                </Button>
              </Link>
              <Link href="/news-management" className="block">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2 bg-transparent hover:bg-primary/5">
                  <Newspaper className="h-6 w-6" />
                  <span>Quản Lý Tin</span>
                </Button>
              </Link>
              <Link href="/help" className="block">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2 bg-transparent hover:bg-primary/5">
                  <HelpCircle className="h-6 w-6" />
                  <span>Trợ Giúp</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
