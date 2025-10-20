import { apiClient } from '../api-client'

export interface NurseDashboardData {
  totalPatients: number
  activeRoomAssignments: number
  totalMedicine: number
  todayAppointments: number
}

export interface PatientAssignment {
  assignment_id: number
  patient_id: number
  room_number: string
  bed_number: string
  admission_date: string
  status: string
  priority: string
  patient: {
    patient_id: number
    first_name: string
    last_name: string
    date_of_birth?: string
    gender?: string
    phone?: string
  }
}

export interface VitalSigns {
  vital_id: number
  patient_id: number
  blood_pressure_systolic: number
  blood_pressure_diastolic: number
  heart_rate: number
  temperature: number
  respiratory_rate?: number
  oxygen_saturation?: number
  recorded_at: string
  recorded_by: string
  patient?: {
    first_name: string
    last_name: string
  }
}

export interface MedicationSchedule {
  schedule_id: number
  patient_id: number
  medicine_name: string
  dosage: string
  frequency: string
  next_dose_time: string
  status: string
  patient?: {
    first_name: string
    last_name: string
  }
}

export interface CarePlan {
  plan_id: number
  patient_id: number
  plan_details: string
  goals: string
  interventions: string
  created_at: string
  updated_at: string
  patient?: {
    first_name: string
    last_name: string
  }
}

export class NurseApiService {
  // Get nurse dashboard overview
  async getDashboard(): Promise<NurseDashboardData> {
    const response = await apiClient.getRaw<{success: boolean, data: NurseDashboardData}>('/nurse/dashboard')
    return response.data
  }

  // Get patient assignments
  async getPatientAssignments(params?: {
    page?: number
    limit?: number
    room?: string
    priority?: string
  }): Promise<{
    data: PatientAssignment[]
    pagination: any
  }> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.room) queryParams.append('room', params.room)
    if (params?.priority) queryParams.append('priority', params.priority)

    const response = await apiClient.getRaw<{
      success: boolean
      data: PatientAssignment[]
      pagination: any
    }>(`/nurse/patient-assignments?${queryParams}`)
    
    return {
      data: response.data,
      pagination: response.pagination
    }
  }

  // Record vital signs
  async recordVitalSigns(data: {
    patient_id: number
    blood_pressure_systolic: number
    blood_pressure_diastolic: number
    heart_rate: number
    temperature: number
    respiratory_rate?: number
    oxygen_saturation?: number
    notes?: string
  }): Promise<VitalSigns> {
    const response = await apiClient.post<{
      success: boolean
      data: VitalSigns
    }>('/nurse/vital-signs', data)
    return response.data
  }

  // Get vital signs history
  async getVitalSignsHistory(patientId: number, params?: {
    page?: number
    limit?: number
  }): Promise<{
    data: VitalSigns[]
    pagination: any
  }> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())

    const response = await apiClient.get<{
      success: boolean
      data: VitalSigns[]
      pagination: any
    }>(`/nurse/vital-signs/${patientId}?${queryParams}`)
    
    return {
      data: response.data,
      pagination: response.pagination
    }
  }

  // Get medication schedule
  async getMedicationSchedule(params?: {
    page?: number
    limit?: number
    patient_id?: number
    status?: string
  }): Promise<{
    data: MedicationSchedule[]
    pagination: any
  }> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.patient_id) queryParams.append('patient_id', params.patient_id.toString())
    if (params?.status) queryParams.append('status', params.status)

    const response = await apiClient.getRaw<{
      success: boolean
      data: MedicationSchedule[]
      pagination: any
    }>(`/nurse/medication-schedule?${queryParams}`)
    
    return {
      data: response.data,
      pagination: response.pagination
    }
  }

  // Record medication administration
  async recordMedicationAdministration(data: {
    patient_id: number
    medicine_id: number
    dose_given: number
    administered_at?: string
    notes?: string
  }): Promise<any> {
    const response = await apiClient.post<{
      success: boolean
      data: any
    }>('/nurse/medication-administration', data)
    return response.data
  }

  // Update/Create care plan
  async updateCarePlan(data: {
    patient_id: number
    plan_details: string
    goals: string
    interventions: string
  }): Promise<CarePlan> {
    const response = await apiClient.post<{
      success: boolean
      data: CarePlan
    }>('/nurse/patient-care-plan', data)
    return response.data
  }

  // Get care plan for patient
  async getCarePlan(patientId: number): Promise<CarePlan> {
    const response = await apiClient.get<{
      success: boolean
      data: CarePlan
    }>(`/nurse/patient-care-plan/${patientId}`)
    return response.data
  }

  // Get shift report
  async getShiftReport(params?: {
    date?: string
    shift?: string
  }): Promise<{
    data: any[]
    summary: any
  }> {
    const queryParams = new URLSearchParams()
    if (params?.date) queryParams.append('date', params.date)
    if (params?.shift) queryParams.append('shift', params.shift)

    const response = await apiClient.get<{
      success: boolean
      data: any[]
      summary: any
    }>(`/nurse/shift-report?${queryParams}`)
    
    return {
      data: response.data,
      summary: response.summary
    }
  }
}

// Export singleton instance
export const nurseApi = new NurseApiService()
