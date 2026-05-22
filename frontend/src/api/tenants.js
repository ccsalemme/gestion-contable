import { apiClient } from './client';
export const tenantsApi = {
    list: () => apiClient.get('/tenants'),
    getById: (id) => apiClient.get(`/tenants/${id}`),
    create: (data) => apiClient.post('/tenants', data),
    update: (id, data) => apiClient.put(`/tenants/${id}`, data),
    delete: (id) => apiClient.delete(`/tenants/${id}`),
};
//# sourceMappingURL=tenants.js.map