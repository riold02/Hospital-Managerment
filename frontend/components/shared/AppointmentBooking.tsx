"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { Calendar, Plus } from "lucide-react"
import { apiClient } from "@/lib/api-client"

interface Doctor {
  doctor_id: number
  first_name: string
  last_name: string
  specialty: string
  available_schedule?: string
}

interface Department {
  department_id: number
  name: string
  description?: string
}

interface AppointmentBookingProps {
  onSuccess?: (appointment: any) => void
  triggerButton?: React.ReactNode
}

export default function AppointmentBooking({ onSuccess, triggerButton }: AppointmentBookingProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([])

  const [formData, setFormData] = useState({
    department_id: "",
    doctor_id: "",
    appointment_date: "",
    appointment_time: "",
    purpose: "",
  })

  // Load departments and doctors when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        const [doctorsData, departmentsData] = await Promise.all([
          apiClient.getDoctors(),
          apiClient.getDepartments()
        ])
        setDoctors(doctorsData)
        setDepartments(departmentsData)
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách bác sĩ và khoa",
          variant: "destructive",
        })
      }
    }
    
    if (isOpen) {
      loadData()
    }
  }, [isOpen])

  // Filter doctors by department
  useEffect(() => {
    if (formData.department_id && doctors.length > 0) {
      // In a real app, you'd filter by department relationship
      // For now, we'll show all doctors and let user pick
      setFilteredDoctors(doctors)
    } else {
      setFilteredDoctors(doctors)
    }
  }, [formData.department_id, doctors])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.doctor_id || !formData.appointment_date || !formData.appointment_time || !formData.purpose) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin",
        variant: "destructive",
      })
      return
    }

    // Validate purpose length
    if (formData.purpose.length < 10) {
      toast({
        title: "Lỗi",
        description: "Mục đích khám phải có ít nhất 10 ký tự",
        variant: "destructive",
      })
      return
    }

    // Validate appointment date
    const appointmentDate = new Date(formData.appointment_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (appointmentDate < today) {
      toast({
        title: "Lỗi",
        description: "Không thể đặt lịch hẹn trong quá khứ",
        variant: "destructive",
      })
      return
    }

    // Check if it's weekend
    const dayOfWeek = appointmentDate.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      toast({
        title: "Lỗi",
        description: "Không thể đặt lịch hẹn vào cuối tuần",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const appointmentData = {
        doctor_id: Number(formData.doctor_id),
        appointment_date: formData.appointment_date,
        appointment_time: formData.appointment_time,
        purpose: formData.purpose,
        status: 'Scheduled'
      }

      console.log('Submitting appointment data:', appointmentData)
      const newAppointment = await apiClient.createAppointment(appointmentData)
      
      toast({
        title: "Đặt lịch thành công",
        description: "Lịch hẹn của bạn đã được tạo và đang chờ xác nhận.",
      })
      
      // Reset form
      setFormData({
        department_id: "",
        doctor_id: "",
        appointment_date: "",
        appointment_time: "",
        purpose: "",
      })
      
      setIsOpen(false)
      
      // Call success callback
      if (onSuccess) {
        onSuccess(newAppointment)
      }
      
    } catch (error: any) {
      console.error("Error booking appointment:", error)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể đặt lịch hẹn. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const generateTimeSlots = () => {
    const slots = []
    // Morning slots
    for (let i = 8; i <= 11; i++) {
      slots.push(`${i.toString().padStart(2, '0')}:00`)
      if (i < 11) slots.push(`${i.toString().padStart(2, '0')}:30`)
    }
    // Afternoon slots  
    for (let i = 14; i <= 17; i++) {
      slots.push(`${i.toString().padStart(2, '0')}:00`)
      if (i < 17) slots.push(`${i.toString().padStart(2, '0')}:30`)
    }
    return slots
  }

  const defaultTrigger = (
    <Button>
      <Plus className="w-4 h-4 mr-2" />
      Đặt lịch hẹn
    </Button>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {triggerButton || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Đặt lịch hẹn khám bệnh
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="department_id">Khoa khám</Label>
            <Select
              value={formData.department_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, department_id: value, doctor_id: "" }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn khoa khám" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.department_id} value={dept.department_id.toString()}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="doctor_id">Bác sĩ *</Label>
            <Select
              value={formData.doctor_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, doctor_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn bác sĩ" />
              </SelectTrigger>
              <SelectContent>
                {filteredDoctors.map((doctor) => (
                  <SelectItem key={doctor.doctor_id} value={doctor.doctor_id.toString()}>
                    {doctor.first_name} {doctor.last_name} - {doctor.specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="appointment_date">Ngày hẹn *</Label>
              <Input
                id="appointment_date"
                type="date"
                value={formData.appointment_date}
                onChange={(e) => setFormData(prev => ({ ...prev, appointment_date: e.target.value }))}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div>
              <Label htmlFor="appointment_time">Giờ hẹn *</Label>
              <Select
                value={formData.appointment_time}
                onValueChange={(value) => setFormData(prev => ({ ...prev, appointment_time: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn giờ" />
                </SelectTrigger>
                <SelectContent>
                  {generateTimeSlots().map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="purpose">Mục đích khám *</Label>
            <Textarea
              id="purpose"
              value={formData.purpose}
              onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
              placeholder="Mô tả triệu chứng hoặc lý do khám bệnh (ít nhất 10 ký tự)..."
              rows={3}
              minLength={10}
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground mt-1">
              {formData.purpose.length}/500 ký tự (tối thiểu 10 ký tự)
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Đang đặt lịch..." : "Đặt lịch hẹn"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={loading}
            >
              Hủy
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
