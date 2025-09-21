// src/rbac/policies.ts
export type Role =
  | "Admin"
  | "Doctor"
  | "Nurse"
  | "Pharmacist"
  | "Technician"
  | "Lab Assistant"
  | "Driver"
  | "Worker"
  | "Patient"

type Action = "create" | "read" | "update" | "delete"
type Scope = "none" | "own" | "any"

export type Rule = { [A in Action]?: Scope } & {
  // optional predicate name cho kiểm tra row-level
  predicates?: string[]
}

export type ModulePolicy = Record<Role, Rule>

export const policies: Record<string, ModulePolicy> = {
  patients: {
    Admin: { create: "any", read: "any", update: "any", delete: "any" },
    Doctor: { read: "any" },
    Nurse: { read: "any" },
    Pharmacist: { read: "any" },
    Technician: { read: "none" },
    "Lab Assistant": { read: "none" },
    Driver: { read: "none" },
    Worker: { read: "none" },
    Patient: { read: "own" },
  },
  doctors: {
    Admin: { create: "any", read: "any", update: "any", delete: "any" },
    Doctor: { read: "any" },
    Nurse: { read: "any" },
    Pharmacist: { read: "none" },
    Technician: { read: "none" },
    "Lab Assistant": { read: "none" },
    Driver: { read: "none" },
    Worker: { read: "none" },
    Patient: { read: "none" },
  },
  departments: {
    Admin: { create: "any", read: "any", update: "any", delete: "any" },
    Doctor: { read: "any" },
    Nurse: { read: "any" },
    Pharmacist: { read: "none" },
    Technician: { read: "none" },
    "Lab Assistant": { read: "none" },
    Driver: { read: "none" },
    Worker: { read: "none" },
    Patient: { read: "none" },
  },
  "doctor-department": {
    Admin: { create: "any", read: "any", update: "any", delete: "any" },
    Doctor: { read: "any" },
    Nurse: { read: "any" },
    Pharmacist: { read: "none" },
    Technician: { read: "none" },
    "Lab Assistant": { read: "none" },
    Driver: { read: "none" },
    Worker: { read: "none" },
    Patient: { read: "none" },
  },
  appointments: {
    Admin: { create: "any", read: "any", update: "any", delete: "any" },
    Doctor: { create: "none", read: "any", update: "own", predicates: ["appointmentOwnedByDoctor"] },
    Nurse: { create: "none", read: "any", update: "any", predicates: ["nurseMayUpdateStatus"] },
    Pharmacist: { read: "none" },
    Technician: { read: "none" },
    "Lab Assistant": { read: "any" },
    Driver: { read: "none" },
    Worker: { read: "none" },
    Patient: { create: "own", read: "own", update: "own", delete: "own", predicates: ["patientTimeWindow"] },
  },
  "medical-records": {
    Admin: { create: "any", read: "any", update: "any", delete: "any" },
    Doctor: { create: "own", read: "any", update: "own", predicates: ["recordOwnedByDoctor"] },
    Nurse: { read: "any" }, // nếu muốn hạn chế, thêm predicate khác
    Pharmacist: { read: "any" },
    Technician: { read: "none" },
    "Lab Assistant": { read: "any" },
    Driver: { read: "none" },
    Worker: { read: "none" },
    Patient: { read: "own" },
  },
  "medical-records-medicine": {
    Admin: { create: "any", read: "any", update: "any", delete: "any" },
    Doctor: { create: "own", read: "any", update: "own", predicates: ["recordOwnedByDoctor"] },
    Nurse: { read: "any" },
    Pharmacist: { read: "any" },
    Technician: { read: "none" },
    "Lab Assistant": { read: "any" },
    Driver: { read: "none" },
    Worker: { read: "none" },
    Patient: { read: "own" },
  },
  prescriptions: {
    Admin: { create: "any", read: "any", update: "any", delete: "any" },
    Doctor: { create: "own", read: "any", update: "own", predicates: ["recordOwnedByDoctor"] },
    Nurse: { read: "any" },
    Pharmacist: { create: "any", read: "any", update: "any", predicates: ["stockNonNegative", "expiryNotPassed"] },
    Technician: { read: "none" },
    "Lab Assistant": { read: "none" },
    Driver: { read: "none" },
    Worker: { read: "none" },
    Patient: { read: "own" },
  },
  billing: {
    Admin: { create: "any", read: "any", update: "any", delete: "any" },
    Doctor: { read: "any" },
    Nurse: { read: "none" },
    Pharmacist: { read: "none" },
    Technician: { read: "none" },
    "Lab Assistant": { read: "none" },
    Driver: { read: "none" },
    Worker: { read: "none" },
    Patient: { read: "own" },
  },
  medicine: {
    Admin: { create: "any", read: "any", update: "any", delete: "any" },
    Doctor: { read: "any" },
    Nurse: { read: "none" },
    Pharmacist: { create: "any", read: "any", update: "any", delete: "any", predicates: ["stockNonNegative"] },
    Technician: { read: "none" },
    "Lab Assistant": { read: "none" },
    Driver: { read: "none" },
    Worker: { read: "none" },
    Patient: { read: "none" },
  },
  pharmacy: {
    Admin: { create: "any", read: "any", update: "any", delete: "any" },
    Doctor: { read: "any" },
    Nurse: { read: "none" },
    Pharmacist: { create: "any", read: "any", update: "any", predicates: ["stockNonNegative", "expiryNotPassed"] },
    Technician: { read: "none" },
    "Lab Assistant": { read: "none" },
    Driver: { read: "none" },
    Worker: { read: "none" },
    Patient: { read: "none" },
  },
  "blood-bank": {
    Admin: { create: "any", read: "any", update: "any", delete: "any" },
    Doctor: { read: "any" },
    Nurse: { read: "any" },
    Pharmacist: { read: "none" },
    Technician: { read: "none" },
    "Lab Assistant": { read: "none" },
    Driver: { read: "none" },
    Worker: { read: "none" },
    Patient: { read: "none" },
  },
  "room-types": {
    Admin: { create: "any", read: "any", update: "any", delete: "any" },
    Doctor: { read: "any" },
    Nurse: { read: "any" },
    Pharmacist: { read: "none" },
    Technician: { read: "none" },
    "Lab Assistant": { read: "none" },
    Driver: { read: "none" },
    Worker: { read: "none" },
    Patient: { read: "none" },
  },
  rooms: {
    Admin: { create: "any", read: "any", update: "any", delete: "any" },
    Doctor: { read: "any" },
    Nurse: { read: "any" },
    Pharmacist: { read: "none" },
    Technician: { read: "any", update: "any", predicates: ["techUpdateRoomStatus"] },
    "Lab Assistant": { read: "none" },
    Driver: { read: "none" },
    Worker: { read: "none" },
    Patient: { read: "none" },
  },
  "room-assignments": {
    Admin: { create: "any", read: "any", update: "any", delete: "any" },
    Doctor: { read: "any" },
    Nurse: { create: "any", read: "any", update: "any", predicates: ["roomAssignable"] },
    Pharmacist: { read: "none" },
    Technician: { read: "any" },
    "Lab Assistant": { read: "none" },
    Driver: { read: "none" },
    Worker: { read: "any" },
    Patient: { read: "none" },
  },
  "cleaning-service": {
    Admin: { create: "any", read: "any", update: "any", delete: "any" },
    Doctor: { read: "none" },
    Nurse: { create: "any", read: "any" },
    Pharmacist: { read: "none" },
    Technician: { create: "any", read: "any" },
    "Lab Assistant": { read: "none" },
    Driver: { read: "none" },
    Worker: { create: "any", read: "any" },
    Patient: { read: "none" },
  },
  ambulances: {
    Admin: { create: "any", read: "any", update: "any", delete: "any" },
    Doctor: { read: "none" },
    Nurse: { read: "none" },
    Pharmacist: { read: "none" },
    Technician: { read: "none" },
    "Lab Assistant": { read: "none" },
    Driver: { read: "any", update: "any", predicates: ["driverMayToggleAvailability"] },
    Worker: { read: "none" },
    Patient: { read: "none" },
  },
  "ambulance-log": {
    Admin: { create: "any", read: "any", update: "any", delete: "any" },
    Doctor: { read: "none" },
    Nurse: { read: "none" },
    Pharmacist: { read: "none" },
    Technician: { read: "none" },
    "Lab Assistant": { read: "none" },
    Driver: { create: "own", read: "own", update: "own", predicates: ["logOwnedByDriver"] },
    Worker: { read: "none" },
    Patient: { read: "none" },
  },
  staff: {
    Admin: { create: "any", read: "any", update: "any", delete: "any" },
    Doctor: { read: "any" },
    Nurse: { read: "any" },
    Pharmacist: { read: "any" },
    Technician: { read: "any" },
    "Lab Assistant": { read: "any" },
    Driver: { read: "any" },
    Worker: { read: "any" },
    Patient: { read: "none" },
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
