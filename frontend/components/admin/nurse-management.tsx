"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Heart, Search, Users, Clock, Activity, Stethoscope } from "lucide-react"

interface Nurse {
  id: string
  name: string
  email: string
  phone: string
  department: string
  specialization: string
  shift: "Sáng" | "Chiều" | "Tối" | "Đêm"
  status: "Active" | "On Leave" | "Busy"
  experience_years: number
  license_number: string
}

interface PatientCare {
  id: string
  patient_name: string
  room_number: string
  nurse_name: string
  care_type: string
  scheduled_time: string
  status: "Pending" | "Completed"
  notes?: string
}

export function NurseManagement() {
  const [nurses, setNurses] = useState<Nurse[]>([])
  const [patientCare, setPatientCare] = useState<PatientCare[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDepartment, setFilterDepartment] = useState<string>("all")
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Mock data
        setNurses([
          {
            id: "1",
            name: "Nguyễn Thị Lan",
            email: "lan.nguyen@hospital.com",
            phone: "0901234567",
            department: "Nội khoa",
            specialization: "Tim mạch",
            shift: "Sáng",
            status: "Active",
            experience_years: 5,
            license_number: "NS001234",
          },
          {
            id: "2",
            name: "Trần Thị Mai",
            email: "mai.tran@hospital.com",
            phone: "0912345678",
            department: "Ngoại khoa",
            specialization: "Phẫu thuật",
            shift: "Chiều",
            status: "Active",
            experience_years: 8,
            license_number: "NS001235",
          },
          {
            id: "3",
            name: "Lê Thị Hoa",
            email: "hoa.le@hospital.com",
            phone: "0923456789",
            department: "ICU",
            specialization: "Hồi sức cấp cứu",
            shift: "Đêm",
            status: "Busy",
            experience_years: 12,
            license_number: "NS001236",
          },
          {
            id: "4",
            name: "Phạm Thị Linh",
            email: "linh.pham@hospital.com",
            phone: "0934567890",
            department: "Sản khoa",
            specialization: "Sản phụ khoa",
            shift: "Sáng",
            status: "On Leave",
            experience_years: 6,
            license_number: "NS001237",
          },
        ])

        setPatientCare([
          {
            id: "1",
            patient_name: "Nguyễn Văn A",
            room_number: "P101",
            nurse_name: "Nguyễn Thị Lan",
            care_type: "Đo huyết áp",
            scheduled_time: "08:00",
            status: "Pending",
          },
          {
            id: "2",
            patient_name: "Trần Thị B",
            room_number: "P205",
            nurse_name: "Trần Thị Mai",
            care_type: "Thay băng",
            scheduled_time: "09:30",
            status: "Completed",
            notes: "Vết thương lành tốt",
          },
          {
            id: "3",
            patient_name: "Lê Văn C",
            room_number: "ICU-03",
            nurse_name: "Lê Thị Hoa",
            care_type: "Theo dõi sinh hiệu",
            scheduled_time: "10:00",
            status: "Pending",
          },
        ])
      } catch (error) {
        toast({
          title: "Lỗi",
          description: "Không thể tải dữ liệu y tá",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 border-green-200"
      case "On Leave":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Busy":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getCareStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const filteredNurses = nurses.filter((nurse) => {
    const matchesSearch =
      nurse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nurse.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nurse.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nurse.specialization.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDepartment = filterDepartment === "all" || nurse.department === filterDepartment

    return matchesSearch && matchesDepartment
  })

  const filteredPatientCare = patientCare.filter(
    (care) =>
      care.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      care.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      care.nurse_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      care.care_type.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số y tá</CardTitle>
            <Heart className="h-4 w-4 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-600">{nurses.length}</div>
            <p className="text-xs text-gray-600">y tá trong hệ thống</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang làm việc</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {nurses.filter((n) => n.status === "Active").length}
            </div>
            <p className="text-xs text-gray-600">y tá có mặt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang bận</CardTitle>
            <Clock className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{nurses.filter((n) => n.status === "Busy").length}</div>
            <p className="text-xs text-gray-600">y tá đang bận</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chăm sóc hôm nay</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{patientCare.length}</div>
            <p className="text-xs text-gray-600">lượt chăm sóc</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Tìm kiếm y tá, khoa, chuyên môn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="nurses" className="space-y-6">
        <TabsList>
          <TabsTrigger value="nurses">Danh sách Y tá</TabsTrigger>
          <TabsTrigger value="care">Chăm sóc Bệnh nhân</TabsTrigger>
        </TabsList>

        <TabsContent value="nurses">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-pink-600" />
                <span>Danh sách Y tá</span>
              </CardTitle>
              <CardDescription>Quản lý thông tin y tá và phân ca làm việc</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredNurses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Không có dữ liệu y tá</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Họ tên</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Điện thoại</TableHead>
                      <TableHead>Khoa</TableHead>
                      <TableHead>Chuyên môn</TableHead>
                      <TableHead>Ca làm</TableHead>
                      <TableHead>Kinh nghiệm</TableHead>
                      <TableHead>Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredNurses.map((nurse) => (
                      <TableRow key={nurse.id}>
                        <TableCell className="font-medium">{nurse.name}</TableCell>
                        <TableCell>{nurse.email}</TableCell>
                        <TableCell>{nurse.phone}</TableCell>
                        <TableCell>{nurse.department}</TableCell>
                        <TableCell>{nurse.specialization}</TableCell>
                        <TableCell>{nurse.shift}</TableCell>
                        <TableCell>{nurse.experience_years} năm</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(nurse.status)}>
                            {nurse.status === "Active"
                              ? "Đang làm việc"
                              : nurse.status === "On Leave"
                                ? "Nghỉ phép"
                                : "Đang bận"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="care">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Stethoscope className="h-5 w-5 text-blue-600" />
                <span>Chăm sóc Bệnh nhân</span>
              </CardTitle>
              <CardDescription>Theo dõi lịch chăm sóc và điều trị bệnh nhân</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredPatientCare.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Stethoscope className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Không có lịch chăm sóc nào</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bệnh nhân</TableHead>
                      <TableHead>Phòng</TableHead>
                      <TableHead>Y tá phụ trách</TableHead>
                      <TableHead>Loại chăm sóc</TableHead>
                      <TableHead>Giờ thực hiện</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ghi chú</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatientCare.map((care) => (
                      <TableRow key={care.id}>
                        <TableCell className="font-medium">{care.patient_name}</TableCell>
                        <TableCell>{care.room_number}</TableCell>
                        <TableCell>{care.nurse_name}</TableCell>
                        <TableCell>{care.care_type}</TableCell>
                        <TableCell>{care.scheduled_time}</TableCell>
                        <TableCell>
                          <Badge className={getCareStatusColor(care.status)}>
                            {care.status === "Pending" ? "Chờ thực hiện" : "Đã hoàn thành"}
                          </Badge>
                        </TableCell>
                        <TableCell>{care.notes || "Không có"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
