"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Printer, User, Calendar, FileText } from "lucide-react"
import PrintMedicalRecord from "@/components/doctor/PrintMedicalRecord"

interface PatientProfile {
  patient_id: number
  patient_code: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  address: string | null
  date_of_birth: string
  gender: string
  blood_type?: string
  allergies?: string
  medical_history?: string | null
  created_at: string
  updated_at: string
}

interface MedicalRecord {
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

interface MedicalRecordDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  record: MedicalRecord | null
  patientProfile?: PatientProfile | null
  onPrint?: (record: MedicalRecord) => void
}

const parseSOAPSection = (text: string, sectionTitle: string): string => {
  if (!text) return ""
  const regex = new RegExp(`\\[${sectionTitle}\\]\\n([\\s\\S]*?)(?=\\n\\n\\[|$)`)
  const match = text.match(regex)
  return match ? match[1].trim() : ""
}

export default function MedicalRecordDetailDialog({
  open,
  onOpenChange,
  record,
  patientProfile,
  onPrint,
}: MedicalRecordDetailDialogProps) {
  const [isPrintOpen, setIsPrintOpen] = useState(false)
  
  if (!record) return null

  const doctorName = record.doctor_name || record.doctor
  const displayDate = record.date || 
    (record.created_at ? new Date(record.created_at).toLocaleDateString('vi-VN') : 'N/A')

  // Parse SOAP sections
  const subjective = parseSOAPSection(record.diagnosis, "TRIỆU CHỨNG CHỦ QUAN")
  const objective = parseSOAPSection(record.diagnosis, "KHÁM LÂM SÀNG")
  const assessment = parseSOAPSection(record.diagnosis, "CHẨN ĐOÁN")
  const plan = parseSOAPSection(record.treatment, "KẾ HOẠCH ĐIỀU TRỊ")
  const orders = parseSOAPSection(record.treatment, "CHỈ ĐỊNH CẬN LÂM SÀNG")

  // Use parsed data or fallback to original
  const displayDiagnosis = assessment || record.diagnosis
  const displayTreatment = plan || record.treatment

  // Parse prescription for print component
  const prescriptions = record.prescription
    ? record.prescription.split('\n').filter(line => line.trim()).map((line, index) => {
        const cleanLine = line.replace(/^\d+\.\s*/, '').trim()
        return {
          id: `${index + 1}`,
          medicine_name: cleanLine,
          medication: cleanLine,
          quantity: '1',
          dosage: '',
          frequency: '',
          duration: '',
          instructions: ''
        }
      })
    : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              Chi tiết hồ sơ khám bệnh
            </DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPrintOpen(true)}
            >
              <Printer className="h-4 w-4 mr-2" />
              In hồ sơ
            </Button>
          </div>
          <DialogDescription>
            Thông tin chi tiết về hồ sơ bệnh án
          </DialogDescription>
        </DialogHeader>

        {/* Visible content in dialog */}

        <div className="space-y-4">
          {/* Header Info */}
          <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-green-600" />
                <div>
                  <Label className="text-xs text-gray-600">Bác sĩ khám:</Label>
                  <p className="font-semibold">BS. {doctorName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <div>
                  <Label className="text-xs text-gray-600">Ngày khám:</Label>
                  <p className="font-semibold">{displayDate}</p>
                </div>
              </div>
            </div>
            {record.status && (
              <div className="mt-3">
                <Badge variant="outline" className="bg-white">
                  {record.status}
                </Badge>
              </div>
            )}
          </div>

          {/* SOAP Notes */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg border-b pb-2">Thông tin khám bệnh (SOAP)</h3>

            {subjective && (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <Label className="font-semibold text-yellow-800 flex items-center gap-2 mb-2">
                  📋 Triệu chứng chủ quan (Subjective)
                </Label>
                <p className="text-gray-700 whitespace-pre-wrap">{subjective}</p>
              </div>
            )}

            {objective && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <Label className="font-semibold text-blue-800 flex items-center gap-2 mb-2">
                  🩺 Khám lâm sàng (Objective)
                </Label>
                <p className="text-gray-700 whitespace-pre-wrap">{objective}</p>
              </div>
            )}

            {displayDiagnosis && (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <Label className="font-semibold text-red-800 flex items-center gap-2 mb-2">
                  🔍 Chẩn đoán (Assessment)
                </Label>
                <p className="text-gray-700 whitespace-pre-wrap">{displayDiagnosis}</p>
              </div>
            )}

            {displayTreatment && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <Label className="font-semibold text-green-800 flex items-center gap-2 mb-2">
                  💊 Kế hoạch điều trị (Plan)
                </Label>
                <p className="text-gray-700 whitespace-pre-wrap">{displayTreatment}</p>
              </div>
            )}

            {orders && (
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <Label className="font-semibold text-purple-800 flex items-center gap-2 mb-2">
                  🔬 Chỉ định cận lâm sàng
                </Label>
                <p className="text-gray-700 whitespace-pre-wrap">{orders}</p>
              </div>
            )}
          </div>

          {/* Prescription */}
          {record.prescription && (
            <div className="space-y-2">
              <h3 className="font-semibold text-lg border-b pb-2">Đơn thuốc</h3>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                <div className="space-y-2">
                  {record.prescription.split('\n').filter(line => line.trim()).map((line, index) => {
                    // Remove numbering
                    const cleanLine = line.replace(/^\d+\.\s*/, '').trim()
                    return (
                      <div key={index} className="flex items-start gap-2 p-2 bg-white rounded border border-purple-100">
                        <div className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1 text-sm text-gray-700">
                          {cleanLine}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {record.notes && (
            <div>
              <Label className="font-semibold">Ghi chú thêm:</Label>
              <p className="text-gray-600 mt-1 p-3 bg-gray-50 rounded-lg">{record.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>

      {/* Print Component */}
      {patientProfile && (
        <PrintMedicalRecord
          open={isPrintOpen}
          onOpenChange={setIsPrintOpen}
          patientData={{
            patient_name: `${patientProfile.first_name} ${patientProfile.last_name}`,
            patient_info: {
              patient_id: patientProfile.patient_id,
              patient_code: patientProfile.patient_code,
              first_name: patientProfile.first_name,
              last_name: patientProfile.last_name,
              date_of_birth: patientProfile.date_of_birth,
              gender: patientProfile.gender,
              phone: patientProfile.phone || '',
              address: patientProfile.address || '',
              blood_type: patientProfile.blood_type,
              allergies: patientProfile.allergies
            },
            patient_id: patientProfile.patient_id,
            appointment_date: displayDate
          }}
          clinicalNotes={{
            subjective: subjective || '',
            objective: objective || '',
            assessment: assessment || displayDiagnosis || '',
            plan: plan || displayTreatment || ''
          }}
          orders={orders ? orders.split('\n').filter(line => line.trim()).map((line, index) => ({
            id: `${index + 1}`,
            type: 'Xét nghiệm',
            test: line.trim(),
            priority: 'Bình thường'
          })) : []}
          prescriptions={prescriptions}
          doctorInfo={{
            name: doctorName,
            title: 'Bác sĩ',
            department: 'Khám bệnh'
          }}
        />
      )}
    </Dialog>
  )
}
