"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { nurseApi, PatientAssignment } from "@/lib/api"
import { 
  Users, 
  Eye, 
  Bed, 
  Calendar, 
  AlertCircle, 
  Clock,
  Phone,
  Mail,
  User,
  Activity
} from "lucide-react"

interface AssignmentsTabProps {
  assignments: PatientAssignment[]
  onRefresh: () => void
}

export default function AssignmentsTab({ assignments, onRefresh }: AssignmentsTabProps) {
  const [selectedAssignment, setSelectedAssignment] = useState<PatientAssignment | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Filter assignments
  const filteredAssignments = assignments.filter(assignment => {
    // Priority filter
    if (priorityFilter !== 'all' && assignment.priority !== priorityFilter) {
      return false
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const patientName = `${assignment.patient?.first_name} ${assignment.patient?.last_name}`.toLowerCase()
      const roomNumber = assignment.room_number?.toString().toLowerCase() || ''
      const bedNumber = assignment.bed_number?.toString().toLowerCase() || ''
      
      if (!patientName.includes(query) && 
          !roomNumber.includes(query) && 
          !bedNumber.includes(query)) {
        return false
      }
    }

    return true
  })

  const handleViewDetails = (assignment: PatientAssignment) => {
    setSelectedAssignment(assignment)
    setShowDetailDialog(true)
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return <Badge variant="destructive">Ưu tiên cao</Badge>
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Ưu tiên trung bình</Badge>
      case 'low':
        return <Badge variant="secondary">Ưu tiên thấp</Badge>
      default:
        return <Badge variant="secondary">Thường</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Đang điều trị</Badge>
      case 'discharged':
        return <Badge variant="secondary">Đã xuất viện</Badge>
      case 'transferred':
        return <Badge className="bg-blue-100 text-blue-800">Đã chuyển viện</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-3xl font-bold text-blue-600">{assignments.length}</p>
              <p className="text-sm text-gray-600">Tổng phân công</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-3xl font-bold text-red-600">
                {assignments.filter(a => a.priority === 'high').length}
              </p>
              <p className="text-sm text-gray-600">Ưu tiên cao</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-3xl font-bold text-green-600">
                {assignments.filter(a => a.status === 'active').length}
              </p>
              <p className="text-sm text-gray-600">Đang điều trị</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-3xl font-bold text-purple-600">
                {new Set(assignments.map(a => a.room_number)).size}
              </p>
              <p className="text-sm text-gray-600">Số phòng</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label className="text-xs mb-1">Tìm kiếm bệnh nhân</Label>
              <Input
                placeholder="Tên bệnh nhân, số phòng, số giường..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full md:w-[200px]">
              <Label className="text-xs mb-1">Mức độ ưu tiên</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="high">Ưu tiên cao</SelectItem>
                  <SelectItem value="medium">Ưu tiên trung bình</SelectItem>
                  <SelectItem value="low">Ưu tiên thấp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <div className="text-sm text-muted-foreground">
                Hiển thị <span className="font-semibold text-primary">{filteredAssignments.length}</span> / {assignments.length}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assignments List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Danh sách bệnh nhân được phân công
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAssignments && filteredAssignments.length > 0 ? (
            <div className="space-y-4">
              {filteredAssignments.map((assignment) => (
                <div 
                  key={assignment.assignment_id} 
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {/* Room/Bed Info */}
                    <div className="text-center bg-blue-100 p-3 rounded-lg min-w-[80px]">
                      <p className="font-bold text-blue-800 text-lg">{assignment.room_number}</p>
                      <p className="text-sm text-blue-600">Giường {assignment.bed_number}</p>
                    </div>

                    {/* Patient Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-lg">
                          {assignment.patient?.first_name} {assignment.patient?.last_name}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          ID: {assignment.patient_id}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Nhập viện: {new Date(assignment.admission_date).toLocaleDateString('vi-VN')}</span>
                        </div>
                        {assignment.discharge_date && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>Xuất viện: {new Date(assignment.discharge_date).toLocaleDateString('vi-VN')}</span>
                          </div>
                        )}
                        {assignment.patient?.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{assignment.patient.phone}</span>
                          </div>
                        )}
                        {assignment.patient?.date_of_birth && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>
                              {new Date().getFullYear() - new Date(assignment.patient.date_of_birth).getFullYear()} tuổi
                            </span>
                          </div>
                        )}
                      </div>

                      {assignment.notes && (
                        <div className="mt-2 p-2 bg-yellow-50 rounded text-sm text-gray-700 flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <span>{assignment.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Priority & Actions */}
                  <div className="flex flex-col items-end gap-2 ml-4">
                    {getPriorityBadge(assignment.priority)}
                    {assignment.status && getStatusBadge(assignment.status)}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleViewDetails(assignment)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Chi tiết
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-1">
                Không có phân công bệnh nhân
              </p>
              <p className="text-sm">
                {searchQuery || priorityFilter !== 'all' 
                  ? 'Không tìm thấy bệnh nhân phù hợp với bộ lọc'
                  : 'Chưa có bệnh nhân nào được phân công cho bạn'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Thông tin chi tiết bệnh nhân
            </DialogTitle>
          </DialogHeader>

          {selectedAssignment && (
            <div className="space-y-4">
              {/* Patient Info Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Thông tin bệnh nhân</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-gray-500">Họ tên</Label>
                      <p className="font-semibold">
                        {selectedAssignment.patient?.first_name} {selectedAssignment.patient?.last_name}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Mã bệnh nhân</Label>
                      <p className="font-semibold">#{selectedAssignment.patient_id}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Ngày sinh</Label>
                      <p className="font-semibold">
                        {selectedAssignment.patient?.date_of_birth 
                          ? new Date(selectedAssignment.patient.date_of_birth).toLocaleDateString('vi-VN')
                          : 'Chưa có'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Giới tính</Label>
                      <p className="font-semibold">
                        {selectedAssignment.patient?.gender === 'Male' ? 'Nam' : 
                         selectedAssignment.patient?.gender === 'Female' ? 'Nữ' : 
                         selectedAssignment.patient?.gender || 'Chưa có'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Điện thoại</Label>
                      <p className="font-semibold">{selectedAssignment.patient?.phone || 'Chưa có'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Email</Label>
                      <p className="font-semibold">{selectedAssignment.patient?.email || 'Chưa có'}</p>
                    </div>
                  </div>
                  {selectedAssignment.patient?.address && (
                    <div>
                      <Label className="text-xs text-gray-500">Địa chỉ</Label>
                      <p className="font-semibold">{selectedAssignment.patient.address}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Assignment Info Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Thông tin phân công</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-gray-500">Phòng - Giường</Label>
                      <p className="font-semibold">
                        Phòng {selectedAssignment.room_number} - Giường {selectedAssignment.bed_number}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Mức độ ưu tiên</Label>
                      <div>{getPriorityBadge(selectedAssignment.priority)}</div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Ngày nhập viện</Label>
                      <p className="font-semibold">
                        {new Date(selectedAssignment.admission_date).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    {selectedAssignment.discharge_date && (
                      <div>
                        <Label className="text-xs text-gray-500">Ngày xuất viện</Label>
                        <p className="font-semibold">
                          {new Date(selectedAssignment.discharge_date).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    )}
                    {selectedAssignment.status && (
                      <div>
                        <Label className="text-xs text-gray-500">Trạng thái</Label>
                        <div>{getStatusBadge(selectedAssignment.status)}</div>
                      </div>
                    )}
                  </div>
                  {selectedAssignment.notes && (
                    <div className="pt-2">
                      <Label className="text-xs text-gray-500">Ghi chú phân công</Label>
                      <div className="mt-1 p-3 bg-yellow-50 rounded-lg text-sm">
                        {selectedAssignment.notes}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
