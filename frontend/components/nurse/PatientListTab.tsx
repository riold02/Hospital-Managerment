"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import {
  Users,
  Search,
  Eye,
  FileText,
  Heart,
  Activity,
  AlertTriangle,
  CheckCircle,
  Bed,
  Calendar,
  Phone,
  Mail,
  ClipboardList,
  Thermometer,
  Stethoscope
} from "lucide-react"
import { patientsApi, type AssignedPatient, type VitalSigns } from "@/lib/api/patients-api"

interface PatientListTabProps {
  onRefresh: () => void
}

export default function PatientListTab({ onRefresh }: PatientListTabProps) {
  const [patients, setPatients] = useState<AssignedPatient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedPatient, setSelectedPatient] = useState<AssignedPatient | null>(null)
  const [showPatientDetail, setShowPatientDetail] = useState(false)
  const [showVitalSignsModal, setShowVitalSignsModal] = useState(false)
  const [vitalSigns, setVitalSigns] = useState<VitalSigns>({
    blood_pressure_systolic: 120,
    blood_pressure_diastolic: 80,
    heart_rate: 72,
    temperature: 36.5,
    respiratory_rate: 16,
    oxygen_saturation: 98,
    notes: ""
  })

  useEffect(() => {
    loadPatients()
  }, [])

  const loadPatients = async () => {
    try {
      setLoading(true)
      const response = await patientsApi.getAssignedPatients()
      setPatients(response.data)
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải danh sách bệnh nhân",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getPatientStatus = (patient: AssignedPatient): 'stable' | 'monitoring' | 'critical' => {
    const latestRecord = patient.patient.medical_records?.[0]
    if (!latestRecord) return 'stable'
    
    const diagnosis = latestRecord.diagnosis?.toLowerCase() || ''
    if (diagnosis.includes('critical') || diagnosis.includes('emergency') || diagnosis.includes('nguy kịch')) {
      return 'critical'
    }
    if (diagnosis.includes('monitor') || diagnosis.includes('theo dõi') || diagnosis.includes('observation')) {
      return 'monitoring'
    }
    return 'stable'
  }

  const getStatusColor = (status: 'stable' | 'monitoring' | 'critical') => {
    switch (status) {
      case 'stable': return 'bg-green-100 text-green-800 border-green-200'
      case 'monitoring': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
    }
  }

  const getStatusLabel = (status: 'stable' | 'monitoring' | 'critical') => {
    switch (status) {
      case 'stable': return 'Ổn định'
      case 'monitoring': return 'Cần theo dõi'
      case 'critical': return 'Nguy kịch'
    }
  }

  const getStatusIcon = (status: 'stable' | 'monitoring' | 'critical') => {
    switch (status) {
      case 'stable': return <CheckCircle className="h-4 w-4" />
      case 'monitoring': return <Activity className="h-4 w-4" />
      case 'critical': return <AlertTriangle className="h-4 w-4" />
    }
  }

  const calculateAge = (dateOfBirth?: string): number => {
    if (!dateOfBirth) return 0
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const formatGender = (gender?: string): string => {
    switch (gender?.toLowerCase()) {
      case 'male': return 'Nam'
      case 'female': return 'Nữ'
      case 'other': return 'Khác'
      default: return 'Không rõ'
    }
  }

  const filteredPatients = patients.filter(assignment => {
    const patient = assignment.patient
    const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase()
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                         assignment.room.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.patient_id.toString().includes(searchTerm)
    
    const status = getPatientStatus(assignment)
    const matchesStatus = statusFilter === 'all' || status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleViewPatient = (assignment: AssignedPatient) => {
    setSelectedPatient(assignment)
    setShowPatientDetail(true)
  }

  const handleRecordVitalSigns = (assignment: AssignedPatient) => {
    setSelectedPatient(assignment)
    setShowVitalSignsModal(true)
  }

  const submitVitalSigns = async () => {
    if (!selectedPatient) return

    try {
      await patientsApi.recordVitalSigns(selectedPatient.patient.patient_id, vitalSigns)
      toast({
        title: "Thành công",
        description: "Đã ghi nhận sinh hiệu",
      })
      setShowVitalSignsModal(false)
      setVitalSigns({
        blood_pressure_systolic: 120,
        blood_pressure_diastolic: 80,
        heart_rate: 72,
        temperature: 36.5,
        respiratory_rate: 16,
        oxygen_saturation: 98,
        notes: ""
      })
      loadPatients()
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể ghi nhận sinh hiệu",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Đang tải danh sách bệnh nhân...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[250px]">
              <Label htmlFor="search">Tìm kiếm</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Tên, mã BN, phòng..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="w-[200px]">
              <Label htmlFor="status-filter">Tình trạng</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="stable">Ổn định</SelectItem>
                  <SelectItem value="monitoring">Cần theo dõi</SelectItem>
                  <SelectItem value="critical">Nguy kịch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <p className="text-sm text-muted-foreground">
                Hiển thị <span className="font-semibold text-primary">{filteredPatients.length}</span> / <span className="font-semibold">{patients.length}</span> bệnh nhân
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patient Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredPatients.map((assignment) => {
          const patient = assignment.patient
          const status = getPatientStatus(assignment)
          const age = calculateAge(patient.date_of_birth)
          const latestNote = patient.medical_records?.[0]

          return (
            <Card key={assignment.assignment_id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">
                        {patient.first_name} {patient.last_name}
                      </CardTitle>
                      <Badge className={`${getStatusColor(status)} border`}>
                        {getStatusIcon(status)}
                        <span className="ml-1">{getStatusLabel(status)}</span>
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" />
                        #{patient.patient_id}
                      </span>
                      <span>{age} tuổi</span>
                      <span>{formatGender(patient.gender)}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Room Info */}
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <Bed className="h-4 w-4 text-primary" />
                  <span className="font-medium">Phòng {assignment.room.room_number}</span>
                  <Badge variant="outline" className="ml-auto">
                    {assignment.room.capacity} giường
                  </Badge>
                </div>

                {/* Latest Note */}
                {latestNote && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-2">
                      <ClipboardList className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-1">
                          Ghi chú gần nhất
                        </p>
                        <p className="text-sm text-blue-800 dark:text-blue-200 line-clamp-2">
                          {latestNote.diagnosis || latestNote.treatment || 'Không có ghi chú'}
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          {new Date(latestNote.created_at).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Contact Info */}
                {(patient.phone || patient.email) && (
                  <div className="flex flex-wrap gap-3 text-sm">
                    {patient.phone && (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Phone className="h-3.5 w-3.5" />
                        {patient.phone}
                      </span>
                    )}
                    {patient.email && (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Mail className="h-3.5 w-3.5" />
                        {patient.email}
                      </span>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleViewPatient(assignment)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Xem chi tiết
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handleRecordVitalSigns(assignment)}
                  >
                    <Thermometer className="h-4 w-4 mr-2" />
                    Sinh hiệu
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredPatients.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Không tìm thấy bệnh nhân</p>
              <p className="text-sm">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Patient Detail Modal */}
      <PatientDetailModal
        assignment={selectedPatient}
        open={showPatientDetail}
        onClose={() => setShowPatientDetail(false)}
      />

      {/* Vital Signs Modal */}
      <Dialog open={showVitalSignsModal} onOpenChange={setShowVitalSignsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-primary" />
              Ghi nhận sinh hiệu
            </DialogTitle>
            <DialogDescription>
              Bệnh nhân: {selectedPatient?.patient.first_name} {selectedPatient?.patient.last_name} - 
              Phòng {selectedPatient?.room.room_number}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bp-systolic">Huyết áp tâm thu (mmHg)</Label>
              <Input
                id="bp-systolic"
                type="number"
                value={vitalSigns.blood_pressure_systolic}
                onChange={(e) => setVitalSigns({...vitalSigns, blood_pressure_systolic: Number(e.target.value)})}
              />
            </div>
            <div>
              <Label htmlFor="bp-diastolic">Huyết áp tâm trương (mmHg)</Label>
              <Input
                id="bp-diastolic"
                type="number"
                value={vitalSigns.blood_pressure_diastolic}
                onChange={(e) => setVitalSigns({...vitalSigns, blood_pressure_diastolic: Number(e.target.value)})}
              />
            </div>
            <div>
              <Label htmlFor="heart-rate">Nhịp tim (bpm)</Label>
              <Input
                id="heart-rate"
                type="number"
                value={vitalSigns.heart_rate}
                onChange={(e) => setVitalSigns({...vitalSigns, heart_rate: Number(e.target.value)})}
              />
            </div>
            <div>
              <Label htmlFor="temperature">Nhiệt độ (°C)</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                value={vitalSigns.temperature}
                onChange={(e) => setVitalSigns({...vitalSigns, temperature: Number(e.target.value)})}
              />
            </div>
            <div>
              <Label htmlFor="respiratory-rate">Nhịp thở (/phút)</Label>
              <Input
                id="respiratory-rate"
                type="number"
                value={vitalSigns.respiratory_rate}
                onChange={(e) => setVitalSigns({...vitalSigns, respiratory_rate: Number(e.target.value)})}
              />
            </div>
            <div>
              <Label htmlFor="oxygen-saturation">SpO2 (%)</Label>
              <Input
                id="oxygen-saturation"
                type="number"
                value={vitalSigns.oxygen_saturation}
                onChange={(e) => setVitalSigns({...vitalSigns, oxygen_saturation: Number(e.target.value)})}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="notes">Ghi chú</Label>
              <Textarea
                id="notes"
                placeholder="Ghi chú về tình trạng bệnh nhân..."
                value={vitalSigns.notes}
                onChange={(e) => setVitalSigns({...vitalSigns, notes: e.target.value})}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowVitalSignsModal(false)}>
              Hủy
            </Button>
            <Button onClick={submitVitalSigns}>
              <Activity className="h-4 w-4 mr-2" />
              Lưu sinh hiệu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Patient Detail Modal Component
function PatientDetailModal({
  assignment,
  open,
  onClose
}: {
  assignment: AssignedPatient | null
  open: boolean
  onClose: () => void
}) {
  const [medicalRecords, setMedicalRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (assignment && open) {
      loadMedicalRecords()
    }
  }, [assignment, open])

  const loadMedicalRecords = async () => {
    if (!assignment) return
    
    try {
      setLoading(true)
      const response = await patientsApi.getPatientMedicalRecords(assignment.patient.patient_id)
      setMedicalRecords(response.data)
    } catch (error) {
      console.error('Error loading medical records:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!assignment) return null

  const patient = assignment.patient
  const age = new Date().getFullYear() - (patient.date_of_birth ? new Date(patient.date_of_birth).getFullYear() : 0)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Hồ sơ bệnh nhân
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Patient Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông tin bệnh nhân</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Họ và tên</Label>
                  <p className="font-medium">{patient.first_name} {patient.last_name}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Mã bệnh nhân</Label>
                  <p className="font-medium">#{patient.patient_id}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Tuổi / Giới tính</Label>
                  <p className="font-medium">{age} tuổi / {patient.gender === 'male' ? 'Nam' : patient.gender === 'female' ? 'Nữ' : 'Khác'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Phòng</Label>
                  <p className="font-medium">Phòng {assignment.room.room_number}</p>
                </div>
                {patient.phone && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Số điện thoại</Label>
                    <p className="font-medium">{patient.phone}</p>
                  </div>
                )}
                {patient.email && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Email</Label>
                    <p className="font-medium">{patient.email}</p>
                  </div>
                )}
                {patient.address && (
                  <div className="col-span-2">
                    <Label className="text-xs text-muted-foreground">Địa chỉ</Label>
                    <p className="font-medium">{patient.address}</p>
                  </div>
                )}
                {patient.medical_history && (
                  <div className="col-span-2">
                    <Label className="text-xs text-muted-foreground">Tiền sử bệnh</Label>
                    <p className="font-medium">{patient.medical_history}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Medical Records */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hồ sơ y tế</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <Activity className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">Đang tải...</p>
                </div>
              ) : medicalRecords.length > 0 ? (
                <div className="space-y-3">
                  {medicalRecords.slice(0, 5).map((record) => (
                    <div key={record.medical_record_id} className="p-3 bg-muted rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline">{record.record_type}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(record.created_at).toLocaleString('vi-VN')}
                        </span>
                      </div>
                      <p className="text-sm font-medium mb-1">Chẩn đoán: {record.diagnosis}</p>
                      <p className="text-sm text-muted-foreground">Điều trị: {record.treatment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">Chưa có hồ sơ y tế</p>
              )}
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
