import { apiClient } from '../api-client'

export interface PharmacyDashboardData {
  totalMedicines: number
  totalPharmacyRecords: number
  lowStockCount: number
  pendingPrescriptions: number
}

export interface Medicine {
  medicine_id: number
  name: string
  type: string
  brand: string
  manufacturer: string
  dosage_form: string
  strength: string
  unit_price: number
  stock_quantity: number
  expiry_date: string
  storage_conditions: string
  created_at: string
}

export interface PharmacyRecord {
  pharmacy_id: number
  patient_id: number
  medicine_id: number
  quantity: number
  dispensed_by_user_id: string
  prescription_date: string
  patient: {
    patient_id: number
    first_name: string
    last_name: string
    patient_code: string
  }
  medicine: {
    medicine_id: number
    name: string
    type: string
    brand: string
  }
  dispensed_by_user: {
    user_id: string
    email: string
  }
}

export interface PendingPrescription {
  prescription_id: number
  appointment_id: number
  medicine_id: number
  quantity: number
  dosage: string
  frequency: string
  duration: string
  status: string
  prescription_date: string
  appointment: {
    patient: {
      patient_id: number
      first_name: string
      last_name: string
      patient_code: string
    }
    doctor: {
      doctor_id: number
      first_name: string
      last_name: string
    }
  }
  medicine: {
    medicine_id: number
    name: string
    type: string
    brand: string
  }
}

export interface PharmacyStatistics {
  totalDispensed: number
  totalRevenue: number
  topMedicines: Array<{
    medicine_name: string
    quantity_dispensed: number
  }>
}

export class PharmacyApiService {
  // Get pharmacy dashboard overview
  async getDashboard(): Promise<PharmacyDashboardData> {
    const response = await apiClient.get<{success: boolean, data: PharmacyDashboardData}>('/pharmacy/dashboard')
    return response.data
  }

  // Get pending prescriptions
  async getPendingPrescriptions(params?: {
    page?: number
    limit?: number
  }): Promise<{
    data: PendingPrescription[]
    pagination: any
  }> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())

    const response = await apiClient.get<{
      success: boolean
      data: PendingPrescription[]
      pagination: any
    }>(`/pharmacy/pending-prescriptions?${queryParams}`)
    
    return {
      data: response.data,
      pagination: response.pagination
    }
  }

  // Get medicine inventory
  async getMedicineInventory(params?: {
    page?: number
    limit?: number
    search?: string
    category?: string
    low_stock?: boolean
  }): Promise<{
    data: Medicine[]
    pagination: any
  }> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.search) queryParams.append('search', params.search)
    if (params?.category) queryParams.append('category', params.category)
    if (params?.low_stock) queryParams.append('low_stock', 'true')

    const response = await apiClient.get<{
      success: boolean
      data: Medicine[]
      pagination: any
    }>(`/pharmacy/medicine-inventory?${queryParams}`)
    
    return {
      data: response.data,
      pagination: response.pagination
    }
  }

  // Update medicine stock
  async updateMedicineStock(medicineId: number, data: {
    stock_quantity: number
    notes?: string
  }): Promise<Medicine> {
    const response = await apiClient.put<{
      success: boolean
      data: Medicine
    }>(`/pharmacy/medicine-stock/${medicineId}`, data)
    return response.data
  }

  // Get expiring medicines
  async getExpiringMedicines(params?: {
    days?: number
    page?: number
    limit?: number
  }): Promise<{
    data: Medicine[]
    pagination: any
  }> {
    const queryParams = new URLSearchParams()
    if (params?.days) queryParams.append('days', params.days.toString())
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())

    const response = await apiClient.get<{
      success: boolean
      data: Medicine[]
      pagination: any
    }>(`/pharmacy/expiring-medicines?${queryParams}`)
    
    return {
      data: response.data,
      pagination: response.pagination
    }
  }

  // Get pharmacy records
  async getPharmacyRecords(params?: {
    page?: number
    limit?: number
    date_from?: string
    date_to?: string
  }): Promise<{
    data: PharmacyRecord[]
    pagination: any
  }> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.date_from) queryParams.append('date_from', params.date_from)
    if (params?.date_to) queryParams.append('date_to', params.date_to)

    const response = await apiClient.get<{
      success: boolean
      data: PharmacyRecord[]
      pagination: any
    }>(`/pharmacy/records?${queryParams}`)
    
    return {
      data: response.data,
      pagination: response.pagination
    }
  }

  // Get pharmacy statistics
  async getPharmacyStatistics(): Promise<PharmacyStatistics> {
    const response = await apiClient.get<{
      success: boolean
      data: PharmacyStatistics
    }>('/pharmacy/statistics')
    return response.data
  }

  // Get daily dispensing report
  async getDailyDispensingReport(date?: string): Promise<{
    data: PharmacyRecord[]
    summary: {
      totalDispensed: number
      totalRevenue: number
      uniquePatients: number
    }
  }> {
    const queryParams = new URLSearchParams()
    if (date) queryParams.append('date', date)

    const response = await apiClient.get<{
      success: boolean
      data: PharmacyRecord[]
      summary: any
    }>(`/pharmacy/daily-report?${queryParams}`)
    
    return {
      data: response.data,
      summary: response.summary
    }
  }

  // Dispense medicine
  async dispenseMedicine(data: {
    patient_id: number
    medicine_id: number
    quantity: number
    notes?: string
  }): Promise<PharmacyRecord> {
    const response = await apiClient.post<{
      success: boolean
      data: PharmacyRecord
    }>('/pharmacy/dispense', data)
    return response.data
  }

  // Get patient pharmacy history
  async getPatientPharmacyHistory(patientId: number, params?: {
    page?: number
    limit?: number
  }): Promise<{
    data: PharmacyRecord[]
    pagination: any
  }> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())

    const response = await apiClient.get<{
      success: boolean
      data: PharmacyRecord[]
      pagination: any
    }>(`/pharmacy/patient-history/${patientId}?${queryParams}`)
    
    return {
      data: response.data,
      pagination: response.pagination
    }
  }

  // Get medicine dispensing history
  async getMedicineDispensingHistory(medicineId: number, params?: {
    page?: number
    limit?: number
  }): Promise<{
    data: PharmacyRecord[]
    pagination: any
  }> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())

    const response = await apiClient.get<{
      success: boolean
      data: PharmacyRecord[]
      pagination: any
    }>(`/pharmacy/medicine/${medicineId}?${queryParams}`)
    
    return {
      data: response.data,
      pagination: response.pagination
    }
  }
}

// Export singleton instance
export const pharmacyApi = new PharmacyApiService()
