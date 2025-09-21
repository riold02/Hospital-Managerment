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
import { toast } from "@/hooks/use-toast"
import { DataTable } from "@/components/shared/DataTable"
import { SearchBar } from "@/components/shared/SearchBar"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { KpiCard } from "@/components/shared/KpiCard"
import { Truck, Plus, Edit, Trash2, ToggleLeft, ToggleRight, Wrench } from "lucide-react"

interface Ambulance {
  ambulance_id: string
  ambulance_number: string
  availability: "Available" | "On Duty" | "Maintenance"
  driver_id: string
  driver_name: string
  last_service_date: string
  created_at: string
}

// Mock data
const mockAmbulances: Ambulance[] = [
  {
    ambulance_id: "AMB001",
    ambulance_number: "AMB-001",
    availability: "Available",
    driver_id: "DRV001",
    driver_name: "Nguyễn Văn An",
    last_service_date: "2024-01-15",
    created_at: "2024-01-01",
  },
  {
    ambulance_id: "AMB002",
    ambulance_number: "AMB-002",
    availability: "On Duty",
    driver_id: "DRV002",
    driver_name: "Trần Thị Bình",
    last_service_date: "2024-01-10",
    created_at: "2024-01-01",
  },
  {
    ambulance_id: "AMB003",
    ambulance_number: "AMB-003",
    availability: "Maintenance",
    driver_id: "DRV003",
    driver_name: "Lê Văn Cường",
    last_service_date: "2024-01-05",
    created_at: "2024-01-01",
  },
]

const mockDrivers = [
  { id: "DRV001", name: "Nguyễn Văn An" },
  { id: "DRV002", name: "Trần Thị Bình" },
  { id: "DRV003", name: "Lê Văn Cường" },
  { id: "DRV004", name: "Phạm Thị Dung" },
]

export function AmbulanceManagement() {
  const [ambulances, setAmbulances] = useState<Ambulance[]>(mockAmbulances)
  const [filteredAmbulances, setFilteredAmbulances] = useState<Ambulance[]>(mockAmbulances)
  const [searchQuery, setSearchQuery] = useState("")
  const [availabilityFilter, setAvailabilityFilter] = useState("all")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingAmbulance, setEditingAmbulance] = useState<Ambulance | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    ambulance_number: "",
    driver_id: "",
    availability: "Available" as "Available" | "On Duty" | "Maintenance",
    last_service_date: "",
  })

  // Filter ambulances
  useEffect(() => {
    let filtered = ambulances

    if (searchQuery) {
      filtered = filtered.filter(
        (ambulance) =>
          ambulance.ambulance_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ambulance.driver_name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (availabilityFilter !== "all") {
      filtered = filtered.filter((ambulance) => ambulance.availability === availabilityFilter)
    }

    setFilteredAmbulances(filtered)
  }, [ambulances, searchQuery, availabilityFilter])

  // Calculate KPIs
  const totalAmbulances = ambulances.length
  const availableAmbulances = ambulances.filter((a) => a.availability === "Available").length
  const onDutyAmbulances = ambulances.filter((a) => a.availability === "On Duty").length
  const maintenanceAmbulances = ambulances.filter((a) => a.availability === "Maintenance").length

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (editingAmbulance) {
        // Update ambulance
        const updatedAmbulances = ambulances.map((ambulance) =>
          ambulance.ambulance_id === editingAmbulance.ambulance_id
            ? {
                ...ambulance,
                ...formData,
                driver_name: mockDrivers.find((d) => d.id === formData.driver_id)?.name || "",
              }
            : ambulance,
        )
        setAmbulances(updatedAmbulances)
        toast({ title: "Thành công", description: "Cập nhật xe cứu thương thành công!" })
      } else {
        // Create new ambulance
        const newAmbulance: Ambulance = {
          ambulance_id: `AMB${String(ambulances.length + 1).padStart(3, "0")}`,
          ...formData,
          driver_name: mockDrivers.find((d) => d.id === formData.driver_id)?.name || "",
          created_at: new Date().toISOString().split("T")[0],
        }
        setAmbulances([...ambulances, newAmbulance])
        toast({ title: "Thành công", description: "Thêm xe cứu thương mới thành công!" })
      }

      setIsFormOpen(false)
      setEditingAmbulance(null)
      setFormData({
        ambulance_number: "",
        driver_id: "",
        availability: "Available",
        last_service_date: "",
      })
    } catch (error) {
      toast({ title: "Lỗi", description: "Có lỗi xảy ra!", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (ambulance: Ambulance) => {
    setEditingAmbulance(ambulance)
    setFormData({
      ambulance_number: ambulance.ambulance_number,
      driver_id: ambulance.driver_id,
      availability: ambulance.availability,
      last_service_date: ambulance.last_service_date,
    })
    setIsFormOpen(true)
  }

  const handleDelete = async (ambulanceId: string) => {
    try {
      setAmbulances(ambulances.filter((a) => a.ambulance_id !== ambulanceId))
      toast({ title: "Thành công", description: "Xóa xe cứu thương thành công!" })
    } catch (error) {
      toast({ title: "Lỗi", description: "Có lỗi xảy ra!", variant: "destructive" })
    }
  }

  const toggleAvailability = async (ambulance: Ambulance) => {
    try {
      const newAvailability = ambulance.availability === "Available" ? "On Duty" : "Available"
      const updatedAmbulances = ambulances.map((a) =>
        a.ambulance_id === ambulance.ambulance_id ? { ...a, availability: newAvailability } : a,
      )
      setAmbulances(updatedAmbulances)
      toast({
        title: "Thành công",
        description: `Cập nhật trạng thái xe ${ambulance.ambulance_number} thành công!`,
      })
    } catch (error) {
      toast({ title: "Lỗi", description: "Có lỗi xảy ra!", variant: "destructive" })
    }
  }

  const columns = [
    {
      key: "ambulance_number",
      label: "Số xe",
      sortable: true,
    },
    {
      key: "driver_name",
      label: "Tài xế",
      sortable: true,
    },
    {
      key: "availability",
      label: "Trạng thái",
      render: (ambulance: Ambulance) =>
        ambulance?.availability ? <StatusBadge status={ambulance.availability} type="ambulance" /> : <span>N/A</span>,
    },
    {
      key: "last_service_date",
      label: "Bảo trì cuối",
      render: (ambulance: Ambulance) => (
        <span>
          {ambulance?.last_service_date ? new Date(ambulance.last_service_date).toLocaleDateString("vi-VN") : "N/A"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Hành động",
      render: (ambulance: Ambulance) =>
        ambulance ? (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleAvailability(ambulance)}
              disabled={ambulance.availability === "Maintenance"}
            >
              {ambulance.availability === "Available" ? (
                <ToggleLeft className="h-4 w-4" />
              ) : (
                <ToggleRight className="h-4 w-4" />
              )}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleEdit(ambulance)}>
              <Edit className="h-4 w-4" />
            </Button>
            <ConfirmDialog
              title="Xác nhận xóa"
              description={`Bạn có chắc chắn muốn xóa xe ${ambulance.ambulance_number}?`}
              onConfirm={() => handleDelete(ambulance.ambulance_id)}
            >
              <Button variant="ghost" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </ConfirmDialog>
          </div>
        ) : (
          <span>N/A</span>
        ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingAmbulance(null)
                setFormData({
                  ambulance_number: "",
                  driver_id: "",
                  availability: "Available",
                  last_service_date: "",
                })
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm xe mới
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingAmbulance ? "Chỉnh sửa xe cứu thương" : "Thêm xe cứu thương mới"}</DialogTitle>
                <DialogDescription>
                  {editingAmbulance ? "Cập nhật thông tin xe cứu thương" : "Nhập thông tin xe cứu thương mới"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="ambulance_number">Số xe *</Label>
                  <Input
                    id="ambulance_number"
                    value={formData.ambulance_number}
                    onChange={(e) => setFormData({ ...formData, ambulance_number: e.target.value })}
                    placeholder="VD: AMB-001"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="driver_id">Tài xế *</Label>
                  <Select
                    value={formData.driver_id}
                    onValueChange={(value) => setFormData({ ...formData, driver_id: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn tài xế" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockDrivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id}>
                          {driver.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="availability">Trạng thái</Label>
                  <Select
                    value={formData.availability}
                    onValueChange={(value: "Available" | "On Duty" | "Maintenance") =>
                      setFormData({ ...formData, availability: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Available">Sẵn sàng</SelectItem>
                      <SelectItem value="On Duty">Đang làm việc</SelectItem>
                      <SelectItem value="Maintenance">Bảo trì</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="last_service_date">Ngày bảo trì cuối</Label>
                  <Input
                    id="last_service_date"
                    type="date"
                    value={formData.last_service_date}
                    onChange={(e) => setFormData({ ...formData, last_service_date: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Đang xử lý..." : editingAmbulance ? "Cập nhật" : "Thêm mới"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Tổng số xe" value={totalAmbulances.toString()} icon={<Truck className="h-4 w-4" />} />
        <KpiCard
          label="Xe sẵn sàng"
          value={availableAmbulances.toString()}
          trend={availableAmbulances > 0 ? "up" : "down"}
        />
        <KpiCard label="Xe đang làm việc" value={onDutyAmbulances.toString()} />
        <KpiCard label="Xe bảo trì" value={maintenanceAmbulances.toString()} icon={<Wrench className="h-4 w-4" />} />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách xe cứu thương</CardTitle>
          <CardDescription>Quản lý và theo dõi trạng thái các xe cứu thương</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <SearchBar placeholder="Tìm kiếm theo số xe, tài xế..." onSearch={setSearchQuery} />
            </div>
            <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="Available">Sẵn sàng</SelectItem>
                <SelectItem value="On Duty">Đang làm việc</SelectItem>
                <SelectItem value="Maintenance">Bảo trì</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DataTable
            columns={columns}
            data={filteredAmbulances}
            total={filteredAmbulances.length}
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
