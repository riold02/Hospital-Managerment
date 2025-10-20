"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, Search, Eye, Plus } from "lucide-react"
import { appointmentsApi } from "@/lib/api"
import { toast } from "@/hooks/use-toast"

export function AppointmentsTab() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  useEffect(() => {
    loadAppointments()
  }, [])

  const loadAppointments = async () => {
    setLoading(true)
    try {
      const response = await appointmentsApi.getAllAppointments({ limit: 100 })
      setAppointments(response.data || [])
    } catch (error) {
      console.error("Error loading appointments:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách lịch hẹn",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: any, label: string }> = {
      'Scheduled': { variant: 'default', label: 'Đã lên lịch' },
      'Confirmed': { variant: 'default', label: 'Đã xác nhận' },
      'Completed': { variant: 'secondary', label: 'Hoàn thành' },
      'Cancelled': { variant: 'destructive', label: 'Đã hủy' },
      'No-show': { variant: 'destructive', label: 'Không đến' },
    }
    return statusMap[status] || { variant: 'outline', label: status }
  }

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = 
      apt.patient?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.patient?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.doctor?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.doctor?.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || apt.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-600" />
            Quản lý lịch hẹn ({filteredAppointments.length})
          </CardTitle>
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Tạo lịch hẹn
          </Button>
        </div>
        <div className="flex items-center gap-4 mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm bệnh nhân, bác sĩ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Scheduled">Đã lên lịch</option>
            <option value="Confirmed">Đã xác nhận</option>
            <option value="Completed">Hoàn thành</option>
            <option value="Cancelled">Đã hủy</option>
          </select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Đang tải...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-medium mb-2">Không có lịch hẹn</h3>
            <p>Chưa có lịch hẹn nào trong hệ thống.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Bệnh nhân</TableHead>
                  <TableHead>Bác sĩ</TableHead>
                  <TableHead>Ngày hẹn</TableHead>
                  <TableHead>Giờ hẹn</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.map((apt) => {
                  const statusInfo = getStatusBadge(apt.status)
                  return (
                    <TableRow key={apt.appointment_id}>
                      <TableCell className="font-medium">#{apt.appointment_id}</TableCell>
                      <TableCell>
                        {apt.patient ? `${apt.patient.first_name} ${apt.patient.last_name}` : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {apt.doctor ? `${apt.doctor.first_name} ${apt.doctor.last_name}` : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {apt.appointment_date ? new Date(apt.appointment_date).toLocaleDateString('vi-VN') : 'N/A'}
                      </TableCell>
                      <TableCell>{apt.appointment_time || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          Xem
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

