"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/hooks/use-toast"
import {
  TestTube,
  FlaskConical,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Package,
  Activity,
  Users,
  LogOut,
  User,
  Home,
  Save,
  Eye,
  Plus,
  Search
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { labAssistantApi, LabDashboardData, SampleToCollect, ProcessingQueue, LabInventoryItem } from "@/lib/api"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function LabAssistantDashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(false)
  
  // Dashboard Data States
  const [dashboardData, setDashboardData] = useState<LabDashboardData | null>(null)
  const [samplesToCollect, setSamplesToCollect] = useState<SampleToCollect[]>([])
  const [processingQueue, setProcessingQueue] = useState<ProcessingQueue[]>([])
  const [labInventory, setLabInventory] = useState<LabInventoryItem[]>([])
  const [collectionSchedule, setCollectionSchedule] = useState([])
  
  // Collection Form State
  const [collectionForm, setCollectionForm] = useState({
    sample_id: "",
    collection_notes: ""
  })

  // Processing Form State
  const [processingForm, setProcessingForm] = useState({
    sample_id: "",
    status: "completed",
    results: "",
    notes: ""
  })

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    setLoading(true)
    console.log('Loading lab assistant dashboard data for user:', user)
    
    try {
      // Load lab assistant dashboard data
      const dashboardResponse = await labAssistantApi.getDashboard()
      console.log('Lab Dashboard API Response:', dashboardResponse)
      setDashboardData(dashboardResponse)

      // Load samples to collect
      const samplesToCollectResponse = await labAssistantApi.getSamplesToCollect({ limit: 20 })
      console.log('Samples to Collect API Response:', samplesToCollectResponse)
      setSamplesToCollect(samplesToCollectResponse.data)

      // Load processing queue
      const processingQueueResponse = await labAssistantApi.getSampleProcessingQueue({ limit: 20 })
      console.log('Processing Queue API Response:', processingQueueResponse)
      setProcessingQueue(processingQueueResponse.data)

      // Load lab inventory
      const inventoryResponse = await labAssistantApi.getLabInventory({ limit: 50 })
      console.log('Lab Inventory API Response:', inventoryResponse)
      setLabInventory(inventoryResponse.data)

      // Load collection schedule
      const scheduleResponse = await labAssistantApi.getCollectionSchedule({ limit: 20 })
      console.log('Collection Schedule API Response:', scheduleResponse)
      setCollectionSchedule(scheduleResponse.data)

      console.log('Lab assistant dashboard data loaded successfully')

    } catch (error) {
      console.error("Error loading lab assistant dashboard data:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu dashboard",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRecordSampleCollection = async () => {
    try {
      if (!collectionForm.sample_id || !collectionForm.collection_notes) {
        toast({
          title: "Lỗi",
          description: "Vui lòng điền đầy đủ thông tin",
          variant: "destructive",
        })
        return
      }

      const collectionData = {
        sample_id: parseInt(collectionForm.sample_id),
        collection_notes: collectionForm.collection_notes
      }

      await labAssistantApi.recordSampleCollection(parseInt(collectionForm.sample_id), collectionData)
      
      toast({
        title: "Thành công",
        description: "Đã ghi nhận thu thập mẫu thành công",
      })

      // Reset form and reload data
      setCollectionForm({
        sample_id: "",
        collection_notes: ""
      })
      
      loadDashboardData()

    } catch (error) {
      console.error("Error recording sample collection:", error)
      toast({
        title: "Lỗi",
        description: "Không thể ghi nhận thu thập mẫu",
        variant: "destructive",
      })
    }
  }

  const handleUpdateProcessingStatus = async () => {
    try {
      if (!processingForm.sample_id || !processingForm.status) {
        toast({
          title: "Lỗi",
          description: "Vui lòng điền đầy đủ thông tin",
          variant: "destructive",
        })
        return
      }

      const statusData = {
        status: processingForm.status,
        results: processingForm.results,
        notes: processingForm.notes
      }

      await labAssistantApi.updateSampleProcessingStatus(parseInt(processingForm.sample_id), statusData)
      
      toast({
        title: "Thành công",
        description: "Đã cập nhật trạng thái xử lý thành công",
      })

      // Reset form and reload data
      setProcessingForm({
        sample_id: "",
        status: "completed",
        results: "",
        notes: ""
      })
      
      loadDashboardData()

    } catch (error) {
      console.error("Error updating processing status:", error)
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái xử lý",
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
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <TestTube className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Dashboard Xét nghiệm</h1>
              <p className="text-sm text-gray-500">
                {user?.full_name || user?.email || "Kỹ thuật viên"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {[
            { value: "overview", label: "Tổng quan", icon: Home },
            { value: "collect", label: "Thu thập mẫu", icon: FlaskConical, badge: samplesToCollect.length },
            { value: "processing", label: "Xử lý mẫu", icon: TestTube, badge: processingQueue.length },
            { value: "inventory", label: "Vật tư", icon: Package },
            { value: "schedule", label: "Lịch trình", icon: Calendar },
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
                      ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg"
                      : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"
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
                    ${isActive ? "bg-white text-purple-600" : "bg-red-500 text-white"}
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
                <AvatarImage src="/placeholder-user.jpg" alt="Lab Assistant Avatar" />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.full_name || user?.email || "Kỹ thuật viên"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || "lab@hospital.vn"}
                </p>
                <Badge variant="secondary" className="text-xs mt-1">
                  LAB ASSISTANT
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
                {activeTab === "collect" && "Thu thập mẫu"}
                {activeTab === "processing" && "Xử lý mẫu"}
                {activeTab === "inventory" && "Vật tư xét nghiệm"}
                {activeTab === "schedule" && "Lịch trình thu thập"}
              </h2>
              <p className="text-sm text-gray-500">
                Chào buổi {new Date().getHours() < 12 ? "sáng" : new Date().getHours() < 18 ? "chiều" : "tối"}, {" "}
                {user?.full_name || user?.email || "Kỹ thuật viên"}
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
                        <Users className="h-8 w-8 text-blue-600 mb-2" />
                        <p className="text-3xl font-bold text-blue-800">
                          {dashboardData?.totalPatients || 0}
                        </p>
                        <p className="text-sm font-medium text-blue-600">Tổng bệnh nhân</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Calendar className="h-8 w-8 text-green-600 mb-2" />
                        <p className="text-3xl font-bold text-green-800">
                          {dashboardData?.totalAppointments || 0}
                        </p>
                        <p className="text-sm font-medium text-green-600">Tổng cuộc hẹn</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <TestTube className="h-8 w-8 text-purple-600 mb-2" />
                        <p className="text-3xl font-bold text-purple-800">
                          {dashboardData?.totalMedicine || 0}
                        </p>
                        <p className="text-sm font-medium text-purple-600">Tổng thuốc</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Package className="h-8 w-8 text-orange-600 mb-2" />
                        <p className="text-3xl font-bold text-orange-800">
                          {dashboardData?.totalInventory || 0}
                        </p>
                        <p className="text-sm font-medium text-orange-600">Tổng vật tư</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Samples to Collect */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FlaskConical className="h-5 w-5 text-purple-600" />
                    Mẫu cần thu thập ({samplesToCollect.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {samplesToCollect && samplesToCollect.length > 0 ? samplesToCollect.slice(0, 5).map((sample) => (
                      <div key={sample.record_id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-purple-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <TestTube className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold">
                              {sample.patient.first_name} {sample.patient.last_name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {sample.diagnosis}
                            </p>
                            <p className="text-xs text-gray-500">
                              Mã BN: {sample.patient.patient_code}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={sample.prescription?.includes('Urgent') ? 'destructive' : 'secondary'}>
                            {sample.prescription?.includes('Urgent') ? 'Khẩn cấp' : 'Thường'}
                          </Badge>
                          <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                            <FlaskConical className="h-3 w-3 mr-1" />
                            Thu thập
                          </Button>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8 text-gray-500">
                        <FlaskConical className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Không có mẫu nào cần thu thập</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sample Collection Tab */}
            <TabsContent value="collect" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FlaskConical className="h-5 w-5 text-purple-600" />
                    Ghi nhận thu thập mẫu
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>ID Mẫu</Label>
                      <Input
                        type="number"
                        placeholder="Nhập ID mẫu"
                        value={collectionForm.sample_id}
                        onChange={(e) => setCollectionForm(prev => ({...prev, sample_id: e.target.value}))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Ghi chú thu thập</Label>
                    <Textarea
                      placeholder="Ghi chú về quá trình thu thập mẫu..."
                      value={collectionForm.collection_notes}
                      onChange={(e) => setCollectionForm(prev => ({...prev, collection_notes: e.target.value}))}
                    />
                  </div>
                  <Button onClick={handleRecordSampleCollection} className="bg-purple-600 hover:bg-purple-700">
                    <Save className="h-4 w-4 mr-2" />
                    Ghi nhận thu thập
                  </Button>
                </CardContent>
              </Card>

              {/* Samples List */}
              <Card>
                <CardHeader>
                  <CardTitle>Danh sách mẫu cần thu thập</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {samplesToCollect && samplesToCollect.length > 0 ? samplesToCollect.map((sample) => (
                      <div key={sample.record_id} className="p-4 rounded-lg border hover:bg-purple-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">
                              ID: {sample.record_id} - {sample.patient.first_name} {sample.patient.last_name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {sample.diagnosis}
                            </p>
                            <p className="text-xs text-gray-500">
                              Yêu cầu: {sample.treatment}
                            </p>
                          </div>
                          <Badge variant={sample.prescription?.includes('Urgent') ? 'destructive' : 'secondary'}>
                            {sample.prescription?.includes('Urgent') ? 'Khẩn cấp' : 'Thường'}
                          </Badge>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-12 text-gray-500">
                        <FlaskConical className="h-16 w-16 mx-auto mb-4 opacity-30" />
                        <h3 className="text-lg font-medium mb-2">Không có mẫu cần thu thập</h3>
                        <p>Tất cả mẫu đã được thu thập.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sample Processing Tab */}
            <TabsContent value="processing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TestTube className="h-5 w-5 text-green-600" />
                    Cập nhật trạng thái xử lý
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>ID Mẫu</Label>
                      <Input
                        type="number"
                        placeholder="Nhập ID mẫu"
                        value={processingForm.sample_id}
                        onChange={(e) => setProcessingForm(prev => ({...prev, sample_id: e.target.value}))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Trạng thái</Label>
                      <Input
                        placeholder="completed, in_progress, failed"
                        value={processingForm.status}
                        onChange={(e) => setProcessingForm(prev => ({...prev, status: e.target.value}))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Kết quả</Label>
                    <Textarea
                      placeholder="Kết quả xét nghiệm..."
                      value={processingForm.results}
                      onChange={(e) => setProcessingForm(prev => ({...prev, results: e.target.value}))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ghi chú</Label>
                    <Textarea
                      placeholder="Ghi chú thêm..."
                      value={processingForm.notes}
                      onChange={(e) => setProcessingForm(prev => ({...prev, notes: e.target.value}))}
                    />
                  </div>
                  <Button onClick={handleUpdateProcessingStatus} className="bg-green-600 hover:bg-green-700">
                    <Save className="h-4 w-4 mr-2" />
                    Cập nhật trạng thái
                  </Button>
                </CardContent>
              </Card>

              {/* Processing Queue */}
              <Card>
                <CardHeader>
                  <CardTitle>Hàng đợi xử lý ({processingQueue.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {processingQueue && processingQueue.length > 0 ? processingQueue.map((sample) => (
                      <div key={sample.record_id} className="p-4 rounded-lg border hover:bg-green-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">
                              ID: {sample.record_id} - {sample.patient.first_name} {sample.patient.last_name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {sample.diagnosis}
                            </p>
                            <p className="text-xs text-gray-500">
                              Trạng thái: {sample.prescription || 'Đang xử lý'}
                            </p>
                          </div>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Xử lý
                          </Button>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-12 text-gray-500">
                        <TestTube className="h-16 w-16 mx-auto mb-4 opacity-30" />
                        <h3 className="text-lg font-medium mb-2">Không có mẫu trong hàng đợi</h3>
                        <p>Tất cả mẫu đã được xử lý.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Other tabs */}
            <TabsContent value="inventory">
              <Card>
                <CardHeader>
                  <CardTitle>Vật tư xét nghiệm</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {labInventory && labInventory.length > 0 ? labInventory.slice(0, 10).map((item) => (
                      <div key={item.medicine_id} className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                          <h4 className="font-semibold">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">{item.type} - {item.brand}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={item.stock_quantity < 10 ? "destructive" : "secondary"}>
                            {item.stock_quantity}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            {item.unit_price.toLocaleString('vi-VN')} đ
                          </p>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-12 text-gray-500">
                        <Package className="h-16 w-16 mx-auto mb-4 opacity-30" />
                        <h3 className="text-lg font-medium mb-2">Không có vật tư</h3>
                        <p>Chưa có vật tư nào trong kho.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schedule">
              <Card>
                <CardHeader>
                  <CardTitle>Lịch trình thu thập</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Chức năng lịch trình thu thập đang được phát triển...</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
