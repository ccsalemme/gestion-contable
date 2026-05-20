import { apiClient } from './client'
import { Tenant } from '@/types'

export const tenantsApi = {
  list: () => apiClient.get<Tenant[]>('/tenants'),

  getById: (id: string) => apiClient.get<Tenant>(`/tenants/${id}`),

  create: (data: any) => apiClient.post<Tenant>('/tenants', data),

  update: (id: string, data: any) => apiClient.put<Tenant>(`/tenants/${id}`, data),

  delete: (id: string) => apiClient.delete<void>(`/tenants/${id}`),
}
