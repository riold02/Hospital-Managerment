"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Helper function to map status from English to Vietnamese
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

// Helper function to get status badge color
const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 'Active': return "default" // Blue
    case 'Filled': return "secondary" // Green
    case 'Cancelled': return "destructive" // Red
    case 'Expired': return "outline" // Gray
    default: return "outline"
  }
}
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import {
  Pill,
  Package,
  FileText,
  BarChart3,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  Search,
  TrendingUp,
  Eye,
  Users,
  LogOut,
  User,
  Home,
  Calendar,
  Building2,
  Droplets,
  Save,
  Plus
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { pharmacyApi, medicineApi, PharmacyDashboardData, Medicine, PharmacyRecord, PendingPrescription } from "@/lib/api"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function PharmacyDashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  // Dashboard Data States
  const [dashboardData, setDashboardData] = useState<PharmacyDashboardData | null>(null)
  const [allPrescriptions, setAllPrescriptions] = useState<PendingPrescription[]>([])
  const [pendingPrescriptions, setPendingPrescriptions] = useState<PendingPrescription[]>([])
  const [medicineInventory, setMedicineInventory] = useState<Medicine[]>([])
  const [pharmacyRecords, setPharmacyRecords] = useState<PharmacyRecord[]>([])
  const [expiringMedicines, setExpiringMedicines] = useState<Medicine[]>([])
  
  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [daysFilter, setDaysFilter] = useState<number>(0) // 0 = Tất cả thời gian
  const [statusFilter, setStatusFilter] = useState<string>('all') // pending, dispensed, all - mặc định show all
  
  // Dispense Form State
  const [dispenseForm, setDispenseForm] = useState({
    patient_id: "",
    medicine_id: "",
    quantity: "",
    notes: ""
  })

  // Add Medicine Dialog State
  const [addMedicineOpen, setAddMedicineOpen] = useState(false)
  const [addMedicineForm, setAddMedicineForm] = useState({
    name: "",
    brand: "",
    type: "",
    dosage: "",
    stock_quantity: "",
    expiry_date: ""
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    setLoading(true)
    
    try {
      // Load pharmacy dashboard data
      const dashboardResponse = await pharmacyApi.getDashboard()
      setDashboardData(dashboardResponse)

      // Load ALL prescriptions (both Active and Filled) for filtering
      const allPrescriptionsResponse = await pharmacyApi.getPendingPrescriptions({ limit: 100, status: 'all' })
      setAllPrescriptions(allPrescriptionsResponse.data)
      setPendingPrescriptions(allPrescriptionsResponse.data) // Initial display

      // Load medicine inventory
      const inventoryResponse = await pharmacyApi.getMedicineInventory({ limit: 50 })
      setMedicineInventory(inventoryResponse.data)

      // Load pharmacy records
      const recordsResponse = await pharmacyApi.getPharmacyRecords({ limit: 20 })
      setPharmacyRecords(recordsResponse.data)

      // Load expiring medicines
      const expiringResponse = await pharmacyApi.getExpiringMedicines({ days: 30, limit: 10 })
      setExpiringMedicines(expiringResponse.data)

    } catch (error) {
      console.error("Error loading pharmacy dashboard data:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu dashboard",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDispenseMedicine = async () => {
    try {
      if (!dispenseForm.patient_id || !dispenseForm.medicine_id || !dispenseForm.quantity) {
        toast({
          title: "Lỗi",
          description: "Vui lòng điền đầy đủ thông tin",
          variant: "destructive",
        })
        return
      }

      const dispenseData = {
        patient_id: parseInt(dispenseForm.patient_id),
        medicine_id: parseInt(dispenseForm.medicine_id),
        quantity: parseInt(dispenseForm.quantity),
        notes: dispenseForm.notes
      }

      await pharmacyApi.dispenseMedicine(dispenseData)
      
      toast({
        title: "Thành công",
        description: "Đã cấp phát thuốc thành công",
      })

      // Reset form and reload data
      setDispenseForm({
        patient_id: "",
        medicine_id: "",
        quantity: "",
        notes: ""
      })
      
      loadDashboardData()

    } catch (error) {
      console.error("Error dispensing medicine:", error)
      toast({
        title: "Lỗi",
        description: "Không thể cấp phát thuốc",
        variant: "destructive",
      })
    }
  }

  const handleDispensePrescription = async (prescription: PendingPrescription) => {
    try {
      // Check if all items have sufficient stock
      const insufficientStockItems = prescription.items.filter(
        item => item.medicine.stock_quantity < item.quantity
      )

      if (insufficientStockItems.length > 0) {
        const itemNames = insufficientStockItems.map(item => item.medicine.name).join(', ')
        toast({
          title: "Lỗi",
          description: `Không đủ tồn kho cho: ${itemNames}`,
          variant: "destructive",
        })
        return
      }

      // Dispense all items in the prescription
      await pharmacyApi.dispenseMedicine({
        prescription_id: prescription.prescription_id
      })
      
      const itemCount = prescription.items.length
      toast({
        title: "Thành công",
        description: `Đã cấp phát ${itemCount} thuốc cho ${prescription.patient.first_name} ${prescription.patient.last_name}`,
      })
      
      loadDashboardData()

    } catch (error: any) {
      console.error("Error dispensing prescription:", error)
      toast({
        title: "Lỗi",
        description: error?.response?.data?.error || "Không thể cấp phát thuốc theo đơn",
        variant: "destructive",
      })
    }
  }

  const handleAddMedicine = async () => {
    try {
      if (!addMedicineForm.name) {
        toast({
          title: "Lỗi",
          description: "Vui lòng nhập tên thuốc",
          variant: "destructive",
        })
        return
      }

      const medicineData = {
        name: addMedicineForm.name,
        brand: addMedicineForm.brand || undefined,
        type: addMedicineForm.type || undefined,
        dosage: addMedicineForm.dosage || undefined,
        stock_quantity: addMedicineForm.stock_quantity ? parseInt(addMedicineForm.stock_quantity) : 0,
        expiry_date: addMedicineForm.expiry_date || undefined
      }

      await medicineApi.createMedicine(medicineData)
      
      toast({
        title: "Thành công",
        description: `Đã thêm thuốc ${addMedicineForm.name} vào kho`,
      })

      // Reset form and close dialog
      setAddMedicineForm({
        name: "",
        brand: "",
        type: "",
        dosage: "",
        stock_quantity: "",
        expiry_date: ""
      })
      setAddMedicineOpen(false)
      
      // Reload data
      loadDashboardData()

    } catch (error: any) {
      console.error("Error adding medicine:", error)
      toast({
        title: "Lỗi",
        description: error?.response?.data?.error || "Không thể thêm thuốc",
        variant: "destructive",
      })
    }
  }

  const handleFillFormFromPrescription = (prescription: PendingPrescription) => {
    // For now, this function is deprecated since we dispense entire prescriptions at once
    // Could be used in future for partial dispensing
    toast({
      title: "Thông báo",
      description: "Vui lòng sử dụng nút 'Cấp phát' để cấp phát toàn bộ đơn thuốc",
    })
  }

  const handleUpdateStock = async (medicineId: number, newStock: number) => {
    try {
      await pharmacyApi.updateMedicineStock(medicineId, { stock_quantity: newStock })
      
      toast({
        title: "Thành công",
        description: "Đã cập nhật tồn kho thành công",
      })
      
      loadDashboardData()

    } catch (error) {
      console.error("Error updating stock:", error)
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật tồn kho",
        variant: "destructive",
      })
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/auth')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Filter prescriptions by date range and status
  const filterPrescriptions = (prescriptions: PendingPrescription[]) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return prescriptions.filter((prescription: PendingPrescription) => {
      // Date filter
      if (daysFilter !== 0) { // Only filter by date if not "Tất cả thời gian"
        const prescriptionDate = new Date(prescription.prescription_date);
        prescriptionDate.setHours(0, 0, 0, 0);

        if (daysFilter > 0) {
          // Forward: today to today + daysFilter
          const maxDate = new Date(now);
          maxDate.setDate(maxDate.getDate() + daysFilter);
          if (prescriptionDate < now || prescriptionDate > maxDate) return false;
        } else if (daysFilter < 0) {
          // Backward: today - |daysFilter| to today
          const minDate = new Date(now);
          minDate.setDate(minDate.getDate() + daysFilter);
          if (prescriptionDate < minDate || prescriptionDate > now) return false;
        }
      }

      // Status filter
      if (statusFilter === 'all') return true;
      if (statusFilter === 'pending') return prescription.status === 'Active'; // Active means pending to dispense
      if (statusFilter === 'dispensed') return prescription.status === 'Filled'; // Filled means already dispensed
      return true;
    });
  };

  // Apply filters when filter options change
  useEffect(() => {
    const filtered = filterPrescriptions(allPrescriptions);
    setPendingPrescriptions(filtered);
  }, [daysFilter, statusFilter, allPrescriptions]);

  const filteredMedicines = medicineInventory.filter(medicine =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.brand.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <Pill className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Dashboard Dược sĩ</h1>
              <p className="text-sm text-gray-500">
                {mounted ? (user?.full_name || user?.email || "Dược sĩ") : "Đang tải..."}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {[
            { value: "overview", label: "Tổng quan", icon: Home },
            { value: "pending", label: "Đơn chờ", icon: Clock, badge: pendingPrescriptions.length },
            { value: "inventory", label: "Kho thuốc", icon: Package },
            { value: "dispense", label: "Cấp phát", icon: Pill },
            { value: "records", label: "Lịch sử", icon: FileText },
            { value: "expiring", label: "Sắp hết hạn", icon: AlertTriangle, badge: expiringMedicines.length },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.value

            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm
                  transition-all duration-200 ease-in-out
                  ${
                    isActive
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg"
                      : "text-gray-600 hover:text-green-600 hover:bg-green-50"
                  }
                `}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-white" : ""}`} />
                <span className="flex-1 text-left">{tab.label}</span>
                {tab.badge && tab.badge > 0 && (
                  <span
                    className={`
                    min-w-5 h-5 rounded-full text-xs font-bold
                    flex items-center justify-center
                    ${isActive ? "bg-white text-green-600" : "bg-red-500 text-white"}
                  `}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-gray-200">
          <div className="p-4 bg-gray-50">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-user.jpg" alt="Pharmacist Avatar" />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {mounted ? (user?.full_name || user?.email || "Dược sĩ") : "Đang tải..."}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {mounted ? (user?.email || "pharmacist@hospital.vn") : "..."}
                </p>
                <Badge variant="secondary" className="text-xs mt-1">
                  PHARMACIST
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="p-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {activeTab === "overview" && "Tổng quan"}
                {activeTab === "pending" && "Đơn thuốc chờ xử lý"}
                {activeTab === "inventory" && "Kho thuốc"}
                {activeTab === "dispense" && "Cấp phát thuốc"}
                {activeTab === "records" && "Lịch sử cấp phát"}
                {activeTab === "expiring" && "Thuốc sắp hết hạn"}
              </h2>
              {mounted && (
                <p className="text-sm text-gray-500">
                  Chào buổi {new Date().getHours() < 12 ? "sáng" : new Date().getHours() < 18 ? "chiều" : "tối"}, {" "}
                  {user?.full_name || user?.email || "Dược sĩ"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Package className="h-8 w-8 text-blue-600 mb-2" />
                        <p className="text-3xl font-bold text-blue-800">
                          {dashboardData?.overview?.totalMedicines || 0}
                        </p>
                        <p className="text-sm font-medium text-blue-600">Tổng thuốc</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <FileText className="h-8 w-8 text-green-600 mb-2" />
                        <p className="text-3xl font-bold text-green-800">
                          {dashboardData?.overview?.todayDispensed || 0}
                        </p>
                        <p className="text-sm font-medium text-green-600">Lượt cấp phát</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <AlertTriangle className="h-8 w-8 text-yellow-600 mb-2" />
                        <p className="text-3xl font-bold text-yellow-800">
                          {dashboardData?.overview?.lowStockMedicines || 0}
                        </p>
                        <p className="text-sm font-medium text-yellow-600">Sắp hết</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Clock className="h-8 w-8 text-purple-600 mb-2" />
                        <p className="text-3xl font-bold text-purple-800">
                          {dashboardData?.overview?.pendingPrescriptions || 0}
                        </p>
                        <p className="text-sm font-medium text-purple-600">Đơn chờ</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Records */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-600" />
                    Hoạt động gần đây
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pharmacyRecords && pharmacyRecords.length > 0 ? pharmacyRecords.slice(0, 5).map((record) => (
                      <div key={record.pharmacy_id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-green-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <Pill className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold">
                              {record.patient.first_name} {record.patient.last_name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {record.medicine.name} - {record.quantity} {record.medicine.type}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(record.prescription_date).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">
                          Đã cấp phát
                        </Badge>
                      </div>
                    )) : (
                      <div className="text-center py-8 text-gray-500">
                        <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Chưa có hoạt động nào</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pending Prescriptions Tab */}
            <TabsContent value="pending" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="space-y-4">
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-purple-600" />
                      Đơn thuốc
                      <Badge variant="secondary" className="ml-2">
                        {pendingPrescriptions.length} đơn
                      </Badge>
                    </CardTitle>
                    
                    {/* Filter Controls */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Label className="font-semibold">Thời gian:</Label>
                        <Select value={daysFilter.toString()} onValueChange={(value) => setDaysFilter(Number(value))}>
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Chọn khoảng thời gian" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Tất cả thời gian</SelectItem>
                            <SelectItem value="-30">30 ngày trước</SelectItem>
                            <SelectItem value="-7">7 ngày trước</SelectItem>
                            <SelectItem value="7">7 ngày tới</SelectItem>
                            <SelectItem value="30">30 ngày tới</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Label className="font-semibold">Trạng thái:</Label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Chọn trạng thái" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tất cả</SelectItem>
                            <SelectItem value="pending">Chờ xử lý</SelectItem>
                            <SelectItem value="dispensed">Đã cấp</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="ml-auto text-sm text-muted-foreground">
                        Hiển thị <span className="font-semibold text-primary">{pendingPrescriptions.length}</span> / <span className="font-semibold">{allPrescriptions.length}</span> đơn thuốc
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingPrescriptions && pendingPrescriptions.length > 0 ? pendingPrescriptions.map((prescription) => (
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
                                onClick={() => handleDispensePrescription(prescription)}
                                className="bg-green-600 hover:bg-green-700"
                                disabled={prescription.status === 'Filled'}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {prescription.status === 'Filled' ? 'Đã cấp phát' : 'Cấp phát'}
                              </Button>
                            </div>
                          </div>
                          
                          {/* Medicine items list */}
                          <div className="pl-4 border-l-2 border-green-500 space-y-2">
                            {prescription.items && prescription.items.length > 0 ? prescription.items.map((item) => (
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
                    )) : (
                      <div className="text-center py-12 text-gray-500">
                        <Clock className="h-16 w-16 mx-auto mb-4 opacity-30" />
                        <h3 className="text-lg font-medium mb-2">Không có đơn thuốc chờ xử lý</h3>
                        <p>Tất cả đơn thuốc đã được xử lý.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Medicine Inventory Tab */}
            <TabsContent value="inventory" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-blue-600" />
                      Kho thuốc ({filteredMedicines.length})
                    </CardTitle>
                    <Button 
                      onClick={() => setAddMedicineOpen(true)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm thuốc
                    </Button>
                  </div>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Tìm kiếm thuốc..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tên thuốc</TableHead>
                          <TableHead>Loại</TableHead>
                          <TableHead>Thương hiệu</TableHead>
                          <TableHead>Tồn kho</TableHead>
                          <TableHead>Hạn dùng</TableHead>
                          <TableHead>Thao tác</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredMedicines.map((medicine) => (
                          <TableRow key={medicine.medicine_id}>
                            <TableCell className="font-medium">{medicine.name}</TableCell>
                            <TableCell>{medicine.type}</TableCell>
                            <TableCell>{medicine.brand}</TableCell>
                            <TableCell>
                              <Badge variant={medicine.stock_quantity < 10 ? "destructive" : "secondary"}>
                                {medicine.stock_quantity}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {medicine.expiry_date ? new Date(medicine.expiry_date).toLocaleDateString('vi-VN') : 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Button size="sm" variant="outline">
                                <Eye className="h-3 w-3 mr-1" />
                                Xem
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Dispense Medicine Tab */}
            <TabsContent value="dispense" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="h-5 w-5 text-green-600" />
                    Cấp phát thuốc
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                    <p className="text-sm text-blue-800">
                      💡 <strong>Mẹo:</strong> Chọn đơn thuốc từ tab "Đơn thuốc chờ" rồi nhấn "Chi tiết" để điền form tự động
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>ID Bệnh nhân *</Label>
                      <Input
                        type="number"
                        placeholder="Nhập ID bệnh nhân"
                        value={dispenseForm.patient_id}
                        onChange={(e) => setDispenseForm(prev => ({...prev, patient_id: e.target.value}))}
                      />
                      <p className="text-xs text-gray-500">Ví dụ: 1, 2, 3...</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Chọn thuốc *</Label>
                      <Select 
                        value={dispenseForm.medicine_id} 
                        onValueChange={(value) => setDispenseForm(prev => ({...prev, medicine_id: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn thuốc từ kho" />
                        </SelectTrigger>
                        <SelectContent>
                          {medicineInventory.map((medicine) => (
                            <SelectItem key={medicine.medicine_id} value={medicine.medicine_id.toString()}>
                              {medicine.name} ({medicine.brand}) - Tồn: {medicine.stock_quantity}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Số lượng *</Label>
                      <Input
                        type="number"
                        placeholder="Nhập số lượng"
                        value={dispenseForm.quantity}
                        onChange={(e) => setDispenseForm(prev => ({...prev, quantity: e.target.value}))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Ghi chú</Label>
                    <Input
                      placeholder="Ghi chú về liều dùng, tần suất..."
                      value={dispenseForm.notes}
                      onChange={(e) => setDispenseForm(prev => ({...prev, notes: e.target.value}))}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleDispenseMedicine} className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Cấp phát thuốc
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setDispenseForm({ patient_id: "", medicine_id: "", quantity: "", notes: "" })}
                    >
                      Xóa form
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Other tabs */}
            <TabsContent value="records">
              <Card>
                <CardHeader>
                  <CardTitle>Lịch sử cấp phát</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Chức năng lịch sử cấp phát đang được phát triển...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="expiring">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    Thuốc sắp hết hạn trong vòng 30 ngày
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">
                    Danh sách các loại thuốc còn hạn dùng nhưng sẽ hết hạn trong vòng 1 tháng tới
                  </p>
                </CardHeader>
                <CardContent>
                  {expiringMedicines.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                      <p className="text-gray-600">Không có thuốc nào sắp hết hạn trong 30 ngày tới</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tên thuốc</TableHead>
                            <TableHead>Loại</TableHead>
                            <TableHead>Thương hiệu</TableHead>
                            <TableHead>Tồn kho</TableHead>
                            <TableHead>Hạn dùng</TableHead>
                            <TableHead>Còn lại (ngày)</TableHead>
                            <TableHead>Trạng thái</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {expiringMedicines.map((medicine) => {
                            const expiryDate = new Date(medicine.expiry_date);
                            const today = new Date();
                            const daysLeft = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                            const urgencyLevel = daysLeft <= 7 ? 'critical' : daysLeft <= 15 ? 'warning' : 'normal';
                            
                            return (
                              <TableRow key={medicine.medicine_id} className={
                                urgencyLevel === 'critical' ? 'bg-red-50' : 
                                urgencyLevel === 'warning' ? 'bg-orange-50' : 
                                'bg-yellow-50'
                              }>
                                <TableCell className="font-medium">{medicine.name}</TableCell>
                                <TableCell>{medicine.type}</TableCell>
                                <TableCell>{medicine.brand}</TableCell>
                                <TableCell>
                                  <Badge variant={medicine.stock_quantity < 10 ? "destructive" : "secondary"}>
                                    {medicine.stock_quantity}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {expiryDate.toLocaleDateString('vi-VN')}
                                </TableCell>
                                <TableCell>
                                  <Badge variant={
                                    urgencyLevel === 'critical' ? 'destructive' : 
                                    urgencyLevel === 'warning' ? 'default' : 
                                    'secondary'
                                  }>
                                    {daysLeft} ngày
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {urgencyLevel === 'critical' && (
                                    <span className="text-xs text-red-600 font-semibold">🔴 Khẩn cấp</span>
                                  )}
                                  {urgencyLevel === 'warning' && (
                                    <span className="text-xs text-orange-600 font-semibold">⚠️ Cảnh báo</span>
                                  )}
                                  {urgencyLevel === 'normal' && (
                                    <span className="text-xs text-yellow-600 font-semibold">⏰ Theo dõi</span>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Add Medicine Dialog */}
      <Dialog open={addMedicineOpen} onOpenChange={setAddMedicineOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-green-600" />
              Thêm thuốc mới vào kho
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="medicine-name">
                Tên thuốc <span className="text-red-500">*</span>
              </Label>
              <Input
                id="medicine-name"
                placeholder="Ví dụ: Paracetamol"
                value={addMedicineForm.name}
                onChange={(e) => setAddMedicineForm(prev => ({...prev, name: e.target.value}))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="medicine-brand">Thương hiệu</Label>
                <Input
                  id="medicine-brand"
                  placeholder="Ví dụ: Stada"
                  value={addMedicineForm.brand}
                  onChange={(e) => setAddMedicineForm(prev => ({...prev, brand: e.target.value}))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="medicine-type">Loại thuốc</Label>
                <Input
                  id="medicine-type"
                  placeholder="Ví dụ: Giảm đau"
                  value={addMedicineForm.type}
                  onChange={(e) => setAddMedicineForm(prev => ({...prev, type: e.target.value}))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="medicine-dosage">Liều lượng</Label>
              <Input
                id="medicine-dosage"
                placeholder="Ví dụ: 500mg"
                value={addMedicineForm.dosage}
                onChange={(e) => setAddMedicineForm(prev => ({...prev, dosage: e.target.value}))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="medicine-quantity">Số lượng tồn kho</Label>
                <Input
                  id="medicine-quantity"
                  type="number"
                  placeholder="0"
                  min="0"
                  value={addMedicineForm.stock_quantity}
                  onChange={(e) => setAddMedicineForm(prev => ({...prev, stock_quantity: e.target.value}))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="medicine-expiry">Ngày hết hạn</Label>
                <Input
                  id="medicine-expiry"
                  type="date"
                  value={addMedicineForm.expiry_date}
                  onChange={(e) => setAddMedicineForm(prev => ({...prev, expiry_date: e.target.value}))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddMedicineOpen(false)}>
              Hủy
            </Button>
            <Button 
              onClick={handleAddMedicine}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Lưu thuốc
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
