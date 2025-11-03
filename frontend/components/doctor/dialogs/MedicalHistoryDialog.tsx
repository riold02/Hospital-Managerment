'use client'

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Activity, Stethoscope, Printer, Calendar, User } from "lucide-react"
import { doctorApi } from "@/lib/api"

interface Patient {
  patient_id?: number
  patient_code?: string
  first_name: string
  last_name: string
  date_of_birth?: string
  [key: string]: any
}

interface MedicalRecord {
  record_id: number
  patient_id: number
  diagnosis: string
  treatment: string
  prescription?: string
  created_at: string
  doctor?: {
    first_name: string
    last_name: string
  }
}

interface MedicalHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient: Patient | null
  onViewProgressNotes: (patient: Patient) => void
  onStartExamination: (patient: Patient) => void
}

export default function MedicalHistoryDialog({
  open,
  onOpenChange,
  patient,
  onViewProgressNotes,
  onStartExamination,
}: MedicalHistoryDialogProps) {
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && patient?.patient_id) {
      loadMedicalRecords()
    }
  }, [open, patient?.patient_id])

  const loadMedicalRecords = async () => {
    if (!patient?.patient_id) return
    
    setLoading(true)
    try {
      const response = await doctorApi.getMedicalRecords({
        patient_id: patient.patient_id,
        limit: 50
      })
      setMedicalRecords(response.data || [])
    } catch (error) {
      console.error('Failed to load medical records:', error)
      setMedicalRecords([])
    } finally {
      setLoading(false)
    }
  }

  const parseSection = (text: string, sectionTitle: string) => {
    const regex = new RegExp(`\\[${sectionTitle}\\]\\n([\\s\\S]*?)(?=\\n\\n\\[|$)`)
    const match = text?.match(regex)
    return match ? match[1].trim() : ""
  }

  if (!patient) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-600" />
            Hồ sơ bệnh án
          </DialogTitle>
          <DialogDescription>
            Lịch sử khám chữa bệnh và điều trị
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Patient Header */}
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-lg">{patient.first_name} {patient.last_name}</h4>
                <p className="text-sm text-gray-600">
                  Mã BN: {patient.patient_code || 'N/A'} • 
                  {patient.date_of_birth && 
                    ` ${new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()} tuổi`}
                </p>
              </div>
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                <Printer className="h-4 w-4 mr-2" />
                In hồ sơ
              </Button>
            </div>
          </div>

          {/* Medical Records Content */}
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Đang tải lịch sử khám bệnh...</p>
              </div>
            ) : medicalRecords && medicalRecords.length > 0 ? (
              medicalRecords.map((record) => {
                const diagnosis = parseSection(record.diagnosis, "CHẨN ĐOÁN")
                const subjective = parseSection(record.diagnosis, "TRIỆU CHỨNG CHỦ QUAN")
                const objective = parseSection(record.diagnosis, "KHÁM LÂM SÀNG")
                const plan = parseSection(record.treatment, "KẾ HOẠCH ĐIỀU TRỊ")

                return (
                  <Card key={record.record_id} className="border-2 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-purple-600" />
                          <span className="font-semibold text-purple-900">
                            {new Date(record.created_at).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })}
                          </span>
                          <Badge variant="outline" className="ml-2">
                            ID: {record.record_id}
                          </Badge>
                        </div>
                        {record.doctor && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <User className="h-3 w-3" />
                            <span>BS. {record.doctor.first_name} {record.doctor.last_name}</span>
                          </div>
                        )}
                      </div>

                      {subjective && (
                        <div className="mb-2">
                          <p className="text-xs font-semibold text-gray-600 mb-1">Triệu chứng:</p>
                          <p className="text-sm text-gray-800 line-clamp-2">{subjective}</p>
                        </div>
                      )}

                      {diagnosis && (
                        <div className="mb-2">
                          <p className="text-xs font-semibold text-blue-600 mb-1">Chẩn đoán:</p>
                          <p className="text-sm text-gray-900 font-medium">{diagnosis}</p>
                        </div>
                      )}

                      {plan && (
                        <div className="mb-2">
                          <p className="text-xs font-semibold text-green-600 mb-1">Điều trị:</p>
                          <p className="text-sm text-gray-800 line-clamp-2">{plan}</p>
                        </div>
                      )}

                      {record.prescription && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs font-semibold text-orange-600 mb-1">Đơn thuốc:</p>
                          <p className="text-sm text-gray-800 line-clamp-3">{record.prescription}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <h4 className="font-medium mb-2">Chưa có lịch sử khám bệnh</h4>
                <p className="text-sm">Hệ thống sẽ lưu trữ toàn bộ lịch sử khám bệnh tại đây</p>
              </div>
            )}
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button 
            variant="outline"
            onClick={() => {
              onOpenChange(false)
              onViewProgressNotes(patient)
            }}
          >
            <Activity className="h-4 w-4 mr-2" />
            Xem diễn biến
          </Button>
          <Button 
            className="bg-green-600 hover:bg-green-700"
            onClick={() => {
              onOpenChange(false)
              onStartExamination(patient)
            }}
          >
            <Stethoscope className="h-4 w-4 mr-2" />
            Khám bệnh
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
