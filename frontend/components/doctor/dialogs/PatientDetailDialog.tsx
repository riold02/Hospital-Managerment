'use client'

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { User, FileText, Activity, Stethoscope } from "lucide-react"

interface Patient {
  patient_id?: number
  patient_code?: string
  first_name: string
  last_name: string
  date_of_birth?: string
  phone?: string
  email?: string
  gender?: string
  [key: string]: any
}

interface PatientDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient: Patient | null
  onViewMedicalHistory: (patient: Patient) => void
  onViewProgressNotes: (patient: Patient) => void
  onStartExamination: (patient: Patient) => void
}

export default function PatientDetailDialog({
  open,
  onOpenChange,
  patient,
  onViewMedicalHistory,
  onViewProgressNotes,
  onStartExamination,
}: PatientDetailDialogProps) {
  if (!patient) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Thông tin chi tiết bệnh nhân
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Patient Basic Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
            <div>
              <Label className="text-xs text-gray-500">Họ và tên</Label>
              <p className="font-semibold text-lg">{patient.first_name} {patient.last_name}</p>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Mã bệnh nhân</Label>
              <p className="font-semibold">{patient.patient_code || 'N/A'}</p>
            </div>
          </div>

          {/* Detailed Info */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-gray-500">Ngày sinh</Label>
              <p className="font-medium">
                {patient.date_of_birth ? 
                  new Date(patient.date_of_birth).toLocaleDateString('vi-VN') : 
                  'Chưa có'}
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-500">Tuổi</Label>
              <p className="font-medium">
                {patient.date_of_birth ? 
                  `${new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()} tuổi` : 
                  'N/A'}
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-500">Trạng thái</Label>
              <Badge className="bg-green-100 text-green-800">Đang điều trị</Badge>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-gray-500">Điện thoại</Label>
              <p className="font-medium">{patient.phone || 'Chưa có'}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-500">Email</Label>
              <p className="font-medium">{patient.email || 'Chưa có'}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => {
                onOpenChange(false)
                onViewMedicalHistory(patient)
              }}
            >
              <FileText className="h-4 w-4 mr-2" />
              Xem hồ sơ
            </Button>
            <Button 
              variant="outline"
              className="flex-1"
              onClick={() => {
                onOpenChange(false)
                onViewProgressNotes(patient)
              }}
            >
              <Activity className="h-4 w-4 mr-2" />
              Diễn biến
            </Button>
            <Button 
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={() => {
                onOpenChange(false)
                onStartExamination(patient)
              }}
            >
              <Stethoscope className="h-4 w-4 mr-2" />
              Khám bệnh
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
