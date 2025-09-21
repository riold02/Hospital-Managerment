import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type StatusType = "appointment" | "billing" | "room" | "ambulance" | "prescription" | "cleaning"

interface StatusBadgeProps {
  status: string
  type: StatusType
  className?: string
}

const statusConfig = {
  appointment: {
    Scheduled: { label: "Đã lên lịch", variant: "default" as const, color: "bg-blue-100 text-blue-800" },
    "In Progress": { label: "Đang diễn ra", variant: "default" as const, color: "bg-yellow-100 text-yellow-800" },
    Completed: { label: "Hoàn thành", variant: "default" as const, color: "bg-green-100 text-green-800" },
    Cancelled: { label: "Đã hủy", variant: "destructive" as const, color: "bg-red-100 text-red-800" },
    "No Show": { label: "Không đến", variant: "secondary" as const, color: "bg-gray-100 text-gray-800" },
  },
  billing: {
    Paid: { label: "Đã thanh toán", variant: "default" as const, color: "bg-green-100 text-green-800" },
    Pending: { label: "Chờ thanh toán", variant: "secondary" as const, color: "bg-yellow-100 text-yellow-800" },
    Overdue: { label: "Quá hạn", variant: "destructive" as const, color: "bg-red-100 text-red-800" },
    Partial: { label: "Thanh toán một phần", variant: "outline" as const, color: "bg-orange-100 text-orange-800" },
  },
  room: {
    Available: { label: "Có sẵn", variant: "default" as const, color: "bg-green-100 text-green-800" },
    Occupied: { label: "Đang sử dụng", variant: "secondary" as const, color: "bg-blue-100 text-blue-800" },
    "Under Maintenance": { label: "Bảo trì", variant: "destructive" as const, color: "bg-red-100 text-red-800" },
    Cleaning: { label: "Đang dọn dẹp", variant: "outline" as const, color: "bg-yellow-100 text-yellow-800" },
  },
  ambulance: {
    Available: { label: "Sẵn sàng", variant: "default" as const, color: "bg-green-100 text-green-800" },
    "In Transit": { label: "Đang di chuyển", variant: "secondary" as const, color: "bg-blue-100 text-blue-800" },
    "On Call": { label: "Đang phục vụ", variant: "default" as const, color: "bg-yellow-100 text-yellow-800" },
    Maintenance: { label: "Bảo trì", variant: "destructive" as const, color: "bg-red-100 text-red-800" },
    Completed: { label: "Hoàn thành", variant: "default" as const, color: "bg-green-100 text-green-800" },
    Cancelled: { label: "Đã hủy", variant: "destructive" as const, color: "bg-red-100 text-red-800" },
  },
  prescription: {
    Pending: { label: "Chờ xuất", variant: "secondary" as const, color: "bg-yellow-100 text-yellow-800" },
    Dispensed: { label: "Đã xuất", variant: "default" as const, color: "bg-green-100 text-green-800" },
    Cancelled: { label: "Đã hủy", variant: "destructive" as const, color: "bg-red-100 text-red-800" },
  },
  cleaning: {
    Pending: { label: "Chờ thực hiện", variant: "secondary" as const, color: "bg-yellow-100 text-yellow-800" },
    "In Progress": { label: "Đang thực hiện", variant: "default" as const, color: "bg-blue-100 text-blue-800" },
    Completed: { label: "Hoàn thành", variant: "default" as const, color: "bg-green-100 text-green-800" },
  },
}

export function StatusBadge({ status, type, className }: StatusBadgeProps) {
  const config = statusConfig[type]?.[status] || {
    label: status,
    variant: "outline" as const,
    color: "bg-gray-100 text-gray-800",
  }

  return (
    <Badge variant={config.variant} className={cn(config.color, className)}>
      {config.label}
    </Badge>
  )
}
