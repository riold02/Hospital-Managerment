import { apiClient } from '../api-client'

export interface DoctorDashboardData {
  totalPatients: number
  todayAppointments: number
  totalAppointments: number
  totalPrescriptions: number
}

export interface DoctorInfo {
  doctor_id: number
  first_name: string
  last_name: string
  specialty: string
  department?: string
  user_id: string
}

export interface AppointmentData {
  appointment_id: number
  appointment_date: string
  appointment_time: string
  status: string
  purpose?: string
  patient: {
    patient_id: number
    first_name: string
    last_name: string
    date_of_birth?: string
    gender?: string
    phone?: string
    allergies?: string
    medical_history?: string
  }
}

export interface MedicalRecord {
  record_id: number
  patient_id: number
  diagnosis: string
  treatment: string
  prescription?: string
  created_at: string
  patient?: {
    first_name: string
    last_name: string
  }
}

export interface PrescriptionData {
  prescription_id: number
  patient_id: number
  medicine_id: number
  dosage: string
  frequency: string
  duration: string
  status: string
  prescription_date: string
  patient?: {
    first_name: string
    last_name: string
  }
  medicine?: {
    name: string
    type: string
    brand: string
  }
}

export class DoctorApiService {
  // Get doctor dashboard overview
  async getDashboard(): Promise<DoctorDashboardData> {
    const response = await apiClient.get<{success: boolean, data: DoctorDashboardData}>('/doctor/dashboard')
    return response.data
  }

  // Get all doctors
  async getAllDoctors(params?: {
    page?: number
    limit?: number
    search?: string
    specialty?: string
  }): Promise<{
    data: DoctorInfo[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.search) queryParams.append('search', params.search)
    if (params?.specialty) queryParams.append('specialty', params.specialty)

    const response = await apiClient.get<{
      success: boolean
      data: DoctorInfo[]
      pagination: any
    }>(`/doctors?${queryParams}`)
    
    return {
      data: response.data,
      pagination: response.pagination
    }
  }

  // Get doctor statistics
  async getStatistics(): Promise<{
    total: number
    specialties: Record<string, number>
    uniqueSpecialties: number
  }> {
    const response = await apiClient.get<{
      success: boolean
      data: {
        total: number
        specialties: Record<string, number>
        uniqueSpecialties: number
      }
    }>('/doctor/statistics')
    return response.data
  }

  // Get doctor appointments
  async getAppointments(params?: {
    page?: number
    limit?: number
    date?: string
    status?: string
  }): Promise<{
    data: AppointmentData[]
    pagination: any
  }> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.date) queryParams.append('date', params.date)
    if (params?.status) queryParams.append('status', params.status)

    const response = await apiClient.get<{
      success: boolean
      data: AppointmentData[]
      pagination: any
    }>(`/doctor/appointments?${queryParams}`)
    
    return {
      data: response.data,
      pagination: response.pagination
    }
  }

  // Get patients for doctor
  async getPatients(params?: {
    page?: number
    limit?: number
    search?: string
  }): Promise<{
    data: any[]
    pagination: any
  }> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.search) queryParams.append('search', params.search)

    const response = await apiClient.get<{
      success: boolean
      data: any[]
      pagination: any
    }>(`/doctor/patients?${queryParams}`)
    
    return {
      data: response.data,
      pagination: response.pagination
    }
  }

  // Get medical records
  async getMedicalRecords(params?: {
    page?: number
    limit?: number
    patient_id?: number
  }): Promise<{
    data: MedicalRecord[]
    pagination: any
  }> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.patient_id) queryParams.append('patient_id', params.patient_id.toString())

    const response = await apiClient.get<{
      success: boolean
      data: MedicalRecord[]
      pagination: any
    }>(`/doctor/medical-records?${queryParams}`)
    
    return {
      data: response.data,
      pagination: response.pagination
    }
  }

  // Get prescriptions
  async getPrescriptions(params?: {
    page?: number
    limit?: number
    status?: string
  }): Promise<{
    data: PrescriptionData[]
    pagination: any
  }> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.status) queryParams.append('status', params.status)

    const response = await apiClient.get<{
      success: boolean
      data: PrescriptionData[]
      pagination: any
    }>(`/doctor/prescriptions?${queryParams}`)
    
    return {
      data: response.data,
      pagination: response.pagination
    }
  }

  // Get doctor schedule
  async getSchedule(): Promise<{
    schedule: string
    availability: any
  }> {
    const response = await apiClient.get<{
      success: boolean
      data: {
        schedule: string
        availability: any
      }
    }>('/doctor/schedule')
    return response.data
  }

  // Create medical record
  async createMedicalRecord(data: {
    patient_id: number
    diagnosis: string
    treatment: string
    prescription?: string
  }): Promise<MedicalRecord> {
    const response = await apiClient.post<{
      success: boolean
      data: MedicalRecord
    }>('/medical-records', data)
    return response.data
  }

  // Create prescription with multiple medicines
  async createPrescription(data: {
    patient_id: number
    diagnosis: string
    instructions?: string
    items: Array<{
      medicine_id: number
      quantity: number
      dosage: string
      frequency: string
      duration: string
      instructions?: string
    }>
  }): Promise<PrescriptionData> {
    const response = await apiClient.post<{
      success: boolean
      data: PrescriptionData
    }>('/prescriptions', data)
    return response.data
  }

  // Get all medicines for prescription
  async getMedicines(): Promise<any[]> {
    const response = await apiClient.get<{
      success: boolean
      data: any[]
    }>('/medicine')
    return response.data
  }
}

// Export singleton instance
export const doctorApi = new DoctorApiService()
