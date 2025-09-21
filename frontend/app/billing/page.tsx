"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { DataTable } from "@/components/shared/DataTable"
import { SearchBar } from "@/components/shared/SearchBar"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { KpiCard } from "@/components/shared/KpiCard"
import { FileText, Plus, Download, Eye, CheckCircle } from "lucide-react"

interface BillingRecord {
  bill_id: string
  patient: string
  patient_id: string
  appointment_id: string
  total_amount: number
  payment_status: "Paid" | "Pending" | "Overdue" | "Partial"
  payment_date: string | null
  insurance_provider: string
  created_at: string
  items: BillingItem[]
}

interface BillingItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  total: number
}

export default function BillingPage() {
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

  // Mock data
  useEffect(() => {
    const mockBills: BillingRecord[] = [
      {
        bill_id: "BILL-001",
        patient: "Nguyễn Văn An",
        patient_id: "PAT-001",
        appointment_id: "APT-001",
        total_amount: 1500000,
        payment_status: "Pending",
        payment_date: null,
        insurance_provider: "Bảo hiểm xã hội",
        created_at: "2024-01-15",
        items: [
          { id: "1", description: "Khám tổng quát", quantity: 1, unit_price: 500000, total: 500000 },
          { id: "2", description: "Xét nghiệm máu", quantity: 1, unit_price: 300000, total: 300000 },
          { id: "3", description: "Thuốc kháng sinh", quantity: 2, unit_price: 350000, total: 700000 },
        ],
      },
      {
        bill_id: "BILL-002",
        patient: "Trần Thị Bình",
        patient_id: "PAT-002",
        appointment_id: "APT-002",
        total_amount: 2300000,
        payment_status: "Paid",
        payment_date: "2024-01-14",
        insurance_provider: "Bảo hiểm tư nhân",
        created_at: "2024-01-14",
        items: [
          { id: "1", description: "Phẫu thuật nhỏ", quantity: 1, unit_price: 2000000, total: 2000000 },
          { id: "2", description: "Thuốc giảm đau", quantity: 1, unit_price: 300000, total: 300000 },
        ],
      },
      {
        bill_id: "BILL-003",
        patient: "Lê Văn Cường",
        patient_id: "PAT-003",
        appointment_id: "APT-003",
        total_amount: 800000,
        payment_status: "Overdue",
        payment_date: null,
        insurance_provider: "Không có",
        created_at: "2024-01-10",
        items: [{ id: "1", description: "Khám chuyên khoa", quantity: 1, unit_price: 800000, total: 800000 }],
      },
    ]

    setTimeout(() => {
      setBills(mockBills)
      setFilteredBills(mockBills)
      setIsLoading(false)
    }, 1000)
  }, [])

  // Filter bills
  useEffect(() => {
    let filtered = bills

    if (searchQuery) {
      filtered = filtered.filter(
        (bill) =>
          bill.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
          bill.bill_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          bill.appointment_id.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (selectedPatient !== "all") {
      filtered = filtered.filter((bill) => bill.patient_id === selectedPatient)
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter((bill) => bill.payment_status === selectedStatus)
    }

    setFilteredBills(filtered)
  }, [bills, searchQuery, selectedPatient, selectedStatus])

  const handleMarkPaid = (billId: string) => {
    setBills((prev) =>
      prev.map((bill) =>
        bill.bill_id === billId
          ? { ...bill, payment_status: "Paid" as const, payment_date: new Date().toISOString().split("T")[0] }
          : bill,
      ),
    )
    toast({
      title: "Thành công",
      description: "Đã cập nhật trạng thái thanh toán",
    })
    setShowMarkPaidDialog(false)
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
    },
    {
      key: "patient",
      label: "Bệnh nhân",
      sortable: true,
    },
    {
      key: "appointment_id",
      label: "Mã cuộc hẹn",
      sortable: true,
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
      render: (value: string | null) => value || "Chưa thanh toán",
    },
    {
      key: "insurance_provider",
      label: "Bảo hiểm",
      sortable: true,
    },
    {
      key: "created_at",
      label: "Ngày tạo",
      sortable: true,
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
  const totalRevenue = bills.reduce((sum, bill) => (bill.payment_status === "Paid" ? sum + bill.total_amount : sum), 0)
  const pendingAmount = bills.reduce(
    (sum, bill) => (bill.payment_status === "Pending" ? sum + bill.total_amount : sum),
    0,
  )
  const overdueCount = bills.filter((bill) => bill.payment_status === "Overdue").length

  const uniquePatients = [...new Set(bills.map((bill) => ({ id: bill.patient_id, name: bill.patient })))]

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
                  <p className="font-medium">{selectedBill.bill_id}</p>
                </div>
                <div>
                  <Label>Bệnh nhân</Label>
                  <p className="font-medium">{selectedBill.patient}</p>
                </div>
                <div>
                  <Label>Mã cuộc hẹn</Label>
                  <p className="font-medium">{selectedBill.appointment_id}</p>
                </div>
                <div>
                  <Label>Trạng thái</Label>
                  <StatusBadge type="billing" status={selectedBill.payment_status} />
                </div>
                <div>
                  <Label>Bảo hiểm</Label>
                  <p className="font-medium">{selectedBill.insurance_provider}</p>
                </div>
                <div>
                  <Label>Ngày thanh toán</Label>
                  <p className="font-medium">{selectedBill.payment_date || "Chưa thanh toán"}</p>
                </div>
              </div>

              <div>
                <Label>Chi tiết dịch vụ</Label>
                <div className="mt-2 border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3">Dịch vụ</th>
                        <th className="text-right p-3">Số lượng</th>
                        <th className="text-right p-3">Đơn giá</th>
                        <th className="text-right p-3">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedBill.items.map((item) => (
                        <tr key={item.id} className="border-t">
                          <td className="p-3">{item.description}</td>
                          <td className="text-right p-3">{item.quantity}</td>
                          <td className="text-right p-3">{formatCurrency(item.unit_price)}</td>
                          <td className="text-right p-3">{formatCurrency(item.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-muted font-medium">
                      <tr>
                        <td colSpan={3} className="text-right p-3">
                          Tổng cộng:
                        </td>
                        <td className="text-right p-3">{formatCurrency(selectedBill.total_amount)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
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
        description={`Bạn có chắc chắn muốn đánh dấu hóa đơn ${selectedBill?.bill_id} là đã thanh toán?`}
        onConfirm={() => selectedBill && handleMarkPaid(selectedBill.bill_id)}
      />
    </div>
  )
}
