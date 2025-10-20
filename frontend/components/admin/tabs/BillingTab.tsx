"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CreditCard, Search, Eye } from "lucide-react"
import { billingApi } from "@/lib/api"
import { toast } from "@/hooks/use-toast"
import { StatusBadge } from "@/components/shared/StatusBadge"

export function BillingTab() {
  const [billings, setBillings] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  useEffect(() => {
    loadBillings()
  }, [])

  const loadBillings = async () => {
    setLoading(true)
    try {
      const response = await billingApi.getAllBilling({ limit: 100 })
      setBillings(response.data || [])
    } catch (error) {
      console.error("Error loading billings:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách thanh toán",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Remove getStatusBadge function - now using StatusBadge component

  const filteredBillings = billings.filter(bill => {
    const matchesSearch = 
      bill.patient?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.patient?.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || bill.payment_status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-emerald-600" />
            Quản lý thanh toán ({filteredBillings.length})
          </CardTitle>
        </div>
        <div className="flex items-center gap-4 mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm bệnh nhân..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Chờ thanh toán</option>
            <option value="PAID">Đã thanh toán</option>
            <option value="CANCELLED">Đã hủy</option>
            <option value="OVERDUE">Quá hạn</option>
          </select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Đang tải...</p>
          </div>
        ) : filteredBillings.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <CreditCard className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-medium mb-2">Không có hóa đơn</h3>
            <p>Chưa có hóa đơn nào trong hệ thống.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Bệnh nhân</TableHead>
                  <TableHead>Tổng tiền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Phương thức</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Hạn thanh toán</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBillings.map((bill) => (
                    <TableRow key={bill.billing_id}>
                      <TableCell className="font-medium">#{bill.billing_id}</TableCell>
                      <TableCell>
                        {bill.patient ? `${bill.patient.first_name} ${bill.patient.last_name}` : 'N/A'}
                      </TableCell>
                      <TableCell className="font-bold text-green-600">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(bill.total_amount || 0)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={bill.payment_status} type="billing" />
                      </TableCell>
                      <TableCell>
                        {bill.payment_method ? (
                          <Badge variant="outline" className="text-xs">
                            {bill.payment_method === 'CASH' ? '💵 Tiền mặt' : 
                             bill.payment_method === 'TRANSFER' ? '🏦 Chuyển khoản' :
                             bill.payment_method === 'MOMO' ? '📱 MoMo' :
                             bill.payment_method === 'VNPAY' ? '💳 VNPay' :
                             bill.payment_method}
                          </Badge>
                        ) : (
                          <span className="text-gray-400 text-sm">Chưa chọn</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {bill.created_at ? new Date(bill.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {bill.due_date ? new Date(bill.due_date).toLocaleDateString('vi-VN') : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
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
  )
}

