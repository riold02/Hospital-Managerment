"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Pill,
  Package,
  FileText,
  Truck,
  BarChart3,
  Activity,
  Clock,
  AlertTriangle,
  Check,
  X,
  CheckCircle,
  Printer,
  Search,
  Filter,
  ArrowRightLeft,
  Download,
  TrendingUp,
  Eye,
  Shield,
  Users,
  Droplets,
  UserCheck,
  LogOut,
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"

import PatientsPage from "../../patients/page"
import BloodBankPage from "../../blood-bank/page"

import { useAuth } from "@/lib/auth-context"

interface Prescription {
  id: string
  patient_name: string
  patient_id: string
  medication_name: string
  dosage: string
  frequency: string
  duration: string
  prescribed_by: string
  prescribed_date: string
  status: "Pending" | "Approved" | "Dispensed" | "Rejected" | "Cancelled"
  notes?: string
  priority: "Normal" | "Urgent" | "Emergency"
  interactions?: string[]
  alternatives?: string[]
}

interface Medicine {
  id: string
  name: string
  type: string
  stock_quantity: number
  expiry_date: string
  batch_number: string
  supplier: string
  unit_price: number
  location: string
  import_date: string
  min_stock_level: number
  therapeutic_class: string
}

interface StockTransaction {
  id: string
  type: "Import" | "Export" | "Transfer" | "Disposal"
  medicine_id: string
  medicine_name: string
  batch_number: string
  quantity: number
  from_location?: string
  to_location?: string
  reason: string
  performed_by: string
  timestamp: string
  supplier?: string
  cost?: number
}

interface DrugInteraction {
  drug1: string
  drug2: string
  severity: "Minor" | "Moderate" | "Major"
  description: string
  recommendation: string
}

export default function PharmacistDashboard() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [transactions, setTransactions] = useState<StockTransaction[]>([])
  const [interactions] = useState<DrugInteraction[]>([
    {
      drug1: "Warfarin",
      drug2: "Aspirin",
      severity: "Major",
      description: "Tăng nguy cơ chảy máu",
      recommendation: "Theo dõi chặt chẽ INR, giảm liều nếu cần",
    },
  ])

  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [activeTab, setActiveTab] = useState("prescriptions")

  // Dialog states
  const [dispenseDialogOpen, setDispenseDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [transferDialogOpen, setTransferDialogOpen] = useState(false)
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null)

  const { logout } = useAuth()

  useEffect(() => {
    const mockPrescriptions: Prescription[] = [
      {
        id: "RX001",
        patient_name: "Nguyễn Văn An",
        patient_id: "P001",
        medication_name: "Paracetamol 500mg",
        dosage: "500mg",
        frequency: "3 lần/ngày",
        duration: "7 ngày",
        prescribed_by: "BS. Trần Thị Bình",
        prescribed_date: "2024-01-15",
        status: "Pending",
        priority: "Normal",
        notes: "Uống sau ăn",
        interactions: [],
        alternatives: ["Ibuprofen 400mg", "Aspirin 500mg"],
      },
      {
        id: "RX002",
        patient_name: "Lê Thị Cẩm",
        patient_id: "P002",
        medication_name: "Warfarin 5mg",
        dosage: "5mg",
        frequency: "1 lần/ngày",
        duration: "30 ngày",
        prescribed_by: "BS. Phạm Văn Đức",
        prescribed_date: "2024-01-15",
        status: "Pending",
        priority: "Urgent",
        interactions: ["Aspirin"],
        alternatives: ["Rivaroxaban 10mg"],
      },
    ]

    const mockMedicines: Medicine[] = [
      {
        id: "M001",
        name: "Paracetamol 500mg",
        type: "Giảm đau",
        stock_quantity: 150,
        expiry_date: "2024-02-10",
        batch_number: "B001-2024",
        supplier: "Công ty Dược A",
        unit_price: 2000,
        location: "Kệ A1",
        import_date: "2023-12-01",
        min_stock_level: 50,
        therapeutic_class: "Analgesic",
      },
      {
        id: "M002",
        name: "Warfarin 5mg",
        type: "Chống đông máu",
        stock_quantity: 25,
        expiry_date: "2024-12-15",
        batch_number: "W001-2024",
        supplier: "Công ty Dược B",
        unit_price: 15000,
        location: "Kệ B2",
        import_date: "2024-01-01",
        min_stock_level: 20,
        therapeutic_class: "Anticoagulant",
      },
    ]

    const mockTransactions: StockTransaction[] = [
      {
        id: "T001",
        type: "Import",
        medicine_id: "M001",
        medicine_name: "Paracetamol 500mg",
        batch_number: "B001-2024",
        quantity: 200,
        reason: "Nhập hàng định kỳ",
        performed_by: "Dược sĩ Nguyễn A",
        timestamp: "2024-01-15T08:30:00",
        supplier: "Công ty Dược A",
        cost: 400000,
      },
      {
        id: "T002",
        type: "Export",
        medicine_id: "M001",
        medicine_name: "Paracetamol 500mg",
        batch_number: "B001-2024",
        quantity: 50,
        reason: "Xuất theo đơn RX001",
        performed_by: "Dược sĩ Nguyễn A",
        timestamp: "2024-01-15T10:15:00",
      },
    ]

    setTimeout(() => {
      setPrescriptions(mockPrescriptions)
      setMedicines(mockMedicines)
      setTransactions(mockTransactions)
      setLoading(false)
    }, 1000)
  }, [])

  const pendingPrescriptions = prescriptions.filter((p) => p.status === "Pending").length
  const urgentPrescriptions = prescriptions.filter((p) => p.priority === "Urgent" || p.priority === "Emergency").length
  const lowStockMedicines = medicines.filter((m) => m.stock_quantity <= m.min_stock_level).length
  const expiringMedicines = medicines.filter((m) => {
    const expiryDate = new Date(m.expiry_date)
    const today = new Date()
    const diffTime = expiryDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 90 && diffDays > 0
  }).length
  const expiredMedicines = medicines.filter((m) => new Date(m.expiry_date) < new Date()).length

  const handlePrescriptionAction = async (prescription: Prescription, action: "approve" | "reject" | "dispense") => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      let newStatus: Prescription["status"]
      let message = ""

      switch (action) {
        case "approve":
          newStatus = "Approved"
          message = `Đã duyệt đơn ${prescription.id}`
          break
        case "reject":
          newStatus = "Rejected"
          message = `Đã từ chối đơn ${prescription.id}`
          break
        case "dispense":
          newStatus = "Dispensed"
          message = `Đã xuất thuốc cho đơn ${prescription.id}`
          // Update stock
          setMedicines((prev) =>
            prev.map((m) =>
              m.name === prescription.medication_name ? { ...m, stock_quantity: Math.max(0, m.stock_quantity - 1) } : m,
            ),
          )
          break
      }

      setPrescriptions((prev) => prev.map((p) => (p.id === prescription.id ? { ...p, status: newStatus } : p)))

      toast({
        title: "Thành công",
        description: message,
      })

      setDispenseDialogOpen(false)
      setSelectedPrescription(null)
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể thực hiện thao tác. Vui lòng thử lại.",
        variant: "destructive",
      })
    }
  }

  const handleStockImport = async (importData: any) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Add new medicine or update existing
      const existingMedicine = medicines.find(
        (m) => m.name === importData.medicine_name && m.batch_number === importData.batch_number,
      )

      if (existingMedicine) {
        setMedicines((prev) =>
          prev.map((m) =>
            m.id === existingMedicine.id
              ? { ...m, stock_quantity: m.stock_quantity + Number.parseInt(importData.quantity) }
              : m,
          ),
        )
      } else {
        const newMedicine: Medicine = {
          id: `M${String(medicines.length + 1).padStart(3, "0")}`,
          name: importData.medicine_name,
          type: importData.type,
          stock_quantity: Number.parseInt(importData.quantity),
          expiry_date: importData.expiry_date,
          batch_number: importData.batch_number,
          supplier: importData.supplier,
          unit_price: Number.parseInt(importData.unit_price),
          location: importData.location,
          import_date: new Date().toISOString().split("T")[0],
          min_stock_level: Number.parseInt(importData.min_stock_level) || 20,
          therapeutic_class: importData.therapeutic_class,
        }
        setMedicines((prev) => [...prev, newMedicine])
      }

      // Add transaction record
      const newTransaction: StockTransaction = {
        id: `T${String(transactions.length + 1).padStart(3, "0")}`,
        type: "Import",
        medicine_id: existingMedicine?.id || `M${String(medicines.length + 1).padStart(3, "0")}`,
        medicine_name: importData.medicine_name,
        batch_number: importData.batch_number,
        quantity: Number.parseInt(importData.quantity),
        reason: importData.reason || "Nhập hàng",
        performed_by: "Dược sĩ hiện tại",
        timestamp: new Date().toISOString(),
        supplier: importData.supplier,
        cost: Number.parseInt(importData.quantity) * Number.parseInt(importData.unit_price),
      }
      setTransactions((prev) => [...prev, newTransaction])

      toast({
        title: "Thành công",
        description: "Đã nhập thuốc vào kho",
      })

      setImportDialogOpen(false)
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể nhập thuốc. Vui lòng thử lại.",
        variant: "destructive",
      })
    }
  }

  const getExpiryWarningLevel = (expiryDate: string) => {
    const expiry = new Date(expiryDate)
    const today = new Date()
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return "expired"
    if (diffDays <= 30) return "critical"
    if (diffDays <= 90) return "warning"
    return "normal"
  }

  const checkDrugInteractions = (medicationName: string) => {
    return interactions.filter(
      (interaction) =>
        interaction.drug1.toLowerCase().includes(medicationName.toLowerCase()) ||
        interaction.drug2.toLowerCase().includes(medicationName.toLowerCase()),
    )
  }

  const filteredMedicines = medicines.filter((medicine) => {
    const matchesSearch =
      medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicine.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === "all" || medicine.type === selectedType
    return matchesSearch && matchesType
  })

  const medicineTypes = [...new Set(medicines.map((m) => m.type))]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Vertical Sidebar */}
      <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Pill className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Dược Sĩ</h1>
              <p className="text-sm text-gray-500">Quản lý dược phẩm</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab("prescriptions")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeTab === "prescriptions"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <FileText className="w-5 h-5" />
            <span className="font-medium">Đơn Thuốc</span>
          </button>

          <button
            onClick={() => setActiveTab("inventory")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeTab === "inventory"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Package className="w-5 h-5" />
            <span className="font-medium">Kho Thuốc</span>
          </button>

          <button
            onClick={() => setActiveTab("transactions")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeTab === "transactions"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Truck className="w-5 h-5" />
            <span className="font-medium">Nhập/Xuất</span>
          </button>

          <button
            onClick={() => setActiveTab("reports")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeTab === "reports"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="font-medium">Báo Cáo</span>
          </button>

          <button
            onClick={() => setActiveTab("clinical")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeTab === "clinical"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Activity className="w-5 h-5" />
            <span className="font-medium">Dược Lâm Sàng</span>
          </button>

          <button
            onClick={() => setActiveTab("logs")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeTab === "logs"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Clock className="w-5 h-5" />
            <span className="font-medium">Nhật Ký</span>
          </button>

          <button
            onClick={() => setActiveTab("patients")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeTab === "patients"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="font-medium">Bệnh Nhân</span>
            <span className="ml-auto px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">Chỉ đọc</span>
          </button>

          <button
            onClick={() => setActiveTab("blood-bank")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeTab === "blood-bank"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Droplets className="w-5 h-5" />
            <span className="font-medium">Ngân Hàng Máu</span>
          </button>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
              <UserCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Dược sĩ Minh</p>
              <p className="text-xs text-gray-500">Khoa Dược</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full text-gray-600 bg-transparent" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" />
            Đăng Xuất
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Bảng Điều Khiển Dược Sĩ</h1>
            <p className="text-gray-600">Quản lý dược phẩm và đơn thuốc</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Đơn Chờ Duyệt</p>
                    <p className="text-2xl font-bold text-emerald-600">{pendingPrescriptions}</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Thuốc Sắp Hết</p>
                    <p className="text-2xl font-bold text-amber-600">{lowStockMedicines}</p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Thuốc Hết Hạn</p>
                    <p className="text-2xl font-bold text-red-600">{expiredMedicines}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tương Tác Thuốc</p>
                    <p className="text-2xl font-bold text-purple-600">{interactions.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs Content */}
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              {/* Enhanced Prescriptions Tab with approval workflow */}
              <TabsContent value="prescriptions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Pill className="w-5 h-5 text-emerald-600" />
                      Quản Lý Đơn Thuốc
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Mã Đơn</TableHead>
                          <TableHead>Bệnh Nhân</TableHead>
                          <TableHead>Thuốc</TableHead>
                          <TableHead>Liều Dùng</TableHead>
                          <TableHead>Ưu Tiên</TableHead>
                          <TableHead>Tương Tác</TableHead>
                          <TableHead>Trạng Thái</TableHead>
                          <TableHead>Hành Động</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {prescriptions.map((prescription) => {
                          const drugInteractions = checkDrugInteractions(prescription.medication_name)
                          return (
                            <TableRow key={prescription.id}>
                              <TableCell className="font-medium">{prescription.id}</TableCell>
                              <TableCell>{prescription.patient_name}</TableCell>
                              <TableCell>{prescription.medication_name}</TableCell>
                              <TableCell>
                                {prescription.dosage} - {prescription.frequency}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    prescription.priority === "Emergency"
                                      ? "destructive"
                                      : prescription.priority === "Urgent"
                                        ? "default"
                                        : "outline"
                                  }
                                >
                                  {prescription.priority}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {drugInteractions.length > 0 && (
                                  <Badge variant="destructive" className="text-xs">
                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                    {drugInteractions.length} tương tác
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    prescription.status === "Pending"
                                      ? "outline"
                                      : prescription.status === "Approved"
                                        ? "default"
                                        : prescription.status === "Dispensed"
                                          ? "secondary"
                                          : "destructive"
                                  }
                                >
                                  {prescription.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-1">
                                  {prescription.status === "Pending" && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-green-600 border-green-200 hover:bg-green-50 bg-transparent"
                                        onClick={() => handlePrescriptionAction(prescription, "approve")}
                                      >
                                        <Check className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                                        onClick={() => handlePrescriptionAction(prescription, "reject")}
                                      >
                                        <X className="w-4 h-4" />
                                      </Button>
                                    </>
                                  )}
                                  {prescription.status === "Approved" && (
                                    <Dialog open={dispenseDialogOpen} onOpenChange={setDispenseDialogOpen}>
                                      <DialogTrigger asChild>
                                        <Button
                                          size="sm"
                                          className="bg-emerald-600 hover:bg-emerald-700"
                                          onClick={() => setSelectedPrescription(prescription)}
                                        >
                                          <CheckCircle className="w-4 h-4 mr-1" />
                                          Xuất
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="max-w-2xl">
                                        <DialogHeader>
                                          <DialogTitle>Xuất Thuốc - Đơn {selectedPrescription?.id}</DialogTitle>
                                        </DialogHeader>
                                        {selectedPrescription && (
                                          <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                              <div>
                                                <Label>Bệnh Nhân</Label>
                                                <p className="font-medium">{selectedPrescription.patient_name}</p>
                                              </div>
                                              <div>
                                                <Label>Thuốc</Label>
                                                <p className="font-medium">{selectedPrescription.medication_name}</p>
                                              </div>
                                            </div>

                                            {/* Drug Interaction Warnings */}
                                            {checkDrugInteractions(selectedPrescription.medication_name).map(
                                              (interaction, idx) => (
                                                <div
                                                  key={idx}
                                                  className="p-3 bg-red-50 border border-red-200 rounded-lg"
                                                >
                                                  <div className="flex items-center gap-2 text-red-800 font-medium">
                                                    <AlertTriangle className="w-4 h-4" />
                                                    Cảnh báo tương tác ({interaction.severity})
                                                  </div>
                                                  <p className="text-sm text-red-700 mt-1">{interaction.description}</p>
                                                  <p className="text-sm text-red-600 mt-1 font-medium">
                                                    Khuyến cáo: {interaction.recommendation}
                                                  </p>
                                                </div>
                                              ),
                                            )}

                                            {/* FEFO Recommendation */}
                                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                              <div className="flex items-center gap-2 text-blue-800 font-medium">
                                                <Package className="w-4 h-4" />
                                                Gợi ý FEFO (First Expired, First Out)
                                              </div>
                                              <p className="text-sm text-blue-700 mt-1">
                                                Ưu tiên xuất lô: B001-2024 (hết hạn 10/02/2024)
                                              </p>
                                            </div>

                                            <div className="flex justify-end space-x-2">
                                              <Button variant="outline" onClick={() => setDispenseDialogOpen(false)}>
                                                Hủy
                                              </Button>
                                              <Button
                                                variant="outline"
                                                className="text-blue-600 border-blue-200 bg-transparent"
                                              >
                                                <Printer className="w-4 h-4 mr-1" />
                                                In Nhãn
                                              </Button>
                                              <Button
                                                className="bg-emerald-600 hover:bg-emerald-700"
                                                onClick={() =>
                                                  handlePrescriptionAction(selectedPrescription, "dispense")
                                                }
                                              >
                                                Xác Nhận Xuất
                                              </Button>
                                            </div>
                                          </div>
                                        )}
                                      </DialogContent>
                                    </Dialog>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Enhanced Inventory Tab with batch management */}
              <TabsContent value="inventory" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-emerald-600" />
                        Quản Lý Kho Thuốc
                      </CardTitle>
                      <div className="flex space-x-2">
                        <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                          <DialogTrigger asChild>
                            <Button className="bg-emerald-600 hover:bg-emerald-700">
                              <Truck className="w-4 h-4 mr-1" />
                              Nhập Thuốc
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Phiếu Nhập Thuốc</DialogTitle>
                            </DialogHeader>
                            <form
                              onSubmit={(e) => {
                                e.preventDefault()
                                const formData = new FormData(e.currentTarget)
                                handleStockImport(Object.fromEntries(formData))
                              }}
                            >
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="medicine_name">Tên Thuốc</Label>
                                  <Input id="medicine_name" name="medicine_name" required />
                                </div>
                                <div>
                                  <Label htmlFor="type">Loại Thuốc</Label>
                                  <Input id="type" name="type" required />
                                </div>
                                <div>
                                  <Label htmlFor="batch_number">Số Lô</Label>
                                  <Input id="batch_number" name="batch_number" required />
                                </div>
                                <div>
                                  <Label htmlFor="quantity">Số Lượng</Label>
                                  <Input id="quantity" name="quantity" type="number" required />
                                </div>
                                <div>
                                  <Label htmlFor="expiry_date">Hạn Sử Dụng</Label>
                                  <Input id="expiry_date" name="expiry_date" type="date" required />
                                </div>
                                <div>
                                  <Label htmlFor="supplier">Nhà Cung Cấp</Label>
                                  <Input id="supplier" name="supplier" required />
                                </div>
                                <div>
                                  <Label htmlFor="unit_price">Giá Nhập (VNĐ)</Label>
                                  <Input id="unit_price" name="unit_price" type="number" required />
                                </div>
                                <div>
                                  <Label htmlFor="location">Vị Trí Lưu Trữ</Label>
                                  <Input id="location" name="location" required />
                                </div>
                                <div>
                                  <Label htmlFor="min_stock_level">Mức Tồn Tối Thiểu</Label>
                                  <Input id="min_stock_level" name="min_stock_level" type="number" defaultValue="20" />
                                </div>
                                <div>
                                  <Label htmlFor="therapeutic_class">Nhóm Điều Trị</Label>
                                  <Input id="therapeutic_class" name="therapeutic_class" />
                                </div>
                              </div>
                              <div className="mt-4">
                                <Label htmlFor="reason">Lý Do Nhập</Label>
                                <Textarea id="reason" name="reason" placeholder="Nhập hàng định kỳ..." />
                              </div>
                              <div className="flex justify-end space-x-2 mt-4">
                                <Button type="button" variant="outline" onClick={() => setImportDialogOpen(false)}>
                                  Hủy
                                </Button>
                                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                                  Nhập Kho
                                </Button>
                              </div>
                            </form>
                          </DialogContent>
                        </Dialog>

                        <Button variant="outline" className="text-blue-600 border-blue-200 bg-transparent">
                          <ArrowRightLeft className="w-4 h-4 mr-1" />
                          Chuyển Kho
                        </Button>
                      </div>
                    </div>

                    {/* Search and Filter */}
                    <div className="flex items-center space-x-4 mt-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Tìm kiếm thuốc, số lô..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Select value={selectedType} onValueChange={setSelectedType}>
                        <SelectTrigger className="w-48">
                          <Filter className="w-4 h-4 mr-2" />
                          <SelectValue placeholder="Lọc theo loại" />
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
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tên Thuốc</TableHead>
                          <TableHead>Số Lô</TableHead>
                          <TableHead>Tồn Kho</TableHead>
                          <TableHead>Hạn Sử Dụng</TableHead>
                          <TableHead>Vị Trí</TableHead>
                          <TableHead>Nhà Cung Cấp</TableHead>
                          <TableHead>Giá</TableHead>
                          <TableHead>Cảnh Báo</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredMedicines.map((medicine) => {
                          const expiryLevel = getExpiryWarningLevel(medicine.expiry_date)
                          const isLowStock = medicine.stock_quantity <= medicine.min_stock_level

                          return (
                            <TableRow
                              key={medicine.id}
                              className={
                                expiryLevel === "critical"
                                  ? "bg-red-50"
                                  : expiryLevel === "warning"
                                    ? "bg-amber-50"
                                    : ""
                              }
                            >
                              <TableCell className="font-medium">{medicine.name}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="font-mono text-xs">
                                  {medicine.batch_number}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <span className={isLowStock ? "text-red-600 font-semibold" : ""}>
                                  {medicine.stock_quantity}
                                </span>
                                {isLowStock && <AlertTriangle className="w-4 h-4 text-red-500 inline ml-1" />}
                              </TableCell>
                              <TableCell>
                                <span
                                  className={
                                    expiryLevel === "expired"
                                      ? "text-red-600 font-semibold"
                                      : expiryLevel === "critical"
                                        ? "text-red-600 font-semibold"
                                        : expiryLevel === "warning"
                                          ? "text-amber-600 font-semibold"
                                          : ""
                                  }
                                >
                                  {new Date(medicine.expiry_date).toLocaleDateString("vi-VN")}
                                </span>
                              </TableCell>
                              <TableCell>{medicine.location}</TableCell>
                              <TableCell>{medicine.supplier}</TableCell>
                              <TableCell>{medicine.unit_price.toLocaleString("vi-VN")} VNĐ</TableCell>
                              <TableCell>
                                <div className="flex space-x-1">
                                  {expiryLevel === "expired" && (
                                    <Badge variant="destructive" className="text-xs">
                                      Hết hạn
                                    </Badge>
                                  )}
                                  {expiryLevel === "critical" && (
                                    <Badge variant="destructive" className="text-xs">
                                      Trong 30 ngày
                                    </Badge>
                                  )}
                                  {expiryLevel === "warning" && (
                                    <Badge variant="outline" className="text-amber-600 border-amber-200 text-xs">
                                      Trong 90 ngày
                                    </Badge>
                                  )}
                                  {isLowStock && (
                                    <Badge variant="outline" className="text-red-600 border-red-200 text-xs">
                                      Sắp hết
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* New Transactions Tab */}
              <TabsContent value="transactions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-emerald-600" />
                      Lịch Sử Nhập - Xuất - Tồn
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Thời Gian</TableHead>
                          <TableHead>Loại</TableHead>
                          <TableHead>Thuốc</TableHead>
                          <TableHead>Số Lô</TableHead>
                          <TableHead>Số Lượng</TableHead>
                          <TableHead>Lý Do</TableHead>
                          <TableHead>Người Thực Hiện</TableHead>
                          <TableHead>Chi Phí</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell>{new Date(transaction.timestamp).toLocaleString("vi-VN")}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  transaction.type === "Import"
                                    ? "default"
                                    : transaction.type === "Export"
                                      ? "secondary"
                                      : "outline"
                                }
                              >
                                {transaction.type}
                              </Badge>
                            </TableCell>
                            <TableCell>{transaction.medicine_name}</TableCell>
                            <TableCell className="font-mono text-sm">{transaction.batch_number}</TableCell>
                            <TableCell className={transaction.type === "Export" ? "text-red-600" : "text-green-600"}>
                              {transaction.type === "Export" ? "-" : "+"}
                              {transaction.quantity}
                            </TableCell>
                            <TableCell>{transaction.reason}</TableCell>
                            <TableCell>{transaction.performed_by}</TableCell>
                            <TableCell>
                              {transaction.cost ? `${transaction.cost.toLocaleString("vi-VN")} VNĐ` : "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* New Reports Tab */}
              <TabsContent value="reports" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-emerald-600" />
                        Báo Cáo Tồn Kho
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span>Tổng giá trị tồn kho:</span>
                          <span className="font-bold text-emerald-600">
                            {medicines
                              .reduce((sum, m) => sum + m.stock_quantity * m.unit_price, 0)
                              .toLocaleString("vi-VN")}{" "}
                            VNĐ
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Số loại thuốc:</span>
                          <span className="font-bold">{medicines.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Thuốc cần nhập thêm:</span>
                          <span className="font-bold text-amber-600">{lowStockMedicines}</span>
                        </div>
                        <Button className="w-full bg-transparent" variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Xuất Báo Cáo Excel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                        Thống Kê Tiêu Thụ
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span>Đơn thuốc hôm nay:</span>
                          <span className="font-bold text-blue-600">
                            {
                              prescriptions.filter((p) => p.prescribed_date === new Date().toISOString().split("T")[0])
                                .length
                            }
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Tỷ lệ xuất thuốc:</span>
                          <span className="font-bold text-green-600">
                            {Math.round(
                              (prescriptions.filter((p) => p.status === "Dispensed").length / prescriptions.length) *
                                100,
                            )}
                            %
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Thuốc hủy (hết hạn):</span>
                          <span className="font-bold text-red-600">{expiredMedicines}</span>
                        </div>
                        <Button className="w-full bg-transparent" variant="outline">
                          <Eye className="w-4 h-4 mr-2" />
                          Xem Chi Tiết
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* New Clinical Pharmacy Tab */}
              <TabsContent value="clinical" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-emerald-600" />
                      Dược Lâm Sàng
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <h3 className="font-semibold text-red-800 mb-2">Cảnh Báo Tương Tác Thuốc</h3>
                        {interactions.map((interaction, idx) => (
                          <div key={idx} className="mb-3 last:mb-0">
                            <div className="flex items-center gap-2 text-red-700">
                              <AlertTriangle className="w-4 h-4" />
                              <span className="font-medium">
                                {interaction.drug1} + {interaction.drug2}
                              </span>
                              <Badge variant="destructive" className="text-xs">
                                {interaction.severity}
                              </Badge>
                            </div>
                            <p className="text-sm text-red-600 mt-1">{interaction.description}</p>
                            <p className="text-sm text-red-700 font-medium mt-1">
                              Khuyến cáo: {interaction.recommendation}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 className="font-semibold text-blue-800 mb-2">Khuyến Cáo Điều Chỉnh Liều</h3>
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="font-medium">Warfarin 5mg:</span> Giảm liều xuống 2.5mg cho bệnh nhân &gt;
                            65 tuổi
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Paracetamol:</span> Không quá 3g/ngày cho bệnh nhân có bệnh
                            gan
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* New Activity Logs Tab */}
              <TabsContent value="logs" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-emerald-600" />
                      Nhật Ký Hoạt Động
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {transactions.slice(0, 10).map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                transaction.type === "Import"
                                  ? "bg-green-500"
                                  : transaction.type === "Export"
                                    ? "bg-blue-500"
                                    : "bg-gray-500"
                              }`}
                            />
                            <div>
                              <p className="text-sm font-medium">
                                {transaction.type === "Import"
                                  ? "Nhập thuốc"
                                  : transaction.type === "Export"
                                    ? "Xuất thuốc"
                                    : "Chuyển kho"}
                                {": "}
                                {transaction.medicine_name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {transaction.performed_by} • {new Date(transaction.timestamp).toLocaleString("vi-VN")}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {transaction.type === "Export" ? "-" : "+"}
                            {transaction.quantity}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="patients" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-emerald-600" />
                      Danh Sách Bệnh Nhân
                      <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">Chỉ đọc</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="pharmacist-patients-readonly">
                      <PatientsPage />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="blood-bank" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Droplets className="w-5 h-5 text-emerald-600" />
                      Quản Lý Ngân Hàng Máu
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BloodBankPage />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .pharmacist-patients-readonly button:has(svg.lucide-plus),
        .pharmacist-patients-readonly button:has(svg.lucide-edit),
        .pharmacist-patients-readonly button:has(svg.lucide-trash),
        .pharmacist-patients-readonly button:has(svg.lucide-user-plus),
        .pharmacist-patients-readonly button:has(svg.lucide-settings),
        .pharmacist-patients-readonly button[aria-label*="Thêm"],
        .pharmacist-patients-readonly button[aria-label*="Sửa"],
        .pharmacist-patients-readonly button[aria-label*="Xóa"],
        .pharmacist-patients-readonly .admin-actions,
        .pharmacist-patients-readonly [data-admin-action] {
          display: none !important;
        }
      `}</style>
    </div>
  )
}
