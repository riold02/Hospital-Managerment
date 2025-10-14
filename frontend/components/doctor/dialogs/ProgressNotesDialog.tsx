'use client'

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Activity, FileText, Stethoscope, Plus } from "lucide-react"

interface Patient {
  patient_id?: number
  patient_code?: string
  first_name: string
  last_name: string
  [key: string]: any
}

interface ProgressNotesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient: Patient | null
  onViewMedicalHistory: (patient: Patient) => void
  onStartExamination: (patient: Patient) => void
}

export default function ProgressNotesDialog({
  open,
  onOpenChange,
  patient,
  onViewMedicalHistory,
  onStartExamination,
}: ProgressNotesDialogProps) {
  if (!patient) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Diễn biến bệnh
          </DialogTitle>
          <DialogDescription>
            Theo dõi diễn biến và tiến triển của bệnh nhân
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Patient Header */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-lg">{patient.first_name} {patient.last_name}</h4>
                <p className="text-sm text-gray-600">Mã BN: {patient.patient_code || 'N/A'}</p>
              </div>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Thêm ghi chú
              </Button>
            </div>
          </div>

          {/* Progress Notes List */}
          <div className="space-y-3">
            <div className="text-center py-12 text-gray-500">
              <Activity className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <h4 className="font-medium mb-2">Chưa có ghi chú diễn biến</h4>
              <p className="text-sm">Thêm ghi chú để theo dõi tiến triển bệnh của bệnh nhân</p>
              <Button size="sm" className="mt-4 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Thêm ghi chú đầu tiên
              </Button>
            </div>
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
              onViewMedicalHistory(patient)
            }}
          >
            <FileText className="h-4 w-4 mr-2" />
            Xem hồ sơ
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
