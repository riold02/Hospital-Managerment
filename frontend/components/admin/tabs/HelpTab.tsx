"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { HelpCircle, BookOpen, Video, MessageCircle, Mail, Phone } from "lucide-react"

export function HelpTab() {
  return (
    <div className="space-y-6">
      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <BookOpen className="h-12 w-12 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Tài liệu hướng dẫn</h3>
            <p className="text-sm text-gray-500">Hướng dẫn chi tiết sử dụng hệ thống</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Video className="h-12 w-12 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Video hướng dẫn</h3>
            <p className="text-sm text-gray-500">Xem video demo các chức năng</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <MessageCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Hỗ trợ trực tuyến</h3>
            <p className="text-sm text-gray-500">Chat với đội ngũ hỗ trợ</p>
          </CardContent>
        </Card>
      </div>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-orange-600" />
            Câu hỏi thường gặp
          </CardTitle>
          <CardDescription>
            Tìm câu trả lời nhanh cho các câu hỏi phổ biến
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Quản lý</Badge>
                  <span>Làm thế nào để thêm người dùng mới?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <p>Để thêm người dùng mới:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Vào tab "Phân quyền"</li>
                    <li>Nhấn nút "Thêm người dùng"</li>
                    <li>Điền đầy đủ thông tin: Email, Vai trò, Mật khẩu</li>
                    <li>Nhấn "Lưu" để hoàn tất</li>
                  </ol>
                  <p className="text-gray-500 mt-2">Lưu ý: Người dùng mới sẽ nhận email xác nhận để kích hoạt tài khoản.</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Bệnh nhân</Badge>
                  <span>Cách quản lý hồ sơ bệnh nhân?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <p>Quản lý hồ sơ bệnh nhân:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Tab "Bệnh nhân" hiển thị danh sách tất cả bệnh nhân</li>
                    <li>Nhấn "Xem" để xem chi tiết hồ sơ</li>
                    <li>Có thể tìm kiếm theo tên, mã bệnh nhân</li>
                    <li>Tab "Hồ sơ y tế" để xem lịch sử khám bệnh</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Lịch hẹn</Badge>
                  <span>Làm thế nào để xác nhận lịch hẹn?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <p>Xác nhận lịch hẹn:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Vào tab "Lịch hẹn"</li>
                    <li>Lọc lịch hẹn theo trạng thái "Chờ xác nhận"</li>
                    <li>Nhấn vào lịch hẹn cần xác nhận</li>
                    <li>Kiểm tra thông tin và nhấn "Xác nhận"</li>
                  </ol>
                  <p className="text-gray-500 mt-2">Bệnh nhân sẽ nhận email/SMS thông báo sau khi xác nhận.</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Báo cáo</Badge>
                  <span>Cách xuất báo cáo thống kê?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <p>Xuất báo cáo:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Vào tab "Báo cáo"</li>
                    <li>Chọn loại báo cáo (Tổng quan, Bệnh nhân, Tài chính...)</li>
                    <li>Chọn khoảng thời gian cần báo cáo</li>
                    <li>Nhấn "Xuất báo cáo" để tải file Excel/PDF</li>
                  </ol>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Bảo mật</Badge>
                  <span>Làm thế nào để đổi mật khẩu?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <p>Đổi mật khẩu:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Nhấn vào avatar ở góc trên bên phải</li>
                    <li>Chọn "Cài đặt tài khoản"</li>
                    <li>Vào mục "Bảo mật"</li>
                    <li>Nhập mật khẩu cũ và mật khẩu mới</li>
                    <li>Nhấn "Cập nhật" để lưu thay đổi</li>
                  </ol>
                  <p className="text-gray-500 mt-2">Khuyến nghị: Sử dụng mật khẩu mạnh với ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.</p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Contact Support */}
      <Card>
        <CardHeader>
          <CardTitle>Liên hệ hỗ trợ</CardTitle>
          <CardDescription>
            Nếu bạn cần hỗ trợ thêm, vui lòng liên hệ với chúng tôi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <Phone className="h-8 w-8 text-blue-600" />
              <div>
                <p className="font-medium">Hotline</p>
                <p className="text-sm text-gray-500">1900-xxxx</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <Mail className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-medium">Email</p>
                <p className="text-sm text-gray-500">support@hospital.com</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <MessageCircle className="h-8 w-8 text-purple-600" />
              <div>
                <p className="font-medium">Live Chat</p>
                <p className="text-sm text-gray-500">8:00 - 22:00 hàng ngày</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Info */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin hệ thống</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Phiên bản:</span>
              <span className="font-medium">v1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Cập nhật cuối:</span>
              <span className="font-medium">{new Date().toLocaleDateString('vi-VN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Trình duyệt được hỗ trợ:</span>
              <span className="font-medium">Chrome, Firefox, Safari, Edge</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

