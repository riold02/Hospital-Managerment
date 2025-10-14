"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Calendar as CalendarIcon,
  Clock,
  Moon,
  Sun,
  Sunrise,
  Users,
  ChevronLeft,
  ChevronRight,
  Building,
  FileText
} from "lucide-react"

interface ShiftScheduleCalendarProps {
  onRefresh?: () => void
  role?: 'nurse' | 'doctor' | 'staff' // Role để tùy chỉnh hiển thị
  userId?: number // ID của user để fetch data
}

interface Shift {
  id: string
  date: string
  type: 'morning' | 'afternoon' | 'night'
  status: 'scheduled' | 'completed' | 'current'
  notes?: string
  time?: string
  patients?: number
  location?: string
  assignedCount?: number // Số lượng bệnh nhân/ca phẫu thuật/công việc tùy role
}

export default function ShiftScheduleCalendar({ onRefresh, role = 'nurse', userId }: ShiftScheduleCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showDayDetail, setShowDayDetail] = useState(false)

  // Mock data - sẽ thay bằng API call thực tế
  const currentShift: Shift = {
    id: "1",
    date: new Date().toISOString().split('T')[0],
    type: "morning",
    status: "current",
    time: "7:00 - 15:00",
    patients: 8,
    location: "Khoa Nội - Tầng 3"
  }

  const upcomingShifts: Shift[] = [
    {
      id: "2",
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      type: "afternoon",
      status: "scheduled",
      time: "15:00 - 23:00",
      patients: 6,
      location: "Khoa Nội - Tầng 3"
    },
    {
      id: "3",
      date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
      type: "morning",
      status: "scheduled",
      time: "7:00 - 15:00",
      patients: 7,
      location: "Khoa Nội - Tầng 3"
    },
    {
      id: "4",
      date: new Date(Date.now() + 259200000).toISOString().split('T')[0],
      type: "night",
      status: "scheduled",
      time: "23:00 - 7:00",
      patients: 5,
      location: "Khoa Ngoại - Tầng 4"
    }
  ]

  const completedShifts: Shift[] = [
    {
      id: "0",
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      type: "night",
      status: "completed",
      notes: "Bàn giao: 15 bệnh nhân ổn định, 2 cần theo dõi",
      time: "23:00 - 7:00",
      patients: 9,
      location: "Khoa Nội - Tầng 3"
    }
  ]

  const getShiftIcon = (type: string) => {
    switch (type) {
      case 'morning': return <Sunrise className="h-3.5 w-3.5" />
      case 'afternoon': return <Sun className="h-3.5 w-3.5" />
      case 'night': return <Moon className="h-3.5 w-3.5" />
    }
  }

  const getShiftColor = (type: string) => {
    switch (type) {
      case 'morning': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
      case 'afternoon': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'night': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    return { daysInMonth, startingDayOfWeek, year, month }
  }

  const getShiftsForDate = (day: number): Shift[] => {
    const { year, month } = getDaysInMonth(currentDate)
    const dateStr = new Date(year, month, day).toISOString().split('T')[0]
    return [...upcomingShifts, ...completedShifts, currentShift].filter(shift => shift.date === dateStr)
  }

  const isToday = (day: number): boolean => {
    const today = new Date()
    const { year, month } = getDaysInMonth(currentDate)
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year
  }

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate)
  const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 
                      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12']
  const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

  return (
    <div className="space-y-6">
      {/* Calendar View */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Lịch ca trực
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Hôm nay
              </Button>
              <Button variant="outline" size="sm" onClick={goToNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-bold text-primary">
              {monthNames[month]} {year}
            </h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {/* Week days header */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {weekDays.map((day, index) => (
                <div
                  key={day}
                  className={`text-center font-semibold text-sm py-2 ${
                    index === 0 ? 'text-red-600' : 'text-muted-foreground'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days - Compact version */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for days before month starts */}
              {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                <div key={`empty-${index}`} className="h-20" />
              ))}

              {/* Actual days */}
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1
                const shifts = getShiftsForDate(day)
                const isCurrentDay = isToday(day)

                return (
                  <div
                    key={day}
                    className={`
                      h-20 border rounded-md p-1.5 cursor-pointer transition-all
                      hover:shadow-sm hover:border-primary
                      ${isCurrentDay ? 'border-2 border-primary bg-primary/5' : 'border-gray-200'}
                      ${shifts.length > 0 ? 'bg-blue-50 dark:bg-blue-950' : 'bg-white dark:bg-gray-900'}
                    `}
                    onClick={() => {
                      setSelectedDate(new Date(year, month, day))
                      setShowDayDetail(true)
                    }}
                  >
                    <div className="flex flex-col h-full">
                      <div className={`text-xs font-semibold mb-0.5 ${isCurrentDay ? 'text-primary' : ''}`}>
                        {day}
                      </div>
                      <div className="flex-1 space-y-0.5 overflow-hidden">
                        {shifts.slice(0, 2).map((shift, idx) => (
                          <div
                            key={idx}
                            className={`text-[10px] px-1 py-0.5 rounded flex items-center gap-0.5 ${getShiftColor(shift.type)}`}
                          >
                            <span className="w-3 h-3">{getShiftIcon(shift.type)}</span>
                            <span className="truncate">{shift.type === 'morning' ? 'Sáng' : shift.type === 'afternoon' ? 'Chiều' : 'Đêm'}</span>
                          </div>
                        ))}
                        {shifts.length > 2 && (
                          <div className="text-[9px] text-muted-foreground text-center">
                            +{shifts.length - 2} ca
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Day Detail Dialog - View only */}
      <Dialog open={showDayDetail} onOpenChange={setShowDayDetail}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Chi tiết lịch ca - {selectedDate ? `${selectedDate.getDate()}/${selectedDate.getMonth() + 1}/${selectedDate.getFullYear()}` : ''}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            {selectedDate && getShiftsForDate(selectedDate.getDate()).length > 0 ? (
              <>
                {getShiftsForDate(selectedDate.getDate()).map((shift, idx) => (
                  <Card key={idx} className="border-l-4" style={{ borderLeftColor: shift.type === 'morning' ? '#f59e0b' : shift.type === 'afternoon' ? '#fb923c' : '#6366f1' }}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getShiftIcon(shift.type)}
                          <h4 className="font-semibold">
                            Ca {shift.type === 'morning' ? 'Sáng' : shift.type === 'afternoon' ? 'Chiều' : 'Đêm'}
                          </h4>
                        </div>
                        <Badge variant={shift.type === 'morning' ? 'default' : shift.type === 'afternoon' ? 'secondary' : 'outline'}>
                          {shift.time}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <span className="font-medium">
                              {role === 'doctor' ? 'Ca phẫu thuật / Khám:' : 
                               role === 'nurse' ? 'Bệnh nhân phụ trách:' : 
                               'Công việc:'}
                            </span>
                            <span className="ml-2">
                              {shift.patients || shift.assignedCount || 5} {role === 'doctor' ? 'ca' : 'người'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Building className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <span className="font-medium">Khu vực:</span>
                            <span className="ml-2">{shift.location || 'Khoa Nội - Tầng 3'}</span>
                          </div>
                        </div>
                        {shift.notes && (
                          <div className="flex items-start gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                              <span className="font-medium">Ghi chú:</span>
                              <p className="ml-2 text-muted-foreground">{shift.notes}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Không có ca trực trong ngày này</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
