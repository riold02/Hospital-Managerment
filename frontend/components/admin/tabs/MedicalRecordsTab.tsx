"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FileText, Search, Eye, Calendar, User, Stethoscope } from "lucide-react"
import { medicalRecordsApi } from "@/lib/api"
import { toast } from "@/hooks/use-toast"

export function MedicalRecordsTab() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRecord, setSelectedRecord] = useState<any>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)

  useEffect(() => {
    loadRecords()
  }, [])

  const loadRecords = async () => {
    setLoading(true)
    try {
      const response = await medicalRecordsApi.getAllMedicalRecords({ limit: 50 })
      setRecords(Array.isArray(response) ? response : [])
    } catch (error) {
      console.error("Error loading medical records:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải hồ sơ y tế",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredRecords = records.filter(record =>
    record.patient?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.patient?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleViewDetail = (record: any) => {
    setSelectedRecord(record)
    setShowDetailDialog(true)
  }

  const parseSOAPSection = (text: string, sectionTitle: string) => {
    if (!text) return ""
    const regex = new RegExp(`\\[${sectionTitle}\\]\\n([\\s\\S]*?)(?=\\n\\n\\[|$)`)
    const match = text.match(regex)
    return match ? match[1].trim() : ""
  }

  return (
    <>
      <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-600" />
            Hồ sơ y tế ({filteredRecords.length})
          </CardTitle>
        </div>
        <div className="flex items-center gap-4 mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm bệnh nhân, chẩn đoán..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Đang tải...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-medium mb-2">Không có hồ sơ</h3>
            <p>Chưa có hồ sơ y tế nào trong hệ thống.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Bệnh nhân</TableHead>
                  <TableHead>Bác sĩ</TableHead>
                  <TableHead>Chẩn đoán</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.record_id}>
                    <TableCell className="font-medium">#{record.record_id}</TableCell>
                    <TableCell>
                      {record.patient ? `${record.patient.first_name} ${record.patient.last_name}` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {record.doctor ? `${record.doctor.first_name} ${record.doctor.last_name}` : 'N/A'}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {record.diagnosis || 'Chưa có chẩn đoán'}
                    </TableCell>
                    <TableCell>
                      {record.created_at ? new Date(record.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewDetail(record)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Xem
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>

    {/* Medical Record Detail Dialog */}
    <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-600" />
            Chi tiết hồ sơ y tế #{selectedRecord?.record_id}
          </DialogTitle>
        </DialogHeader>
        
        {selectedRecord && (
          <div className="space-y-6">
            {/* Patient & Doctor Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Thông tin bệnh nhân
                </h4>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p><strong>Tên:</strong> {selectedRecord.patient?.first_name} {selectedRecord.patient?.last_name}</p>
                  <p><strong>Email:</strong> {selectedRecord.patient?.email || 'N/A'}</p>
                  <p><strong>Ngày sinh:</strong> {selectedRecord.patient?.date_of_birth ? new Date(selectedRecord.patient.date_of_birth).toLocaleDateString('vi-VN') : 'N/A'}</p>
                  <p><strong>Giới tính:</strong> {selectedRecord.patient?.gender === 'male' ? 'Nam' : selectedRecord.patient?.gender === 'female' ? 'Nữ' : 'N/A'}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" />
                  Thông tin bác sĩ
                </h4>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p><strong>Tên:</strong> {selectedRecord.doctor?.first_name} {selectedRecord.doctor?.last_name}</p>
                  <p><strong>Chuyên khoa:</strong> {selectedRecord.doctor?.specialty || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Diagnosis */}
            <div className="space-y-2">
              <h4 className="font-semibold">Chẩn đoán</h4>
              <div className="bg-blue-50 p-4 rounded-lg">
                {selectedRecord.diagnosis ? (
                  <div className="space-y-3">
                    {parseSOAPSection(selectedRecord.diagnosis, "TRIỆU CHỨNG CHỦ QUAN") && (
                      <div>
                        <h5 className="font-medium text-blue-800">Triệu chứng chủ quan:</h5>
                        <p className="text-sm">{parseSOAPSection(selectedRecord.diagnosis, "TRIỆU CHỨNG CHỦ QUAN")}</p>
                      </div>
                    )}
                    {parseSOAPSection(selectedRecord.diagnosis, "KHÁM LÂM SÀNG") && (
                      <div>
                        <h5 className="font-medium text-blue-800">Khám lâm sàng:</h5>
                        <p className="text-sm">{parseSOAPSection(selectedRecord.diagnosis, "KHÁM LÂM SÀNG")}</p>
                      </div>
                    )}
                    {parseSOAPSection(selectedRecord.diagnosis, "CHẨN ĐOÁN") && (
                      <div>
                        <h5 className="font-medium text-blue-800">Chẩn đoán:</h5>
                        <p className="text-sm">{parseSOAPSection(selectedRecord.diagnosis, "CHẨN ĐOÁN")}</p>
                      </div>
                    )}
                    {!parseSOAPSection(selectedRecord.diagnosis, "TRIỆU CHỨNG CHỦ QUAN") && 
                     !parseSOAPSection(selectedRecord.diagnosis, "KHÁM LÂM SÀNG") && 
                     !parseSOAPSection(selectedRecord.diagnosis, "CHẨN ĐOÁN") && (
                      <p className="text-sm">{selectedRecord.diagnosis}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">Chưa có chẩn đoán</p>
                )}
              </div>
            </div>

            {/* Treatment */}
            {selectedRecord.treatment && (
              <div className="space-y-2">
                <h4 className="font-semibold">Điều trị</h4>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="space-y-3">
                    {parseSOAPSection(selectedRecord.treatment, "KẾ HOẠCH ĐIỀU TRỊ") && (
                      <div>
                        <h5 className="font-medium text-green-800">Kế hoạch điều trị:</h5>
                        <p className="text-sm">{parseSOAPSection(selectedRecord.treatment, "KẾ HOẠCH ĐIỀU TRỊ")}</p>
                      </div>
                    )}
                    {parseSOAPSection(selectedRecord.treatment, "CHỈ ĐỊNH CẬN LÂM SÀNG") && (
                      <div>
                        <h5 className="font-medium text-green-800">Chỉ định cận lâm sàng:</h5>
                        <p className="text-sm">{parseSOAPSection(selectedRecord.treatment, "CHỈ ĐỊNH CẬN LÂM SÀNG")}</p>
                      </div>
                    )}
                    {!parseSOAPSection(selectedRecord.treatment, "KẾ HOẠCH ĐIỀU TRỊ") && 
                     !parseSOAPSection(selectedRecord.treatment, "CHỈ ĐỊNH CẬN LÂM SÀNG") && (
                      <p className="text-sm">{selectedRecord.treatment}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Prescription */}
            {selectedRecord.prescription && (
              <div className="space-y-2">
                <h4 className="font-semibold">Đơn thuốc</h4>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap">{selectedRecord.prescription}</pre>
                </div>
              </div>
            )}

            {/* Record Info */}
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Thông tin hồ sơ
              </h4>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p><strong>Ngày tạo:</strong> {selectedRecord.created_at ? new Date(selectedRecord.created_at).toLocaleString('vi-VN') : 'N/A'}</p>
                <p><strong>Loại hồ sơ:</strong> {selectedRecord.record_type || 'General'}</p>
                {selectedRecord.appointment_id && (
                  <p><strong>Lịch hẹn:</strong> #{selectedRecord.appointment_id}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  )
}

