'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Eye } from "lucide-react"

interface Patient {
  patient_id: number
  patient_code?: string
  first_name: string
  last_name: string
  date_of_birth?: string
  phone?: string
  email?: string
}

interface PatientsTabProps {
  inpatients: Patient[]
  handleViewPatientDetail: (patient: Patient) => void
}

export default function PatientsTab({
  inpatients,
  handleViewPatientDetail
}: PatientsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          Quản lý bệnh nhân
        </CardTitle>
        <CardDescription>Xem và quản lý thông tin bệnh nhân</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {inpatients && inpatients.length > 0 ? inpatients.map((patient: Patient) => (
            <div key={patient.patient_id} className="p-4 rounded-lg border hover:bg-blue-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{patient.first_name} {patient.last_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {patient.date_of_birth ? 
                        `${new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()} tuổi` : 
                        'Chưa có thông tin tuổi'
                      } • Mã BN: {patient.patient_code}
                    </p>
                    <p className="text-xs text-gray-500">
                      Điện thoại: {patient.phone || 'Chưa có'} • Email: {patient.email || 'Chưa có'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Đang điều trị
                  </Badge>
                  <Button 
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleViewPatientDetail(patient)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Xem chi tiết
                  </Button>
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center py-12 text-gray-500">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-medium mb-2">Không có bệnh nhân</h3>
              <p>Chưa có bệnh nhân nào được phân công.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
