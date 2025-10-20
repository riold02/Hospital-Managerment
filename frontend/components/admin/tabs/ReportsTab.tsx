"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, TrendingUp, Users, Calendar, Download, FileText } from "lucide-react"
import { adminApi } from "@/lib/api"
import { toast } from "@/hooks/use-toast"

export function ReportsTab() {
  const [loading, setLoading] = useState(false)
  const [reportType, setReportType] = useState("overview")
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    loadReportData()
  }, [reportType])

  const loadReportData = async () => {
    setLoading(true)
    try {
      const response = await adminApi.getDashboard()
      setDashboardData(response)
    } catch (error) {
      console.error("Error loading report data:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu báo cáo",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExportReport = async () => {
    setExporting(true)
    try {
      // Tạo CSV data
      const csvData = generateCSVData(reportType, dashboardData)
      
      // Download file
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `bao-cao-${reportType}-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast({
        title: "Thành công",
        description: "Đã xuất báo cáo thành công",
      })
    } catch (error) {
      console.error("Error exporting report:", error)
      toast({
        title: "Lỗi",
        description: "Không thể xuất báo cáo",
        variant: "destructive",
      })
    } finally {
      setExporting(false)
    }
  }

  const generateCSVData = (type: string, data: any) => {
    if (type === 'overview' && data?.overview) {
      const headers = ['Chỉ số', 'Giá trị']
      const rows = [
        ['Tổng bệnh nhân', data.overview.totalPatients || 0],
        ['Tổng lịch hẹn', data.overview.totalAppointments || 0],
        ['Tổng bác sĩ', data.overview.totalDoctors || 0],
        ['Tổng nhân viên', data.overview.totalStaff || 0],
        ['Tổng khoa', data.overview.totalDepartments || 0],
        ['Tổng phòng', data.overview.totalRooms || 0],
      ]
      
      return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
    }
    
    return 'Chưa có dữ liệu'
  }

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-orange-600" />
              Báo cáo & Thống kê
            </CardTitle>
            <div className="flex items-center gap-3">
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Chọn loại báo cáo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Tổng quan</SelectItem>
                  <SelectItem value="patients">Bệnh nhân</SelectItem>
                  <SelectItem value="appointments">Lịch hẹn</SelectItem>
                  <SelectItem value="financial">Tài chính</SelectItem>
                  <SelectItem value="staff">Nhân sự</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline"
                onClick={handleExportReport}
                disabled={exporting || !dashboardData}
              >
                <Download className="h-4 w-4 mr-2" />
                {exporting ? 'Đang xuất...' : 'Xuất báo cáo'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Overview Report */}
      {reportType === "overview" && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="p-6">
                <Users className="h-8 w-8 text-blue-600 mb-2" />
                <p className="text-3xl font-bold text-blue-800">
                  {dashboardData?.overview?.totalPatients || 0}
                </p>
                <p className="text-sm font-medium text-blue-600">Tổng bệnh nhân</p>
                <p className="text-xs text-gray-500 mt-1">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  +12% so với tháng trước
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-white">
              <CardContent className="p-6">
                <Calendar className="h-8 w-8 text-green-600 mb-2" />
                <p className="text-3xl font-bold text-green-800">
                  {dashboardData?.overview?.totalAppointments || 0}
                </p>
                <p className="text-sm font-medium text-green-600">Tổng lịch hẹn</p>
                <p className="text-xs text-gray-500 mt-1">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  +8% so với tháng trước
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-white">
              <CardContent className="p-6">
                <Users className="h-8 w-8 text-purple-600 mb-2" />
                <p className="text-3xl font-bold text-purple-800">
                  {dashboardData?.overview?.totalDoctors || 0}
                </p>
                <p className="text-sm font-medium text-purple-600">Bác sĩ</p>
                <p className="text-xs text-gray-500 mt-1">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  +3% so với tháng trước
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-white">
              <CardContent className="p-6">
                <Users className="h-8 w-8 text-orange-600 mb-2" />
                <p className="text-3xl font-bold text-orange-800">
                  {dashboardData?.overview?.totalStaff || 0}
                </p>
                <p className="text-sm font-medium text-orange-600">Nhân viên</p>
                <p className="text-xs text-gray-500 mt-1">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  +5% so với tháng trước
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Placeholder */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Lịch hẹn theo tháng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center text-gray-400">
                    <BarChart3 className="h-16 w-16 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Biểu đồ đang được phát triển</p>
                    <p className="text-xs">Sử dụng Chart.js hoặc Recharts</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bệnh nhân theo khoa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center text-gray-400">
                    <BarChart3 className="h-16 w-16 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Biểu đồ đang được phát triển</p>
                    <p className="text-xs">Sử dụng Chart.js hoặc Recharts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Hoạt động gần đây
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData?.recentActivities && dashboardData.recentActivities.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.recentActivities.slice(0, 10).map((activity: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <p className="font-medium">{activity.email}</p>
                        <p className="text-sm text-gray-500">
                          Đã đăng ký - {activity.created_at ? new Date(activity.created_at).toLocaleString('vi-VN') : 'N/A'}
                        </p>
                      </div>
                      <Badge>Người dùng mới</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">Không có hoạt động nào</p>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Other Report Types */}
      {reportType !== "overview" && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-medium mb-2">Báo cáo {reportType}</h3>
              <p>Chức năng này đang được phát triển</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

