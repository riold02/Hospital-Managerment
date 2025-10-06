import { apiClient } from '../api-client';

// Interfaces
export interface StaffMember {
  staff_id: number;
  first_name: string;
  last_name: string;
  email?: string;
  position?: string;
  department_id?: number;
  department?: {
    department_name: string;
  };
  contact_number?: string;
  is_active?: boolean;
  user_id?: string;
}

export interface StaffStats {
  total: number;
  byRole: {
    [key: string]: number;
  };
  byDepartment: {
    [key: string]: number;
  };
}

export interface StaffListParams {
  page?: number;
  limit?: number;
  role?: string;
  department_id?: number;
  search?: string;
}

// API Functions
export const staffApi = {
  // Get all staff members
  async getAllStaff(params?: StaffListParams) {
    const response = await apiClient.get('/staff', { params });
    // Backend returns {success, data, pagination}
    return response;
  },

  // Get staff by ID
  async getStaffById(id: number) {
    const response = await apiClient.get(`/staff/${id}`);
    return response.data;
  },

  // Get staff statistics
  async getStaffStats() {
    const response = await apiClient.get('/staff/stats');
    return response.data;
  },

  // Create staff member (admin only)
  async createStaff(data: Partial<StaffMember>) {
    const response = await apiClient.post('/staff', data);
    return response.data;
  },

  // Update staff member (admin only)
  async updateStaff(id: number, data: Partial<StaffMember>) {
    const response = await apiClient.put(`/staff/${id}`, data);
    return response.data;
  },

  // Delete staff member (admin only)
  async deleteStaff(id: number) {
    const response = await apiClient.delete(`/staff/${id}`);
    return response.data;
  },
};

export default staffApi;

