import { apiClient } from '../api-client'

export interface Room {
  room_id: number
  room_number: string
  room_type_id: number
  capacity: number
  status: 'Available' | 'Occupied' | 'Maintenance' | 'Cleaning'
  last_serviced?: string
  room_type?: {
    room_type_id: number
    type_name: string
    description?: string
  }
  current_occupancy?: number
}

export interface RoomAssignment {
  assignment_id: number
  room_id: number
  assignment_type: 'Patient' | 'Staff' | 'PATIENT' | 'STAFF'
  patient_id?: number
  staff_id?: number
  assigned_by_user_id?: string
  start_date: string
  end_date?: string
  created_at: string
  room?: {
    room_id: number
    room_number: string
    room_type?: {
      room_type_id: number
      type_name: string
    }
  }
  patient?: {
    patient_id: number
    first_name: string
    last_name: string
    email?: string
    phone?: string
    date_of_birth?: string
    gender?: string
  }
  staff?: {
    staff_id: number
    first_name: string
    last_name: string
    role?: string
    position?: string
  }
}

export interface CreateRoomAssignmentData {
  room_id: number
  assignment_type: 'Patient' | 'Staff' | 'PATIENT' | 'STAFF'
  patient_id?: number
  staff_id?: number
  start_date: string
  end_date?: string
}

export interface UpdateRoomAssignmentData {
  room_id?: number
  assignment_type?: 'Patient' | 'Staff' | 'PATIENT' | 'STAFF'
  patient_id?: number
  staff_id?: number
  start_date?: string
  end_date?: string
}

export interface GetRoomsParams {
  page?: number
  limit?: number
  status?: string
  room_type_id?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface GetRoomAssignmentsParams {
  page?: number
  limit?: number
  room_id?: number
  assignment_type?: 'Patient' | 'Staff' | 'PATIENT' | 'STAFF'
  patient_id?: number
  staff_id?: number
  active_only?: boolean
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

class RoomsApi {
  // Rooms
  async getAllRooms(params?: GetRoomsParams) {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.status) queryParams.append('status', params.status)
    if (params?.room_type_id) queryParams.append('room_type_id', params.room_type_id.toString())
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)

    const url = `/rooms${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return apiClient.get<{ success: boolean; data: Room[]; pagination?: any }>(url)
  }

  async getRoomById(id: number) {
    return apiClient.get<{ success: boolean; data: Room }>(`/rooms/${id}`)
  }

  async createRoom(data: any) {
    return apiClient.post<{ success: boolean; data: Room }>('/rooms', data)
  }

  async updateRoom(id: number, data: any) {
    return apiClient.put<{ success: boolean; data: Room }>(`/rooms/${id}`, data)
  }

  async deleteRoom(id: number) {
    return apiClient.delete<{ success: boolean; message: string }>(`/rooms/${id}`)
  }

  // Room Assignments
  async getAllRoomAssignments(params?: GetRoomAssignmentsParams) {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.room_id) queryParams.append('room_id', params.room_id.toString())
    if (params?.assignment_type) queryParams.append('assignment_type', params.assignment_type)
    if (params?.patient_id) queryParams.append('patient_id', params.patient_id.toString())
    if (params?.staff_id) queryParams.append('staff_id', params.staff_id.toString())
    if (params?.active_only !== undefined) queryParams.append('active_only', params.active_only.toString())
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)

    const url = `/room-assignments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return apiClient.get<{ success: boolean; data: RoomAssignment[]; pagination?: any }>(url)
  }

  async getRoomAssignmentById(id: number) {
    return apiClient.get<{ success: boolean; data: RoomAssignment }>(`/room-assignments/${id}`)
  }

  async createRoomAssignment(data: CreateRoomAssignmentData) {
    return apiClient.post<{ success: boolean; data: RoomAssignment }>('/room-assignments', data)
  }

  async updateRoomAssignment(id: number, data: UpdateRoomAssignmentData) {
    return apiClient.put<{ success: boolean; data: RoomAssignment }>(`/room-assignments/${id}`, data)
  }

  async endRoomAssignment(id: number) {
    return apiClient.patch<{ success: boolean; data: RoomAssignment }>(`/room-assignments/${id}/end`, {})
  }

  async deleteRoomAssignment(id: number) {
    return apiClient.delete<{ success: boolean; message: string }>(`/room-assignments/${id}`)
  }

  // Room Types
  async getRoomTypes() {
    return apiClient.get<{ success: boolean; data: any[] }>('/room-types')
  }
}

export const roomsApi = new RoomsApi()
