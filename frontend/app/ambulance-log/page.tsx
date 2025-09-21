"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { DataTable } from "@/components/shared/DataTable"
import { SearchBar } from "@/components/shared/SearchBar"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { KpiCard } from "@/components/shared/KpiCard"
import { Plus, CheckCircle, XCircle, Clock, MapPin } from "lucide-react"

interface AmbulanceLog {
  log_id: string
  ambulance_id: string
  ambulance_number: string
  patient_id: string
  patient_name: string
  pickup_location: string
  dropoff_location: string
  pickup_time: string
  dropoff_time: string | null
  status: "Completed" | "In Progress" | "Canceled"
  notes: string
  created_at: string
}

// Mock data
const mockLogs: AmbulanceLog[] = [
  {
    log_id: "LOG001",
    ambulance_id: "AMB001",
    ambulance_number: "AMB-001",
    patient_id: "PAT001",
    patient_name: "Nguyễn Văn A",
    pickup_location: "123 Đường ABC, Quận 1",
    dropoff_location: "Bệnh viện Chợ Rẫy",
    pickup_time: "2024-01-20T08:30:00",
    dropoff_time: "2024-01-20T09:15:00",
    status: "Completed",
    notes: "Bệnh nhân bị đau tim cấp",
    created_at: "2024-01-20T08:00:00",
  },
  {
    log_id: "LOG002",
    ambulance_id: "AMB002",
    ambulance_number: "AMB-002",
    patient_id: "PAT002",
    patient_name: "Trần Thị B",
    pickup_location: "456 Đường DEF, Quận 3",
    dropoff_location: "Bệnh viện Đại học Y Dược",
    pickup_time: "2024-01-20T10:00:00",
    dropoff_time: null,
    status: "In Progress",
    notes: "Tai nạn giao thông",
    created_at: "2024-01-20T09:45:00",
  },
]

const mockAmbulances = [
  { id: "AMB001", number: "AMB-001" },
  { id: "AMB002", number: "AMB-002" },
  { id: "AMB003", number: "AMB-003" },
]

const mockPatients = [
  { id: "PAT001", name: "Nguyễn Văn A" },
  { id: "PAT002", name: "Trần Thị B" },
  { id: "PAT003", name: "Lê Văn C" },
]

export default function AmbulanceLogPage() {
  const [logs, setLogs] = useState<AmbulanceLog[]>(mockLogs)
  const [filteredLogs, setFilteredLogs] = useState<AmbulanceLog[]>(mockLogs)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingLog, setEditingLog] = useState<AmbulanceLog | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    ambulance_id: "",
    patient_id: "",
    pickup_location: "",
    dropoff_location: "",
    pickup_time: "",
    notes: "",
  })

  // Filter logs
  useEffect(() => {
    let filtered = logs

    if (searchQuery) {
      filtered = filtered.filter(
        (log) =>
          log.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.ambulance_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.pickup_location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.dropoff_location.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((log) => log.status === statusFilter)
    }

    setFilteredLogs(filtered)
  }, [logs, searchQuery, statusFilter])

  // Calculate KPIs
  const totalTrips = logs.length
  const completedTrips = logs.filter((l) => l.status === "Completed").length
  const inProgressTrips = logs.filter((l) => l.status === "In Progress").length
  const canceledTrips = logs.filter((l) => l.status === "Canceled").length

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const ambulance = mockAmbulances.find((a) => a.id === formData.ambulance_id)
      const patient = mockPatients.find((p) => p.id === formData.patient_id)

      const newLog: AmbulanceLog = {
        log_id: `LOG${String(logs.length + 1).padStart(3, "0")}`,
        ambulance_id: formData.ambulance_id,
        ambulance_number: ambulance?.number || "",
        patient_id: formData.patient_id,
        patient_name: patient?.name || "",
        pickup_location: formData.pickup_location,
        dropoff_location: formData.dropoff_location,
        pickup_time: formData.pickup_time,
        dropoff_time: null,
        status: "In Progress",
        notes: formData.notes,
        created_at: new Date().toISOString(),
      }

      setLogs([...logs, newLog])
      toast({ title: "Thành công", description: "Tạo chuyến đi mới thành công!" })

      setIsFormOpen(false)
      setFormData({
        ambulance_id: "",
        patient_id: "",
        pickup_location: "",
        dropoff_location: "",
        pickup_time: "",
        notes: "",
      })
    } catch (error) {
      toast({ title: "Lỗi", description: "Có lỗi xảy ra!", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusUpdate = async (logId: string, newStatus: "Completed" | "In Progress" | "Canceled") => {
    try {
      const updatedLogs = logs.map((log) =>
        log.log_id === logId
          ? {
              ...log,
              status: newStatus,
              dropoff_time: newStatus === "Completed" ? new Date().toISOString() : log.dropoff_time,
            }
          : log,
      )
      setLogs(updatedLogs)
      toast({ title: "Thành công", description: "Cập nhật trạng thái thành công!" })
    } catch (error) {
      toast({ title: "Lỗi", description: "Có lỗi xảy ra!", variant: "destructive" })
    }
  }

  const columns = [
    {
      key: "ambulance_number",
      label: "Xe cứu thương",
      sortable: true,
    },
    {
      key: "patient_name",
      label: "Bệnh nhân",
      sortable: true,
    },
    {
      key: "pickup_location",
      label: "Điểm đón",
      render: (log: AmbulanceLog) => (
        <div className="max-w-xs truncate" title={log?.pickup_location || ""}>
          {log?.pickup_location || "N/A"}
        </div>
      ),
    },
    {
      key: "dropoff_location",
      label: "Điểm đến",
      render: (log: AmbulanceLog) => (
        <div className="max-w-xs truncate" title={log?.dropoff_location || ""}>
          {log?.dropoff_location || "N/A"}
        </div>
      ),
    },
    {
      key: "pickup_time",
      label: "Thời gian đón",
      render: (log: AmbulanceLog) => (
        <span>{log?.pickup_time ? new Date(log.pickup_time).toLocaleString("vi-VN") : "N/A"}</span>
      ),
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (log: AmbulanceLog) =>
        log?.status ? <StatusBadge status={log.status} type="ambulance" /> : <span>N/A</span>,
    },
    {
      key: "actions",
      label: "Hành động",
      render: (log: AmbulanceLog) => (
        <div className="flex items-center gap-2">
          {log?.status === "In Progress" && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleStatusUpdate(log.log_id, "Completed")}
                title="Hoàn thành"
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
              <ConfirmDialog
                title="Xác nhận hủy"
                description="Bạn có chắc chắn muốn hủy chuyến đi này?"
                onConfirm={() => handleStatusUpdate(log.log_id, "Canceled")}
              >
                <Button variant="ghost" size="sm" title="Hủy">
                  <XCircle className="h-4 w-4" />
                </Button>
              </ConfirmDialog>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Nhật ký Xe cứu thương</h1>
          <p className="text-muted-foreground">Theo dõi các chuyến đi và trạng thái xe cứu thương</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tạo chuyến đi
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Tạo chuyến đi mới</DialogTitle>
                <DialogDescription>Nhập thông tin chuyến đi xe cứu thương</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="ambulance_id">Xe cứu thương *</Label>
                  <Select
                    value={formData.ambulance_id}
                    onValueChange={(value) => setFormData({ ...formData, ambulance_id: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn xe cứu thương" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockAmbulances.map((ambulance) => (
                        <SelectItem key={ambulance.id} value={ambulance.id}>
                          {ambulance.number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="patient_id">Bệnh nhân *</Label>
                  <Select
                    value={formData.patient_id}
                    onValueChange={(value) => setFormData({ ...formData, patient_id: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn bệnh nhân" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockPatients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pickup_location">Điểm đón *</Label>
                  <Input
                    id="pickup_location"
                    value={formData.pickup_location}
                    onChange={(e) => setFormData({ ...formData, pickup_location: e.target.value })}
                    placeholder="Nhập địa chỉ đón bệnh nhân"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dropoff_location">Điểm đến *</Label>
                  <Input
                    id="dropoff_location"
                    value={formData.dropoff_location}
                    onChange={(e) => setFormData({ ...formData, dropoff_location: e.target.value })}
                    placeholder="Nhập địa chỉ đến"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pickup_time">Thời gian đón *</Label>
                  <Input
                    id="pickup_time"
                    type="datetime-local"
                    value={formData.pickup_time}
                    onChange={(e) => setFormData({ ...formData, pickup_time: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Ghi chú</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Ghi chú về tình trạng bệnh nhân hoặc yêu cầu đặc biệt"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Đang xử lý..." : "Tạo chuyến đi"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Tổng chuyến đi" value={totalTrips.toString()} icon={<MapPin className="h-4 w-4" />} />
        <KpiCard label="Hoàn thành" value={completedTrips.toString()} trend="up" />
        <KpiCard label="Đang thực hiện" value={inProgressTrips.toString()} icon={<Clock className="h-4 w-4" />} />
        <KpiCard label="Đã hủy" value={canceledTrips.toString()} />
      </div>

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <CardTitle>Nhật ký chuyến đi</CardTitle>
          <CardDescription>Danh sách các chuyến đi xe cứu thương và trạng thái</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <SearchBar placeholder="Tìm kiếm theo bệnh nhân, xe, địa điểm..." onSearch={setSearchQuery} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="Completed">Hoàn thành</SelectItem>
                <SelectItem value="In Progress">Đang thực hiện</SelectItem>
                <SelectItem value="Canceled">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DataTable
            columns={columns}
            data={filteredLogs}
            total={filteredLogs.length}
            page={1}
            pageSize={10}
            onPageChange={() => {}}
            onSort={() => {}}
            onFilter={() => {}}
          />
        </CardContent>
      </Card>
    </div>
  )
}
