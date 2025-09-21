"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { DataTable } from "@/components/shared/DataTable"
import { SearchBar } from "@/components/shared/SearchBar"
import { KpiCard } from "@/components/shared/KpiCard"
import { Plus, Minus, Droplets, AlertTriangle, TrendingDown } from "lucide-react"

interface BloodStock {
  blood_id: string
  blood_type: string
  stock_quantity: number
  last_updated: string
}

interface StockTransaction {
  type: "in" | "out"
  quantity: number
  notes?: string
}

export default function BloodBankPage() {
  const [bloodStocks, setBloodStocks] = useState<BloodStock[]>([])
  const [filteredStocks, setFilteredStocks] = useState<BloodStock[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedBloodType, setSelectedBloodType] = useState("all")
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false)
  const [selectedStock, setSelectedStock] = useState<BloodStock | null>(null)
  const [transaction, setTransaction] = useState<StockTransaction>({ type: "in", quantity: 0 })
  const [isLoading, setIsLoading] = useState(true)

  // Mock data
  useEffect(() => {
    const mockData: BloodStock[] = [
      { blood_id: "BB001", blood_type: "A+", stock_quantity: 45, last_updated: "2024-01-15T10:30:00Z" },
      { blood_id: "BB002", blood_type: "A-", stock_quantity: 12, last_updated: "2024-01-14T14:20:00Z" },
      { blood_id: "BB003", blood_type: "B+", stock_quantity: 38, last_updated: "2024-01-15T09:15:00Z" },
      { blood_id: "BB004", blood_type: "B-", stock_quantity: 8, last_updated: "2024-01-13T16:45:00Z" },
      { blood_id: "BB005", blood_type: "AB+", stock_quantity: 22, last_updated: "2024-01-15T11:00:00Z" },
      { blood_id: "BB006", blood_type: "AB-", stock_quantity: 5, last_updated: "2024-01-12T13:30:00Z" },
      { blood_id: "BB007", blood_type: "O+", stock_quantity: 67, last_updated: "2024-01-15T08:45:00Z" },
      { blood_id: "BB008", blood_type: "O-", stock_quantity: 15, last_updated: "2024-01-14T12:20:00Z" },
    ]

    setTimeout(() => {
      setBloodStocks(mockData)
      setFilteredStocks(mockData)
      setIsLoading(false)
    }, 1000)
  }, [])

  // Filter and search logic
  useEffect(() => {
    let filtered = bloodStocks

    if (searchQuery) {
      filtered = filtered.filter(
        (stock) =>
          stock.blood_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          stock.blood_id.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (selectedBloodType !== "all") {
      filtered = filtered.filter((stock) => stock.blood_type === selectedBloodType)
    }

    setFilteredStocks(filtered)
  }, [bloodStocks, searchQuery, selectedBloodType])

  const handleStockTransaction = async () => {
    if (!selectedStock || transaction.quantity <= 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập số lượng hợp lệ",
        variant: "destructive",
      })
      return
    }

    const newQuantity =
      transaction.type === "in"
        ? selectedStock.stock_quantity + transaction.quantity
        : selectedStock.stock_quantity - transaction.quantity

    if (newQuantity < 0) {
      toast({
        title: "Lỗi",
        description: "Số lượng tồn kho không thể âm",
        variant: "destructive",
      })
      return
    }

    // Update stock
    const updatedStocks = bloodStocks.map((stock) =>
      stock.blood_id === selectedStock.blood_id
        ? { ...stock, stock_quantity: newQuantity, last_updated: new Date().toISOString() }
        : stock,
    )

    setBloodStocks(updatedStocks)
    setIsTransactionDialogOpen(false)
    setSelectedStock(null)
    setTransaction({ type: "in", quantity: 0 })

    toast({
      title: "Thành công",
      description: `Đã ${transaction.type === "in" ? "nhập" : "xuất"} ${transaction.quantity} đơn vị máu ${selectedStock.blood_type}`,
    })
  }

  const openTransactionDialog = (stock: BloodStock, type: "in" | "out") => {
    setSelectedStock(stock)
    setTransaction({ type, quantity: 0 })
    setIsTransactionDialogOpen(true)
  }

  const getStockStatus = (quantity: number) => {
    if (quantity <= 10) return { status: "Thiếu", color: "destructive" as const }
    if (quantity <= 20) return { status: "Thấp", color: "secondary" as const }
    return { status: "Đủ", color: "default" as const }
  }

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
  const totalStock = bloodStocks.reduce((sum, stock) => sum + stock.stock_quantity, 0)
  const lowStockCount = bloodStocks.filter((stock) => stock.stock_quantity <= 10).length
  const criticalStockCount = bloodStocks.filter((stock) => stock.stock_quantity <= 5).length

  const columns = [
    {
      key: "blood_id",
      label: "Mã máu",
      sortable: true,
    },
    {
      key: "blood_type",
      label: "Nhóm máu",
      sortable: true,
      render: (value: string) => (
        <Badge variant="outline" className="font-mono">
          {value}
        </Badge>
      ),
    },
    {
      key: "stock_quantity",
      label: "Tồn kho",
      sortable: true,
      render: (value: number, row: BloodStock) => {
        const { status, color } = getStockStatus(value)
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">{value}</span>
            <Badge variant={color} className="text-xs">
              {status}
            </Badge>
          </div>
        )
      },
    },
    {
      key: "last_updated",
      label: "Cập nhật cuối",
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString("vi-VN"),
    },
    {
      key: "actions",
      label: "Hành động",
      render: (_: any, row: BloodStock) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => openTransactionDialog(row, "in")}
            className="text-green-600 hover:text-green-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Nhập
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => openTransactionDialog(row, "out")}
            className="text-red-600 hover:text-red-700"
            disabled={row.stock_quantity === 0}
          >
            <Minus className="h-4 w-4 mr-1" />
            Xuất
          </Button>
        </div>
      ),
    },
  ]

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Đang tải...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ngân hàng máu</h1>
          <p className="text-muted-foreground">Quản lý tồn kho máu và theo dõi giao dịch nhập xuất</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Tổng tồn kho"
          value={totalStock.toString()}
          trend={{ value: 5, isPositive: true }}
          icon={<Droplets className="h-4 w-4" />}
        />
        <KpiCard label="Nhóm máu" value={bloodTypes.length.toString()} icon={<Droplets className="h-4 w-4" />} />
        <KpiCard
          label="Tồn kho thấp"
          value={lowStockCount.toString()}
          trend={{ value: -2, isPositive: false }}
          icon={<TrendingDown className="h-4 w-4" />}
        />
        <KpiCard
          label="Tình trạng nguy hiểm"
          value={criticalStockCount.toString()}
          icon={<AlertTriangle className="h-4 w-4" />}
        />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <SearchBar placeholder="Tìm kiếm theo nhóm máu hoặc mã máu..." onSearch={setSearchQuery} />
            </div>
            <Select value={selectedBloodType} onValueChange={setSelectedBloodType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Chọn nhóm máu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả nhóm máu</SelectItem>
                {bloodTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách tồn kho máu</CardTitle>
          <CardDescription>
            Hiển thị {filteredStocks.length} trên tổng số {bloodStocks.length} mục
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredStocks}
            total={filteredStocks.length}
            page={1}
            pageSize={10}
            onPageChange={() => {}}
            onSort={() => {}}
            onFilter={() => {}}
          />
        </CardContent>
      </Card>

      {/* Transaction Dialog */}
      <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {transaction.type === "in" ? "Nhập máu" : "Xuất máu"} - {selectedStock?.blood_type}
            </DialogTitle>
            <DialogDescription>Tồn kho hiện tại: {selectedStock?.stock_quantity} đơn vị</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="quantity">Số lượng</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={transaction.quantity || ""}
                onChange={(e) =>
                  setTransaction((prev) => ({ ...prev, quantity: Number.parseInt(e.target.value) || 0 }))
                }
                placeholder="Nhập số lượng..."
              />
            </div>
            <div>
              <Label htmlFor="notes">Ghi chú (tùy chọn)</Label>
              <Input
                id="notes"
                value={transaction.notes || ""}
                onChange={(e) => setTransaction((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Ghi chú về giao dịch..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTransactionDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleStockTransaction}>{transaction.type === "in" ? "Nhập máu" : "Xuất máu"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
