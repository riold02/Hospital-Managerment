"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, Printer } from "lucide-react"

export interface Medication {
  name: string
  dosage: string
  duration: string
  frequency?: string
  instructions?: string
}

export interface Prescription {
  id: number
  prescription_id?: number
  doctor: string
  doctor_name?: string
  date: string
  medications: Medication[]
  status: string
  notes?: string
  created_at?: string
}

interface PrescriptionListProps {
  prescriptions: Prescription[]
  onDownload?: (prescription: Prescription) => void
  onPrint?: (prescription: Prescription) => void
  showActions?: boolean
}

const getStatusColor = (status: string): string => {
  const lowerStatus = status.toLowerCase()
  if (lowerStatus.includes("active") || lowerStatus.includes("đang dùng")) {
    return "bg-green-100 text-green-800 hover:bg-green-200"
  }
  if (lowerStatus.includes("completed") || lowerStatus.includes("hoàn thành")) {
    return "bg-blue-100 text-blue-800 hover:bg-blue-200"
  }
  if (lowerStatus.includes("cancelled") || lowerStatus.includes("đã hủy")) {
    return "bg-red-100 text-red-800 hover:bg-red-200"
  }
  return "bg-gray-100 text-gray-800 hover:bg-gray-200"
}

const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    active: "Đang dùng",
    completed: "Hoàn thành",
    cancelled: "Đã hủy",
    pending: "Chờ xử lý",
  }
  return statusMap[status.toLowerCase()] || status
}

export default function PrescriptionList({
  prescriptions,
  onDownload,
  onPrint,
  showActions = true,
}: PrescriptionListProps) {
  if (!prescriptions || prescriptions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Đơn thuốc của tôi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>Chưa có đơn thuốc nào</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Đơn thuốc của tôi</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {prescriptions.map((prescription) => {
            const doctorName = prescription.doctor_name || prescription.doctor
            const displayDate = prescription.date || 
              (prescription.created_at ? new Date(prescription.created_at).toLocaleDateString('vi-VN') : 'N/A')

            return (
              <Card key={prescription.id || prescription.prescription_id} className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-lg">BS. {doctorName}</h4>
                        <Badge className={getStatusColor(prescription.status)}>
                          {getStatusText(prescription.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Ngày kê đơn:</span> {displayDate}
                      </p>
                      {prescription.notes && (
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Ghi chú:</span> {prescription.notes}
                        </p>
                      )}
                    </div>
                    {showActions && (
                      <div className="flex gap-2">
                        {onPrint && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPrint(prescription)}
                            title="In đơn thuốc"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                        )}
                        {onDownload && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDownload(prescription)}
                            title="Tải xuống"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Medications List */}
                  <div className="space-y-2 mt-4">
                    <h5 className="font-medium text-sm text-gray-700 mb-2">Danh sách thuốc:</h5>
                    {prescription.medications && prescription.medications.length > 0 ? (
                      prescription.medications.map((med, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-lg border border-green-200"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900">{med.name}</div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-sm">
                                <div className="text-gray-700">
                                  <span className="font-medium">Liều dùng:</span> {med.dosage}
                                </div>
                                {med.frequency && (
                                  <div className="text-gray-700">
                                    <span className="font-medium">Tần suất:</span> {med.frequency}
                                  </div>
                                )}
                                <div className="text-gray-700">
                                  <span className="font-medium">Thời gian:</span> {med.duration}
                                </div>
                                {med.instructions && (
                                  <div className="text-gray-700 col-span-full">
                                    <span className="font-medium">Hướng dẫn:</span> {med.instructions}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500 italic">Không có thông tin thuốc</div>
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
