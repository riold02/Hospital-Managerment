import { formatAppointmentTime as formatTime } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
  Clock,
  Plus,
  TestTube,
  Pill,
  Calendar,
  Bell,
  Stethoscope,
  AlertTriangle,
} from "lucide-react"

interface PatientInfo {
  patient_id?: number
  first_name?: string
  last_name?: string
  date_of_birth?: string
  gender?: string
  phone?: string
  allergies?: string
  medical_history?: string
}

interface Appointment {
  appointment_id?: number
  id?: number
  appointment_time: string
  appointment_date?: string
  purpose?: string
  status: string
  patient?: PatientInfo
}

interface Message {
  id: number
  sender?: {
    full_name?: string
  }
  message: string
  priority: "high" | "medium" | "low"
  created_at: string
}

interface TimelineTabProps {
  appointments: Appointment[]
  allAppointments: Appointment[]
  messages: Message[]
  daysFilter: number
  statusFilter: string
  onDaysFilterChange: (days: number) => void
  onStatusFilterChange: (status: string) => void
  onStartVisit: (appointment: Appointment) => void
}

const TimelineTab = ({
  appointments,
  allAppointments,
  messages,
  daysFilter,
  statusFilter,
  onDaysFilterChange,
  onStatusFilterChange,
  onStartVisit,
}: TimelineTabProps) => {
  const formatAppointmentTime = (time: string) => {
    if (!time) return "N/A"
    return formatTime(time)
  }

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { label: string; className: string } } = {
      Scheduled: { label: "Chưa xác nhận", className: "bg-yellow-100 text-yellow-800" },
      "Chưa xác nhận": { label: "Chưa xác nhận", className: "bg-yellow-100 text-yellow-800" },
      Confirmed: { label: "Đã xác nhận", className: "bg-blue-100 text-blue-800" },
      "Đã xác nhận": { label: "Đã xác nhận", className: "bg-blue-100 text-blue-800" },
      "Đã đến": { label: "Đã đến", className: "bg-green-100 text-green-800" },
      Cancelled: { label: "Đã hủy", className: "bg-red-100 text-red-800" },
      "Đã hủy": { label: "Đã hủy", className: "bg-red-100 text-red-800" },
      Completed: { label: "Đã hoàn thành", className: "bg-gray-100 text-gray-800" },
      "Đã hoàn thành": { label: "Đã hoàn thành", className: "bg-gray-100 text-gray-800" },
    }

    const statusInfo = statusMap[status] || {
      label: status,
      className: "bg-gray-100 text-gray-800",
    }

    return <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Appointment Timeline */}
      <div className="lg:col-span-2">
        <Card className="shadow-sm">
          <CardHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-600" />
                  Lịch hẹn
                  <Badge variant="secondary" className="ml-2">
                    {appointments.length} lịch hẹn
                  </Badge>
                </CardTitle>
              </div>

              {/* Filter Controls */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label className="font-semibold">Thời gian:</Label>
                  <Select
                    value={daysFilter.toString()}
                    onValueChange={(value: string) => onDaysFilterChange(Number(value))}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Chọn khoảng thời gian" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-30">30 ngày trước</SelectItem>
                      <SelectItem value="-7">7 ngày trước</SelectItem>
                      <SelectItem value="7">7 ngày tới</SelectItem>
                      <SelectItem value="30">30 ngày tới</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Label className="font-semibold">Trạng thái:</Label>
                  <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="scheduled">Chưa xác nhận</SelectItem>
                      <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                      <SelectItem value="cancelled">Đã hủy</SelectItem>
                      <SelectItem value="completed">Đã hoàn thành</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="ml-auto text-sm text-muted-foreground">
                  Hiển thị <span className="font-semibold text-primary">{appointments.length}</span> /{" "}
                  <span className="font-semibold">{allAppointments.length}</span> lịch hẹn
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointments && appointments.length > 0 ? (
                appointments.map((appointment, index) => (
                  <div
                    key={appointment.appointment_id || appointment.id}
                    className="flex items-center gap-4 p-4 rounded-lg border hover:bg-green-50 transition-colors"
                  >
                    <div className="text-center min-w-16">
                      <div className="text-lg font-bold text-green-800">
                        {formatAppointmentTime(appointment.appointment_time)}
                      </div>
                      <div className="text-xs text-green-600">
                        {index === 0 ? "Tiếp theo" : `+${index * 45}m`}
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <img
                          src="/placeholder-user.jpg"
                          alt={`${appointment.patient?.first_name || ""} ${
                            appointment.patient?.last_name || ""
                          }`.trim() || "Bệnh nhân"}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <Button
                                variant="link"
                                className="p-0 h-auto font-semibold text-green-800"
                              >
                                {`${appointment.patient?.first_name || ""} ${
                                  appointment.patient?.last_name || ""
                                }`.trim() || "Không có tên"}
                              </Button>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80">
                              <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <img
                                    src="/placeholder-user.jpg"
                                    alt=""
                                    className="w-12 h-12 rounded-full"
                                  />
                                  <div>
                                    <h4 className="font-semibold">
                                      {`${appointment.patient?.first_name || ""} ${
                                        appointment.patient?.last_name || ""
                                      }`.trim() || "Không có tên"}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                      {appointment.patient?.date_of_birth
                                        ? `${
                                            new Date().getFullYear() -
                                            new Date(appointment.patient.date_of_birth).getFullYear()
                                          } tuổi`
                                        : "Chưa có thông tin tuổi"}{" "}
                                      • {appointment.patient?.gender || "Chưa xác định"}
                                    </p>
                                  </div>
                                </div>

                                {appointment.patient?.allergies && (
                                  <div>
                                    <p className="text-sm font-medium text-red-600 mb-1">Dị ứng:</p>
                                    <div className="flex flex-wrap gap-1">
                                      <Badge className="bg-red-100 text-red-800">
                                        {appointment.patient.allergies}
                                      </Badge>
                                    </div>
                                  </div>
                                )}

                                {appointment.patient?.medical_history && (
                                  <div>
                                    <p className="text-sm font-medium mb-1">Bệnh sử:</p>
                                    <div className="flex flex-wrap gap-1">
                                      <Badge variant="outline">
                                        {appointment.patient.medical_history}
                                      </Badge>
                                    </div>
                                  </div>
                                )}

                                <p className="text-xs text-muted-foreground">
                                  Số điện thoại: {appointment.patient?.phone || "Chưa có"}
                                </p>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                          <p className="text-sm text-muted-foreground">
                            {appointment.purpose || "Khám tổng quát"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {getStatusBadge(appointment.status)}
                      {(appointment.status === "Confirmed" ||
                        appointment.status === "Đã xác nhận" ||
                        appointment.status === "Đã đến") && (
                        <Button
                          size="sm"
                          onClick={() => onStartVisit(appointment)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Stethoscope className="h-3 w-3 mr-1" />
                          Khám
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Không có lịch hẹn nào khớp với bộ lọc</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Inbox */}
      <div className="space-y-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-green-800">Hành động nhanh</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Tạo hồ sơ mới
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <TestTube className="h-4 w-4 mr-2" />
              Chỉ định xét nghiệm
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <Pill className="h-4 w-4 mr-2" />
              Kê đơn thuốc
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <Calendar className="h-4 w-4 mr-2" />
              Hẹn tái khám
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Bell className="h-5 w-5" />
              Thông báo mới
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {messages && messages.length > 0 ? (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className="p-3 rounded-lg border-l-4 border-l-blue-500 bg-blue-50"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">
                        {message.sender?.full_name || "Hệ thống"}
                      </p>
                      <Badge
                        className={
                          message.priority === "high"
                            ? "bg-red-100 text-red-800"
                            : message.priority === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                        }
                      >
                        {message.priority === "high"
                          ? "Cao"
                          : message.priority === "medium"
                            ? "Trung bình"
                            : "Thấp"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{message.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(message.created_at).toLocaleString("vi-VN")}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Không có thông báo mới</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default TimelineTab
