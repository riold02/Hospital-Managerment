export const predicates = {
  appointmentOwnedByDoctor: (row: any, ctx: any) => row?.doctor_id === ctx?.doctor_id,
  nurseMayUpdateStatus: () => true, // có thể thêm điều kiện ca trực
  patientTimeWindow: (row: any, ctx: any) => {
    if (!row || !ctx || row.patient_id !== ctx.patient_id) return false
    const now = Date.now()
    const start = new Date(`${row.appointment_date}T${row.appointment_time}:00`).getTime()
    const diffHours = (start - now) / 36e5
    return diffHours >= (ctx.rules?.patientCancelBeforeHours ?? 4)
  },
  recordOwnedByDoctor: (row: any, ctx: any) => row?.doctor_id === ctx?.doctor_id,
  stockNonNegative: (row: any, ctx: any) => (row?.request_qty ?? 0) <= (row?.stock_quantity ?? 0),
  expiryNotPassed: (row: any) => !row?.expiry_date || new Date(row.expiry_date) >= new Date(),
  techUpdateRoomStatus: () => true,
  roomAssignable: (row: any) => row?.room?.status !== "Under Maintenance",
  driverMayToggleAvailability: (row: any, ctx: any) =>
    row?.driver_id === ctx?.staff_id || row?.assigned_driver_id === ctx?.staff_id,
  logOwnedByDriver: (row: any, ctx: any) => row?.driver_id === ctx?.staff_id,
}
