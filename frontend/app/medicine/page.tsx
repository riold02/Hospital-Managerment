"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, AlertTriangle, Clock } from "lucide-react"

import { DataTable } from "@/components/shared/DataTable"
import { SearchBar } from "@/components/shared/SearchBar"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { KpiCard } from "@/components/shared/KpiCard"

interface Medicine {
  medicine_id: string
  name: string
  brand: string
  type: string
  dosage: string
  stock_quantity: number
  expiry_date: string
  batch_number: string
  supplier: string
  unit_price: number
  location: string
  created_at: string
}

export default function MedicinePage() {
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    type: "",
    dosage: "",
    stock_quantity: 0,
    expiry_date: "",
    batch_number: "",
    supplier: "",
    unit_price: 0,
    location: "",
  })

  // Mock data
  useEffect(() => {
    const mockMedicines: Medicine[] = [
      {
        medicine_id: "M001",
        name: "Paracetamol",
        brand: "Teva",
        type: "Giảm đau",
        dosage: "500mg",
        stock_quantity: 150,
        expiry_date: "2024-02-10",
        batch_number: "B001",
        supplier: "Công ty Dược A",
        unit_price: 2000,
        location: "Kệ A1",
        created_at: "2024-01-01T00:00:00Z",
      },
      {
        medicine_id: "M002",
        name: "Amoxicillin",
        brand: "GSK",
        type: "Kháng sinh",
        dosage: "250mg",
        stock_quantity: 5,
        expiry_date: "2024-06-15",
        batch_number: "B002",
        supplier: "Công ty Dược B",
        unit_price: 5000,
        location: "Kệ B2",
        created_at: "2024-01-02T00:00:00Z",
      },
      {
        medicine_id: "M003",
        name: "Ibuprofen",
        brand: "Pfizer",
        type: "Chống viêm",
        dosage: "400mg",
        stock_quantity: 80,
        expiry_date: "2024-01-25",
        batch_number: "B003",
        supplier: "Công ty Dược C",
        unit_price: 3000,
        location: "Kệ A2",
        created_at: "2024-01-03T00:00:00Z",
      },
    ]

    setTimeout(() => {
      setMedicines(mockMedicines.sort((a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()))
      setLoading(false)
    }, 1000)
  }, [])

  // Check if medicine is expiring soon (<30 days)
  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate)
    const today = new Date()
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 30 && diffDays > 0
  }

  // Filter medicines
  const filteredMedicines = medicines.filter((medicine) => {
    const matchesSearch =
      searchQuery === "" ||
      medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      medicine.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      medicine.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      medicine.medicine_id.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = selectedType === "all" || medicine.type === selectedType

    return matchesSearch && matchesType
  })

  // Pagination
  const totalMedicines = filteredMedicines.length
  const totalPages = Math.ceil(totalMedicines / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedMedicines = filteredMedicines.slice(startIndex, startIndex + pageSize)

  // Table columns
  const columns = [
    { key: "medicine_id", label: "Mã thuốc", sortable: true },
    { key: "name", label: "Tên thuốc", sortable: true },
    { key: "brand", label: "Thương hiệu", sortable: true },
    { key: "type", label: "Loại", sortable: true },
    { key: "dosage", label: "Liều lượng", sortable: false },
    { key: "stock_quantity", label: "Tồn kho", sortable: true },
    { key: "expiry_date", label: "Hạn sử dụng", sortable: true },
    { key: "actions", label: "Hành động", sortable: false },
  ]

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.type || formData.stock_quantity < 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin và đảm bảo số lượng không âm",
        variant: "destructive",
      })
      return
    }

    const medicineData: Medicine = {
      medicine_id: editingMedicine ? editingMedicine.medicine_id : `M${String(medicines.length + 1).padStart(3, "0")}`,
      ...formData,
      created_at: editingMedicine ? editingMedicine.created_at : new Date().toISOString(),
    }

    if (editingMedicine) {
      setMedicines(medicines.map((m) => (m.medicine_id === editingMedicine.medicine_id ? medicineData : m)))
      toast({
        title: "Thành công",
        description: "Cập nhật thuốc thành công",
      })
    } else {
      setMedicines([...medicines, medicineData])
      toast({
        title: "Thành công",
        description: "Thêm thuốc mới thành công",
      })
    }

    setIsFormOpen(false)
    setEditingMedicine(null)
    setFormData({
      name: "",
      brand: "",
      type: "",
      dosage: "",
      stock_quantity: 0,
      expiry_date: "",
      batch_number: "",
      supplier: "",
      unit_price: 0,
      location: "",
    })
  }

  // Handle delete
  const handleDelete = async (medicineId: string) => {
    setMedicines(medicines.filter((m) => m.medicine_id !== medicineId))
    toast({
      title: "Thành công",
      description: "Xóa thuốc thành công",
    })
  }

  // Handle edit
  const handleEdit = (medicine: Medicine) => {
    setEditingMedicine(medicine)
    setFormData({
      name: medicine.name,
      brand: medicine.brand,
      type: medicine.type,
      dosage: medicine.dosage,
      stock_quantity: medicine.stock_quantity,
      expiry_date: medicine.expiry_date,
      batch_number: medicine.batch_number,
      supplier: medicine.supplier,
      unit_price: medicine.unit_price,
      location: medicine.location,
    })
    setIsFormOpen(true)
  }

  // Render table row
  const renderRow = (medicine: Medicine) => (
    <tr
      key={medicine.medicine_id}
      className={`border-b hover:bg-muted/50 ${isExpiringSoon(medicine.expiry_date) ? "bg-amber-50" : ""}`}
    >
      <td className="px-4 py-3 font-medium">{medicine.medicine_id}</td>
      <td className="px-4 py-3">{medicine.name}</td>
      <td className="px-4 py-3">{medicine.brand}</td>
      <td className="px-4 py-3">
        <span className="px-2 py-1 bg-muted rounded-md text-sm">{medicine.type}</span>
      </td>
      <td className="px-4 py-3">{medicine.dosage}</td>
      <td className="px-4 py-3">
        <span className={medicine.stock_quantity < 20 ? "text-red-600 font-semibold" : ""}>
          {medicine.stock_quantity}
        </span>
        {medicine.stock_quantity < 20 && <AlertTriangle className="w-4 h-4 text-red-500 inline ml-1" />}
      </td>
      <td className="px-4 py-3">
        <span className={isExpiringSoon(medicine.expiry_date) ? "text-amber-600 font-semibold" : ""}>
          {new Date(medicine.expiry_date).toLocaleDateString("vi-VN")}
        </span>
        {isExpiringSoon(medicine.expiry_date) && <Clock className="w-4 h-4 text-amber-500 inline ml-1" />}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleEdit(medicine)}>
            <Edit className="h-4 w-4" />
          </Button>
          <ConfirmDialog
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa thuốc này không?"
            onConfirm={() => handleDelete(medicine.medicine_id)}
          >
            <Button variant="outline" size="sm">
              <Trash2 className="h-4 w-4" />
            </Button>
          </ConfirmDialog>
        </div>
      </td>
    </tr>
  )

  const medicineTypes = [...new Set(medicines.map((m) => m.type))]
  const lowStockCount = medicines.filter((m) => m.stock_quantity < 20).length
  const expiringCount = medicines.filter((m) => isExpiringSoon(m.expiry_date)).length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Thuốc</h1>
          <p className="text-muted-foreground">Quản lý kho thuốc và theo dõi tồn kho</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingMedicine(null)
                setFormData({
                  name: "",
                  brand: "",
                  type: "",
                  dosage: "",
                  stock_quantity: 0,
                  expiry_date: "",
                  batch_number: "",
                  supplier: "",
                  unit_price: 0,
                  location: "",
                })
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm thuốc mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingMedicine ? "Chỉnh sửa thuốc" : "Thêm thuốc mới"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Tên thuốc *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="brand">Thương hiệu</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="type">Loại *</Label>
                  <Input
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dosage">Liều lượng</Label>
                  <Input
                    id="dosage"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    placeholder="VD: 500mg"
                  />
                </div>
                <div>
                  <Label htmlFor="stock_quantity">Số lượng tồn kho *</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    min="0"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: Number.parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="expiry_date">Hạn sử dụng *</Label>
                  <Input
                    id="expiry_date"
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="batch_number">Số lô</Label>
                  <Input
                    id="batch_number"
                    value={formData.batch_number}
                    onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="supplier">Nhà cung cấp</Label>
                  <Input
                    id="supplier"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="unit_price">Giá đơn vị (VNĐ)</Label>
                  <Input
                    id="unit_price"
                    type="number"
                    min="0"
                    value={formData.unit_price}
                    onChange={(e) => setFormData({ ...formData, unit_price: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Vị trí</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="VD: Kệ A1"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit">{editingMedicine ? "Cập nhật" : "Thêm mới"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard label="Tổng thuốc" value={medicines.length.toString()} />
        <KpiCard label="Sắp hết hạn" value={expiringCount.toString()} />
        <KpiCard label="Tồn kho thấp" value={lowStockCount.toString()} />
        <KpiCard label="Loại thuốc" value={medicineTypes.length.toString()} />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Tìm kiếm</Label>
              <SearchBar onSearch={setSearchQuery} placeholder="Tìm theo tên, thương hiệu, loại..." />
            </div>
            <div>
              <Label>Loại thuốc</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại thuốc" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả loại</SelectItem>
                  {medicineTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={paginatedMedicines}
        total={totalMedicines}
        page={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        renderRow={renderRow}
        emptyMessage="Không có thuốc nào"
      />
    </div>
  )
}
