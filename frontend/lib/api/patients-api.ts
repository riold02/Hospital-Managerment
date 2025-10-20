import { apiClient } from '../api-client'

export interface Patient {
  patient_id: number
  first_name: string
  last_name: string
  email: string
  phone?: string
  date_of_birth?: string
  gender?: 'male' | 'female' | 'other'
  address?: string
  medical_history?: string
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface MedicalRecord {
  medical_record_id: number
  patient_id: number
  record_type: string
  diagnosis: string
  treatment: string
  recorded_by: number
  created_at: string
  updated_at: string
}

export interface Room {
  room_id: number
  room_number: string
  capacity: number
  status: string
}

export interface AssignedPatient {
  assignment_id: number
  room_id: number
  patient_id: number
  assignment_type: string
  start_date: string
  end_date: string | null
  patient: Patient & {
    medical_records?: MedicalRecord[]
  }
  room: Room
}

export interface VitalSigns {
  blood_pressure_systolic: number
  blood_pressure_diastolic: number
  heart_rate: number
  temperature: number
  respiratory_rate: number
  oxygen_saturation: number
  notes?: string
}

export interface NursingNote {
  note_id: number
  patient_id: number
  nurse_id: number
  note_type: 'observation' | 'intervention' | 'care_plan' | 'handover'
  content: string
  priority: 'normal' | 'important' | 'critical'
  created_at: string
  updated_at: string
  nurse?: {
    user_id: number
    first_name: string
    last_name: string
  }
}

export interface GetPatientsParams {
  page?: number
  limit?: number
  search?: string
  gender?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PatientsResponse {
  success: boolean
  data: Patient[]
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export const patientsApi = {
  // Get all patients
  getAllPatients: async (params?: GetPatientsParams): Promise<PatientsResponse> => {
    const queryParams = new URLSearchParams()
    if (params) {
      if (params.page) queryParams.append('page', String(params.page))
      if (params.limit) queryParams.append('limit', String(params.limit))
      if (params.search) queryParams.append('search', params.search)
      if (params.gender) queryParams.append('gender', params.gender)
      if (params.sortBy) queryParams.append('sortBy', params.sortBy)
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder)
    }
    const queryString = queryParams.toString()
    const endpoint = queryString ? `/patients?${queryString}` : '/patients'
    
    return await apiClient.getRaw<PatientsResponse>(endpoint)
  },

  // Get patient by ID
  getPatientById: async (id: number): Promise<{ success: boolean; data: Patient }> => {
    return await apiClient.getRaw<{ success: boolean; data: Patient }>(`/patients/${id}`)
  },

  // Get patient statistics
  getPatientStats: async (): Promise<{
    success: boolean
    data: {
      total: number
      male: number
      female: number
      other: number
    }
  }> => {
    return await apiClient.getRaw('/patients/stats')
  },

  // Get assigned patients for nurse
  getAssignedPatients: async (): Promise<{ success: boolean; data: AssignedPatient[] }> => {
    return await apiClient.getRaw<{ success: boolean; data: AssignedPatient[] }>('/nurse/patient-assignments')
  },

  // Record vital signs
  recordVitalSigns: async (patientId: number, vitalSigns: VitalSigns): Promise<{ 
    success: boolean; 
    data: MedicalRecord;
    message: string;
  }> => {
    return await apiClient.post(`/nurse/vital-signs/${patientId}`, vitalSigns)
  },

  // Get patient medical records
  getPatientMedicalRecords: async (patientId: number): Promise<{
    success: boolean;
    data: MedicalRecord[];
  }> => {
    return await apiClient.get(`/medical-records/patient/${patientId}`)
  },

  // Create patient
  createPatient: async (data: {
    first_name: string
    last_name: string
    date_of_birth?: string
    gender?: string
    phone?: string
    email?: string
    password?: string
    address?: string
    blood_type?: string
    emergency_contact_name?: string
    emergency_contact_phone?: string
    medical_history?: string
  }): Promise<{ success: boolean; data: Patient; message: string }> => {
    return await apiClient.post('/patients', data)
  },

  // Update patient
  updatePatient: async (patientId: number, data: {
    first_name?: string
    last_name?: string
    date_of_birth?: string
    gender?: string
    phone?: string
    email?: string
    address?: string
    blood_type?: string
    emergency_contact_name?: string
    emergency_contact_phone?: string
    medical_history?: string
  }): Promise<{ success: boolean; data: Patient; message: string }> => {
    return await apiClient.put(`/patients/${patientId}`, data)
  },

  // Delete patient
  deletePatient: async (patientId: number): Promise<{ success: boolean; message: string }> => {
    return await apiClient.delete(`/patients/${patientId}`)
  }
}
