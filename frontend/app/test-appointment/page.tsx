"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import AppointmentBooking from "@/components/shared/AppointmentBooking"
import { Calendar, CheckCircle, Clock, User } from "lucide-react"

export default function TestAppointmentPage() {
  const handleAppointmentSuccess = (appointment: any) => {
    console.log("New appointment created:", appointment)
    // In a real app, you might want to refresh appointment list or show success message
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Test Appointment Booking System
        </h1>
        <p className="text-muted-foreground">
          Kiểm tra chức năng đặt lịch hẹn cho bệnh nhân
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Features</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6/6</div>
            <p className="text-xs text-muted-foreground">Tính năng hoàn thành</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Validation</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">✓</div>
            <p className="text-xs text-muted-foreground">Frontend + Backend</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Real Data</CardTitle>
            <User className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">✓</div>
            <p className="text-xs text-muted-foreground">API Integration</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conflicts</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">✓</div>
            <p className="text-xs text-muted-foreground">Time Checking</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Appointment Booking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <h3 className="font-semibold mb-2">Các tính năng đã hoàn thành:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>✅ Lấy danh sách bác sĩ thực từ backend API</li>
                <li>✅ Lấy danh sách khoa/phòng ban từ backend</li>
                <li>✅ Component AppointmentBooking có thể tái sử dụng</li>
                <li>✅ Validation frontend và backend đầy đủ</li>
                <li>✅ Kiểm tra conflict thời gian đặt lịch</li>
                <li>✅ Tự động lấy patient_id từ token đăng nhập</li>
                <li>✅ UI/UX thân thiện với người dùng</li>
                <li>✅ Validation thời gian làm việc (8AM-5PM, không cuối tuần)</li>
                <li>✅ Validation mục đích khám (tối thiểu 10 ký tự)</li>
                <li>✅ Hiển thị số ký tự realtime</li>
              </ul>
            </div>
            
            <div className="flex justify-center pt-4">
              <AppointmentBooking />
            </div>
            
            <div className="text-xs text-muted-foreground mt-4">
              <strong>Lưu ý:</strong> Để test đầy đủ, bạn cần:
              <ol className="list-decimal list-inside mt-1 space-y-1">
                <li>Đăng nhập với tài khoản patient</li>
                <li>Đảm bảo database có dữ liệu doctors và departments</li>
                <li>Backend server đang chạy trên port 3001</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
