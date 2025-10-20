"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Pill, TrendingUp, AlertTriangle, Package, DollarSign, Eye, Calendar, User, Stethoscope } from "lucide-react"
// Helper function to map status from English to Vietnamese - y chang dược sĩ
const getStatusInVietnamese = (status: string): string => {
  const statusMap: Record<string, string> = {
    'Active': 'Chờ cấp phát',
    'Filled': 'Đã cấp phát',
    'Partially_Filled': 'Cấp phát một phần',
    'Cancelled': 'Đã hủy',
    'Expired': 'Hết hạn'
  }
  return statusMap[status] || status
}

// Helper function to get status badge color - y chang dược sĩ
const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 'Active': return "default" // Blue
    case 'Filled': return "secondary" // Green
    case 'Cancelled': return "destructive" // Red
    case 'Expired': return "outline" // Gray
    default: return "outline"
  }
}

export function PharmacyTab() {
  const [loading, setLoading] = useState(false)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [allPrescriptions, setAllPrescriptions] = useState<any[]>([])
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)

  useEffect(() => {
    loadPharmacyData()
  }, [])

  const loadPharmacyData = async () => {
    setLoading(true)
    try {
      // Load pharmacy dashboard data
      const dashboardResponse = await pharmacyApi.getDashboard()
      setDashboardData(dashboardResponse)

      // Load ALL prescriptions (both Active and Filled) for filtering - y chang dược sĩ
      const allPrescriptionsResponse = await pharmacyApi.getPendingPrescriptions({ limit: 100, status: 'all' })
      setAllPrescriptions(allPrescriptionsResponse.data)
    } catch (error) {
      console.error("Error loading pharmacy data:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu nhà thuốc",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetail = (prescription: any) => {
    setSelectedPrescription(prescription)
    setShowDetailDialog(true)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-teal-600" />
            Quản lý nhà thuốc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Đang tải...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <Package className="h-8 w-8 text-blue-600 mb-2" />
                <p className="text-3xl font-bold text-blue-800">
                  {dashboardData?.overview?.totalMedicines || 0}
                </p>
                <p className="text-sm font-medium text-blue-600">Tổng loại thuốc</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <TrendingUp className="h-8 w-8 text-green-600 mb-2" />
                <p className="text-3xl font-bold text-green-800">
                  {dashboardData?.overview?.todayDispensed || 0}
                </p>
                <p className="text-sm font-medium text-green-600">Đơn đã phát hôm nay</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <AlertTriangle className="h-8 w-8 text-orange-600 mb-2" />
                <p className="text-3xl font-bold text-orange-800">
                  {dashboardData?.overview?.expiringMedicines || 0}
                </p>
                <p className="text-sm font-medium text-orange-600">Sắp hết hạn</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <Package className="h-8 w-8 text-red-600 mb-2" />
                <p className="text-3xl font-bold text-red-800">
                  {dashboardData?.overview?.lowStockMedicines || 0}
                </p>
                <p className="text-sm font-medium text-red-600">Sắp hết hàng</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Prescriptions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-teal-600" />
            Đơn thuốc gần đây
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allPrescriptions && allPrescriptions.length > 0 ? (
            <div className="space-y-4">
              {allPrescriptions.map((prescription: any) => (
                <div key={prescription.prescription_id} className="p-4 rounded-lg border hover:bg-purple-50 transition-colors">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">
                          Bệnh nhân: {prescription.patient ? `${prescription.patient.first_name} ${prescription.patient.last_name}` : 'N/A'}
                        </h4>
                        <p className="text-xs text-gray-500">
                          Bác sĩ: {prescription.doctor ? `${prescription.doctor.first_name} ${prescription.doctor.last_name} (${prescription.doctor.specialty})` : 'N/A'}
                        </p>
                        {prescription.diagnosis && (
                          <p className="text-xs text-gray-600 mt-1">
                            <span className="font-medium">Chẩn đoán:</span> {prescription.diagnosis}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          {new Date(prescription.prescription_date).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusBadgeVariant(prescription.status)}>
                          {getStatusInVietnamese(prescription.status)}
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewDetail(prescription)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Xem
                        </Button>
                      </div>
                    </div>
                    
                    {/* Medicine items list */}
                    <div className="pl-4 border-l-2 border-green-500 space-y-2">
                      {prescription.items && prescription.items.length > 0 ? prescription.items.map((item: any) => (
                        <div key={item.item_id} className="text-sm">
                          <p className="font-medium text-gray-900">
                            {item.medicine.name} - {item.medicine.brand}
                          </p>
                          <p className="text-xs text-gray-600">
                            Số lượng: <span className="font-medium">{item.quantity}</span>
                            {item.dosage && ` | Liều dùng: ${item.dosage}`}
                            {item.frequency && ` | Tần suất: ${item.frequency}`}
                            {item.duration && ` | Thời gian: ${item.duration}`}
                          </p>
                          {item.instructions && (
                            <p className="text-xs text-gray-500 italic">
                              {item.instructions}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">
                            Tồn kho: <span className={item.medicine.stock_quantity < item.quantity ? "text-red-600 font-medium" : "text-green-600"}>
                              {item.medicine.stock_quantity}
                            </span>
                          </p>
                        </div>
                      )) : (
                        <p className="text-xs text-gray-500">Không có thuốc trong đơn</p>
                      )}
                    </div>

                    {prescription.instructions && (
                      <p className="text-xs text-gray-600 italic mt-2">
                        <span className="font-medium">Ghi chú:</span> {prescription.instructions}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">Chưa có đơn thuốc nào</p>
          )}
        </CardContent>
      </Card>

      {/* Prescription Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-teal-600" />
              Chi tiết đơn thuốc #{selectedPrescription?.prescription_id}
            </DialogTitle>
          </DialogHeader>
          {selectedPrescription && (
            <div className="space-y-6">
              {/* Patient & Doctor Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Thông tin bệnh nhân
                  </h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p><strong>Tên:</strong> {selectedPrescription.patient ? `${selectedPrescription.patient.first_name || ''} ${selectedPrescription.patient.last_name || ''}`.trim() || 'N/A' : 'N/A'}</p>
                    <p><strong>Email:</strong> {selectedPrescription.patient?.email || 'N/A'}</p>
                    <p><strong>Số điện thoại:</strong> {selectedPrescription.patient?.phone || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Stethoscope className="h-4 w-4" />
                    Thông tin bác sĩ
                  </h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p><strong>Tên:</strong> {selectedPrescription.doctor ? `${selectedPrescription.doctor.first_name || ''} ${selectedPrescription.doctor.last_name || ''}`.trim() || 'N/A' : 'N/A'}</p>
                    <p><strong>Chuyên khoa:</strong> {selectedPrescription.doctor?.specialty || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Diagnosis */}
              {selectedPrescription.diagnosis && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Chẩn đoán</h4>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm">{selectedPrescription.diagnosis}</p>
                  </div>
                </div>
              )}

              {/* Prescription Items */}
              {selectedPrescription.items && selectedPrescription.items.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Danh sách thuốc</h4>
                  <div className="space-y-2">
                    {selectedPrescription.items.map((item: any, index: number) => (
                      <div key={item.item_id || index} className="bg-green-50 p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-green-800">
                              {item.medicine?.name || 'Thuốc không xác định'} - {item.medicine?.brand || 'N/A'}
                            </p>
                            <div className="text-sm text-green-700 mt-1 space-y-1">
                              <p><strong>Số lượng:</strong> {item.quantity || 'N/A'}</p>
                              {item.dosage && <p><strong>Liều dùng:</strong> {item.dosage}</p>}
                              {item.frequency && <p><strong>Tần suất:</strong> {item.frequency}</p>}
                              {item.duration && <p><strong>Thời gian:</strong> {item.duration}</p>}
                              {item.instructions && (
                                <p><strong>Hướng dẫn:</strong> {item.instructions}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">
                              Tồn kho: <span className={item.medicine?.stock_quantity < item.quantity ? "text-red-600 font-medium" : "text-green-600"}>
                                {item.medicine?.stock_quantity || 0}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Instructions */}
              {selectedPrescription.instructions && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Hướng dẫn sử dụng</h4>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-sm">{selectedPrescription.instructions}</p>
                  </div>
                </div>
              )}

              {/* Prescription Info */}
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Thông tin đơn thuốc
                </h4>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p><strong>Ngày kê đơn:</strong> {selectedPrescription.prescription_date ? new Date(selectedPrescription.prescription_date).toLocaleString('vi-VN') : 'N/A'}</p>
                   <p><strong>Trạng thái:</strong> 
                     <Badge variant={getStatusBadgeVariant(selectedPrescription.status)} className="ml-2">
                       {getStatusInVietnamese(selectedPrescription.status)}
                     </Badge>
                   </p>
                  <p><strong>Ngày tạo:</strong> {selectedPrescription.created_at ? new Date(selectedPrescription.created_at).toLocaleString('vi-VN') : 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

