// src/rbac/policies.ts
export type Role =
  | "admin"
  | "doctor"
  | "nurse"
  | "pharmacist"
  | "technician"
  | "driver"
  | "worker"
  | "patient"

type Action = "create" | "read" | "update" | "delete"
type Scope = "none" | "own" | "any"

export type Rule = { [A in Action]?: Scope } & {
  // optional predicate name cho kiểm tra row-level
  predicates?: string[]
}

export type ModulePolicy = Record<Role, Rule>

export const policies: Record<string, ModulePolicy> = {
  patients: {
    admin: { create: "any", read: "any", update: "any", delete: "any" },
    doctor: { read: "any" },
    nurse: { read: "any" },
    pharmacist: { read: "any" },
    technician: { read: "none" },
    driver: { read: "none" },
    worker: { read: "none" },
    patient: { read: "own" },
  },
  doctors: {
    admin: { create: "any", read: "any", update: "any", delete: "any" },
    doctor: { read: "any" },
    nurse: { read: "any" },
    pharmacist: { read: "none" },
    technician: { read: "none" },
    driver: { read: "none" },
    worker: { read: "none" },
    patient: { read: "none" },
  },
  departments: {
    admin: { create: "any", read: "any", update: "any", delete: "any" },
    doctor: { read: "any" },
    nurse: { read: "any" },
    pharmacist: { read: "none" },
    technician: { read: "none" },
    driver: { read: "none" },
    worker: { read: "none" },
    patient: { read: "none" },
  },
  "doctor-department": {
    admin: { create: "any", read: "any", update: "any", delete: "any" },
    doctor: { read: "any" },
    nurse: { read: "any" },
    pharmacist: { read: "none" },
    technician: { read: "none" },
    driver: { read: "none" },
    worker: { read: "none" },
    patient: { read: "none" },
  },
  appointments: {
    admin: { create: "any", read: "any", update: "any", delete: "any" },
    doctor: { create: "none", read: "any", update: "own", predicates: ["appointmentOwnedByDoctor"] },
    nurse: { create: "none", read: "any", update: "any", predicates: ["nurseMayUpdateStatus"] },
    pharmacist: { read: "none" },
    technician: { read: "none" },
    driver: { read: "none" },
    worker: { read: "none" },
    patient: { create: "own", read: "own", update: "own", delete: "own", predicates: ["patientTimeWindow"] },
  },
  "medical-records": {
    admin: { create: "any", read: "any", update: "any", delete: "any" },
    doctor: { create: "own", read: "any", update: "own", predicates: ["recordOwnedByDoctor"] },
    nurse: { read: "any" }, // nếu muốn hạn chế, thêm predicate khác
    pharmacist: { read: "any" },
    technician: { read: "none" },
    driver: { read: "none" },
    worker: { read: "none" },
    patient: { read: "own" },
  },
  "medical-records-medicine": {
    admin: { create: "any", read: "any", update: "any", delete: "any" },
    doctor: { create: "own", read: "any", update: "own", predicates: ["recordOwnedByDoctor"] },
    nurse: { read: "any" },
    pharmacist: { read: "any" },
    technician: { read: "none" },
    driver: { read: "none" },
    worker: { read: "none" },
    patient: { read: "own" },
  },
  prescriptions: {
    admin: { create: "any", read: "any", update: "any", delete: "any" },
    doctor: { create: "own", read: "any", update: "own", predicates: ["recordOwnedByDoctor"] },
    nurse: { read: "any" },
    pharmacist: { create: "any", read: "any", update: "any", predicates: ["stockNonNegative", "expiryNotPassed"] },
    technician: { read: "none" },
    driver: { read: "none" },
    worker: { read: "none" },
    patient: { read: "own" },
  },
  billing: {
    admin: { create: "any", read: "any", update: "any", delete: "any" },
    doctor: { read: "any" },
    nurse: { read: "none" },
    pharmacist: { read: "none" },
    technician: { read: "none" },
    driver: { read: "none" },
    worker: { read: "none" },
    patient: { read: "own" },
  },
  medicine: {
    admin: { create: "any", read: "any", update: "any", delete: "any" },
    doctor: { read: "any" },
    nurse: { read: "none" },
    pharmacist: { create: "any", read: "any", update: "any", delete: "any", predicates: ["stockNonNegative"] },
    technician: { read: "none" },
    driver: { read: "none" },
    worker: { read: "none" },
    patient: { read: "none" },
  },
  pharmacy: {
    admin: { create: "any", read: "any", update: "any", delete: "any" },
    doctor: { read: "any" },
    nurse: { read: "none" },
    pharmacist: { create: "any", read: "any", update: "any", predicates: ["stockNonNegative", "expiryNotPassed"] },
    technician: { read: "none" },
    driver: { read: "none" },
    worker: { read: "none" },
    patient: { read: "none" },
  },
  "blood-bank": {
    admin: { create: "any", read: "any", update: "any", delete: "any" },
    doctor: { read: "any" },
    nurse: { read: "any" },
    pharmacist: { read: "none" },
    technician: { read: "none" },
    driver: { read: "none" },
    worker: { read: "none" },
    patient: { read: "none" },
  },
  "room-types": {
    admin: { create: "any", read: "any", update: "any", delete: "any" },
    doctor: { read: "any" },
    nurse: { read: "any" },
    pharmacist: { read: "none" },
    technician: { read: "none" },
    driver: { read: "none" },
    worker: { read: "none" },
    patient: { read: "none" },
  },
  rooms: {
    admin: { create: "any", read: "any", update: "any", delete: "any" },
    doctor: { read: "any" },
    nurse: { read: "any" },
    pharmacist: { read: "none" },
    technician: { read: "any", update: "any", predicates: ["techUpdateRoomStatus"] },
    driver: { read: "none" },
    worker: { read: "none" },
    patient: { read: "none" },
  },
  "room-assignments": {
    admin: { create: "any", read: "any", update: "any", delete: "any" },
    doctor: { read: "any" },
    nurse: { create: "any", read: "any", update: "any", predicates: ["roomAssignable"] },
    pharmacist: { read: "none" },
    technician: { read: "any" },
    driver: { read: "none" },
    worker: { read: "any" },
    patient: { read: "none" },
  },
  "cleaning-service": {
    admin: { create: "any", read: "any", update: "any", delete: "any" },
    doctor: { read: "none" },
    nurse: { create: "any", read: "any" },
    pharmacist: { read: "none" },
    technician: { create: "any", read: "any" },
    driver: { read: "none" },
    worker: { create: "any", read: "any" },
    patient: { read: "none" },
  },
  ambulances: {
    admin: { create: "any", read: "any", update: "any", delete: "any" },
    doctor: { read: "none" },
    nurse: { read: "none" },
    pharmacist: { read: "none" },
    technician: { read: "none" },
    driver: { read: "any", update: "any", predicates: ["driverMayToggleAvailability"] },
    worker: { read: "none" },
    patient: { read: "none" },
  },
  "ambulance-log": {
    admin: { create: "any", read: "any", update: "any", delete: "any" },
    doctor: { read: "none" },
    nurse: { read: "none" },
    pharmacist: { read: "none" },
    technician: { read: "none" },
    driver: { create: "own", read: "own", update: "own", predicates: ["logOwnedByDriver"] },
    worker: { read: "none" },
    patient: { read: "none" },
  },
  staff: {
    admin: { create: "any", read: "any", update: "any", delete: "any" },
    doctor: { read: "any" },
    nurse: { read: "any" },
    pharmacist: { read: "any" },
    technician: { read: "any" },
    driver: { read: "any" },
    worker: { read: "any" },
    patient: { read: "none" },
  },
}

// src/rbac/predicates.ts
export const predicates = {
  appointmentOwnedByDoctor: (row: any, ctx: any) => row.doctor_id === ctx.doctor_id,
  nurseMayUpdateStatus: () => true, // có thể thêm điều kiện ca trực
  patientTimeWindow: (row: any, ctx: any) => {
    if (row.patient_id !== ctx.patient_id) return false
    const now = Date.now()
    const start = new Date(`${row.appointment_date}T${row.appointment_time}:00`).getTime()
    const diffHours = (start - now) / 36e5
    return diffHours >= (ctx.rules?.patientCancelBeforeHours ?? 4)
  },
  recordOwnedByDoctor: (row: any, ctx: any) => row.doctor_id === ctx.doctor_id,
  stockNonNegative: (row: any, ctx: any) => (row.request_qty ?? 0) <= (row.stock_quantity ?? 0),
  expiryNotPassed: (row: any) => !row.expiry_date || new Date(row.expiry_date) >= new Date(),
  techUpdateRoomStatus: () => true,
  roomAssignable: (row: any) => row?.room?.status !== "Under Maintenance",
  driverMayToggleAvailability: (row: any, ctx: any) =>
    row.driver_id === ctx.staff_id || row.assigned_driver_id === ctx.staff_id,
  logOwnedByDriver: (row: any, ctx: any) => row.driver_id === ctx.staff_id,
}
