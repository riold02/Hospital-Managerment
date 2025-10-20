"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sparkles, Plus, CheckCircle, Clock, AlertCircle } from "lucide-react"

export function CleaningTab() {
  // Demo data - cần thay bằng API thật
  const cleaningTasks = [
    { id: 1, room: 'Phòng 101', area: 'Khoa Nội', status: 'completed', assignedTo: 'Nguyễn Văn A', time: '08:00' },
    { id: 2, room: 'Phòng 102', area: 'Khoa Nội', status: 'in_progress', assignedTo: 'Trần Thị B', time: '09:00' },
    { id: 3, room: 'Phòng 201', area: 'Khoa Ngoại', status: 'pending', assignedTo: 'Lê Văn C', time: '10:00' },
    { id: 4, room: 'Phòng 202', area: 'Khoa Ngoại', status: 'completed', assignedTo: 'Phạm Thị D', time: '08:30' },
    { id: 5, room: 'Phòng 301', area: 'Khoa Nhi', status: 'pending', assignedTo: 'Hoàng Văn E', time: '11:00' },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return { label: 'Hoàn thành', variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' }
      case 'in_progress':
        return { label: 'Đang thực hiện', variant: 'secondary' as const, icon: Clock, color: 'text-blue-600' }
      case 'pending':
        return { label: 'Chờ xử lý', variant: 'outline' as const, icon: AlertCircle, color: 'text-orange-600' }
      default:
        return { label: status, variant: 'outline' as const, icon: Clock, color: 'text-gray-600' }
    }
  }

  const stats = {
    completed: cleaningTasks.filter(t => t.status === 'completed').length,
    inProgress: cleaningTasks.filter(t => t.status === 'in_progress').length,
    pending: cleaningTasks.filter(t => t.status === 'pending').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-cyan-600" />
              Quản lý vệ sinh
            </CardTitle>
            <Button className="bg-cyan-600 hover:bg-cyan-700">
              <Plus className="h-4 w-4 mr-2" />
              Tạo công việc mới
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-6">
            <CheckCircle className="h-8 w-8 text-green-600 mb-2" />
            <p className="text-3xl font-bold text-green-800">{stats.completed}</p>
            <p className="text-sm font-medium text-green-600">Đã hoàn thành</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-6">
            <Clock className="h-8 w-8 text-blue-600 mb-2" />
            <p className="text-3xl font-bold text-blue-800">{stats.inProgress}</p>
            <p className="text-sm font-medium text-blue-600">Đang thực hiện</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="p-6">
            <AlertCircle className="h-8 w-8 text-orange-600 mb-2" />
            <p className="text-3xl font-bold text-orange-800">{stats.pending}</p>
            <p className="text-sm font-medium text-orange-600">Chờ xử lý</p>
          </CardContent>
        </Card>
      </div>

      {/* Tasks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Công việc hôm nay</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Phòng</TableHead>
                <TableHead>Khu vực</TableHead>
                <TableHead>Người thực hiện</TableHead>
                <TableHead>Giờ</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cleaningTasks.map((task) => {
                const status = getStatusBadge(task.status)
                const StatusIcon = status.icon
                
                return (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.room}</TableCell>
                    <TableCell>{task.area}</TableCell>
                    <TableCell>{task.assignedTo}</TableCell>
                    <TableCell>{task.time}</TableCell>
                    <TableCell>
                      <Badge variant={status.variant} className="flex items-center gap-1 w-fit">
                        <StatusIcon className={`h-3 w-3 ${status.color}`} />
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

      {/* Notice */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <p className="font-medium text-orange-900">Chú ý</p>
              <p className="text-sm text-orange-700">
                Đây là dữ liệu demo. Cần tích hợp API backend để quản lý công việc vệ sinh thực tế.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

