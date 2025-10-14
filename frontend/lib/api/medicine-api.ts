import { apiClient } from '../api-client'

export interface Medicine {
  medicine_id: number
  name: string
  brand?: string
  type?: string
  dosage?: string
  stock_quantity?: number
  expiry_date?: string
  created_at?: string
}

export interface CreateMedicineData {
  name: string
  brand?: string
  type?: string
  dosage?: string
  stock_quantity?: number
  expiry_date?: string
}

export interface UpdateMedicineData {
  name?: string
  brand?: string
  type?: string
  dosage?: string
  stock_quantity?: number
  expiry_date?: string
}

class MedicineApi {
  // Get all medicines with pagination and filters
  async getAllMedicines(params?: {
    page?: number
    limit?: number
    medicine_type?: string
    search?: string
    expiry_date_from?: string
    expiry_date_to?: string
    low_stock?: boolean
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<{
    data: Medicine[]
    pagination: any
  }> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.medicine_type) queryParams.append('medicine_type', params.medicine_type)
    if (params?.search) queryParams.append('search', params.search)
    if (params?.expiry_date_from) queryParams.append('expiry_date_from', params.expiry_date_from)
    if (params?.expiry_date_to) queryParams.append('expiry_date_to', params.expiry_date_to)
    if (params?.low_stock) queryParams.append('low_stock', 'true')
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)

    const response = await apiClient.get<{
      success: boolean
      data: Medicine[]
      pagination: any
    }>(`/medicine?${queryParams}`)

    return {
      data: response.data,
      pagination: response.pagination
    }
  }

  // Get medicine by ID
  async getMedicineById(id: number): Promise<Medicine> {
    const response = await apiClient.get<{
      success: boolean
      data: Medicine
    }>(`/medicine/${id}`)
    return response.data
  }

  // Create new medicine
  async createMedicine(data: CreateMedicineData): Promise<Medicine> {
    const response = await apiClient.post<{
      success: boolean
      data: Medicine
      message: string
    }>('/medicine', data)
    return response.data
  }

  // Update medicine
  async updateMedicine(id: number, data: UpdateMedicineData): Promise<Medicine> {
    const response = await apiClient.put<{
      success: boolean
      data: Medicine
      message: string
    }>(`/medicine/${id}`, data)
    return response.data
  }

  // Delete medicine
  async deleteMedicine(id: number): Promise<void> {
    await apiClient.delete(`/medicine/${id}`)
  }

  // Get medicines by type
  async getMedicinesByType(type: string): Promise<Medicine[]> {
    const response = await apiClient.get<{
      success: boolean
      data: Medicine[]
    }>(`/medicine/type/${type}`)
    return response.data
  }

  // Get low stock medicines
  async getLowStockMedicines(threshold?: number): Promise<Medicine[]> {
    const queryParams = new URLSearchParams()
    if (threshold) queryParams.append('threshold', threshold.toString())

    const response = await apiClient.get<{
      success: boolean
      data: Medicine[]
    }>(`/medicine/low-stock?${queryParams}`)
    return response.data
  }

  // Get expired medicines
  async getExpiredMedicines(): Promise<Medicine[]> {
    const response = await apiClient.get<{
      success: boolean
      data: Medicine[]
    }>('/medicine/expired')
    return response.data
  }

  // Get medicine statistics
  async getMedicineStats(): Promise<{
    total: number
    totalValue: number
    byType: Record<string, number>
    lowStock: number
    expired: number
    expiringSoon: number
  }> {
    const response = await apiClient.get<{
      success: boolean
      data: {
        total: number
        totalValue: number
        byType: Record<string, number>
        lowStock: number
        expired: number
        expiringSoon: number
      }
    }>('/medicine/stats')
    return response.data
  }
}

export const medicineApi = new MedicineApi()
