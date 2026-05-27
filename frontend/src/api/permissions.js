import { apiClient } from './client';
export const permissionsApi = {
    getAll: () => apiClient.get('/permissions'),
    getById: (id) => apiClient.get(`/permissions/${id}`),
    create: (data) => apiClient.post('/permissions', data),
    update: (id, data) => apiClient.put(`/permissions/${id}`, data),
    delete: (id) => apiClient.delete(`/permissions/${id}`),
    assignToUser: (userId, permissionId) => apiClient.post(`/permissions/assign/${userId}/${permissionId}`),
    revokeFromUser: (userId, permissionId) => apiClient.delete(`/permissions/revoke/${userId}/${permissionId}`),
};
//# sourceMappingURL=permissions.js.map