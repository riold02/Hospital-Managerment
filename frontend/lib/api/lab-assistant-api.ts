import { apiClient } from '../api-client'

export interface LabDashboardData {
  totalPatients: number
  totalAppointments: number
  totalMedicine: number
  totalInventory: number
}

export interface SampleToCollect {
  record_id: number
  patient_id: number
  diagnosis: string
  treatment: string
  prescription: string
  created_at: string
  patient: {
    patient_id: number
    first_name: string
    last_name: string
    patient_code: string
  }
}

export interface ProcessingQueue {
  record_id: number
  patient_id: number
  diagnosis: string
  treatment: string
  prescription: string
  created_at: string
  patient: {
    patient_id: number
    first_name: string
    last_name: string
    patient_code: string
  }
}

export interface LabInventoryItem {
  medicine_id: number
  name: string
  type: string
  brand: string
  stock_quantity: number
  unit_price: number
  expiry_date: string
}

export interface CollectionSchedule {
  schedule_id: number
  patient_id: number
  collection_date: string
  collection_time: string
  sample_type: string
  priority: string
  status: string
  patient: {
    first_name: string
    last_name: string
  }
}

export class LabAssistantApiService {
  // Get lab assistant dashboard overview
  async getDashboard(): Promise<LabDashboardData> {
    const response = await apiClient.get<{success: boolean, data: LabDashboardData}>('/lab-assistant/dashboard')
    return response.data
  }

  // Get samples to collect
  async getSamplesToCollect(params?: {
    page?: number
    limit?: number
    priority?: string
  }): Promise<{
    data: SampleToCollect[]
    pagination: any
  }> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.priority) queryParams.append('priority', params.priority)

    const response = await apiClient.get<{
      success: boolean
      data: SampleToCollect[]
      pagination: any
    }>(`/lab-assistant/samples-to-collect?${queryParams}`)
    
    return {
      data: response.data,
      pagination: response.pagination
    }
  }

  // Record sample collection
  async recordSampleCollection(sampleId: number, data: {
    sample_id: number
    collection_notes: string
  }): Promise<any> {
    const response = await apiClient.post<{
      success: boolean
      data: any
    }>(`/lab-assistant/samples/${sampleId}/collect`, data)
    return response.data
  }

  // Get sample processing queue
  async getSampleProcessingQueue(params?: {
    page?: number
    limit?: number
    status?: string
  }): Promise<{
    data: ProcessingQueue[]
    pagination: any
  }> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.status) queryParams.append('status', params.status)

    const response = await apiClient.get<{
      success: boolean
      data: ProcessingQueue[]
      pagination: any
    }>(`/lab-assistant/processing-queue?${queryParams}`)
    
    return {
      data: response.data,
      pagination: response.pagination
    }
  }

  // Update sample processing status
  async updateSampleProcessingStatus(sampleId: number, data: {
    status: string
    results?: string
    notes?: string
  }): Promise<any> {
    const response = await apiClient.put<{
      success: boolean
      data: any
    }>(`/lab-assistant/samples/${sampleId}/processing-status`, data)
    return response.data
  }

  // Get lab inventory
  async getLabInventory(params?: {
    page?: number
    limit?: number
    search?: string
    low_stock?: boolean
  }): Promise<{
    data: LabInventoryItem[]
    pagination: any
  }> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.search) queryParams.append('search', params.search)
    if (params?.low_stock) queryParams.append('low_stock', 'true')

    const response = await apiClient.get<{
      success: boolean
      data: LabInventoryItem[]
      pagination: any
    }>(`/lab-assistant/inventory?${queryParams}`)
    
    return {
      data: response.data,
      pagination: response.pagination
    }
  }

  // Submit inventory restock request
  async submitInventoryRestockRequest(data: {
    medicine_id: number
    requested_quantity: number
    priority: string
    notes?: string
  }): Promise<any> {
    const response = await apiClient.post<{
      success: boolean
      data: any
    }>('/lab-assistant/inventory-restock-request', data)
    return response.data
  }

  // Get collection schedule
  async getCollectionSchedule(params?: {
    page?: number
    limit?: number
    date?: string
  }): Promise<{
    data: CollectionSchedule[]
    pagination: any
  }> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.date) queryParams.append('date', params.date)

    const response = await apiClient.get<{
      success: boolean
      data: CollectionSchedule[]
      pagination: any
    }>(`/lab-assistant/collection-schedule?${queryParams}`)
    
    return {
      data: response.data,
      pagination: response.pagination
    }
  }
}

// Export singleton instance
export const labAssistantApi = new LabAssistantApiService()
