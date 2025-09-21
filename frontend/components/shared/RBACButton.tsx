"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { canShowCreateButton, canShowEditButton, canShowDeleteButton } from "@/lib/data-adapter"
import type { Role, RBACContext } from "@/lib/rbac"

interface RBACButtonProps {
  action: "create" | "edit" | "delete"
  module: string
  context?: RBACContext
  row?: any
  children: React.ReactNode
  onClick?: () => void
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  disabled?: boolean
}

export function RBACButton({
  action,
  module,
  context,
  row,
  children,
  onClick,
  variant = "default",
  size = "default",
  className,
  disabled = false,
  ...props
}: RBACButtonProps) {
  const { role } = useAuth()

  if (!role) return null

  let canShow = false
  switch (action) {
    case "create":
      canShow = canShowCreateButton(role as Role, module, context)
      break
    case "edit":
      canShow = canShowEditButton(role as Role, module, context, row)
      break
    case "delete":
      canShow = canShowDeleteButton(role as Role, module, context, row)
      break
  }

  if (!canShow) return null

  return (
    <Button variant={variant} size={size} className={className} onClick={onClick} disabled={disabled} {...props}>
      {children}
    </Button>
  )
}
