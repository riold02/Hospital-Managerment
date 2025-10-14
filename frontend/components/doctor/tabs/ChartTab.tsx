"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  AlertTriangle,
  Heart,
  Activity,
  Thermometer,
  Plus,
  X,
  Save,
  Printer,
  FileText,
  Calendar,
  MessageSquare,
  Stethoscope,
  TestTube,
  Pill,
} from "lucide-react"

interface PatientInfo {
  patient_id?: number
  first_name?: string
  last_name?: string
  date_of_birth?: string
  gender?: string
  phone?: string
  allergies?: string
  medical_history?: string
}

interface SelectedPatient {
  patient_name?: string
  patient_id?: number
  patient_info?: PatientInfo
  patient?: PatientInfo
  appointment_date?: string
  appointment_time?: string
  purpose?: string
  vitals?: {
    bp: string
    hr: string
    temp: string
  }
}

interface ClinicalNotes {
  subjective: string
  objective: string
  assessment: string
  plan: string
}

interface OrderItem {
  id: number
  type: string
  test: string
  priority: string
}

interface NewOrder {
  type: string
  test: string
  priority: string
}

interface PrescriptionItem {
  id: number
  medicine_id: string
  medicine_name: string
  medication?: string
  quantity: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
}

interface NewPrescription {
  medicine_id: string
  medicine_name: string
  quantity: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
}

interface Medicine {
  medicine_id: number
  name: string
  dosage: string
  brand: string
  type: string
  stock_quantity: number
}

interface MedicalRecord {
  record_id: number
  created_at: string
  diagnosis: string
  treatment: string
  prescription?: string
}

interface ChartTabProps {
  selectedPatient: SelectedPatient | null
  clinicalTab: string
  onClinicalTabChange: (tab: string) => void
  clinicalNotes: ClinicalNotes
  onClinicalNotesChange: (notes: ClinicalNotes) => void
  newOrder: NewOrder
  onNewOrderChange: (order: NewOrder) => void
  orders: OrderItem[]
  onAddOrder: () => void
  onRemoveOrder: (id: number) => void
  prescription: NewPrescription
  onPrescriptionChange: (prescription: NewPrescription) => void
  prescriptions: PrescriptionItem[]
  onAddPrescription: () => void
  onRemovePrescription: (id: number) => void
  medicines: Medicine[]
  medicineSearchOpen: boolean
  onMedicineSearchOpenChange: (open: boolean) => void
  medicineSearchValue: string
  onMedicineSearchValueChange: (value: string) => void
  medicalHistory: MedicalRecord[]
  loadingHistory: boolean
  onSaveCompleteRecord: () => void
  onPrintMedicalRecord: () => void
}

const ChartTab = ({
  selectedPatient,
  clinicalTab,
  onClinicalTabChange,
  clinicalNotes,
  onClinicalNotesChange,
  newOrder,
  onNewOrderChange,
  orders,
  onAddOrder,
  onRemoveOrder,
  prescription,
  onPrescriptionChange,
  prescriptions,
  onAddPrescription,
  onRemovePrescription,
  medicines,
  medicineSearchOpen,
  onMedicineSearchOpenChange,
  medicineSearchValue,
  onMedicineSearchValueChange,
  medicalHistory,
  loadingHistory,
  onSaveCompleteRecord,
  onPrintMedicalRecord,
}: ChartTabProps) => {
  const formatTime = (time: string | undefined) => {
    if (!time) return "N/A"

    if (typeof time === "string" && time.includes("T")) {
      try {
        const date = new Date(time)
        return date.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      } catch {
        return "N/A"
      }
    }

    if (typeof time === "string" && time.includes(":")) {
      const parts = time.split(":")
      return `${parts[0]}:${parts[1]}`
    }

    return String(time)
  }

  const getGenderDisplay = () => {
    const gender = selectedPatient?.patient_info?.gender || selectedPatient?.patient?.gender
    if (!gender) return "Chưa xác định"
    
    // Convert to lowercase for comparison
    const genderLower = gender.toLowerCase()
    if (genderLower === "male" || genderLower === "m" || genderLower === "nam") return "Nam"
    if (genderLower === "female" || genderLower === "f" || genderLower === "nữ") return "Nữ"
    if (genderLower === "other" || genderLower === "o" || genderLower === "khác") return "Khác"
    
    return gender
  }

  const parseSection = (text: string, sectionTitle: string) => {
    const regex = new RegExp(`\\[${sectionTitle}\\]\\n([\\s\\S]*?)(?=\\n\\n\\[|$)`)
    const match = text.match(regex)
    return match ? match[1].trim() : ""
  }

  if (!selectedPatient) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Stethoscope className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Chọn bệnh nhân để bắt đầu khám</h3>
          <p className="text-muted-foreground">
            Nhấp "Khám" từ lịch hẹn để mở hồ sơ bệnh nhân
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Patient Header */}
      <Card className="shadow-sm border-l-4 border-l-green-500">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src="/placeholder-user.jpg"
                alt=""
                className="w-16 h-16 rounded-full"
              />
              <div>
                <h2 className="text-2xl font-bold text-green-800">
                  {selectedPatient.patient_name || "Không có tên"}
                </h2>
                <p className="text-green-600">
                  {getGenderDisplay()} •  ID:{" "}
                  {selectedPatient.patient_info?.patient_id ||
                    selectedPatient.patient_id ||
                    "N/A"}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedPatient.patient_info?.date_of_birth && (
                    <>
                      SN:{" "}
                      {new Date(
                        selectedPatient.patient_info.date_of_birth
                      ).toLocaleDateString("vi-VN")}{" "}
                      •{" "}
                    </>
                  )}
                  {selectedPatient.patient_info?.phone && (
                    <>SĐT: {selectedPatient.patient_info.phone} • </>
                  )}
                  Ngày khám:{" "}
                  {selectedPatient.appointment_date
                    ? new Date(selectedPatient.appointment_date).toLocaleDateString("vi-VN")
                    : "N/A"}{" "}
                  • Giờ: {formatTime(selectedPatient.appointment_time)}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {selectedPatient.patient_info?.allergies && (
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <Badge className="bg-red-100 text-red-800">
                        {selectedPatient.patient_info.allergies}
                      </Badge>
                    </div>
                  )}
                  {selectedPatient.purpose && (
                    <Badge variant="outline" className="text-blue-600 border-blue-300">
                      {selectedPatient.purpose}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {selectedPatient.vitals && (
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-lg bg-red-50">
                  <Heart className="h-6 w-6 text-red-500 mx-auto mb-1" />
                  <p className="text-sm font-medium">Huyết áp</p>
                  <p className="text-lg font-bold text-red-600">{selectedPatient.vitals.bp}</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-50">
                  <Activity className="h-6 w-6 text-blue-500 mx-auto mb-1" />
                  <p className="text-sm font-medium">Mạch</p>
                  <p className="text-lg font-bold text-blue-600">{selectedPatient.vitals.hr}</p>
                </div>
                <div className="p-3 rounded-lg bg-orange-50">
                  <Thermometer className="h-6 w-6 text-orange-500 mx-auto mb-1" />
                  <p className="text-sm font-medium">Nhiệt độ</p>
                  <p className="text-lg font-bold text-orange-600">
                    {selectedPatient.vitals.temp}°C
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Clinical Workflow Tabs */}
      <Tabs value={clinicalTab} onValueChange={onClinicalTabChange} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="notes">Ghi chú SOAP</TabsTrigger>
          <TabsTrigger value="orders">Chỉ định</TabsTrigger>
          <TabsTrigger value="prescriptions">Đơn thuốc</TabsTrigger>
          <TabsTrigger value="history">Tiền sử</TabsTrigger>
          <TabsTrigger value="followup">Tái khám</TabsTrigger>
        </TabsList>

        {/* SOAP Notes Tab */}
        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>Ghi chú khám bệnh (SOAP)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Subjective (Triệu chứng chủ quan)</Label>
                  <Textarea
                    placeholder="Bệnh nhân than phiền..."
                    value={clinicalNotes.subjective}
                    onChange={(e) =>
                      onClinicalNotesChange({ ...clinicalNotes, subjective: e.target.value })
                    }
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Objective (Khám lâm sàng)</Label>
                  <Textarea
                    placeholder="Khám thực thể..."
                    value={clinicalNotes.objective}
                    onChange={(e) =>
                      onClinicalNotesChange({ ...clinicalNotes, objective: e.target.value })
                    }
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Assessment (Đánh giá)</Label>
                  <Textarea
                    placeholder="Chẩn đoán..."
                    value={clinicalNotes.assessment}
                    onChange={(e) =>
                      onClinicalNotesChange({ ...clinicalNotes, assessment: e.target.value })
                    }
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Plan (Kế hoạch điều trị)</Label>
                  <Textarea
                    placeholder="Kế hoạch điều trị..."
                    value={clinicalNotes.plan}
                    onChange={(e) =>
                      onClinicalNotesChange({ ...clinicalNotes, plan: e.target.value })
                    }
                    rows={4}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Chỉ định cận lâm sàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Loại chỉ định</Label>
                  <Select
                    value={newOrder.type}
                    onValueChange={(value) => onNewOrderChange({ ...newOrder, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lab">Xét nghiệm</SelectItem>
                      <SelectItem value="imaging">Chẩn đoán hình ảnh</SelectItem>
                      <SelectItem value="procedure">Thủ thuật</SelectItem>
                      <SelectItem value="consultation">Hội chẩn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tên xét nghiệm/chỉ định</Label>
                  <Input
                    placeholder="Nhập tên..."
                    value={newOrder.test}
                    onChange={(e) => onNewOrderChange({ ...newOrder, test: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mức độ ưu tiên</Label>
                  <Select
                    value={newOrder.priority}
                    onValueChange={(value) => onNewOrderChange({ ...newOrder, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="routine">Thường quy</SelectItem>
                      <SelectItem value="urgent">Khẩn cấp</SelectItem>
                      <SelectItem value="stat">Cấp cứu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={onAddOrder}
                    disabled={!newOrder.type || !newOrder.test}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm chỉ định
                  </Button>
                </div>
              </div>

              {/* Orders List */}
              {orders.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Danh sách chỉ định:</h4>
                  <div className="space-y-2">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{order.test}</p>
                          <p className="text-sm text-gray-600">
                            Loại:{" "}
                            {order.type === "lab"
                              ? "Xét nghiệm"
                              : order.type === "imaging"
                                ? "Chẩn đoán hình ảnh"
                                : order.type === "procedure"
                                  ? "Thủ thuật"
                                  : "Hội chẩn"}{" "}
                            • Độ ưu tiên:{" "}
                            {order.priority === "routine"
                              ? "Thường quy"
                              : order.priority === "urgent"
                                ? "Khẩn cấp"
                                : "Cấp cứu"}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveOrder(order.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prescriptions Tab */}
        <TabsContent value="prescriptions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Kê đơn thuốc điện tử</span>
                {prescriptions.length > 0 && (
                  <Badge variant="secondary">{prescriptions.length} thuốc</Badge>
                )}
              </CardTitle>
              <CardDescription>
                Thêm thuốc vào đơn, sau đó lưu toàn bộ đơn thuốc
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Form thêm thuốc */}
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                <h4 className="font-semibold mb-3 text-gray-700">Thêm thuốc mới</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2 lg:col-span-2">
                    <Label>Tên thuốc *</Label>
                    <Popover open={medicineSearchOpen} onOpenChange={onMedicineSearchOpenChange}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={medicineSearchOpen}
                          className="w-full justify-between"
                        >
                          {prescription.medicine_name || "Nhập tên thuốc để tìm kiếm..."}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="ml-2 h-4 w-4 shrink-0 opacity-50"
                          >
                            <path d="m7 15 5 5 5-5" />
                            <path d="m7 9 5-5 5 5" />
                          </svg>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[600px] p-0" align="start">
                        <Command>
                          <CommandInput
                            placeholder="Tìm kiếm thuốc theo tên, loại, hãng..."
                            value={medicineSearchValue}
                            onValueChange={onMedicineSearchValueChange}
                          />
                          <CommandList>
                            <CommandEmpty>Không tìm thấy thuốc nào.</CommandEmpty>
                            <CommandGroup>
                              {medicines
                                .filter((med) => {
                                  const searchLower = medicineSearchValue.toLowerCase()
                                  return (
                                    med.name.toLowerCase().includes(searchLower) ||
                                    med.brand?.toLowerCase().includes(searchLower) ||
                                    med.type?.toLowerCase().includes(searchLower)
                                  )
                                })
                                .map((med) => (
                                  <CommandItem
                                    key={med.medicine_id}
                                    value={med.medicine_id.toString()}
                                    onSelect={() => {
                                      onPrescriptionChange({
                                        ...prescription,
                                        medicine_id: med.medicine_id.toString(),
                                        medicine_name: `${med.name} ${med.dosage} (${med.brand})`,
                                        dosage: med.dosage || "",
                                      })
                                      onMedicineSearchOpenChange(false)
                                      onMedicineSearchValueChange("")
                                    }}
                                    className="cursor-pointer"
                                  >
                                    <div className="flex flex-col gap-1 py-1">
                                      <div className="flex items-center justify-between w-full">
                                        <span className="font-semibold">
                                          {med.name} {med.dosage}
                                        </span>
                                        <Badge
                                          variant={
                                            med.stock_quantity > 50
                                              ? "default"
                                              : med.stock_quantity > 20
                                                ? "secondary"
                                                : "destructive"
                                          }
                                          className="ml-2"
                                        >
                                          Kho: {med.stock_quantity}
                                        </Badge>
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        {med.brand} • {med.type}
                                      </div>
                                    </div>
                                  </CommandItem>
                                ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Số lượng *</Label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="Số lượng"
                      value={prescription.quantity}
                      onChange={(e) =>
                        onPrescriptionChange({ ...prescription, quantity: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Liều lượng *</Label>
                    <Input
                      placeholder="Ví dụ: 1 viên, 2 viên"
                      value={prescription.dosage}
                      onChange={(e) =>
                        onPrescriptionChange({ ...prescription, dosage: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tần suất sử dụng *</Label>
                    <Select
                      value={prescription.frequency}
                      onValueChange={(value) =>
                        onPrescriptionChange({ ...prescription, frequency: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn tần suất" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1 lần/ngày">1 lần/ngày</SelectItem>
                        <SelectItem value="2 lần/ngày (sáng, tối)">
                          2 lần/ngày (sáng, tối)
                        </SelectItem>
                        <SelectItem value="3 lần/ngày (sáng, trưa, tối)">
                          3 lần/ngày (sáng, trưa, tối)
                        </SelectItem>
                        <SelectItem value="Mỗi 4 giờ">Mỗi 4 giờ</SelectItem>
                        <SelectItem value="Mỗi 6 giờ">Mỗi 6 giờ</SelectItem>
                        <SelectItem value="Mỗi 8 giờ">Mỗi 8 giờ</SelectItem>
                        <SelectItem value="Khi cần thiết">Khi cần thiết</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Thời gian sử dụng</Label>
                    <Select
                      value={prescription.duration}
                      onValueChange={(value) =>
                        onPrescriptionChange({ ...prescription, duration: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn thời gian" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3 ngày">3 ngày</SelectItem>
                        <SelectItem value="5 ngày">5 ngày</SelectItem>
                        <SelectItem value="7 ngày">7 ngày</SelectItem>
                        <SelectItem value="10 ngày">10 ngày</SelectItem>
                        <SelectItem value="14 ngày">14 ngày</SelectItem>
                        <SelectItem value="30 ngày">30 ngày</SelectItem>
                        <SelectItem value="Dùng liên tục">Dùng liên tục</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 lg:col-span-2">
                    <Label>Hướng dẫn sử dụng</Label>
                    <Input
                      placeholder="Ví dụ: Uống sau bữa ăn, không dùng với rượu..."
                      value={prescription.instructions}
                      onChange={(e) =>
                        onPrescriptionChange({ ...prescription, instructions: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <Button
                    className="w-full md:w-auto bg-green-600 hover:bg-green-700"
                    onClick={onAddPrescription}
                    disabled={
                      !prescription.medicine_id || !prescription.dosage || !prescription.frequency
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm vào đơn thuốc
                  </Button>
                </div>
              </div>

              {/* Cảnh báo dị ứng */}
              {selectedPatient.patient_info?.allergies && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <p className="font-medium text-red-800">Cảnh báo dị ứng</p>
                  </div>
                  <p className="text-sm text-red-700">
                    Bệnh nhân dị ứng với: {selectedPatient.patient_info.allergies}
                  </p>
                </div>
              )}

              {/* Danh sách thuốc đã kê */}
              {prescriptions.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">
                      Đơn thuốc hiện tại ({prescriptions.length} loại)
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {prescriptions.map((rx, index) => (
                      <div
                        key={rx.id}
                        className="p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge
                                variant="outline"
                                className="bg-green-50 text-green-700 border-green-300"
                              >
                                #{index + 1}
                              </Badge>
                              <h5 className="font-bold text-lg text-gray-900">
                                {rx.medicine_name || rx.medication}
                              </h5>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                              <div>
                                <span className="text-gray-500">Số lượng:</span>
                                <span className="ml-1 font-medium text-gray-900">
                                  {rx.quantity}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">Liều lượng:</span>
                                <span className="ml-1 font-medium text-gray-900">{rx.dosage}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Tần suất:</span>
                                <span className="ml-1 font-medium text-gray-900">
                                  {rx.frequency}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">Thời gian:</span>
                                <span className="ml-1 font-medium text-gray-900">
                                  {rx.duration || "Chưa xác định"}
                                </span>
                              </div>
                            </div>
                            {rx.instructions && (
                              <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                                <span className="font-medium text-blue-900">Hướng dẫn:</span>
                                <span className="ml-1 text-blue-700">{rx.instructions}</span>
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemovePrescription(rx.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hiển thị khi chưa có thuốc */}
              {prescriptions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Pill className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">Chưa có thuốc nào trong đơn</p>
                  <p className="text-sm mt-1">Thêm thuốc bằng form bên trên</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Tiền sử bệnh nhân</CardTitle>
              <CardDescription>Thông tin tiền sử bệnh tật, dị ứng</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedPatient.patient_info?.medical_history && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Tiền sử bệnh</h4>
                    <p className="text-sm text-blue-800">
                      {selectedPatient.patient_info.medical_history}
                    </p>
                  </div>
                )}
                {selectedPatient.patient_info?.allergies && (
                  <div className="p-4 bg-red-50 rounded-lg">
                    <h4 className="font-semibold text-red-900 mb-2">Dị ứng</h4>
                    <p className="text-sm text-red-800">
                      {selectedPatient.patient_info.allergies}
                    </p>
                  </div>
                )}
                {!selectedPatient.patient_info?.medical_history &&
                  !selectedPatient.patient_info?.allergies && (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Chưa có thông tin tiền sử</p>
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Follow-up Tab - Medical History */}
        <TabsContent value="followup">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Lịch sử khám bệnh
              </CardTitle>
              <CardDescription>Xem lại các lần khám trước của bệnh nhân</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingHistory ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Đang tải lịch sử khám bệnh...</p>
                </div>
              ) : medicalHistory.length > 0 ? (
                <div className="space-y-4">
                  {medicalHistory.map((record) => {
                    const diagnosis = parseSection(record.diagnosis, "CHẨN ĐOÁN")
                    const subjective = parseSection(record.diagnosis, "TRIỆU CHỨNG CHỦ QUAN")
                    const objective = parseSection(record.diagnosis, "KHÁM LÂM SÀNG")
                    const plan = parseSection(record.treatment, "KẾ HOẠCH ĐIỀU TRỊ")
                    const orders = parseSection(record.treatment, "CHỈ ĐỊNH CẬN LÂM SÀNG")

                    return (
                      <Card
                        key={record.record_id}
                        className="border-2 hover:shadow-md transition-shadow"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-blue-600" />
                              <span className="font-semibold text-sm">
                                {new Date(record.created_at).toLocaleDateString("vi-VN", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <Badge variant="outline">Mã: {record.record_id}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* SOAP Notes Section */}
                          <div className="grid grid-cols-2 gap-4">
                            {subjective && (
                              <div className="space-y-1">
                                <div className="flex items-center gap-1">
                                  <MessageSquare className="h-4 w-4 text-orange-600" />
                                  <Label className="text-xs font-semibold text-orange-700">
                                    TRIỆU CHỨNG CHỦ QUAN
                                  </Label>
                                </div>
                                <div className="p-3 bg-orange-50 rounded-md text-sm whitespace-pre-wrap">
                                  {subjective}
                                </div>
                              </div>
                            )}
                            {objective && (
                              <div className="space-y-1">
                                <div className="flex items-center gap-1">
                                  <Stethoscope className="h-4 w-4 text-purple-600" />
                                  <Label className="text-xs font-semibold text-purple-700">
                                    KHÁM LÂM SÀNG
                                  </Label>
                                </div>
                                <div className="p-3 bg-purple-50 rounded-md text-sm whitespace-pre-wrap">
                                  {objective}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Diagnosis */}
                          {diagnosis && (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1">
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                <Label className="text-xs font-semibold text-red-700">
                                  CHẨN ĐOÁN
                                </Label>
                              </div>
                              <div className="p-3 bg-red-50 rounded-md text-sm font-medium whitespace-pre-wrap">
                                {diagnosis}
                              </div>
                            </div>
                          )}

                          {/* Treatment Plan */}
                          {plan && (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1">
                                <Heart className="h-4 w-4 text-green-600" />
                                <Label className="text-xs font-semibold text-green-700">
                                  KẾ HOẠCH ĐIỀU TRỊ
                                </Label>
                              </div>
                              <div className="p-3 bg-green-50 rounded-md text-sm whitespace-pre-wrap">
                                {plan}
                              </div>
                            </div>
                          )}

                          {/* Orders */}
                          {orders && (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1">
                                <TestTube className="h-4 w-4 text-blue-600" />
                                <Label className="text-xs font-semibold text-blue-700">
                                  CHỈ ĐỊNH CẬN LÂM SÀNG
                                </Label>
                              </div>
                              <div className="p-3 bg-blue-50 rounded-md text-sm whitespace-pre-wrap">
                                {orders}
                              </div>
                            </div>
                          )}

                          {/* Prescription */}
                          {record.prescription && (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1">
                                <Pill className="h-4 w-4 text-indigo-600" />
                                <Label className="text-xs font-semibold text-indigo-700">
                                  ĐƠN THUỐC
                                </Label>
                              </div>
                              <div className="p-3 bg-indigo-50 rounded-md text-sm whitespace-pre-wrap">
                                {record.prescription}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p className="font-medium text-lg">Chưa có lịch sử khám bệnh</p>
                  <p className="text-sm mt-1">Bệnh nhân này chưa có hồ sơ khám bệnh trước đó</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Complete Medical Record Button */}
      <Card className="mt-6 border-2 border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg text-green-900 mb-1">Hoàn tất khám bệnh</h3>
              <p className="text-sm text-green-700">
                Lưu toàn bộ ghi chú SOAP, chỉ định và đơn thuốc vào hồ sơ bệnh án
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                size="lg"
                variant="outline"
                className="bg-white hover:bg-gray-50 border-2 border-blue-600 text-blue-600 font-bold px-6"
                onClick={onPrintMedicalRecord}
              >
                <Printer className="h-5 w-5 mr-2" />
                In hồ sơ
              </Button>
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white font-bold px-8"
                onClick={onSaveCompleteRecord}
                disabled={!clinicalNotes.assessment || !clinicalNotes.plan}
              >
                <Save className="h-5 w-5 mr-2" />
                Lưu hồ sơ hoàn chỉnh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ChartTab
