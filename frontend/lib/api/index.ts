// Export all API services
export * from './doctor-api'
export * from './nurse-api'
export * from './appointments-api'
export * from './pharmacy-api'
export { medicineApi } from './medicine-api'
export type { CreateMedicineData, UpdateMedicineData } from './medicine-api'
export { billingApi } from './billing-api'
export type { CreateBillingData, UpdateBillingData, BillingRecord, BillingItem } from './billing-api'
export { servicesApi } from './services-api'
export type { Service, ServiceCategory, CreateServiceData, UpdateServiceData, GetServicesParams } from './services-api'
export { medicalRecordsApi } from './medical-records-api'
export type { MedicalRecord, CreateMedicalRecordData, UpdateMedicalRecordData, GetMedicalRecordsParams } from './medical-records-api'
export { roomsApi } from './rooms-api'
export type { Room, RoomAssignment, CreateRoomAssignmentData, UpdateRoomAssignmentData, GetRoomsParams, GetRoomAssignmentsParams } from './rooms-api'

export { patientsApi } from './patients-api'
export type { Patient, GetPatientsParams, PatientsResponse } from './patients-api'
export * from './lab-assistant-api'
export * from './admin-api'
export * from './staff-api'

// Re-export main API client
export { apiClient, ApiError } from '../api-client'
