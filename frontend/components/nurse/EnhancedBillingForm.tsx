'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  billingApi, 
  servicesApi, 
  medicalRecordsApi,
  type Service,
  type MedicalRecord,
  type BillingItem
} from '@/lib/api'
import { Loader2, Plus, Trash2, FileText, Stethoscope } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface SelectedService {
  service_id: number
  quantity: number
  unit_price: number
  total_amount: number
  service?: Service
}

export default function EnhancedBillingForm({ onSuccess }: { onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const { toast } = useToast()

  // Data states
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [servicesByCategory, setServicesByCategory] = useState<Record<string, Service[]>>({})

  // Form states
  const [selectedMedicalRecord, setSelectedMedicalRecord] = useState<string>('')
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([])
  const [paymentStatus, setPaymentStatus] = useState<'PENDING' | 'PAID'>('PENDING')
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER' | ''>('')

  // Load initial data
  useEffect(() => {
    loadInitialData()
  }, [])

  async function loadInitialData() {
    try {
      setLoadingData(true)
      const [recordsData, servicesData] = await Promise.all([
        medicalRecordsApi.getAllMedicalRecords({ limit: 100 }),
        servicesApi.getAllServices({ is_active: 'true' })
      ])

      // Handle both array and object response formats
      const recordsList: MedicalRecord[] = Array.isArray(recordsData) 
        ? recordsData 
        : (recordsData as any).data || []
      
      const servicesList: Service[] = Array.isArray(servicesData) 
        ? servicesData 
        : (servicesData as any).data || []

      setMedicalRecords(recordsList)
      setServices(servicesList)

      // Group services by category
      const grouped = servicesList.reduce((acc: Record<string, Service[]>, service: Service) => {
        const category = service.category || 'Other'
        if (!acc[category]) acc[category] = []
        acc[category].push(service)
        return acc
      }, {} as Record<string, Service[]>)

      setServicesByCategory(grouped)
    } catch (error: any) {
      toast({
        title: "Lỗi tải dữ liệu",
        description: error.message || "Không thể tải dữ liệu",
        variant: "destructive"
      })
    } finally {
      setLoadingData(false)
    }
  }

  function addService(service: Service) {
    const existingIndex = selectedServices.findIndex((s: SelectedService) => s.service_id === service.service_id)
    
    if (existingIndex >= 0) {
      // Increase quantity if already selected
      const updated = [...selectedServices]
      updated[existingIndex].quantity += 1
      updated[existingIndex].total_amount = updated[existingIndex].quantity * updated[existingIndex].unit_price
      setSelectedServices(updated)
    } else {
      // Add new service
      setSelectedServices([...selectedServices, {
        service_id: service.service_id,
        quantity: 1,
        unit_price: parseFloat(service.unit_price.toString()),
        total_amount: parseFloat(service.unit_price.toString()),
        service: service
      }])
    }

    toast({
      title: "Đã thêm dịch vụ",
      description: `${service.service_name} đã được thêm vào hóa đơn`
    })
  }

  function updateQuantity(index: number, quantity: number) {
    if (quantity < 1) return
    const updated = [...selectedServices]
    updated[index].quantity = quantity
    updated[index].total_amount = quantity * updated[index].unit_price
    setSelectedServices(updated)
  }

  function removeService(index: number) {
    setSelectedServices(selectedServices.filter((_: SelectedService, i: number) => i !== index))
  }

  function calculateTotal(): number {
    return selectedServices.reduce((sum: number, item: SelectedService) => sum + item.total_amount, 0)
  }

  async function handleSubmit(e: any) {
    e.preventDefault()

    if (!selectedMedicalRecord) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn hồ sơ y tế",
        variant: "destructive"
      })
      return
    }

    if (selectedServices.length === 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn ít nhất một dịch vụ",
        variant: "destructive"
      })
      return
    }

    try {
      setLoading(true)
      const record = medicalRecords.find((r: MedicalRecord) => r.record_id.toString() === selectedMedicalRecord)
      
      if (!record) {
        throw new Error("Không tìm thấy hồ sơ y tế")
      }

      const result = await billingApi.createBilling({
        patient_id: record.patient_id,
        medical_record_id: record.record_id,
        billing_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
        total_amount: calculateTotal(),
        payment_status: paymentStatus,
        payment_date: paymentStatus === 'PAID' ? new Date().toISOString().split('T')[0] : undefined,
        payment_method: paymentMethod || undefined,
        billing_items: selectedServices.map((item: SelectedService) => ({
          service_id: item.service_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_amount: item.total_amount
        }))
      })

      const billId = result.bill_id

      toast({
        title: "Thành công",
        description: "Đã tạo hóa đơn thành công",
        action: (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                window.open(`/billing/print/${billId}`, '_blank', 'width=800,height=600')
              }}
            >
              In hóa đơn
            </Button>
          </div>
        )
      })

      // Reset form
      setSelectedMedicalRecord('')
      setSelectedServices([])
      setPaymentStatus('PENDING')
      setPaymentMethod('')

      if (onSuccess) onSuccess()
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo hóa đơn",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const selectedRecord = medicalRecords.find((r: MedicalRecord) => r.record_id.toString() === selectedMedicalRecord)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Medical Record Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Chọn hồ sơ y tế
          </CardTitle>
          <CardDescription>
            Chọn hồ sơ y tế của bệnh nhân để tạo hóa đơn
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="medical-record">Hồ sơ y tế *</Label>
            <Select value={selectedMedicalRecord} onValueChange={setSelectedMedicalRecord}>
              <SelectTrigger id="medical-record">
                <SelectValue placeholder="Chọn hồ sơ y tế..." />
              </SelectTrigger>
              <SelectContent>
                {medicalRecords.map((record: MedicalRecord) => (
                  <SelectItem key={record.record_id} value={record.record_id.toString()}>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {record.patient?.first_name} {record.patient?.last_name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {record.diagnosis} - {record.doctor?.first_name} {record.doctor?.last_name}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedRecord && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Thông tin hồ sơ</span>
              </div>
              <div className="text-sm space-y-1">
                <p><strong>Bệnh nhân:</strong> {selectedRecord.patient?.first_name} {selectedRecord.patient?.last_name}</p>
                <p><strong>Chẩn đoán:</strong> {selectedRecord.diagnosis}</p>
                {selectedRecord.treatment && (
                  <p><strong>Điều trị:</strong> {selectedRecord.treatment}</p>
                )}
                <p><strong>Bác sĩ:</strong> {selectedRecord.doctor?.first_name} {selectedRecord.doctor?.last_name}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="payment-status">Trạng thái thanh toán</Label>
              <Select value={paymentStatus} onValueChange={(v: any) => setPaymentStatus(v)}>
                <SelectTrigger id="payment-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Chờ thanh toán</SelectItem>
                  <SelectItem value="PAID">Đã thanh toán</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="payment-method">Phương thức thanh toán</Label>
              <Select value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)}>
                <SelectTrigger id="payment-method">
                  <SelectValue placeholder="Chọn phương thức..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">💵 Tiền mặt</SelectItem>
                  <SelectItem value="TRANSFER">🏦 Chuyển khoản</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Chọn dịch vụ</CardTitle>
          <CardDescription>
            Chọn các dịch vụ y tế đã thực hiện cho bệnh nhân
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
              <AccordionItem key={category} value={category}>
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <span>{category}</span>
                    <Badge variant="secondary">{categoryServices.length}</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pt-2">
                    {categoryServices.map(service => (
                      <div
                        key={service.service_id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-base">{service.service_name}</h4>
                            {service.requires_doctor && (
                              <Badge variant="outline" className="text-xs">Cần bác sĩ</Badge>
                            )}
                          </div>
                          {service.description && (
                            <p className="text-sm text-muted-foreground">
                              {service.description}
                            </p>
                          )}
                          <div className="flex items-baseline gap-2 mt-2">
                            <span className="text-2xl font-bold text-primary">
                              {parseFloat(service.unit_price.toString()).toLocaleString('vi-VN')}
                            </span>
                            <span className="text-lg font-semibold text-primary">₫</span>
                          </div>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => addService(service)}
                          className="ml-4 h-9"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Thêm
                        </Button>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Selected Services */}
      {selectedServices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Dịch vụ đã chọn</CardTitle>
            <CardDescription>
              Xem lại và điều chỉnh số lượng dịch vụ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedServices.map((item: SelectedService, index: number) => (
                <div key={index} className="flex items-center gap-4 p-4 border rounded-lg bg-card hover:bg-muted/30 transition-colors">
                  <div className="flex-1 space-y-1">
                    <h4 className="font-semibold text-base">{item.service?.service_name}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="font-medium">{item.unit_price.toLocaleString('vi-VN')} ₫</span>
                      <span>×</span>
                      <span className="font-medium">{item.quantity}</span>
                      <span>•</span>
                      <Badge variant="secondary" className="text-xs">{item.service?.category}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`quantity-${index}`} className="text-sm font-medium whitespace-nowrap">SL:</Label>
                      <Input
                        id={`quantity-${index}`}
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(index, parseInt(e.target.value) || 1)}
                        className="w-16 h-9 text-center"
                      />
                    </div>
                    <div className="min-w-[130px] text-right">
                      <p className="text-xl font-bold text-primary">
                        {item.total_amount.toLocaleString('vi-VN')} ₫
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeService(index)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <Separator />

              <div className="flex justify-between items-center pt-4">
                <span className="text-xl font-semibold">Tổng cộng:</span>
                <span className="text-3xl font-bold text-primary">
                  {calculateTotal().toLocaleString('vi-VN')} ₫
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button type="submit" disabled={loading || !selectedMedicalRecord || selectedServices.length === 0}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Tạo hóa đơn
        </Button>
      </div>
    </form>
  )
}
