"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { DataTable } from "@/components/shared/DataTable"
import { SearchBar } from "@/components/shared/SearchBar"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { KpiCard } from "@/components/shared/KpiCard"
import { FileText, Plus, Download, Eye, CheckCircle, Save } from "lucide-react"
import { billingApi, BillingRecord as ApiBillingRecord, CreateBillingData } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

interface BillingRecord extends ApiBillingRecord {
  patient?: {
    first_name?: string
    last_name?: string
  }
}

export default function BillingPage() {
  const { user } = useAuth()
  const [bills, setBills] = useState<BillingRecord[]>([])
  const [filteredBills, setFilteredBills] = useState<BillingRecord[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPatient, setSelectedPatient] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [selectedBill, setSelectedBill] = useState<BillingRecord | null>(null)
  const [showMarkPaidDialog, setShowMarkPaidDialog] = useState(false)
  
  // Create Billing Form State
  const [billingForm, setBillingForm] = useState({
    patient_id: "",
    appointment_id: "",
    total_amount: "",
    payment_status: "Pending",
    payment_date: "",
    insurance_provider: ""
  })

  // Load billing data from API
  useEffect(() => {
    if (user) {
      loadBillingData()
    }
  }, [user])

  const loadBillingData = async () => {
    setIsLoading(true)
    try {
      const response = await billingApi.getAllBilling({ limit: 100 })
      setBills(response.data)
      setFilteredBills(response.data)
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách hóa đơn",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filter bills
  useEffect(() => {
    let filtered = bills

    if (searchQuery) {
      filtered = filtered.filter(
        (bill) => {
          const patientName = `${bill.patient?.first_name || ''} ${bill.patient?.last_name || ''}`
          return patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            bill.bill_id.toString().includes(searchQuery)
        }
      )
    }

    if (selectedPatient !== "all") {
      filtered = filtered.filter((bill) => bill.patient_id.toString() === selectedPatient)
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter((bill) => bill.payment_status === selectedStatus)
    }

    setFilteredBills(filtered)
  }, [bills, searchQuery, selectedPatient, selectedStatus])

  const handleCreateBilling = async () => {
    try {
      if (!billingForm.patient_id || !billingForm.total_amount) {
        toast({
          title: "Lỗi",
          description: "Vui lòng nhập ID bệnh nhân và số tiền",
          variant: "destructive",
        })
        return
      }

      const billingData: CreateBillingData = {
        patient_id: parseInt(billingForm.patient_id),
        appointment_id: billingForm.appointment_id ? parseInt(billingForm.appointment_id) : undefined,
        total_amount: parseFloat(billingForm.total_amount),
        payment_status: billingForm.payment_status as any,
        payment_date: billingForm.payment_date || undefined,
        insurance_provider: billingForm.insurance_provider || undefined
      }

      await billingApi.createBilling(billingData)
      
      toast({
        title: "Thành công",
        description: `Đã tạo hóa đơn cho bệnh nhân #${billingForm.patient_id}`,
      })

      setBillingForm({
        patient_id: "",
        appointment_id: "",
        total_amount: "",
        payment_status: "Pending",
        payment_date: "",
        insurance_provider: ""
      })
      setShowCreateDialog(false)
      loadBillingData()

    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error?.response?.data?.error || "Không thể tạo hóa đơn",
        variant: "destructive",
      })
    }
  }

  const handleMarkPaid = async (billId: number) => {
    try {
      await billingApi.updateBilling(billId, { 
        payment_status: "Paid",
        payment_date: new Date().toISOString()
      })
      
      toast({
        title: "Thành công",
        description: "Đã cập nhật trạng thái thanh toán",
      })
      
      setShowMarkPaidDialog(false)
      loadBillingData()
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái",
        variant: "destructive",
      })
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  const columns = [
    {
      key: "bill_id",
      label: "Mã hóa đơn",
      sortable: true,
      render: (value: number) => `#${value}`,
    },
    {
      key: "patient",
      label: "Bệnh nhân",
      sortable: true,
      render: (_: any, record: BillingRecord) => 
        `${record.patient?.first_name || ''} ${record.patient?.last_name || ''}`,
    },
    {
      key: "appointment_id",
      label: "Mã cuộc hẹn",
      sortable: true,
      render: (value: number | null) => value ? `#${value}` : '-',
    },
    {
      key: "total_amount",
      label: "Tổng tiền",
      sortable: true,
      render: (value: number) => formatCurrency(value),
    },
    {
      key: "payment_status",
      label: "Trạng thái",
      sortable: true,
      render: (value: string) => <StatusBadge type="billing" status={value} />,
    },
    {
      key: "payment_date",
      label: "Ngày thanh toán",
      sortable: true,
      render: (value: string | null | undefined) => value ? new Date(value).toLocaleDateString('vi-VN') : "Chưa thanh toán",
    },
    {
      key: "insurance_provider",
      label: "Bảo hiểm",
      sortable: true,
      render: (value: string | null | undefined) => value || "Không có",
    },
    {
      key: "created_at",
      label: "Ngày tạo",
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString('vi-VN'),
    },
    {
      key: "actions",
      label: "Hành động",
      render: (_: any, record: BillingRecord) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedBill(record)
              setShowViewDialog(true)
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {record.payment_status !== "Paid" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedBill(record)
                setShowMarkPaidDialog(true)
              }}
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ]

  // Calculate statistics
  const totalRevenue = bills.reduce((sum: number, bill) => (bill.payment_status === "Paid" ? sum + bill.total_amount : sum), 0)
  const pendingAmount = bills.reduce(
    (sum: number, bill) => (bill.payment_status === "Pending" ? sum + bill.total_amount : sum),
    0,
  )
  const overdueCount = bills.filter((bill) => bill.payment_status === "Overdue").length

  const uniquePatients = bills.map(bill => ({
    id: bill.patient_id.toString(),
    name: `${bill.patient?.first_name || ''} ${bill.patient?.last_name || ''}`
  })).filter((patient, index, self) => 
    index === self.findIndex(p => p.id === patient.id)
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Thanh toán</h1>
          <p className="text-muted-foreground">Quản lý hóa đơn và thanh toán</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Tạo hóa đơn mới
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KpiCard label="Tổng doanh thu" value={formatCurrency(totalRevenue)} trend={{ value: 12, isPositive: true }} />
        <KpiCard label="Chờ thanh toán" value={formatCurrency(pendingAmount)} trend={{ value: 5, isPositive: false }} />
        <KpiCard label="Quá hạn" value={overdueCount.toString()} trend={{ value: 2, isPositive: false }} />
        <KpiCard label="Tổng hóa đơn" value={bills.length.toString()} trend={{ value: 8, isPositive: true }} />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Tìm kiếm</Label>
              <SearchBar onSearch={setSearchQuery} placeholder="Tìm theo tên, mã hóa đơn..." />
            </div>
            <div>
              <Label>Bệnh nhân</Label>
              <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn bệnh nhân" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả bệnh nhân</SelectItem>
                  {uniquePatients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Trạng thái</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="Paid">Đã thanh toán</SelectItem>
                  <SelectItem value="Pending">Chờ thanh toán</SelectItem>
                  <SelectItem value="Overdue">Quá hạn</SelectItem>
                  <SelectItem value="Partial">Thanh toán một phần</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách hóa đơn</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredBills}
            total={filteredBills.length}
            page={1}
            pageSize={10}
            onPageChange={() => {}}
            onSort={() => {}}
            onFilter={() => {}}
            loading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Create Billing Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-600" />
              Lập hóa đơn mới
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patient-id">
                  ID Bệnh nhân <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="patient-id"
                  type="number"
                  placeholder="Nhập ID bệnh nhân"
                  value={billingForm.patient_id}
                  onChange={(e) => setBillingForm(prev => ({...prev, patient_id: e.target.value}))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="appointment-id">ID Lịch hẹn</Label>
                <Input
                  id="appointment-id"
                  type="number"
                  placeholder="Tùy chọn"
                  value={billingForm.appointment_id}
                  onChange={(e) => setBillingForm(prev => ({...prev, appointment_id: e.target.value}))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="total-amount">
                Tổng tiền <span className="text-red-500">*</span>
              </Label>
              <Input
                id="total-amount"
                type="number"
                placeholder="Nhập số tiền (VND)"
                value={billingForm.total_amount}
                onChange={(e) => setBillingForm(prev => ({...prev, total_amount: e.target.value}))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payment-status">Trạng thái thanh toán</Label>
                <Select 
                  value={billingForm.payment_status} 
                  onValueChange={(value) => setBillingForm(prev => ({...prev, payment_status: value}))}
                >
                  <SelectTrigger id="payment-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Chờ thanh toán</SelectItem>
                    <SelectItem value="Paid">Đã thanh toán</SelectItem>
                    <SelectItem value="Overdue">Quá hạn</SelectItem>
                    <SelectItem value="Cancelled">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-date">Ngày thanh toán</Label>
                <Input
                  id="payment-date"
                  type="date"
                  value={billingForm.payment_date}
                  onChange={(e) => setBillingForm(prev => ({...prev, payment_date: e.target.value}))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="insurance">Nhà cung cấp bảo hiểm</Label>
              <Input
                id="insurance"
                placeholder="Tùy chọn"
                value={billingForm.insurance_provider}
                onChange={(e) => setBillingForm(prev => ({...prev, insurance_provider: e.target.value}))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Hủy
            </Button>
            <Button 
              onClick={handleCreateBilling}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Lưu hóa đơn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Bill Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Chi tiết hóa đơn</DialogTitle>
          </DialogHeader>
          {selectedBill && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Mã hóa đơn</Label>
                  <p className="font-medium">#{selectedBill.bill_id}</p>
                </div>
                <div>
                  <Label>Bệnh nhân</Label>
                  <p className="font-medium">
                    {selectedBill.patient?.first_name} {selectedBill.patient?.last_name}
                  </p>
                </div>
                <div>
                  <Label>Mã cuộc hẹn</Label>
                  <p className="font-medium">{selectedBill.appointment_id ? `#${selectedBill.appointment_id}` : '-'}</p>
                </div>
                <div>
                  <Label>Trạng thái</Label>
                  <StatusBadge type="billing" status={selectedBill.payment_status} />
                </div>
                <div>
                  <Label>Bảo hiểm</Label>
                  <p className="font-medium">{selectedBill.insurance_provider || 'Không có'}</p>
                </div>
                <div>
                  <Label>Ngày thanh toán</Label>
                  <p className="font-medium">
                    {selectedBill.payment_date ? new Date(selectedBill.payment_date).toLocaleDateString('vi-VN') : "Chưa thanh toán"}
                  </p>
                </div>
              </div>

              <div>
                <Label>Tổng tiền</Label>
                <p className="text-2xl font-bold text-blue-600 mt-2">
                  {formatCurrency(selectedBill.total_amount)}
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Tải PDF
                </Button>
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  In hóa đơn
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Mark Paid Confirmation */}
      <ConfirmDialog
        open={showMarkPaidDialog}
        onOpenChange={setShowMarkPaidDialog}
        title="Xác nhận thanh toán"
        description={`Bạn có chắc chắn muốn đánh dấu hóa đơn #${selectedBill?.bill_id} là đã thanh toán?`}
        onConfirm={() => selectedBill && handleMarkPaid(selectedBill.bill_id)}
      />
    </div>
  )
}
