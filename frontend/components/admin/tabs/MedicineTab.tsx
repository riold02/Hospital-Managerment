"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Pill, Search, Eye, Plus, AlertTriangle, Edit, Trash2 } from "lucide-react"
import { medicineApi } from "@/lib/api"
import { toast } from "@/hooks/use-toast"

export function MedicineTab() {
  const [medicines, setMedicines] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMedicine, setSelectedMedicine] = useState<any>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)

  useEffect(() => {
    loadMedicines()
  }, [])

  const loadMedicines = async () => {
    setLoading(true)
    try {
      const response = await medicineApi.getAllMedicines({ limit: 100 })
      setMedicines(response.data || [])
    } catch (error) {
      console.error("Error loading medicines:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách thuốc",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetail = (medicine: any) => {
    setSelectedMedicine(medicine)
    setShowDetailDialog(true)
  }

  const handleDelete = async (medicineId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa thuốc này?')) return
    
    try {
      await medicineApi.deleteMedicine(medicineId)
      toast({
        title: "Thành công",
        description: "Đã xóa thuốc thành công",
      })
      loadMedicines()
    } catch (error) {
      console.error("Error deleting medicine:", error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa thuốc",
        variant: "destructive",
      })
    }
  }

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.type?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const isExpiringSoon = (expiryDate: string) => {
    if (!expiryDate) return false
    const expiry = new Date(expiryDate)
    const now = new Date()
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-green-600" />
              Quản lý thuốc ({filteredMedicines.length})
            </CardTitle>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Thêm thuốc
            </Button>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm thuốc, thương hiệu, loại..."
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
        ) : filteredMedicines.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Pill className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-medium mb-2">Không có thuốc</h3>
            <p>Chưa có thuốc nào trong kho.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Tên thuốc</TableHead>
                  <TableHead>Thương hiệu</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Liều lượng</TableHead>
                  <TableHead>Tồn kho</TableHead>
                  <TableHead>Hạn dùng</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMedicines.map((medicine) => {
                  const expiring = isExpiringSoon(medicine.expiry_date)
                  const lowStock = medicine.stock_quantity < 100
                  
                  return (
                    <TableRow key={medicine.medicine_id} className={expiring ? 'bg-yellow-50' : ''}>
                      <TableCell className="font-medium">#{medicine.medicine_id}</TableCell>
                      <TableCell className="font-medium">{medicine.name}</TableCell>
                      <TableCell>{medicine.brand || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{medicine.type || 'Chung'}</Badge>
                      </TableCell>
                      <TableCell>{medicine.dosage || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={lowStock ? "destructive" : "default"}>
                          {medicine.stock_quantity || 0}
                          {lowStock && <AlertTriangle className="h-3 w-3 ml-1" />}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {medicine.expiry_date ? (
                          <span className={expiring ? 'text-orange-600 font-semibold' : ''}>
                            {new Date(medicine.expiry_date).toLocaleDateString('vi-VN')}
                            {expiring && ' ⚠️'}
                          </span>
                        ) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewDetail(medicine)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Xem
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDelete(medicine.medicine_id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chi tiết thuốc</DialogTitle>
          <DialogDescription>Thông tin đầy đủ về thuốc</DialogDescription>
        </DialogHeader>
        {selectedMedicine && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Tên thuốc</label>
                <p className="font-semibold">{selectedMedicine.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Thương hiệu</label>
                <p>{selectedMedicine.brand || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Loại</label>
                <p>{selectedMedicine.type || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Nhà sản xuất</label>
                <p>{selectedMedicine.manufacturer || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Liều lượng</label>
                <p>{selectedMedicine.dosage || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Tồn kho</label>
                <p className="font-semibold text-blue-600">{selectedMedicine.stock_quantity || 0}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Hạn dùng</label>
                <p className={isExpiringSoon(selectedMedicine.expiry_date) ? 'text-orange-600 font-semibold' : ''}>
                  {selectedMedicine.expiry_date ? new Date(selectedMedicine.expiry_date).toLocaleDateString('vi-VN') : 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Giá</label>
                <p className="font-semibold text-green-600">
                  {selectedMedicine.unit_price ? `${selectedMedicine.unit_price.toLocaleString()} đ` : 'N/A'}
                </p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Điều kiện bảo quản</label>
              <p className="text-sm">{selectedMedicine.storage_conditions || 'Không có thông tin'}</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </div>
  )
}

