"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AlertTriangle, Trash2, CheckCircle, XCircle } from "lucide-react"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: "destructive" | "default"
  icon?: "warning" | "delete" | "success" | "error"
}

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  variant = "default",
  icon = "warning",
}: ConfirmDialogProps) {
  const getIcon = () => {
    switch (icon) {
      case "delete":
        return <Trash2 className="h-6 w-6 text-red-600" />
      case "success":
        return <CheckCircle className="h-6 w-6 text-green-600" />
      case "error":
        return <XCircle className="h-6 w-6 text-red-600" />
      default:
        return <AlertTriangle className="h-6 w-6 text-yellow-600" />
    }
  }

  const getDefaultTitle = () => {
    switch (variant) {
      case "destructive":
        return "Xác nhận xóa"
      default:
        return "Xác nhận hành động"
    }
  }

  const getDefaultDescription = () => {
    switch (variant) {
      case "destructive":
        return "Hành động này không thể hoàn tác. Bạn có chắc chắn muốn tiếp tục?"
      default:
        return "Bạn có chắc chắn muốn thực hiện hành động này?"
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center space-x-3">
            {getIcon()}
            <AlertDialogTitle>{title || getDefaultTitle()}</AlertDialogTitle>
          </div>
          <AlertDialogDescription>{description || getDefaultDescription()}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={variant === "destructive" ? "bg-red-600 hover:bg-red-700" : ""}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
