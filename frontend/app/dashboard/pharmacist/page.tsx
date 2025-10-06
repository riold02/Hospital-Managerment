"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { pharmacyApi, PharmacyDashboardData, Medicine, PharmacyRecord, PendingPrescription } from "@/lib/api"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function PharmacyDashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(false)
  
  // Dashboard Data States
  const [dashboardData, setDashboardData] = useState<PharmacyDashboardData | null>(null)
  const [pendingPrescriptions, setPendingPrescriptions] = useState<PendingPrescription[]>([])
  const [medicineInventory, setMedicineInventory] = useState<Medicine[]>([])
  const [pharmacyRecords, setPharmacyRecords] = useState<PharmacyRecord[]>([])
  const [expiringMedicines, setExpiringMedicines] = useState<Medicine[]>([])
  
  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  
  // Dispense Form State
  const [dispenseForm, setDispenseForm] = useState({
    patient_id: "",
    medicine_id: "",
    quantity: "",
    notes: ""
  })

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    setLoading(true)
    console.log('Loading pharmacy dashboard data for user:', user)
    
    try {
      // Load pharmacy dashboard data
      const dashboardResponse = await pharmacyApi.getDashboard()
      console.log('Pharmacy Dashboard API Response:', dashboardResponse)
      setDashboardData(dashboardResponse)

      // Load pending prescriptions
      const pendingResponse = await pharmacyApi.getPendingPrescriptions({ limit: 20 })
      console.log('Pending Prescriptions API Response:', pendingResponse)
      setPendingPrescriptions(pendingResponse.data)

      // Load medicine inventory
      const inventoryResponse = await pharmacyApi.getMedicineInventory({ limit: 50 })
      console.log('Medicine Inventory API Response:', inventoryResponse)
      setMedicineInventory(inventoryResponse.data)

      // Load pharmacy records
      const recordsResponse = await pharmacyApi.getPharmacyRecords({ limit: 20 })
      console.log('Pharmacy Records API Response:', recordsResponse)
      setPharmacyRecords(recordsResponse.data)

      // Load expiring medicines
      const expiringResponse = await pharmacyApi.getExpiringMedicines({ days: 30, limit: 10 })
      console.log('Expiring Medicines API Response:', expiringResponse)
      setExpiringMedicines(expiringResponse.data)

      console.log('Pharmacy dashboard data loaded successfully')

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
                {user?.full_name || user?.email || "Dược sĩ"}
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
                  {user?.full_name || user?.email || "Dược sĩ"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || "pharmacist@hospital.vn"}
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
              <p className="text-sm text-gray-500">
                Chào buổi {new Date().getHours() < 12 ? "sáng" : new Date().getHours() < 18 ? "chiều" : "tối"}, {" "}
                {user?.full_name || user?.email || "Dược sĩ"}
              </p>
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
                          {dashboardData?.totalMedicines || 0}
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
                          {dashboardData?.totalPharmacyRecords || 0}
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
                          {dashboardData?.lowStockCount || 0}
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
                          {dashboardData?.pendingPrescriptions || 0}
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
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-purple-600" />
                    Đơn thuốc chờ xử lý ({pendingPrescriptions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingPrescriptions && pendingPrescriptions.length > 0 ? pendingPrescriptions.map((prescription) => (
                      <div key={prescription.prescription_id} className="p-4 rounded-lg border hover:bg-purple-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">
                              {prescription.appointment.patient.first_name} {prescription.appointment.patient.last_name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {prescription.medicine.name} - {prescription.quantity} {prescription.medicine.type}
                            </p>
                            <p className="text-xs text-gray-500">
                              Bác sĩ: {prescription.appointment.doctor.first_name} {prescription.appointment.doctor.last_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(prescription.prescription_date).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-purple-100 text-purple-800">
                              {prescription.status}
                            </Badge>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Xử lý
                            </Button>
                          </div>
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
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    Kho thuốc ({filteredMedicines.length})
                  </CardTitle>
                  <div className="flex items-center gap-4">
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
                          <TableHead>Giá</TableHead>
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
                            <TableCell>{medicine.unit_price.toLocaleString('vi-VN')} đ</TableCell>
                            <TableCell>
                              {new Date(medicine.expiry_date).toLocaleDateString('vi-VN')}
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>ID Bệnh nhân</Label>
                      <Input
                        type="number"
                        placeholder="Nhập ID bệnh nhân"
                        value={dispenseForm.patient_id}
                        onChange={(e) => setDispenseForm(prev => ({...prev, patient_id: e.target.value}))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>ID Thuốc</Label>
                      <Input
                        type="number"
                        placeholder="Nhập ID thuốc"
                        value={dispenseForm.medicine_id}
                        onChange={(e) => setDispenseForm(prev => ({...prev, medicine_id: e.target.value}))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Số lượng</Label>
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
                      placeholder="Ghi chú thêm..."
                      value={dispenseForm.notes}
                      onChange={(e) => setDispenseForm(prev => ({...prev, notes: e.target.value}))}
                    />
                  </div>
                  <Button onClick={handleDispenseMedicine} className="bg-green-600 hover:bg-green-700">
                    <Save className="h-4 w-4 mr-2" />
                    Cấp phát thuốc
                  </Button>
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
                  <CardTitle>Thuốc sắp hết hạn</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Chức năng thuốc sắp hết hạn đang được phát triển...</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
