"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { CheckCircle, Pill } from "lucide-react"

import { DataTable } from "@/components/shared/DataTable"
import { SearchBar } from "@/components/shared/SearchBar"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { KpiCard } from "@/components/shared/KpiCard"

interface PharmacyRecord {
  pharmacy_id: string
  medicine_name: string
  medicine_id: string
  patient_name: string
  patient_id: string
  quantity: number
  prescription_date: string
  dispensed_date: string
  dispensed_by: string
  status: "Dispensed" | "Returned"
}

interface Prescription {
  id: string
  patient_name: string
  patient_id: string
  medication_name: string
  medication_id: string
  quantity: number
  prescribed_date: string
  status: "Pending" | "Dispensed" | "Cancelled"
}

interface Medicine {
  id: string
  name: string
  stock_quantity: number
}

export default function PharmacyPage() {
  const [pharmacyRecords, setPharmacyRecords] = useState<PharmacyRecord[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isDispenseDialogOpen, setIsDispenseDialogOpen] = useState(false)
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)

  // Mock data
  useEffect(() => {
    const mockPharmacyRecords: PharmacyRecord[] = [
      {
        pharmacy_id: "PH001",
        medicine_name: "Paracetamol 500mg",
        medicine_id: "M001",
        patient_name: "Nguyễn Văn An",
        patient_id: "P001",
        quantity: 30,
        prescription_date: "2024-01-15",
        dispensed_date: "2024-01-15",
        dispensed_by: "DS. Lê Thị Mai",
        status: "Dispensed",
      },
      {
        pharmacy_id: "PH002",
        medicine_name: "Amoxicillin 250mg",
        medicine_id: "M002",
        patient_name: "Trần Thị Bình",
        patient_id: "P002",
        quantity: 21,
        prescription_date: "2024-01-14",
        dispensed_date: "2024-01-14",
        dispensed_by: "DS. Phạm Văn Cường",
        status: "Dispensed",
      },
    ]

    const mockPrescriptions: Prescription[] = [
      {
        id: "RX003",
        patient_name: "Lê Văn Dũng",
        patient_id: "P003",
        medication_name: "Ibuprofen 400mg",
        medication_id: "M003",
        quantity: 14,
        prescribed_date: "2024-01-15",
        status: "Pending",
      },
      {
        id: "RX004",
        patient_name: "Phạm Thị Em",
        patient_id: "P004",
        medication_name: "Paracetamol 500mg",
        medication_id: "M001",
        quantity: 20,
        prescribed_date: "2024-01-15",
        status: "Pending",
      },
    ]

    const mockMedicines: Medicine[] = [
      { id: "M001", name: "Paracetamol 500mg", stock_quantity: 150 },
      { id: "M002", name: "Amoxicillin 250mg", stock_quantity: 80 },
      { id: "M003", name: "Ibuprofen 400mg", stock_quantity: 60 },
    ]

    setTimeout(() => {
      setPharmacyRecords(mockPharmacyRecords)
      setPrescriptions(mockPrescriptions)
      setMedicines(mockMedicines)
      setLoading(false)
    }, 1000)
  }, [])

  // Filter pharmacy records
  const filteredRecords = pharmacyRecords.filter((record) => {
    const matchesSearch =
      searchQuery === "" ||
      record.medicine_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.pharmacy_id.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = selectedStatus === "all" || record.status === selectedStatus

    return matchesSearch && matchesStatus
  })

  // Pagination
  const totalRecords = filteredRecords.length
  const totalPages = Math.ceil(totalRecords / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedRecords = filteredRecords.slice(startIndex, startIndex + pageSize)

  // Table columns
  const columns = [
    { key: "pharmacy_id", label: "Mã phiếu xuất", sortable: true },
    { key: "medicine_name", label: "Tên thuốc", sortable: true },
    { key: "patient_name", label: "Bệnh nhân", sortable: true },
    { key: "quantity", label: "Số lượng", sortable: true },
    { key: "prescription_date", label: "Ngày kê đơn", sortable: true },
    { key: "dispensed_date", label: "Ngày xuất", sortable: true },
    { key: "status", label: "Trạng thái", sortable: false },
  ]

  // Handle dispense from prescription
  const handleDispense = async (prescription: Prescription) => {
    const medicine = medicines.find((m) => m.id === prescription.medication_id)

    if (!medicine) {
      toast({
        title: "Lỗi",
        description: "Không tìm thấy thuốc trong kho",
        variant: "destructive",
      })
      return
    }

    if (medicine.stock_quantity < prescription.quantity) {
      toast({
        title: "Lỗi",
        description: "Không đủ thuốc trong kho",
        variant: "destructive",
      })
      return
    }

    // Create pharmacy record
    const newPharmacyRecord: PharmacyRecord = {
      pharmacy_id: `PH${String(pharmacyRecords.length + 1).padStart(3, "0")}`,
      medicine_name: prescription.medication_name,
      medicine_id: prescription.medication_id,
      patient_name: prescription.patient_name,
      patient_id: prescription.patient_id,
      quantity: prescription.quantity,
      prescription_date: prescription.prescribed_date,
      dispensed_date: new Date().toISOString().split("T")[0],
      dispensed_by: "DS. Hiện tại", // Current pharmacist
      status: "Dispensed",
    }

    // Update states
    setPharmacyRecords([...pharmacyRecords, newPharmacyRecord])
    setPrescriptions(prescriptions.filter((p) => p.id !== prescription.id))
    setMedicines(
      medicines.map((m) =>
        m.id === prescription.medication_id ? { ...m, stock_quantity: m.stock_quantity - prescription.quantity } : m,
      ),
    )

    toast({
      title: "Thành công",
      description: `Đã xuất thuốc cho đơn ${prescription.id}`,
    })

    setIsDispenseDialogOpen(false)
    setSelectedPrescription(null)
  }

  // Render table row
  const renderRow = (record: PharmacyRecord) => (
    <tr key={record.pharmacy_id} className="border-b hover:bg-muted/50">
      <td className="px-4 py-3 font-medium">{record.pharmacy_id}</td>
      <td className="px-4 py-3">{record.medicine_name}</td>
      <td className="px-4 py-3">{record.patient_name}</td>
      <td className="px-4 py-3">{record.quantity}</td>
      <td className="px-4 py-3">{new Date(record.prescription_date).toLocaleDateString("vi-VN")}</td>
      <td className="px-4 py-3">{new Date(record.dispensed_date).toLocaleDateString("vi-VN")}</td>
      <td className="px-4 py-3">
        <StatusBadge status={record.status} type="pharmacy" />
      </td>
    </tr>
  )

  const pendingPrescriptions = prescriptions.filter((p) => p.status === "Pending").length
  const todayDispensed = pharmacyRecords.filter(
    (r) => r.dispensed_date === new Date().toISOString().split("T")[0],
  ).length

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
          <h1 className="text-3xl font-bold">Quản lý Nhà thuốc</h1>
          <p className="text-muted-foreground">Theo dõi xuất thuốc và đơn thuốc</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard label="Đơn chờ xuất" value={pendingPrescriptions.toString()} />
        <KpiCard label="Xuất hôm nay" value={todayDispensed.toString()} />
        <KpiCard label="Tổng phiếu xuất" value={pharmacyRecords.length.toString()} />
        <KpiCard label="Loại thuốc" value={medicines.length.toString()} />
      </div>

      {/* Pending Prescriptions */}
      {prescriptions.filter((p) => p.status === "Pending").length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-orange-600" />
              Đơn thuốc chờ xuất
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {prescriptions
                .filter((p) => p.status === "Pending")
                .map((prescription) => (
                  <div key={prescription.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{prescription.patient_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {prescription.medication_name} - Số lượng: {prescription.quantity}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Ngày kê: {new Date(prescription.prescribed_date).toLocaleDateString("vi-VN")}
                      </div>
                    </div>
                    <Dialog open={isDispenseDialogOpen} onOpenChange={setIsDispenseDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => setSelectedPrescription(prescription)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Xuất thuốc
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Xác nhận xuất thuốc</DialogTitle>
                        </DialogHeader>
                        {selectedPrescription && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Mã đơn</Label>
                                <p className="font-medium">{selectedPrescription.id}</p>
                              </div>
                              <div>
                                <Label>Bệnh nhân</Label>
                                <p className="font-medium">{selectedPrescription.patient_name}</p>
                              </div>
                              <div>
                                <Label>Thuốc</Label>
                                <p className="font-medium">{selectedPrescription.medication_name}</p>
                              </div>
                              <div>
                                <Label>Số lượng</Label>
                                <p className="font-medium">{selectedPrescription.quantity}</p>
                              </div>
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" onClick={() => setIsDispenseDialogOpen(false)}>
                                Hủy
                              </Button>
                              <Button
                                className="bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => handleDispense(selectedPrescription)}
                              >
                                Xác nhận xuất thuốc
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Tìm kiếm</Label>
              <SearchBar onSearch={setSearchQuery} placeholder="Tìm theo thuốc, bệnh nhân..." />
            </div>
            <div>
              <Label>Trạng thái</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="Dispensed">Đã xuất</SelectItem>
                  <SelectItem value="Returned">Đã trả</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={paginatedRecords}
        total={totalRecords}
        page={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        renderRow={renderRow}
        emptyMessage="Không có phiếu xuất thuốc nào"
      />
    </div>
  )
}
