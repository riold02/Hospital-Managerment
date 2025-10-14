import { apiClient } from '../api-client';

export interface MedicalRecord {
  record_id: number;
  patient_id: number;
  doctor_id?: number;
  appointment_id?: number;
  created_by_user_id?: string;
  diagnosis?: string;
  treatment?: string;
  prescription?: string;
  created_at?: string;
  patient?: {
    patient_id: number;
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
  };
  doctor?: {
    doctor_id: number;
    first_name: string;
    last_name: string;
    specialization?: string;
  };
  appointment?: {
    appointment_id: number;
    appointment_date: string;
    appointment_time: string;
  };
}

export interface GetMedicalRecordsParams {
  patient_id?: number;
  doctor_id?: number;
  limit?: number;
  offset?: number;
}

export interface CreateMedicalRecordData {
  patient_id: number;
  doctor_id?: number;
  appointment_id?: number;
  diagnosis?: string;
  treatment?: string;
  prescription?: string;
}

export interface UpdateMedicalRecordData extends Partial<CreateMedicalRecordData> {}

class MedicalRecordsApi {
  /**
   * Get all medical records
   */
  async getAllMedicalRecords(params?: GetMedicalRecordsParams) {
    const response = await apiClient.get<{ success: boolean; data: MedicalRecord[]; total: number }>(
      '/medical-records'
    );
    return response.data;
  }

  /**
   * Get medical record by ID
   */
  async getMedicalRecordById(id: number) {
    const response = await apiClient.get<{ success: boolean; data: MedicalRecord }>(
      `/medical-records/${id}`
    );
    return response.data;
  }

  /**
   * Get medical records by patient ID
   */
  async getMedicalRecordsByPatient(patientId: number) {
    const response = await apiClient.get<{ success: boolean; data: MedicalRecord[]; total: number }>(
      `/medical-records/patient/${patientId}`
    );
    return response.data;
  }

  /**
   * Create new medical record
   */
  async createMedicalRecord(data: CreateMedicalRecordData) {
    const response = await apiClient.post<{ success: boolean; data: MedicalRecord; message: string }>(
      '/medical-records',
      data
    );
    return response.data;
  }

  /**
   * Update medical record
   */
  async updateMedicalRecord(id: number, data: UpdateMedicalRecordData) {
    const response = await apiClient.put<{ success: boolean; data: MedicalRecord; message: string }>(
      `/medical-records/${id}`,
      data
    );
    return response.data;
  }

  /**
   * Delete medical record
   */
  async deleteMedicalRecord(id: number) {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `/medical-records/${id}`
    );
    return response;
  }
}

export const medicalRecordsApi = new MedicalRecordsApi();
