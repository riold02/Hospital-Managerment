'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TestTube, RefreshCcw, Eye, Printer, Calendar, AlertTriangle } from "lucide-react"

interface TestResultItem {
  parameter_name?: string
  parameter?: string
  value: string | number
  unit?: string
  normal_range?: string
  is_abnormal?: boolean
}

interface LabResult {
  id: number
  test_type?: string
  test_code?: string
  test_date: string
  status: string
  critical_flag?: boolean
  technician_name?: string
  room_number?: string
  notes?: string
  interpretation?: string
  test_results?: TestResultItem[]
  patient?: {
    full_name?: string
  }
}

interface ResultsTabProps {
  pendingResults: LabResult[]
  loadDashboardData: () => void
  handlePrintLabResult: (result: LabResult) => void
  setSelectedLabResult: (result: LabResult) => void
  setShowLabResultDialog: (show: boolean) => void
  isValueInRange: (value: string | number, range: string) => boolean
}

export default function ResultsTab({
  pendingResults,
  loadDashboardData,
  handlePrintLabResult,
  setSelectedLabResult,
  setShowLabResultDialog,
  isValueInRange
}: ResultsTabProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5 text-purple-600" />
          Kết quả cận lâm sàng ({pendingResults?.length || 0})
        </CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => loadDashboardData()}>
            <RefreshCcw className="h-4 w-4 mr-1" />
            Làm mới
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pendingResults && pendingResults.length > 0 ? pendingResults.map((result) => (
            <Card 
              key={result.id} 
              className="border-l-4 hover:shadow-md transition-shadow"
              style={{ 
                borderLeftColor: result.status === 'abnormal' || result.critical_flag ? '#ef4444' : 
                                 result.status === 'completed' ? '#10b981' : '#6b7280' 
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-base">{result.patient?.full_name || 'Không có tên'}</h4>
                      {result.critical_flag && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Khẩn cấp
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 mb-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        {result.test_type || 'Xét nghiệm'}
                      </p>
                      {result.test_code && (
                        <span className="text-xs text-gray-500">
                          Mã: {result.test_code}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Ngày XN: {new Date(result.test_date).toLocaleDateString('vi-VN')}
                      </span>
                      {result.technician_name && (
                        <span>Kỹ thuật viên: {result.technician_name}</span>
                      )}
                      {result.room_number && (
                        <span>Phòng: {result.room_number}</span>
                      )}
                    </div>

                    {/* Test Results Details */}
                    {result.test_results && result.test_results.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-sm font-semibold text-gray-700">Chi tiết kết quả:</p>
                        <div className="space-y-1.5">
                          {result.test_results.map((item: TestResultItem, idx: number) => {
                            const isAbnormal = item.is_abnormal || 
                              (item.value && item.normal_range && 
                               !isValueInRange(item.value, item.normal_range));
                            
                            return (
                              <div 
                                key={idx} 
                                className={`flex items-center justify-between p-2 rounded ${
                                  isAbnormal ? 'bg-red-50' : 'bg-gray-50'
                                }`}
                              >
                                <span className="text-sm font-medium">{item.parameter_name || item.parameter}</span>
                                <div className="flex items-center gap-3">
                                  <span className={`font-semibold ${
                                    isAbnormal ? 'text-red-600' : 'text-green-600'
                                  }`}>
                                    {item.value} {item.unit || ''}
                                  </span>
                                  {item.normal_range && (
                                    <span className="text-xs text-gray-500">
                                      (BT: {item.normal_range})
                                    </span>
                                  )}
                                  {isAbnormal && (
                                    <Badge variant="destructive" className="text-xs py-0">
                                      <AlertTriangle className="h-3 w-3 mr-1" />
                                      Bất thường
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {result.notes && (
                      <div className="mt-3 p-2 bg-blue-50 rounded-md border border-blue-100">
                        <p className="text-sm">
                          <strong className="text-blue-900">Ghi chú:</strong>
                          <span className="text-blue-800 ml-2">{result.notes}</span>
                        </p>
                      </div>
                    )}

                    {/* Interpretation */}
                    {result.interpretation && (
                      <div className="mt-3 p-2 bg-amber-50 rounded-md border border-amber-100">
                        <p className="text-sm">
                          <strong className="text-amber-900">Nhận xét:</strong>
                          <span className="text-amber-800 ml-2">{result.interpretation}</span>
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Status and Actions */}
                  <div className="flex flex-col gap-2 min-w-[140px]">
                    <Badge className={
                      result.status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' :
                      result.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                      result.status === 'in_progress' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                      'bg-gray-100 text-gray-800 border-gray-200'
                    }>
                      {result.status === 'completed' ? 'Hoàn thành' :
                       result.status === 'pending' ? 'Chờ kết quả' : 
                       result.status === 'in_progress' ? 'Đang xử lý' : 'Mới'}
                    </Badge>
                    
                    {result.status === 'completed' && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={() => {
                            setSelectedLabResult(result);
                            setShowLabResultDialog(true);
                          }}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Chi tiết
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => handlePrintLabResult(result)}
                        >
                          <Printer className="h-3 w-3 mr-1" />
                          In kết quả
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )) : (
            <div className="text-center py-12 text-gray-500">
              <TestTube className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-medium mb-2">Không có kết quả xét nghiệm</h3>
              <p>Chưa có kết quả cận lâm sàng nào.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
