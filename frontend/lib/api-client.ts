interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

class ApiError {
  message: string
  status: number

  constructor(message: string, status: number) {
    this.message = message
    this.status = status
  }
}

class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1"
  }

  setToken(token: string) {
    this.token = token
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    const storedToken = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
    const effectiveToken = this.token || storedToken
    if (effectiveToken) {
      headers.Authorization = `Bearer ${effectiveToken}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new ApiError(errorData.message || `HTTP error! status: ${response.status}`, response.status)
      }

      const data = await response.json()
      return data
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(error instanceof Error ? error.message : "Network error occurred", 0)
    }
  }

  // Generic CRUD operations
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" })
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" })
  }

  // Dashboard KPIs
  async getDashboardKPIs(): Promise<{
    todayAppointments: number
    roomOccupancy: number
    monthlyRevenue: number
    expiringMedicine: number
  }> {
    return this.get("/dashboard/kpis")
  }

  // Patients
  async getPatients(
    page = 1,
    limit = 10,
    search = "",
  ): Promise<{
    patients: any[]
    total: number
    page: number
    totalPages: number
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    })
    return this.get(`/patients?${params}`)
  }

  async getPatient(id: string): Promise<any> {
    return this.get(`/patients/${id}`)
  }

  async createPatient(data: any): Promise<any> {
    return this.post("/patients", data)
  }

  async updatePatient(id: string, data: any): Promise<any> {
    return this.put(`/patients/${id}`, data)
  }

  async deletePatient(id: string): Promise<any> {
    return this.delete(`/patients/${id}`)
  }

  // Appointments
  async getAppointments(date?: string): Promise<any[]> {
    const params = date ? `?date=${date}` : ""
    return this.get(`/appointments${params}`)
  }

  async createAppointment(data: any): Promise<any> {
    return this.post("/appointments", data)
  }

  async updateAppointment(id: string, data: any): Promise<any> {
    return this.put(`/appointments/${id}`, data)
  }

  async updateAppointmentStatus(id: string, status: string): Promise<any> {
    return this.put(`/appointments/${id}/status`, { status })
  }

  // Billing
  async getBilling(status?: string): Promise<any[]> {
    const params = status ? `?status=${status}` : ""
    return this.get(`/billing${params}`)
  }

  async updateBillingStatus(id: string, status: string): Promise<any> {
    return this.put(`/billing/${id}/status`, { status })
  }

  // Rooms
  async getRooms(status?: string): Promise<any[]> {
    const params = status ? `?status=${status}` : ""
    return this.get(`/rooms${params}`)
  }

  async updateRoomStatus(id: string, status: string): Promise<any> {
    return this.put(`/rooms/${id}/status`, { status })
  }

  // Staff
  async getStaff(role?: string): Promise<any[]> {
    const params = role ? `?role=${role}` : ""
    return this.get(`/staff${params}`)
  }

  async createStaff(data: any): Promise<any> {
    return this.post("/staff", data)
  }

  async updateStaff(id: string, data: any): Promise<any> {
    return this.put(`/staff/${id}`, data)
  }

  async deleteStaff(id: string): Promise<any> {
    return this.delete(`/staff/${id}`)
  }

  // Staff Registration (Admin only)
  async registerStaff(data: {
    email: string
    password: string
    first_name: string
    last_name: string
    role: string
    position?: string
    department_id?: number
    contact_number?: string
  }): Promise<any> {
    return this.post("/auth/register/staff", data)
  }

  async getDoctors(): Promise<any[]> {
    return this.get("/doctors")
  }

  async getNurses(): Promise<any[]> {
    return this.get("/nurses")
  }

  // Medical Records
  async getMedicalRecords(patientId?: string): Promise<any[]> {
    const params = patientId ? `?patient_id=${patientId}` : ""
    return this.get(`/medical-records${params}`)
  }

  async createMedicalRecord(data: any): Promise<any> {
    return this.post("/medical-records", data)
  }

  // Medicine & Pharmacy
  async getMedicines(): Promise<any[]> {
    return this.get("/medicines")
  }

  async getPharmacyRecords(): Promise<any[]> {
    return this.get("/pharmacy-records")
  }

  // Blood Bank
  async getBloodBank(): Promise<any[]> {
    return this.get("/blood-bank")
  }

  // Ambulances
  async getAmbulances(): Promise<any[]> {
    return this.get("/ambulances")
  }

  async getAmbulanceLogs(): Promise<any[]> {
    return this.get("/ambulance-logs")
  }

  // Authentication
  async login(
    email: string,
    password: string,
  ): Promise<{
    token: string
    user: any
  }> {
    const response = await this.post<{ token: string; user: any }>("/auth/login", {
      email,
      password,
    })
    this.setToken(response.token)
    return response
  }

  async logout(): Promise<void> {
    await this.post("/auth/logout", {})
    this.token = null
  }

  async getCurrentUser(): Promise<any> {
    return this.get("/auth/me")
  }

  // Technician specific endpoints
  async getRoomsForMaintenance(): Promise<any[]> {
    return this.get("/rooms?status=maintenance_needed")
  }

  async getCleaningServices(date?: string): Promise<any[]> {
    const params = date ? `?date=${date}` : ""
    return this.get(`/cleaning-services${params}`)
  }

  async updateCleaningServiceStatus(id: string, status: string): Promise<any> {
    return this.put(`/cleaning-services/${id}/status`, { status })
  }

  // Lab specific endpoints
  async getLabAppointments(date?: string): Promise<any[]> {
    const params = date ? `?date=${date}&type=lab` : "?type=lab"
    return this.get(`/appointments${params}`)
  }

  async addMedicalRecordNotes(id: string, notes: string): Promise<any> {
    return this.put(`/medical-records/${id}/notes`, { notes })
  }

  // Nurse specific endpoints
  async getRoomAssignments(): Promise<any[]> {
    return this.get("/room-assignments")
  }

  async getMedicalOrders(status?: string): Promise<any[]> {
    const params = status ? `?status=${status}` : ""
    return this.get(`/medical-orders${params}`)
  }

  async updateMedicalOrderStatus(id: string, status: string): Promise<any> {
    return this.put(`/medical-orders/${id}/status`, { status })
  }

  async getVitalSigns(patientId?: string): Promise<any[]> {
    const params = patientId ? `?patient_id=${patientId}` : ""
    return this.get(`/vital-signs${params}`)
  }

  async recordVitalSigns(data: any): Promise<any> {
    return this.post("/vital-signs", data)
  }

  // Doctor specific endpoints
  async getDoctorAppointments(doctorId: string, date?: string): Promise<any[]> {
    const params = new URLSearchParams({
      doctor_id: doctorId,
      ...(date && { date }),
    })
    return this.get(`/appointments?${params}`)
  }

  async getInpatients(doctorId?: string): Promise<any[]> {
    const params = doctorId ? `?doctor_id=${doctorId}` : ""
    return this.get(`/inpatients${params}`)
  }

  async getPendingResults(doctorId?: string): Promise<any[]> {
    const params = doctorId ? `?doctor_id=${doctorId}` : ""
    return this.get(`/test-results?status=pending${params}`)
  }

  async getDoctorMessages(doctorId: string): Promise<any[]> {
    return this.get(`/messages?recipient_id=${doctorId}`)
  }

  // Pharmacist specific endpoints
  async getPrescriptions(status?: string): Promise<any[]> {
    const params = status ? `?status=${status}` : ""
    return this.get(`/prescriptions${params}`)
  }

  async updatePrescriptionStatus(id: string, status: string): Promise<any> {
    return this.put(`/prescriptions/${id}/status`, { status })
  }

  async getStockTransactions(): Promise<any[]> {
    return this.get("/stock-transactions")
  }

  async createStockTransaction(data: any): Promise<any> {
    return this.post("/stock-transactions", data)
  }

  async checkDrugInteractions(medicineIds: string[]): Promise<any> {
    return this.post("/drug-interactions/check", { medicine_ids: medicineIds })
  }
}

// Create singleton instance
export const apiClient = new ApiClient()

// Export ApiError for error handling
export { ApiError }
export type { ApiResponse }
