import { rbacManager, type Role, type RBACContext } from "./rbac"

export class ApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const token = localStorage.getItem("auth_token")

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Network error" }))
      throw new Error(error.message || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Generic CRUD operations
  async getAll<T>(endpoint: string, params?: Record<string, any>): Promise<{ data: T[]; total: number }> {
    const queryString = params ? "?" + new URLSearchParams(params).toString() : ""
    return this.request(`${endpoint}${queryString}`)
  }

  async getById<T>(endpoint: string, id: string | number): Promise<T> {
    return this.request(`${endpoint}/${id}`)
  }

  async create<T>(endpoint: string, data: any): Promise<T> {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async update<T>(endpoint: string, id: string | number, data: any): Promise<T> {
    return this.request(`${endpoint}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async delete(endpoint: string, id: string | number): Promise<void> {
    return this.request(`${endpoint}/${id}`, {
      method: "DELETE",
    })
  }

  // Dashboard KPIs
  async getDashboardKpis(role: string): Promise<any[]> {
    return this.request(`/dashboard/${role}/kpis`)
  }
}

// Singleton instance
export const apiClient = new ApiClient()

// Legacy DataAdapter for backward compatibility (now uses API)
export class DataAdapter<T extends { id: string | number }> {
  private endpoint: string

  constructor(endpoint: string) {
    this.endpoint = endpoint
  }

  async getAll(): Promise<T[]> {
    const result = await apiClient.getAll<T>(this.endpoint)
    return result.data
  }

  async getById(id: string | number): Promise<T | undefined> {
    try {
      return await apiClient.getById<T>(this.endpoint, id)
    } catch {
      return undefined
    }
  }

  async create(item: Omit<T, "id">): Promise<T> {
    return apiClient.create<T>(this.endpoint, item)
  }

  async update(id: string | number, updates: Partial<T>): Promise<T | null> {
    try {
      return await apiClient.update<T>(this.endpoint, id, updates)
    } catch {
      return null
    }
  }

  async delete(id: string | number): Promise<boolean> {
    try {
      await apiClient.delete(this.endpoint, id)
      return true
    } catch {
      return false
    }
  }
}

export interface UserRole {
  id: string
  name: string
  permissions: string[]
}

export const ROLES = {
  ADMIN: "admin",
  DOCTOR: "doctor",
  NURSE: "nurse",
  PATIENT: "patient",
  PHARMACIST: "pharmacist",
  TECHNICIAN: "technician",
  LAB: "lab",
  DRIVER: "driver",
  WORKER: "worker",
} as const

export const PERMISSIONS = {
  // Patient management
  PATIENTS_VIEW: "patients:view",
  PATIENTS_CREATE: "patients:create",
  PATIENTS_EDIT: "patients:edit",
  PATIENTS_DELETE: "patients:delete",

  // Doctor management
  DOCTORS_VIEW: "doctors:view",
  DOCTORS_CREATE: "doctors:create",
  DOCTORS_EDIT: "doctors:edit",
  DOCTORS_DELETE: "doctors:delete",

  // Appointments
  APPOINTMENTS_VIEW: "appointments:view",
  APPOINTMENTS_CREATE: "appointments:create",
  APPOINTMENTS_EDIT: "appointments:edit",
  APPOINTMENTS_DELETE: "appointments:delete",

  // Medical records
  MEDICAL_RECORDS_VIEW: "medical_records:view",
  MEDICAL_RECORDS_CREATE: "medical_records:create",
  MEDICAL_RECORDS_EDIT: "medical_records:edit",

  // Billing
  BILLING_VIEW: "billing:view",
  BILLING_CREATE: "billing:create",
  BILLING_EDIT: "billing:edit",

  // Medicine & Pharmacy
  MEDICINE_VIEW: "medicine:view",
  MEDICINE_CREATE: "medicine:create",
  MEDICINE_EDIT: "medicine:edit",
  PHARMACY_DISPENSE: "pharmacy:dispense",

  // Rooms & Assignments
  ROOMS_VIEW: "rooms:view",
  ROOMS_MANAGE: "rooms:manage",
  ROOM_ASSIGNMENTS_VIEW: "room_assignments:view",
  ROOM_ASSIGNMENTS_MANAGE: "room_assignments:manage",

  // Admin functions
  ADMIN_DASHBOARD: "admin:dashboard",
  USER_MANAGEMENT: "users:manage",
} as const

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS),
  [ROLES.DOCTOR]: [
    PERMISSIONS.PATIENTS_VIEW,
    PERMISSIONS.APPOINTMENTS_VIEW,
    PERMISSIONS.APPOINTMENTS_EDIT,
    PERMISSIONS.MEDICAL_RECORDS_VIEW,
    PERMISSIONS.MEDICAL_RECORDS_CREATE,
    PERMISSIONS.MEDICAL_RECORDS_EDIT,
  ],
  [ROLES.NURSE]: [
    PERMISSIONS.PATIENTS_VIEW,
    PERMISSIONS.APPOINTMENTS_VIEW,
    PERMISSIONS.ROOMS_VIEW,
    PERMISSIONS.ROOM_ASSIGNMENTS_VIEW,
    PERMISSIONS.ROOM_ASSIGNMENTS_MANAGE,
  ],
  [ROLES.PATIENT]: [
    PERMISSIONS.APPOINTMENTS_VIEW,
    PERMISSIONS.APPOINTMENTS_CREATE,
    PERMISSIONS.MEDICAL_RECORDS_VIEW,
    PERMISSIONS.BILLING_VIEW,
  ],
  [ROLES.PHARMACIST]: [
    PERMISSIONS.MEDICINE_VIEW,
    PERMISSIONS.MEDICINE_CREATE,
    PERMISSIONS.MEDICINE_EDIT,
    PERMISSIONS.PHARMACY_DISPENSE,
  ],
  [ROLES.TECHNICIAN]: [PERMISSIONS.ROOMS_VIEW, PERMISSIONS.ROOMS_MANAGE],
  [ROLES.LAB]: [PERMISSIONS.APPOINTMENTS_VIEW, PERMISSIONS.MEDICAL_RECORDS_VIEW],
  [ROLES.DRIVER]: [PERMISSIONS.APPOINTMENTS_VIEW],
  [ROLES.WORKER]: [PERMISSIONS.ROOMS_VIEW],
}

export function hasPermission(
  userRole: Role,
  module: string,
  action: "create" | "read" | "update" | "delete",
  context?: RBACContext,
  row?: any,
): boolean {
  return rbacManager.hasPermission(userRole, module, action, context, row)
}

export function canAccessRoute(userRole: Role, route: string): boolean {
  // Map routes to modules
  const routeModuleMap: Record<string, string> = {
    "/patients": "patients",
    "/doctors": "doctors",
    "/appointments": "appointments",
    "/medical-records": "medical-records",
    "/billing": "billing",
    "/medicine": "medicine",
    "/pharmacy": "pharmacy",
    "/rooms": "rooms",
    "/room-assignments": "room-assignments",
    "/blood-bank": "blood-bank",
    "/ambulances": "ambulances",
    "/ambulance-log": "ambulance-log",
    "/cleaning": "cleaning-service",
    "/staff": "staff",
  }

  const module = routeModuleMap[route]
  return module ? rbacManager.canAccessModule(userRole, module) : true
}

export function canShowCreateButton(userRole: Role, module: string, context?: RBACContext): boolean {
  return rbacManager.hasPermission(userRole, module, "create", context)
}

export function canShowEditButton(userRole: Role, module: string, context?: RBACContext, row?: any): boolean {
  return rbacManager.hasPermission(userRole, module, "update", context, row)
}

export function canShowDeleteButton(userRole: Role, module: string, context?: RBACContext, row?: any): boolean {
  return rbacManager.hasPermission(userRole, module, "delete", context, row)
}

export function getAccessibleModules(userRole: Role): string[] {
  return rbacManager.getAccessibleModules(userRole)
}
