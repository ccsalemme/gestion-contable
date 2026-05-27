import { apiClient } from './client';
export const usersApi = {
    getAll: () => apiClient.get('/users'),
    getById: (id) => apiClient.get(`/users/${id}`),
    create: (data) => apiClient.post('/users', data),
    update: (id, data) => apiClient.put(`/users/${id}`, data),
    delete: (id) => apiClient.delete(`/users/${id}`),
    getMe: () => apiClient.get('/users/me'),
};
//# sourceMappingURL=users.js.map