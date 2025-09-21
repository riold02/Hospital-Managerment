"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DataTable } from "@/components/shared/DataTable"
import { SearchBar } from "@/components/shared/SearchBar"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { useToast } from "@/hooks/use-toast"
import { UserCheck, Plus, ArrowRightLeft, LogOut, Bed } from "lucide-react"

interface RoomAssignment {
  assignment_id: string
  room_number: string
  room_type: string
  patient_name: string
  patient_id: string
  staff_name: string
  staff_id: string
  assignment_date: string
  end_date?: string
  status: "Active" | "Completed"
}

interface Patient {
  id: string
  name: string
  phone: string
}

interface Staff {
  id: string
  name: string
  role: string
}

interface Room {
  id: string
  room_number: string
  type: string
  status: "Available" | "Occupied" | "Under Maintenance"
}

export default function RoomAssignmentsPage() {
  const [assignments, setAssignments] = useState<RoomAssignment[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Modal states
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<RoomAssignment | null>(null)

  // Form states
  const [assignForm, setAssignForm] = useState({
    patient_id: "",
    room_id: "",
    staff_id: "",
    assignment_date: new Date().toISOString().split("T")[0],
  })

  const [transferForm, setTransferForm] = useState({
    new_room_id: "",
  })

  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Mock API calls - replace with actual endpoints
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockAssignments: RoomAssignment[] = [
        {
          assignment_id: "A001",
          room_number: "101",
          room_type: "Phòng đơn",
          patient_name: "Nguyễn Văn An",
          patient_id: "P001",
          staff_name: "Y tá Lan",
          staff_id: "S001",
          assignment_date: "2024-01-15",
          status: "Active",
        },
        {
          assignment_id: "A002",
          room_number: "102",
          room_type: "Phòng đôi",
          patient_name: "Trần Thị Bình",
          patient_id: "P002",
          staff_name: "Y tá Hoa",
          staff_id: "S002",
          assignment_date: "2024-01-16",
          status: "Active",
        },
        {
          assignment_id: "A003",
          room_number: "201",
          room_type: "ICU",
          patient_name: "Lê Văn Cường",
          patient_id: "P003",
          staff_name: "Y tá Minh",
          staff_id: "S003",
          assignment_date: "2024-01-10",
          end_date: "2024-01-17",
          status: "Completed",
        },
      ]

      const mockPatients: Patient[] = [
        { id: "P004", name: "Phạm Thị Dung", phone: "0901234567" },
        { id: "P005", name: "Hoàng Văn Em", phone: "0912345678" },
        { id: "P006", name: "Vũ Thị Phương", phone: "0923456789" },
      ]

      const mockStaff: Staff[] = [
        { id: "S004", name: "Y tá Thu", role: "Nurse" },
        { id: "S005", name: "Y tá Nam", role: "Nurse" },
        { id: "S006", name: "Bác sĩ Khoa", role: "Doctor" },
      ]

      const mockRooms: Room[] = [
        { id: "R104", room_number: "104", type: "Phòng đơn", status: "Available" },
        { id: "R105", room_number: "105", type: "Phòng đôi", status: "Available" },
        { id: "R106", room_number: "106", type: "ICU", status: "Available" },
      ]

      setAssignments(mockAssignments)
      setPatients(mockPatients)
      setStaff(mockStaff)
      setRooms(mockRooms)
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu phân giường",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAssignRoom = async () => {
    try {
      // API call: POST /room-assignments
      const selectedPatient = patients.find((p) => p.id === assignForm.patient_id)
      const selectedRoom = rooms.find((r) => r.id === assignForm.room_id)
      const selectedStaff = staff.find((s) => s.id === assignForm.staff_id)

      if (selectedPatient && selectedRoom && selectedStaff) {
        const newAssignment: RoomAssignment = {
          assignment_id: `A${Date.now()}`,
          room_number: selectedRoom.room_number,
          room_type: selectedRoom.type,
          patient_name: selectedPatient.name,
          patient_id: selectedPatient.id,
          staff_name: selectedStaff.name,
          staff_id: selectedStaff.id,
          assignment_date: assignForm.assignment_date,
          status: "Active",
        }

        setAssignments((prev) => [...prev, newAssignment])
        setIsAssignModalOpen(false)
        resetAssignForm()

        toast({
          title: "Thành công",
          description: "Đã phân giường cho bệnh nhân",
        })
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể phân giường",
        variant: "destructive",
      })
    }
  }

  const handleTransferRoom = async () => {
    if (!selectedAssignment) return

    try {
      // API call: PUT /room-assignments/{id} with new room_id
      const newRoom = rooms.find((r) => r.id === transferForm.new_room_id)
      if (newRoom) {
        setAssignments((prev) =>
          prev.map((a) =>
            a.assignment_id === selectedAssignment.assignment_id
              ? { ...a, room_number: newRoom.room_number, room_type: newRoom.type }
              : a,
          ),
        )

        setIsTransferModalOpen(false)
        setTransferForm({ new_room_id: "" })
        setSelectedAssignment(null)

        toast({
          title: "Thành công",
          description: "Đã chuyển phòng cho bệnh nhân",
        })
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể chuyển phòng",
        variant: "destructive",
      })
    }
  }

  const handleCheckout = async () => {
    if (!selectedAssignment) return

    try {
      // API call: PUT /room-assignments/{id} with end_date
      const today = new Date().toISOString().split("T")[0]
      setAssignments((prev) =>
        prev.map((a) =>
          a.assignment_id === selectedAssignment.assignment_id
            ? { ...a, end_date: today, status: "Completed" as const }
            : a,
        ),
      )

      setIsCheckoutModalOpen(false)
      setSelectedAssignment(null)

      toast({
        title: "Thành công",
        description: "Đã xuất viện bệnh nhân",
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xuất viện",
        variant: "destructive",
      })
    }
  }

  const resetAssignForm = () => {
    setAssignForm({
      patient_id: "",
      room_id: "",
      staff_id: "",
      assignment_date: new Date().toISOString().split("T")[0],
    })
  }

  // Filter assignments
  const filteredAssignments = assignments.filter((assignment) => {
    const matchesSearch =
      assignment.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.room_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.staff_name.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesSearch
  })

  const columns = [
    {
      key: "room_number",
      label: "Phòng",
      sortable: true,
    },
    {
      key: "patient_name",
      label: "Bệnh nhân",
      sortable: true,
    },
    {
      key: "staff_name",
      label: "Nhân viên phụ trách",
      sortable: true,
    },
    {
      key: "assignment_date",
      label: "Ngày phân giường",
      render: (assignment: RoomAssignment) =>
        assignment?.assignment_date ? new Date(assignment.assignment_date).toLocaleDateString("vi-VN") : "N/A",
    },
    {
      key: "end_date",
      label: "Ngày xuất viện",
      render: (assignment: RoomAssignment) =>
        assignment?.end_date ? new Date(assignment.end_date).toLocaleDateString("vi-VN") : "-",
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (assignment: RoomAssignment) => (
        <StatusBadge status={assignment?.status === "Active" ? "Active" : "Completed"} type="assignment" />
      ),
    },
    {
      key: "actions",
      label: "Hành động",
      render: (assignment: RoomAssignment) => (
        <div className="flex gap-2">
          {assignment?.status === "Active" && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedAssignment(assignment)
                  setIsTransferModalOpen(true)
                }}
              >
                <ArrowRightLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedAssignment(assignment)
                  setIsCheckoutModalOpen(true)
                }}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ]

  const activeAssignments = assignments.filter((a) => a.status === "Active").length
  const completedAssignments = assignments.filter((a) => a.status === "Completed").length

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Phân giường</h1>
          <p className="text-muted-foreground">Quản lý phân giường bệnh nhân và nhân viên phụ trách</p>
        </div>
        <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Phân giường mới
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Phân giường cho bệnh nhân</DialogTitle>
              <DialogDescription>Chọn bệnh nhân, phòng và nhân viên phụ trách</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="patient">Bệnh nhân *</Label>
                <Select
                  value={assignForm.patient_id}
                  onValueChange={(value) => setAssignForm((prev) => ({ ...prev, patient_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn bệnh nhân" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name} - {patient.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="room">Phòng *</Label>
                <Select
                  value={assignForm.room_id}
                  onValueChange={(value) => setAssignForm((prev) => ({ ...prev, room_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn phòng" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        Phòng {room.room_number} - {room.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="staff">Nhân viên phụ trách *</Label>
                <Select
                  value={assignForm.staff_id}
                  onValueChange={(value) => setAssignForm((prev) => ({ ...prev, staff_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn nhân viên" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name} - {member.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="assignment_date">Ngày phân giường *</Label>
                <Input
                  id="assignment_date"
                  type="date"
                  value={assignForm.assignment_date}
                  onChange={(e) => setAssignForm((prev) => ({ ...prev, assignment_date: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAssignModalOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleAssignRoom}>Phân giường</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng phân giường</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang điều trị</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeAssignments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã xuất viện</CardTitle>
            <LogOut className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{completedAssignments}</div>
          </CardContent>
        </Card>
      </div>

      {/* Assignments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách phân giường</CardTitle>
          <div className="flex gap-4 items-center">
            <SearchBar onSearch={setSearchQuery} placeholder="Tìm kiếm theo bệnh nhân, phòng, nhân viên..." />
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredAssignments}
            loading={loading}
            emptyMessage="Không có phân giường nào"
          />
        </CardContent>
      </Card>

      {/* Transfer Modal */}
      <Dialog open={isTransferModalOpen} onOpenChange={setIsTransferModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chuyển phòng</DialogTitle>
            <DialogDescription>Chuyển bệnh nhân {selectedAssignment?.patient_name} sang phòng khác</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new_room">Phòng mới *</Label>
              <Select
                value={transferForm.new_room_id}
                onValueChange={(value) => setTransferForm((prev) => ({ ...prev, new_room_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn phòng mới" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      Phòng {room.room_number} - {room.type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTransferModalOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleTransferRoom}>Chuyển phòng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Checkout Confirmation */}
      <ConfirmDialog
        open={isCheckoutModalOpen}
        onOpenChange={setIsCheckoutModalOpen}
        onConfirm={handleCheckout}
        title="Xác nhận xuất viện"
        description={`Bạn có chắc chắn muốn xuất viện cho bệnh nhân ${selectedAssignment?.patient_name}?`}
      />
    </div>
  )
}
