import { apiClient } from '../api-client'

export interface AdminDashboardData {
  overview: {
    totalUsers: number
    totalPatients: number
    totalDoctors: number
    totalStaff: number
    totalAppointments: number
    todayAppointments: number
    totalDepartments: number
    totalRooms: number
  }
  recentActivities: Array<{
    user_id: string
    email: string
    created_at: string
  }>
  systemHealth: {
    database: string
    server: string
    lastBackup: string
  }
}

export interface SystemStatistics {
  totalUsers: number
  totalAppointments: number
  totalDepartments: number
  totalRooms: number
}

export interface UserData {
  user_id: string
  email: string
  is_active: boolean
  created_at: string
  last_login?: string
}

export interface ActivityLog {
  log_id: number
  user_id: string
  action: string
  resource: string
  details?: string
  timestamp: string
  user?: {
    email: string
  }
}

export interface BackupData {
  backup_id: number
  backup_type: string
  tables: string[]
  created_at: string
  created_by: string
  status: string
  file_size: string
  file_path: string
}

export interface MaintenanceMode {
  maintenance_mode: boolean
  message: string
  enabled_at?: string
  enabled_by?: string
  estimated_duration?: string
}

export class AdminApiService {
  // Get admin dashboard overview
  async getDashboard(): Promise<AdminDashboardData> {
    const response = await apiClient.getRaw<{success: boolean, data: AdminDashboardData}>('/admin/dashboard')
    return response.data
  }

  // Get system statistics
  async getSystemStatistics(): Promise<SystemStatistics> {
    const response = await apiClient.getRaw<{success: boolean, data: SystemStatistics}>('/admin/system-stats')
    return response.data
  }

  // Get all users
  async getAllUsers(params?: {
    page?: number
    limit?: number
    role?: string
    status?: string
  }): Promise<{
    data: UserData[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
      hasNext: boolean
      hasPrev: boolean
    }
  }> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.role) queryParams.append('role', params.role)
    if (params?.status) queryParams.append('status', params.status)

    const response = await apiClient.getRaw<{
      success: boolean
      data: UserData[]
      pagination: any
    }>(`/admin/users?${queryParams}`)
    
    return {
      data: response.data,
      pagination: response.pagination
    }
  }

  // Update user status
  async updateUserStatus(userId: string, data: {
    is_active: boolean
  }): Promise<UserData> {
    const response = await apiClient.put<{
      success: boolean
      data: UserData
    }>(`/admin/users/${userId}/status`, data)
    return response.data
  }

  // Get activity logs
  async getActivityLogs(params?: {
    page?: number
    limit?: number
    user_id?: string
    action?: string
    date_from?: string
    date_to?: string
  }): Promise<{
    data: ActivityLog[]
    pagination: any
  }> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.user_id) queryParams.append('user_id', params.user_id)
    if (params?.action) queryParams.append('action', params.action)
    if (params?.date_from) queryParams.append('date_from', params.date_from)
    if (params?.date_to) queryParams.append('date_to', params.date_to)

    const response = await apiClient.getRaw<{
      success: boolean
      data: ActivityLog[]
      pagination: any
    }>(`/admin/activity-logs?${queryParams}`)
    
    return {
      data: response.data,
      pagination: response.pagination
    }
  }

  // Create system backup
  async createBackup(data: {
    backup_type?: string
    tables?: string[]
  }): Promise<BackupData> {
    const response = await apiClient.post<{
      success: boolean
      data: BackupData
    }>('/admin/backup', data)
    return response.data
  }

  // Toggle maintenance mode
  async toggleMaintenanceMode(data: {
    enabled: boolean
    message?: string
  }): Promise<MaintenanceMode> {
    const response = await apiClient.post<{
      success: boolean
      data: MaintenanceMode
    }>('/admin/maintenance-mode', data)
    return response.data
  }

  // Get system health
  async getSystemHealth(): Promise<{
    database: string
    server: string
    api: string
    storage: string
  }> {
    const response = await apiClient.getRaw<{
      success: boolean
      data: {
        database: string
        server: string
        api: string
        storage: string
      }
    }>('/admin/system-health')
    return response.data
  }

  // Get user roles
  async getUserRoles(): Promise<Array<{
    role_id: number
    role_name: string
    description: string
  }>> {
    const response = await apiClient.getRaw<{
      success: boolean
      data: Array<{
        role_id: number
        role_name: string
        description: string
      }>
    }>('/admin/roles')
    return response.data
  }

  // Assign role to user
  async assignUserRole(userId: string, roleId: number): Promise<any> {
    const response = await apiClient.post<{
      success: boolean
      data: any
    }>(`/admin/users/${userId}/roles`, { role_id: roleId })
    return response.data
  }

  // Remove role from user
  async removeUserRole(userId: string, roleId: number): Promise<any> {
    const response = await apiClient.delete<{
      success: boolean
      data: any
    }>(`/admin/users/${userId}/roles/${roleId}`)
    return response.data
  }

  // Delete user
  async deleteUser(userId: string): Promise<any> {
    const response = await apiClient.delete<{
      success: boolean
      message: string
    }>(`/admin/users/${userId}`)
    return response.data
  }
}

// Export singleton instance
export const adminApi = new AdminApiService()
