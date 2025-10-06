import { apiClient } from '../api-client';

export interface Appointment {
  appointment_id: number;
  patient_id: number;
  doctor_id: number;
  appointment_date: string;
  appointment_time: string;
  purpose?: string;
  // API trả về PascalCase từ database
  status: 'Scheduled' | 'Confirmed' | 'In_Progress' | 'Completed' | 'Cancelled' | 'No_Show';
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  patient?: {
    patient_id: number;
    first_name: string;
    last_name: string;
    phone?: string;
    email?: string;
  };
  doctor?: {
    doctor_id: number;
    first_name: string;
    last_name: string;
    specialty?: string;
  };
}

export interface AppointmentListParams {
  page?: number;
  limit?: number;
  patient_id?: number;
  doctor_id?: number;
  status?: string;
  date_from?: string;
  date_to?: string;
}

export const appointmentsApi = {
  // Get all appointments
  async getAllAppointments(params?: AppointmentListParams) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.patient_id) queryParams.append('patient_id', params.patient_id.toString());
    if (params?.doctor_id) queryParams.append('doctor_id', params.doctor_id.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.date_from) queryParams.append('date_from', params.date_from);
    if (params?.date_to) queryParams.append('date_to', params.date_to);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/appointments?${queryString}` : '/appointments';
    
    const response = await apiClient.get<{
      success: boolean;
      data: Appointment[];
      pagination: any;
    }>(endpoint);
    return response;
  },

  // Get appointment by ID
  async getAppointmentById(id: number) {
    const response = await apiClient.get<{
      success: boolean;
      data: Appointment;
    }>(`/appointments/${id}`);
    return response.data;
  },

  // Update appointment
  async updateAppointment(id: number, data: Partial<Appointment>) {
    const response = await apiClient.put<{
      success: boolean;
      data: Appointment;
    }>(`/appointments/${id}`, data);
    return response.data;
  },

  // Confirm appointment (for nurses)
  async confirmAppointment(id: number, notes?: string) {
    return this.updateAppointment(id, { 
      status: 'Confirmed',  // Match database format (uppercase)
      notes: notes 
    });
  },

  // Cancel appointment
  async cancelAppointment(id: number, reason?: string) {
    const response = await apiClient.patch<{
      success: boolean;
      data: Appointment;
    }>(`/appointments/${id}/cancel`, { reason });
    return response.data;
  },

  // Get pending appointments (scheduled status)
  async getPendingAppointments(params?: AppointmentListParams) {
    return this.getAllAppointments({
      ...params,
      status: 'Scheduled'  // Match database format (uppercase)
    });
  },

  // Get today's appointments
  async getTodayAppointments(params?: AppointmentListParams) {
    const today = new Date().toISOString().split('T')[0];
    return this.getAllAppointments({
      ...params,
      date_from: today,
      date_to: today
    });
  }
};

