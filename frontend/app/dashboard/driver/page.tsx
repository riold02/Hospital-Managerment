"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { AmbulanceManagement } from "@/components/admin/ambulance-management"
import { StaffManagement } from "@/components/admin/staff-management"
import {
  Calendar,
  TrendingUp,
  Route,
  AlertTriangle,
  Truck,
  Clock,
  MapPin,
  Users,
  Phone,
  PhoneCall,
  Timer,
  Siren,
  FileText,
  RotateCcw,
  LogOut,
  User,
  Ambulance,
  UserCheck,
  RefreshCw,
} from "lucide-react"
import { apiClient, ApiError } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

interface Trip {
  id: string
  pickup_time: string
  patient_name?: string
  patient_phone: string
  doctor_phone: string
  family_phone: string
  emergency_hotline: string
  pickup_location: string
  dropoff_location: string
  status: "Scheduled" | "Moving to Pickup" | "Picked Up" | "Completed" | "Cancelled"
  priority: "Low" | "Medium" | "High" | "Critical"
  requires_oxygen?: boolean
  requires_ventilator?: boolean
  mobility_assistance?: boolean
  special_notes?: string
  scheduled_time?: string
  moving_to_pickup_time?: string
  picked_up_time?: string
  completed_time?: string
}

interface Vehicle {
  license_plate: string
  fuel_level: number
  availability: boolean
}

interface Incident {
  id: string
  type: string
  description: string
  resolved: boolean
  timestamp: string
}

interface ShiftReport {
  total_distance: number
  fuel_consumed: number
  incidents_count: number
}

export default function DriverDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [trips, setTrips] = useState<Trip[]>([])
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [shiftReport, setShiftReport] = useState<ShiftReport | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const todayTrips = trips.length
  const activeTrips = trips.filter((trip) => trip.status !== "Completed" && trip.status !== "Cancelled").length
  const completedTrips = trips.filter((trip) => trip.status === "Completed").length
  const completionRate = todayTrips > 0 ? Math.round((completedTrips / todayTrips) * 100) : 0

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        console.log("[v0] Loading driver dashboard data from API")

        // Fetch today's ambulance trips
        const tripsData = await apiClient.getAmbulanceLogs()
        const todayTrips = tripsData.filter(
          (trip: any) => new Date(trip.created_at).toDateString() === new Date().toDateString(),
        )
        setTrips(todayTrips)

        // Fetch ambulance/vehicle information
        const ambulancesData = await apiClient.getAmbulances()
        if (ambulancesData.length > 0) {
          setVehicle({
            license_plate: ambulancesData[0].license_plate,
            fuel_level: ambulancesData[0].fuel_level || 85,
            availability: ambulancesData[0].status === "Available",
          })
        }

        // Fetch incidents (could be from a general incidents endpoint)
        try {
          const incidentsData = await apiClient.get("/incidents?date=today")
          setIncidents(incidentsData)
        } catch (error) {
          // If incidents endpoint doesn't exist, set empty array
          setIncidents([])
        }

        // Generate shift report from trip data
        const totalDistance = todayTrips.reduce((sum: number, trip: any) => sum + (trip.distance || 0), 0)
        setShiftReport({
          total_distance: totalDistance,
          fuel_consumed: Math.round(totalDistance * 0.12), // Estimate fuel consumption
          incidents_count: incidents.filter((i) => !i.resolved).length,
        })
      } catch (error) {
        console.error("[v0] Error fetching driver data:", error)
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
  }, [toast, incidents.length])

  const triggerSOS = () => {
    alert("SOS Alert sent to dispatch center!")
  }

  const getPriorityBadge = (priority: Trip["priority"]) => {
    const colors = {
      Low: "bg-green-100 text-green-800",
      Medium: "bg-yellow-100 text-yellow-800",
      High: "bg-orange-100 text-orange-800",
      Critical: "bg-red-100 text-red-800",
    }
    return <Badge className={colors[priority]}>{priority}</Badge>
  }

  const getStatusBadge = (status: Trip["status"]) => {
    const colors = {
      Scheduled: "bg-blue-100 text-blue-800",
      "Moving to Pickup": "bg-yellow-100 text-yellow-800",
      "Picked Up": "bg-orange-100 text-orange-800",
      Completed: "bg-green-100 text-green-800",
      Cancelled: "bg-red-100 text-red-800",
    }
    return <Badge className={colors[status]}>{status}</Badge>
  }

  const getNextStatus = (currentStatus: Trip["status"]) => {
    const statusFlow = {
      Scheduled: "Moving to Pickup",
      "Moving to Pickup": "Picked Up",
      "Picked Up": "Completed",
    }
    return statusFlow[currentStatus as keyof typeof statusFlow]
  }

  const updateTripStatus = async (tripId: string, newStatus: Trip["status"]) => {
    try {
      console.log("[v0] Updating trip status:", tripId, newStatus)

      await apiClient.put(`/ambulance-logs/${tripId}`, {
        status: newStatus,
        updated_at: new Date().toISOString(),
      })

      setTrips((prev) => prev.map((trip) => (trip.id === tripId ? { ...trip, status: newStatus } : trip)))

      toast({
        title: "Thành công",
        description: "Đã cập nhật trạng thái chuyến đi",
      })
    } catch (error) {
      console.error("[v0] Error updating trip status:", error)
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái chuyến đi",
        variant: "destructive",
      })
    }
  }

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
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Truck className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Tài xế</h2>
              <p className="text-sm text-gray-500">Cứu thương</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <Button
            variant={activeTab === "overview" ? "default" : "ghost"}
            className={`w-full justify-start ${
              activeTab === "overview"
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "hover:bg-emerald-50 hover:text-emerald-700"
            }`}
            onClick={() => setActiveTab("overview")}
          >
            <Calendar className="h-4 w-4 mr-3" />
            Tổng quan
          </Button>

          <Button
            variant={activeTab === "trips" ? "default" : "ghost"}
            className={`w-full justify-start ${
              activeTab === "trips"
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "hover:bg-emerald-50 hover:text-emerald-700"
            }`}
            onClick={() => setActiveTab("trips")}
          >
            <Truck className="h-4 w-4 mr-3" />
            Chuyến đi
          </Button>

          <Button
            variant={activeTab === "ambulances" ? "default" : "ghost"}
            className={`w-full justify-start ${
              activeTab === "ambulances"
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "hover:bg-emerald-50 hover:text-emerald-700"
            }`}
            onClick={() => setActiveTab("ambulances")}
          >
            <Ambulance className="h-4 w-4 mr-3" />
            Xe cứu thương
          </Button>

          <Button
            variant={activeTab === "staff" ? "default" : "ghost"}
            className={`w-full justify-start ${
              activeTab === "staff"
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "hover:bg-emerald-50 hover:text-emerald-700"
            }`}
            onClick={() => setActiveTab("staff")}
          >
            <UserCheck className="h-4 w-4 mr-3" />
            Nhân viên
            <Badge className="ml-auto bg-blue-100 text-blue-800 text-xs">Chỉ đọc</Badge>
          </Button>

          <Button
            variant={activeTab === "incidents" ? "default" : "ghost"}
            className={`w-full justify-start ${
              activeTab === "incidents"
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "hover:bg-emerald-50 hover:text-emerald-700"
            }`}
            onClick={() => setActiveTab("incidents")}
          >
            <AlertTriangle className="h-4 w-4 mr-3" />
            Sự cố
          </Button>

          <Button
            variant={activeTab === "schedule" ? "default" : "ghost"}
            className={`w-full justify-start ${
              activeTab === "schedule"
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "hover:bg-emerald-50 hover:text-emerald-700"
            }`}
            onClick={() => setActiveTab("schedule")}
          >
            <Clock className="h-4 w-4 mr-3" />
            Lịch trình
          </Button>

          <Button
            variant={activeTab === "reports" ? "default" : "ghost"}
            className={`w-full justify-start ${
              activeTab === "reports"
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "hover:bg-emerald-50 hover:text-emerald-700"
            }`}
            onClick={() => setActiveTab("reports")}
          >
            <FileText className="h-4 w-4 mr-3" />
            Báo cáo
          </Button>

          <Button
            variant={activeTab === "handover" ? "default" : "ghost"}
            className={`w-full justify-start ${
              activeTab === "handover"
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "hover:bg-emerald-50 hover:text-emerald-700"
            }`}
            onClick={() => setActiveTab("handover")}
          >
            <RotateCcw className="h-4 w-4 mr-3" />
            Bàn giao ca
          </Button>
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <div className="flex items-center space-x-3 p-2">
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Tài xế</p>
              <p className="text-xs text-gray-500 truncate">driver@hospital.com</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
            <LogOut className="h-4 w-4 mr-3" />
            Đăng xuất
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {activeTab === "overview" && (
          <div className="space-y-6 p-6">
            {/* Header with SOS Button */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Bảng điều khiển Tài xế Cứu thương</h1>
                <p className="text-muted-foreground">Quản lý chuyến đi và xe cứu thương chuyên nghiệp</p>
              </div>

              <div className="flex items-center gap-4">
                <Button onClick={triggerSOS} className="bg-red-600 hover:bg-red-700 text-white" size="lg">
                  <Siren className="h-5 w-5 mr-2" />
                  SOS Khẩn cấp
                </Button>

                {/* Vehicle Status */}
                {vehicle && (
                  <Card className="w-fit">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Truck className="h-5 w-5 text-emerald-600" />
                        <div>
                          <p className="font-medium">{vehicle.license_plate}</p>
                          <p className="text-sm text-muted-foreground">Nhiên liệu: {vehicle.fuel_level}%</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">Sẵn sàng</span>
                          <Switch
                            checked={vehicle.availability}
                            onCheckedChange={() => {
                              if (vehicle) {
                                setVehicle((prev) => (prev ? { ...prev, availability: !prev.availability } : null))
                              }
                            }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Chuyến hôm nay</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-600">{todayTrips}</div>
                  <p className="text-xs text-muted-foreground">{activeTrips} đang thực hiện</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tỷ lệ hoàn thành</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-600">{completionRate}%</div>
                  <p className="text-xs text-muted-foreground">
                    {completedTrips}/{todayTrips} chuyến
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Quãng đường</CardTitle>
                  <Route className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-600">{shiftReport?.total_distance || 0} km</div>
                  <p className="text-xs text-muted-foreground">Tổng trong ca</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sự cố</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {incidents.filter((i) => !i.resolved).length}
                  </div>
                  <p className="text-xs text-muted-foreground">Chưa giải quyết</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "trips" && (
          <div className="space-y-6 p-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Chuyến của tôi
                </CardTitle>
              </CardHeader>
              <CardContent>
                {trips.length === 0 ? (
                  <div className="text-center py-8">
                    <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-muted-foreground">Không có chuyến đi nào hôm nay</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {trips.map((trip) => (
                      <div key={trip.id} className="border rounded-lg p-6 space-y-4">
                        {/* Trip Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{trip.pickup_time}</span>
                            {trip.patient_name && (
                              <span className="text-sm text-muted-foreground">- {trip.patient_name}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {getPriorityBadge(trip.priority)}
                            {getStatusBadge(trip.status)}
                          </div>
                        </div>

                        <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                          <h4 className="font-medium text-blue-900 flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Thông tin bệnh nhân & liên hệ
                          </h4>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium">Bệnh nhân:</span>
                                <span className="text-sm">{trip.patient_phone}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium">Bác sĩ:</span>
                                <span className="text-sm">{trip.doctor_phone}</span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-purple-600" />
                                <span className="text-sm font-medium">Người nhà:</span>
                                <span className="text-sm">{trip.family_phone}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <PhoneCall className="h-4 w-4 text-red-600" />
                                <span className="text-sm font-medium">Hotline:</span>
                                <span className="text-sm font-bold text-red-600">{trip.emergency_hotline}</span>
                              </div>
                            </div>
                          </div>

                          {/* Special Care Requirements */}
                          {(trip.requires_oxygen || trip.requires_ventilator || trip.mobility_assistance) && (
                            <div className="border-t pt-3">
                              <p className="text-sm font-medium text-orange-700 mb-2">Yêu cầu đặc biệt:</p>
                              <div className="flex flex-wrap gap-2">
                                {trip.requires_oxygen && <Badge className="bg-blue-100 text-blue-800">Cần oxy</Badge>}
                                {trip.requires_ventilator && <Badge className="bg-red-100 text-red-800">Thở máy</Badge>}
                                {trip.mobility_assistance && (
                                  <Badge className="bg-green-100 text-green-800">Hỗ trợ di chuyển</Badge>
                                )}
                              </div>
                            </div>
                          )}

                          {trip.special_notes && (
                            <div className="border-t pt-3">
                              <p className="text-sm font-medium text-gray-700">Ghi chú:</p>
                              <p className="text-sm text-gray-600 mt-1">{trip.special_notes}</p>
                            </div>
                          )}
                        </div>

                        {/* Location Information */}
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium">Điểm đón:</p>
                              <p className="text-sm text-muted-foreground">{trip.pickup_location}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium">Điểm đến:</p>
                              <p className="text-sm text-muted-foreground">{trip.dropoff_location}</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                            <Timer className="h-4 w-4" />
                            Thời gian thực hiện
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="font-medium">Lên lịch:</p>
                              <p className="text-muted-foreground">{trip.scheduled_time || "-"}</p>
                            </div>
                            <div>
                              <p className="font-medium">Bắt đầu:</p>
                              <p className="text-muted-foreground">{trip.moving_to_pickup_time || "-"}</p>
                            </div>
                            <div>
                              <p className="font-medium">Đón BN:</p>
                              <p className="text-muted-foreground">{trip.picked_up_time || "-"}</p>
                            </div>
                            <div>
                              <p className="font-medium">Hoàn thành:</p>
                              <p className="text-muted-foreground">{trip.completed_time || "-"}</p>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          {trip.status !== "Completed" && trip.status !== "Cancelled" && (
                            <>
                              {getNextStatus(trip.status) && (
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    updateTripStatus(trip.id, getNextStatus(trip.status) as Trip["status"])
                                  }
                                  className="bg-emerald-600 hover:bg-emerald-700"
                                >
                                  {getNextStatus(trip.status)}
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "ambulances" && (
          <div className="space-y-6 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Quản lý Xe cứu thương</h1>
                <p className="text-muted-foreground">Theo dõi và quản lý đội xe cứu thương</p>
              </div>
            </div>
            <AmbulanceManagement />
          </div>
        )}

        {activeTab === "staff" && (
          <div className="space-y-6 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Thông tin Nhân viên</h1>
                <p className="text-muted-foreground">Xem thông tin nhân viên (chỉ đọc)</p>
              </div>
              <Badge className="bg-blue-100 text-blue-800">Chỉ đọc</Badge>
            </div>
            <div className="staff-read-only">
              <StaffManagement />
            </div>
            <style jsx>{`
              .staff-read-only button:not(.lucide):not([role="tab"]):not([role="combobox"]):not([aria-haspopup="listbox"]),
              .staff-read-only input:not([type="search"]):not([role="combobox"]),
              .staff-read-only textarea,
              .staff-read-only select {
                pointer-events: none !important;
                opacity: 0.6 !important;
                cursor: not-allowed !important;
              }
              .staff-read-only .lucide-plus,
              .staff-read-only .lucide-edit,
              .staff-read-only .lucide-trash-2,
              .staff-read-only .lucide-save,
              .staff-read-only .lucide-x {
                display: none !important;
              }
              .staff-read-only button[type="submit"],
              .staff-read-only button:has(.lucide-plus),
              .staff-read-only button:has(.lucide-edit),
              .staff-read-only button:has(.lucide-trash-2),
              .staff-read-only button:has(.lucide-save),
              .staff-read-only button:has(.lucide-x) {
                display: none !important;
              }
            `}</style>
          </div>
        )}

        {activeTab === "incidents" && (
          <div className="space-y-6 p-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Sự cố và Báo cáo
                </CardTitle>
              </CardHeader>
              <CardContent>
                {incidents.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-muted-foreground">Không có sự cố nào được báo cáo</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {incidents.map((incident) => (
                      <div key={incident.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{incident.type}</h4>
                          <Badge
                            className={incident.resolved ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                          >
                            {incident.resolved ? "Đã giải quyết" : "Chưa giải quyết"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{incident.description}</p>
                        <p className="text-xs text-muted-foreground">{incident.timestamp}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "schedule" && (
          <div className="space-y-6 p-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Lịch trình hôm nay
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground">Lịch trình sẽ được cập nhật tự động</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "reports" && (
          <div className="space-y-6 p-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Báo cáo ca làm việc
                </CardTitle>
              </CardHeader>
              <CardContent>
                {shiftReport ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{shiftReport.total_distance} km</p>
                      <p className="text-sm text-muted-foreground">Tổng quãng đường</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{shiftReport.fuel_consumed}L</p>
                      <p className="text-sm text-muted-foreground">Nhiên liệu tiêu thụ</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <p className="text-2xl font-bold text-orange-600">{shiftReport.incidents_count}</p>
                      <p className="text-sm text-muted-foreground">Sự cố</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-muted-foreground">Chưa có báo cáo cho ca này</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "handover" && (
          <div className="space-y-6 p-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RotateCcw className="h-5 w-5" />
                  Bàn giao ca làm việc
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <RotateCcw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground">Chức năng bàn giao ca sẽ được triển khai</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
