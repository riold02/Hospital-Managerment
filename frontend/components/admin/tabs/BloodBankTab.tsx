"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Droplets, Plus, AlertTriangle } from "lucide-react"

export function BloodBankTab() {
  // Demo data - cần thay bằng API thật
  const bloodStock = [
    { type: 'A+', units: 45, status: 'normal' },
    { type: 'A-', units: 12, status: 'low' },
    { type: 'B+', units: 32, status: 'normal' },
    { type: 'B-', units: 8, status: 'critical' },
    { type: 'O+', units: 67, status: 'high' },
    { type: 'O-', units: 15, status: 'low' },
    { type: 'AB+', units: 23, status: 'normal' },
    { type: 'AB-', units: 5, status: 'critical' },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'high': return 'bg-green-100 text-green-800'
      case 'normal': return 'bg-blue-100 text-blue-800'
      case 'low': return 'bg-orange-100 text-orange-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'high': return 'Dư thừa'
      case 'normal': return 'Bình thường'
      case 'low': return 'Thiếu'
      case 'critical': return 'Rất thiếu'
      default: return status
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-red-600" />
              Quản lý ngân hàng máu
            </CardTitle>
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="h-4 w-4 mr-2" />
              Nhập máu
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Blood Stock Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {bloodStock.map((blood) => (
          <Card key={blood.type} className={`${blood.status === 'critical' ? 'border-red-500 border-2' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Droplets className="h-6 w-6 text-red-600" />
                  <h3 className="text-2xl font-bold">{blood.type}</h3>
                </div>
                {blood.status === 'critical' && (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                )}
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-2">{blood.units}</p>
              <p className="text-sm text-gray-500 mb-3">đơn vị</p>
              <Badge className={getStatusColor(blood.status)}>
                {getStatusLabel(blood.status)}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-6">
            <p className="text-sm text-gray-500 mb-1">Tổng tồn kho</p>
            <p className="text-3xl font-bold text-blue-800">
              {bloodStock.reduce((sum, b) => sum + b.units, 0)} đơn vị
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="p-6">
            <p className="text-sm text-gray-500 mb-1">Nhóm máu thiếu</p>
            <p className="text-3xl font-bold text-orange-800">
              {bloodStock.filter(b => b.status === 'low').length}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-white">
          <CardContent className="p-6">
            <p className="text-sm text-gray-500 mb-1">Cần nhập gấp</p>
            <p className="text-3xl font-bold text-red-800">
              {bloodStock.filter(b => b.status === 'critical').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Notice */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <p className="font-medium text-orange-900">Chú ý</p>
              <p className="text-sm text-orange-700">
                Đây là dữ liệu demo. Cần tích hợp API backend để quản lý ngân hàng máu thực tế.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

