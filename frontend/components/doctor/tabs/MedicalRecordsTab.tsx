'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Eye } from "lucide-react"

interface MedicalRecordPatient {
  first_name?: string
  last_name?: string
}

interface MedicalRecord {
  record_id: number
  diagnosis?: string
  treatment?: string
  patient?: MedicalRecordPatient
}

interface MedicalRecordsTabProps {
  pendingResults: MedicalRecord[]
  handleViewMedicalRecordDetail: (record: MedicalRecord) => void
}

export default function MedicalRecordsTab({
  pendingResults,
  handleViewMedicalRecordDetail
}: MedicalRecordsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-green-600" />
          Hồ sơ y tế
        </CardTitle>
        <CardDescription>Xem và quản lý hồ sơ bệnh án</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pendingResults && pendingResults.length > 0 ? pendingResults.map((record) => (
            <div key={record.record_id} className="p-4 rounded-lg border hover:bg-green-50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">
                    {record.patient?.first_name && record.patient?.last_name 
                      ? `${record.patient.first_name} ${record.patient.last_name}`
                      : 'Bệnh nhân'}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {record.diagnosis || 'Chưa có chẩn đoán'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Điều trị: {record.treatment || 'Chưa có'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    Hồ sơ y tế
                  </Badge>
                  <Button 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleViewMedicalRecordDetail(record)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Xem chi tiết
                  </Button>
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center py-12 text-gray-500">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-medium mb-2">Không có hồ sơ y tế</h3>
              <p>Chưa có hồ sơ bệnh án nào.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
