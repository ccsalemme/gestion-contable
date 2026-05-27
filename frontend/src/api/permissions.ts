import { apiClient } from './client'
import { Permission, UserPermission } from '@/types'

export const permissionsApi = {
  getAll: () => apiClient.get<Permission[]>('/permissions'),

  getById: (id: string) => apiClient.get<Permission>(`/permissions/${id}`),

  create: (data: Omit<Permission, 'id'>) =>
    apiClient.post<Permission>('/permissions', data),

  update: (id: string, data: Partial<Permission>) =>
    apiClient.put<Permission>(`/permissions/${id}`, data),

  delete: (id: string) => apiClient.delete(`/permissions/${id}`),

  assignToUser: (userId: string, permissionId: string) =>
    apiClient.post<UserPermission>(
      `/permissions/assign/${userId}/${permissionId}`,
    ),

  revokeFromUser: (userId: string, permissionId: string) =>
    apiClient.delete(`/permissions/revoke/${userId}/${permissionId}`),
}
