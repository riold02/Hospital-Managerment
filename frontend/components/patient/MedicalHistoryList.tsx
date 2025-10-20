"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, FileText, Printer, Calendar, User } from "lucide-react"

export interface MedicalRecord {
  id: number
  record_id?: number
  date: string
  created_at?: string
  doctor: string
  doctor_name?: string
  diagnosis: string
  treatment: string
  notes?: string
  prescription?: string
  status?: string
}

interface MedicalHistoryListProps {
  records: MedicalRecord[]
  onViewDetail?: (record: MedicalRecord) => void
  onPrint?: (record: MedicalRecord) => void
  showActions?: boolean
}

const parseSOAPSection = (text: string, sectionTitle: string): string => {
  if (!text) return ""
  const regex = new RegExp(`\\[${sectionTitle}\\]\\n([\\s\\S]*?)(?=\\n\\n\\[|$)`)
  const match = text.match(regex)
  return match ? match[1].trim() : ""
}

export default function MedicalHistoryList({
  records,
  onViewDetail,
  onPrint,
  showActions = true,
}: MedicalHistoryListProps) {
  if (!records || records.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử khám bệnh</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Chưa có hồ sơ khám bệnh nào</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-green-600" />
          Lịch sử khám bệnh
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {records.map((record) => {
            const doctorName = record.doctor_name || record.doctor
            const displayDate = record.date || 
              (record.created_at ? new Date(record.created_at).toLocaleDateString('vi-VN') : 'N/A')

            // Parse SOAP sections if available
            const subjective = parseSOAPSection(record.diagnosis, "TRIỆU CHỨNG CHỦ QUAN")
            const objective = parseSOAPSection(record.diagnosis, "KHÁM LÂM SÀNG")
            const assessment = parseSOAPSection(record.diagnosis, "CHẨN ĐOÁN")
            const plan = parseSOAPSection(record.treatment, "KẾ HOẠCH ĐIỀU TRỊ")

            // Use parsed data or fallback to original
            const displayDiagnosis = assessment || record.diagnosis
            const displayTreatment = plan || record.treatment

            return (
              <Card
                key={record.id || record.record_id}
                className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-3 flex-1">
                      {/* Header */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2 text-green-700">
                          <User className="h-4 w-4" />
                          <h4 className="font-semibold text-lg">BS. {doctorName}</h4>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Calendar className="h-4 w-4" />
                          <span>{displayDate}</span>
                        </div>
                        {record.status && (
                          <Badge variant="outline" className="bg-blue-50">
                            {record.status}
                          </Badge>
                        )}
                      </div>

                      {/* Subjective */}
                      {subjective && (
                        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                          <span className="font-semibold text-yellow-800">📋 Triệu chứng: </span>
                          <span className="text-gray-700">
                            {subjective.length > 150 ? `${subjective.substring(0, 150)}...` : subjective}
                          </span>
                        </div>
                      )}

                      {/* Objective */}
                      {objective && (
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                          <span className="font-semibold text-blue-800">🩺 Khám lâm sàng: </span>
                          <span className="text-gray-700">
                            {objective.length > 150 ? `${objective.substring(0, 150)}...` : objective}
                          </span>
                        </div>
                      )}

                      {/* Diagnosis */}
                      {displayDiagnosis && (
                        <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                          <span className="font-semibold text-red-800">🔍 Chẩn đoán: </span>
                          <span className="text-gray-700">
                            {displayDiagnosis.length > 200 ? `${displayDiagnosis.substring(0, 200)}...` : displayDiagnosis}
                          </span>
                        </div>
                      )}

                      {/* Treatment */}
                      {displayTreatment && (
                        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                          <span className="font-semibold text-green-800">💊 Điều trị: </span>
                          <span className="text-gray-700">
                            {displayTreatment.length > 200 ? `${displayTreatment.substring(0, 200)}...` : displayTreatment}
                          </span>
                        </div>
                      )}

                      {/* Notes */}
                      {record.notes && (
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <span className="font-semibold text-gray-800">📝 Ghi chú: </span>
                          <span className="text-gray-600">{record.notes}</span>
                        </div>
                      )}

                      {/* Prescription summary */}
                      {record.prescription && (
                        <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                          <span className="font-semibold text-purple-800">💊 Đơn thuốc: </span>
                          <span className="text-gray-700">
                            {record.prescription.split('\n').length} loại thuốc
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {showActions && (
                      <div className="flex flex-col gap-2">
                        {onViewDetail && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewDetail(record)}
                            className="whitespace-nowrap"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Xem chi tiết
                          </Button>
                        )}
                        {onPrint && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPrint(record)}
                            className="whitespace-nowrap"
                          >
                            <Printer className="h-4 w-4 mr-1" />
                            In hồ sơ
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
