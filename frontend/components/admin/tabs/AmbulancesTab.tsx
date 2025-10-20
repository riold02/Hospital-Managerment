"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Truck, Plus, MapPin, Clock, CheckCircle2, AlertCircle } from "lucide-react"

export function AmbulancesTab() {
  // Demo data - cần thay bằng API thật
  const ambulances = [
    { id: 'AMB-001', plateNumber: '30A-12345', status: 'available', driver: 'Nguyễn Văn A', location: 'Bệnh viện' },
    { id: 'AMB-002', plateNumber: '30A-23456', status: 'on_trip', driver: 'Trần Văn B', location: 'Quận 1' },
    { id: 'AMB-003', plateNumber: '30A-34567', status: 'maintenance', driver: 'Lê Văn C', location: 'Garage' },
    { id: 'AMB-004', plateNumber: '30A-45678', status: 'available', driver: 'Phạm Văn D', location: 'Bệnh viện' },
    { id: 'AMB-005', plateNumber: '30A-56789', status: 'on_trip', driver: 'Hoàng Văn E', location: 'Quận 3' },
  ]

  const trips = [
    { id: 1, ambulanceId: 'AMB-002', from: 'Quận 1 - Đường ABC', to: 'Bệnh viện', time: '09:30', status: 'in_progress' },
    { id: 2, ambulanceId: 'AMB-005', from: 'Quận 3 - Đường XYZ', to: 'Bệnh viện', time: '10:15', status: 'in_progress' },
    { id: 3, ambulanceId: 'AMB-001', from: 'Quận 2 - Đường DEF', to: 'Bệnh viện', time: '08:00', status: 'completed' },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return { label: 'Sẵn sàng', variant: 'default' as const, color: 'bg-green-100 text-green-800' }
      case 'on_trip':
        return { label: 'Đang đi', variant: 'secondary' as const, color: 'bg-blue-100 text-blue-800' }
      case 'maintenance':
        return { label: 'Bảo trì', variant: 'outline' as const, color: 'bg-orange-100 text-orange-800' }
      default:
        return { label: status, variant: 'outline' as const, color: 'bg-gray-100 text-gray-800' }
    }
  }

  const stats = {
    total: ambulances.length,
    available: ambulances.filter(a => a.status === 'available').length,
    onTrip: ambulances.filter(a => a.status === 'on_trip').length,
    maintenance: ambulances.filter(a => a.status === 'maintenance').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-yellow-600" />
              Quản lý xe cứu thương
            </CardTitle>
            <Button className="bg-yellow-600 hover:bg-yellow-700">
              <Plus className="h-4 w-4 mr-2" />
              Tạo chuyến đi
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-6">
            <Truck className="h-8 w-8 text-blue-600 mb-2" />
            <p className="text-3xl font-bold text-blue-800">{stats.total}</p>
            <p className="text-sm font-medium text-blue-600">Tổng xe</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-6">
            <CheckCircle2 className="h-8 w-8 text-green-600 mb-2" />
            <p className="text-3xl font-bold text-green-800">{stats.available}</p>
            <p className="text-sm font-medium text-green-600">Sẵn sàng</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-white">
          <CardContent className="p-6">
            <Clock className="h-8 w-8 text-yellow-600 mb-2" />
            <p className="text-3xl font-bold text-yellow-800">{stats.onTrip}</p>
            <p className="text-sm font-medium text-yellow-600">Đang đi</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="p-6">
            <AlertCircle className="h-8 w-8 text-orange-600 mb-2" />
            <p className="text-3xl font-bold text-orange-800">{stats.maintenance}</p>
            <p className="text-sm font-medium text-orange-600">Bảo trì</p>
          </CardContent>
        </Card>
      </div>

      {/* Ambulances Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách xe</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã xe</TableHead>
                <TableHead>Biển số</TableHead>
                <TableHead>Tài xế</TableHead>
                <TableHead>Vị trí</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ambulances.map((ambulance) => {
                const status = getStatusBadge(ambulance.status)
                
                return (
                  <TableRow key={ambulance.id}>
                    <TableCell className="font-medium">{ambulance.id}</TableCell>
                    <TableCell>{ambulance.plateNumber}</TableCell>
                    <TableCell>{ambulance.driver}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        {ambulance.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant} className={status.color}>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">
                        Chi tiết
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Active Trips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Chuyến đi đang hoạt động
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {trips.filter(t => t.status === 'in_progress').map((trip) => (
              <div key={trip.id} className="p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{trip.ambulanceId}</Badge>
                    <span className="text-sm text-gray-500">{trip.time}</span>
                  </div>
                  <Badge variant="default" className="bg-blue-100 text-blue-800">
                    Đang diễn ra
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{trip.from}</span>
                  <span className="text-gray-500">→</span>
                  <span className="font-medium">{trip.to}</span>
                </div>
              </div>
            ))}
            {trips.filter(t => t.status === 'in_progress').length === 0 && (
              <p className="text-center text-gray-500 py-8">Không có chuyến đi nào đang diễn ra</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notice */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <p className="font-medium text-orange-900">Chú ý</p>
              <p className="text-sm text-orange-700">
                Đây là dữ liệu demo. Cần tích hợp API backend và GPS tracking để quản lý xe cứu thương thực tế.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

