'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bed, FileText, Eye, Stethoscope } from "lucide-react"

interface InpatientData {
  patient_id: number
  patient_code?: string
  first_name: string
  last_name: string
  date_of_birth?: string
  email?: string
  phone?: string
}

interface InpatientTabProps {
  inpatients: InpatientData[]
  handleViewProgressNotes: (patient: InpatientData) => void
  handleViewMedicalHistory: (patient: InpatientData) => void
  handleStartExamination: (patient: InpatientData) => void
}

export default function InpatientTab({
  inpatients,
  handleViewProgressNotes,
  handleViewMedicalHistory,
  handleStartExamination
}: InpatientTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bed className="h-5 w-5 text-green-600" />
          Bệnh nhân nội trú
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {inpatients && inpatients.length > 0 ? inpatients.map((patient: InpatientData) => (
            <div key={patient.patient_id} className="p-4 rounded-lg border hover:bg-green-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Bed className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold">{patient.first_name} {patient.last_name}</h4>
                    <p className="text-sm text-muted-foreground">Mã BN: {patient.patient_code}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="bg-blue-100 text-blue-800">Nội trú</Badge>
                      <Badge variant="outline">
                        {patient.date_of_birth 
                          ? `${new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()} tuổi`
                          : 'Chưa rõ tuổi'
                        }
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center text-sm">
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-xs">{patient.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="font-medium">Điện thoại</p>
                    <p>{patient.phone || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleViewProgressNotes(patient)}
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    Diễn biến
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleViewMedicalHistory(patient)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Xem hồ sơ
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleStartExamination(patient)}
                  >
                    <Stethoscope className="h-3 w-3 mr-1" />
                    Khám
                  </Button>
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center py-12 text-gray-500">
              <Bed className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-medium mb-2">Không có bệnh nhân nội trú</h3>
              <p>Hiện tại không có bệnh nhân nội trú nào.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
