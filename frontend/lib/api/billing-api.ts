import { apiClient } from '../api-client'

export interface BillingItem {
  item_id?: number
  service_id: number
  quantity: number
  unit_price: string | number
  total_price: string | number
  item_description?: string
  service?: {
    service_id: number
    service_name: string
    service_code: string
    category: string
    unit_price: string | number
    description?: string
  }
}

export interface PaymentTransaction {
  transaction_id: number
  bill_id: number
  payment_gateway: string
  transaction_code: string
  amount: string | number
  status: string
  payment_url?: string
  gateway_transaction_id?: string
  gateway_response?: any
  paid_at?: string
  created_at: string
  updated_at?: string
}

export interface BillingRecord {
  bill_id: number
  patient_id: number
  appointment_id?: number
  medical_record_id?: number
  processed_by_user_id?: string
  total_amount: string | number
  payment_status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'Pending' | 'Paid' | 'Overdue' | 'Cancelled'
  payment_date?: string
  payment_method?: string
  billing_date?: string
  insurance_provider?: string
  created_at: string
  updated_at?: string
  patient?: {
    patient_id: number
    name: string
    first_name?: string
    last_name?: string
    email?: string
    phone?: string
    address?: string
    date_of_birth: string
    gender: string
  }
  appointment?: {
    appointment_id: number
    appointment_date: string
    purpose?: string
  }
  medical_record?: {
    record_id: number
    diagnosis: string
    treatment?: string
    doctor?: {
      user_id?: string
      doctor_id?: number
      first_name?: string
      last_name?: string
      user?: {
        full_name: string
      }
    }
  }
  items?: BillingItem[]
  payment_transactions?: PaymentTransaction[]
}

// Alias for getBillingById response (full detail)
export type BillingDetail = BillingRecord

export interface CreateBillingData {
  patient_id: number
  billing_date: string // Required: YYYY-MM-DD format
  appointment_id?: number
  medical_record_id?: number
  total_amount: number
  payment_status?: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED'
  payment_date?: string
  payment_method?: 'CASH' | 'TRANSFER'  // Tiền mặt or Chuyển khoản
  insurance_provider?: string
  billing_items?: {
    service_id: number
    quantity: number
    unit_price: number
    total_amount: number
  }[]
}

export interface UpdateBillingData {
  total_amount?: number
  payment_status?: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'Pending' | 'Paid' | 'Overdue' | 'Cancelled'
  payment_date?: string
  insurance_provider?: string
}

class BillingApi {
  // Get all billing records with pagination and filters
  async getAllBilling(params?: {
    page?: number
    limit?: number
    patient_id?: number
    payment_status?: string
    date_from?: string
    date_to?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<{
    data: BillingRecord[]
    pagination: any
  }> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.patient_id) queryParams.append('patient_id', params.patient_id.toString())
    if (params?.payment_status) queryParams.append('payment_status', params.payment_status)
    if (params?.date_from) queryParams.append('date_from', params.date_from)
    if (params?.date_to) queryParams.append('date_to', params.date_to)
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)

    const response = await apiClient.getRaw<{
      success: boolean
      data: BillingRecord[]
      pagination: any
    }>(`/billing?${queryParams}`)

    return {
      data: response.data,
      pagination: response.pagination
    }
  }

  // Get billing by ID
  async getBillingById(id: number): Promise<BillingRecord> {
    const response = await apiClient.get<{
      success: boolean
      data: BillingRecord
    }>(`/billing/${id}`)
    return response.data
  }

  // Create new billing record
  async createBilling(data: CreateBillingData): Promise<BillingRecord> {
    const response = await apiClient.post<{
      success: boolean
      data: BillingRecord
      message: string
    }>('/billing', data)
    return response.data
  }

  // Update billing record
  async updateBilling(id: number, data: UpdateBillingData): Promise<BillingRecord> {
    const response = await apiClient.put<{
      success: boolean
      data: BillingRecord
      message: string
    }>(`/billing/${id}`, data)
    return response.data
  }

  // Delete billing record
  async deleteBilling(id: number): Promise<void> {
    await apiClient.delete(`/billing/${id}`)
  }

  // Get billing statistics
  async getBillingStats(params?: {
    date_from?: string
    date_to?: string
  }): Promise<{
    totalRevenue: number
    totalPending: number
    totalPaid: number
    totalOverdue: number
    totalCancelled: number
    byStatus: Record<string, number>
  }> {
    const queryParams = new URLSearchParams()
    if (params?.date_from) queryParams.append('date_from', params.date_from)
    if (params?.date_to) queryParams.append('date_to', params.date_to)

    const response = await apiClient.get<{
      success: boolean
      data: {
        totalRevenue: number
        totalPending: number
        totalPaid: number
        totalOverdue: number
        totalCancelled: number
        byStatus: Record<string, number>
      }
    }>(`/billing/stats?${queryParams}`)
    return response.data
  }

  // Get patient billing history
  async getPatientBillingHistory(patientId: number): Promise<BillingRecord[]> {
    const response = await apiClient.get<{
      success: boolean
      data: BillingRecord[]
    }>(`/billing/patient/${patientId}`)
    return response.data
  }
}

export const billingApi = new BillingApi()
