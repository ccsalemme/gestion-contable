import { apiClient } from './client'
import { User, UserRole } from '@/types'

export interface CreateUserDto {
  email: string
  password: string
  role: UserRole
}

export interface UpdateUserDto {
  email?: string
  role?: UserRole
  active?: boolean
}

export const usersApi = {
  getAll: () => apiClient.get<User[]>('/users'),

  getById: (id: string) => apiClient.get<User>(`/users/${id}`),

  create: (data: CreateUserDto) => apiClient.post<User>('/users', data),

  update: (id: string, data: UpdateUserDto) =>
    apiClient.put<User>(`/users/${id}`, data),

  delete: (id: string) => apiClient.delete(`/users/${id}`),

  getMe: () => apiClient.get<User>('/users/me'),
}
