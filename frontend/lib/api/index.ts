// Export all API services
export * from './doctor-api'
export * from './nurse-api'
export * from './appointments-api'
export * from './pharmacy-api'
export * from './lab-assistant-api'
export * from './admin-api'
export * from './staff-api'

// Re-export main API client
export { apiClient, ApiError } from '../api-client'
