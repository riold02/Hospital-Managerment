"use client"

import ShiftScheduleCalendar from "@/components/shared/ShiftScheduleCalendar"

interface ShiftScheduleTabProps {
  onRefresh: () => void
}

export default function ShiftScheduleTab({ onRefresh }: ShiftScheduleTabProps) {
  return <ShiftScheduleCalendar role="nurse" onRefresh={onRefresh} />
}
