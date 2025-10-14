'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FileText, Stethoscope, Activity, Printer } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import PrintMedicalRecord from "@/components/doctor/PrintMedicalRecord"

interface MedicalRecord {
  record_id: number
  patient_id: number
  diagnosis?: string
  treatment?: string
  prescription?: string
  created_at: string
  patient?: {
    first_name: string
    last_name: string
    patient_code?: string
  }
  doctor?: {
    first_name: string
    last_name: string
  }
  [key: string]: any
}

interface MedicalRecordDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  record: MedicalRecord | null
}

export default function MedicalRecordDetailDialog({
  open,
  onOpenChange,
  record,
}: MedicalRecordDetailDialogProps) {
  const { toast } = useToast()
  const [showPrintDialog, setShowPrintDialog] = useState(false)

  if (!record) return null

  const parseSection = (text: string, sectionTitle: string) => {
    const regex = new RegExp(`\\[${sectionTitle}\\]\\n([\\s\\S]*?)(?=\\n\\n\\[|$)`)
    const match = text?.match(regex)
    return match ? match[1].trim() : ""
  }

  // Parse SOAP notes from diagnosis field
  const subjective = parseSection(record.diagnosis, "TRIỆU CHỨNG CHỦ QUAN")
  const objective = parseSection(record.diagnosis, "KHÁM LÂM SÀNG")
  const assessment = parseSection(record.diagnosis, "CHẨN ĐOÁN")
  const plan = parseSection(record.treatment, "KẾ HOẠCH ĐIỀU TRỊ")
  const orders = parseSection(record.treatment, "CHỈ ĐỊNH CẬN LÂM SÀNG")

  // Prepare clinical notes for print
  const clinicalNotes = {
    subjective: subjective || '',
    objective: objective || '',
    assessment: assessment || record.diagnosis || '',
    plan: plan || record.treatment || '',
  }

  // Parse prescriptions with smart extraction
  const prescriptions = record.prescription
    ? record.prescription.split('\n').filter(line => line.trim()).map((line, index) => {
        // Remove numbering at the start (1., 2., etc.)
        const cleanLine = line.replace(/^\d+\.\s*/, '').trim()
        
        // Try to parse various prescription formats
        // Format 1: "Medicine 500mg - Liều x Số lượng - Tần suất - Thời gian (Instructions)"
        const format1 = cleanLine.match(/^(.+?)\s+(\d+(?:mg|ml|g|mcg|IU)?)\s*-\s*(.+?)\s+x\s+(\d+)\s*-\s*(.+?)\s*-\s*(.+?)(?:\s*\((.+?)\))?$/i)
        if (format1) {
          return {
            id: `rx-${index}`,
            medicine_name: format1[1].trim(),
            dosage: format1[2].trim(),
            quantity: format1[4].trim(),
            frequency: format1[5].trim(),
            duration: format1[6].trim(),
            instructions: format1[7]?.trim() || '',
          }
        }
        
        // Format 2: "Medicine - Dosage - Quantity - Frequency - Duration"
        const format2 = cleanLine.match(/^(.+?)\s*-\s*(.+?)\s*-\s*(\d+)\s*-\s*(.+?)\s*-\s*(.+?)$/i)
        if (format2) {
          return {
            id: `rx-${index}`,
            medicine_name: format2[1].trim(),
            dosage: format2[2].trim(),
            quantity: format2[3].trim(),
            frequency: format2[4].trim(),
            duration: format2[5].trim(),
            instructions: '',
          }
        }
        
        // Format 3: Try to extract medicine name and dosage at least
        const format3 = cleanLine.match(/^(.+?)\s+(\d+(?:mg|ml|g|mcg|IU)?)/i)
        if (format3) {
          return {
            id: `rx-${index}`,
            medicine_name: format3[1].trim(),
            dosage: format3[2].trim(),
            quantity: '',
            frequency: '',
            duration: '',
            instructions: cleanLine.replace(format3[0], '').trim(),
          }
        }
        
        // Fallback: just use the whole line as medicine name
        return {
          id: `rx-${index}`,
          medicine_name: cleanLine,
          quantity: '',
          dosage: '',
          frequency: '',
          duration: '',
          instructions: '',
        }
      })
    : []

  const handlePrint = () => {
    setShowPrintDialog(true)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-600" />
            Chi tiết hồ sơ y tế
          </DialogTitle>
          <DialogDescription>
            Thông tin chi tiết về hồ sơ bệnh án
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {/* Patient Info */}
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-semibold text-lg mb-2">
              Thông tin bệnh nhân
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Tên bệnh nhân:</span>
                <p className="font-medium">
                  {record.patient?.first_name} {record.patient?.last_name}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Ngày khám:</span>
                <p className="font-medium">
                  {new Date(record.created_at).toLocaleString('vi-VN')}
                </p>
              </div>
              {record.patient?.patient_code && (
                <div>
                  <span className="text-gray-600">Mã bệnh nhân:</span>
                  <p className="font-medium">{record.patient.patient_code}</p>
                </div>
              )}
              {record.doctor && (
                <div>
                  <span className="text-gray-600">Bác sĩ điều trị:</span>
                  <p className="font-medium">
                    {record.doctor.first_name} {record.doctor.last_name}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Diagnosis */}
          {record.diagnosis && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-blue-600" />
                Chẩn đoán
              </h4>
              <div className="text-sm whitespace-pre-wrap">{record.diagnosis}</div>
            </div>
          )}

          {/* Treatment */}
          {record.treatment && (
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Activity className="h-4 w-4 text-purple-600" />
                Điều trị
              </h4>
              <div className="text-sm whitespace-pre-wrap">{record.treatment}</div>
            </div>
          )}

          {/* Prescription */}
          {record.prescription && (
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-orange-600" />
                Đơn thuốc
              </h4>
              <div className="text-sm whitespace-pre-wrap">{record.prescription}</div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button 
            className="bg-green-600 hover:bg-green-700"
            onClick={handlePrint}
          >
            <Printer className="h-4 w-4 mr-2" />
            In hồ sơ
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Print Medical Record Dialog */}
      <PrintMedicalRecord
        open={showPrintDialog}
        onOpenChange={setShowPrintDialog}
        patientData={{
          patient_name: record.patient ? `${record.patient.first_name} ${record.patient.last_name}` : '',
          patient_info: record.patient,
          patient_id: record.patient_id,
          appointment_date: record.created_at,
          appointment_time: new Date(record.created_at).toTimeString().split(' ')[0].substring(0, 5),
        }}
        clinicalNotes={clinicalNotes}
        orders={[]}
        prescriptions={prescriptions}
        doctorInfo={{
          name: record.doctor ? `${record.doctor.first_name} ${record.doctor.last_name}` : '',
          title: 'Bác sĩ',
          department: '',
        }}
      />
    </Dialog>
  )
}
