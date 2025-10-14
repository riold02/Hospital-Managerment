'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Stethoscope, Eye } from "lucide-react"

interface Doctor {
  doctor_id: number
  first_name: string
  last_name: string
  specialty?: string
  department?: string
}

interface DoctorsTabProps {
  allDoctors: Doctor[]
}

export default function DoctorsTab({ allDoctors }: DoctorsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Stethoscope className="h-5 w-5 text-green-600" />
          Danh sách bác sĩ ({allDoctors.length})
        </CardTitle>
        <CardDescription>Danh sách các bác sĩ trong hệ thống</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Statistics Cards */}
          {allDoctors && allDoctors.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{allDoctors.length}</p>
                  <p className="text-sm text-gray-600">Tổng bác sĩ</p>
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {new Set(allDoctors.map(d => d.specialty)).size}
                  </p>
                  <p className="text-sm text-gray-600">Chuyên khoa</p>
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{allDoctors.length}</p>
                  <p className="text-sm text-gray-600">Đang hoạt động</p>
                </div>
              </Card>
            </div>
          )}

          {/* Doctor List */}
          {allDoctors && allDoctors.length > 0 ? allDoctors.map((doctor) => (
            <div key={doctor.doctor_id} className="p-4 rounded-lg border hover:bg-green-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Stethoscope className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">
                      Bác sĩ {doctor.first_name} {doctor.last_name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Chuyên khoa: {doctor.specialty}
                    </p>
                    {doctor.department && (
                      <p className="text-xs text-gray-500">
                        Khoa: {doctor.department}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Hoạt động
                  </Badge>
                  <Button size="sm" variant="outline">
                    <Eye className="h-3 w-3 mr-1" />
                    Xem hồ sơ
                  </Button>
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center py-12 text-gray-500">
              <Stethoscope className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-medium mb-2">Không có dữ liệu bác sĩ</h3>
              <p>Chưa có thông tin bác sĩ nào trong hệ thống.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
