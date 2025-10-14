'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserCog, Eye } from "lucide-react"

interface Department {
  department_name: string
}

interface Staff {
  staff_id: number
  first_name: string
  last_name: string
  position?: string
  department?: Department
  contact_number?: string
  is_active?: boolean
}

interface StaffStats {
  total?: number
  byRole?: Record<string, number>
}

interface StaffTabProps {
  staffList: Staff[]
  staffStats?: StaffStats
}

export default function StaffTab({ staffList, staffStats }: StaffTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCog className="h-5 w-5 text-purple-600" />
          Danh sách nhân viên y tế ({staffList?.length || 0})
        </CardTitle>
        <CardDescription>Danh sách nhân viên y tế trong hệ thống</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Statistics Cards */}
          {staffStats && (
            <div className="grid grid-cols-4 gap-4 mb-6">
              {Object.entries(staffStats.byRole || {}).map(([role, count]) => (
                <Card key={role} className="p-4">
                  <div className="text-center">
                    <UserCog className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <p className="text-lg font-bold text-purple-600">{count as number}</p>
                    <p className="text-sm text-gray-600">{role}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Staff List */}
          {staffList && staffList.length > 0 ? staffList.map((staff) => (
            <div key={staff.staff_id} className="p-4 rounded-lg border hover:bg-purple-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <UserCog className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">
                      {staff.first_name} {staff.last_name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Vị trí: {staff.position || 'Chưa xác định'}
                    </p>
                    {staff.department && (
                      <p className="text-xs text-gray-500">
                        Khoa: {staff.department.department_name}
                      </p>
                    )}
                    {staff.contact_number && (
                      <p className="text-xs text-gray-500">
                        SĐT: {staff.contact_number}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={staff.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                    {staff.is_active ? 'Hoạt động' : 'Không hoạt động'}
                  </Badge>
                  <Button size="sm" variant="outline">
                    <Eye className="h-3 w-3 mr-1" />
                    Xem chi tiết
                  </Button>
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center py-12 text-gray-500">
              <UserCog className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-medium mb-2">Không có dữ liệu nhân viên</h3>
              <p>Chưa có thông tin nhân viên nào trong hệ thống.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
