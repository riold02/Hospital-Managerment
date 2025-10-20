import { apiClient } from '../api-client';

export interface Service {
  service_id: number;
  service_name: string;
  service_code: string;
  description?: string;
  category?: string;
  unit_price: string | number;
  unit?: string;
  is_active?: boolean;
  requires_doctor?: boolean;
  estimated_duration?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ServiceCategory {
  category: string;
  service_count: number;
}

export interface GetServicesParams {
  category?: string;
  is_active?: 'true' | 'false' | 'all';
  limit?: number;
}

export interface CreateServiceData {
  service_name: string;
  service_code: string;
  description?: string;
  category?: string;
  unit_price: number;
  unit?: string;
  is_active?: boolean;
  requires_doctor?: boolean;
  estimated_duration?: number;
}

export interface UpdateServiceData extends Partial<CreateServiceData> {}

class ServicesApi {
  /**
   * Get all services
   */
  async getAllServices(params?: GetServicesParams) {
    const response = await apiClient.getRaw<{ success: boolean; data: Service[]; total: number }>(
      '/services',
      { params }
    );
    return response.data;
  }

  /**
   * Get service by ID
   */
  async getServiceById(id: number) {
    const response = await apiClient.getRaw<{ success: boolean; data: Service }>(
      `/services/${id}`
    );
    return response.data;
  }

  /**
   * Get services by category
   */
  async getServicesByCategory(category: string) {
    const response = await apiClient.getRaw<{ success: boolean; data: Service[]; total: number }>(
      `/services/category/${category}`
    );
    return response.data;
  }

  /**
   * Get all service categories
   */
  async getServiceCategories() {
    const response = await apiClient.getRaw<{ success: boolean; data: ServiceCategory[] }>(
      '/services/categories'
    );
    return response.data;
  }

  /**
   * Create new service (Admin only)
   */
  async createService(data: CreateServiceData) {
    const response = await apiClient.post<{ success: boolean; data: Service; message: string }>(
      '/services',
      data
    );
    return response.data;
  }

  /**
   * Update service (Admin only)
   */
  async updateService(id: number, data: UpdateServiceData) {
    const response = await apiClient.put<{ success: boolean; data: Service; message: string }>(
      `/services/${id}`,
      data
    );
    return response.data;
  }

  /**
   * Delete service (Admin only)
   */
  async deleteService(id: number) {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `/services/${id}`
    );
    return response;
  }
}

export const servicesApi = new ServicesApi();
