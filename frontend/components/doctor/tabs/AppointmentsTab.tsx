'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Calendar as CalendarIcon, Eye } from "lucide-react"

interface AppointmentPatient {
  first_name?: string
  last_name?: string
}

interface Appointment {
  appointment_id: number
  appointment_date: string
  appointment_time: string
  status: string
  purpose?: string
  patient?: AppointmentPatient
}

interface AppointmentsTabProps {
  appointments: Appointment[]
  mounted: boolean
  currentDate: string | null
  currentDateFormatted: string
  formatAppointmentTime: (time: string) => string
  getStatusBadge: (status: string) => React.ReactNode
}

export default function AppointmentsTab({
  appointments,
  mounted,
  currentDate,
  currentDateFormatted,
  formatAppointmentTime,
  getStatusBadge
}: AppointmentsTabProps) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-blue-600" />
            Quản lý lịch hẹn
          </CardTitle>
          <CardDescription>
            Xem và quản lý lịch hẹn bệnh nhân{mounted && currentDateFormatted ? ` - ${currentDateFormatted}` : ''}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {appointments && appointments.length > 0 && mounted && currentDate ? appointments.filter((appointment: Appointment) => {
            const appointmentDate = appointment.appointment_date?.split('T')[0]
            // Chỉ hiển thị lịch hẹn đã xác nhận của hôm nay, loại bỏ đã hủy
            return appointmentDate === currentDate && 
                   (appointment.status === "Confirmed" || appointment.status === "Đã xác nhận") &&
                   appointment.status !== "Cancelled" && appointment.status !== "Đã hủy"
          }).map((appointment) => (
            <div key={appointment.appointment_id} className="p-4 rounded-lg border hover:bg-blue-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-center min-w-16">
                    <div className="text-lg font-bold text-blue-800">
                      {formatAppointmentTime(appointment.appointment_time)}
                    </div>
                    <div className="text-xs text-blue-600">
                      {new Date(appointment.appointment_date).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold">
                      {`${appointment.patient?.first_name || ''} ${appointment.patient?.last_name || ''}`.trim() || 'Không có tên'}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {appointment.purpose || 'Khám tổng quát'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(appointment.status)}
                  <Button size="sm" variant="outline">
                    <Eye className="h-3 w-3 mr-1" />
                    Xem
                  </Button>
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center py-12 text-gray-500">
              <CalendarIcon className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-medium mb-2">Không có lịch hẹn</h3>
              <p>Chưa có lịch hẹn nào được lên lịch.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
