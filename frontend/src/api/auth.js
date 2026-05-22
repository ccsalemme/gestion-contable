import { apiClient } from './client';
export const authApi = {
    login: (credentials) => apiClient.post('/auth/login', credentials),
    register: (data) => apiClient.post('/auth/register', data),
};
//# sourceMappingURL=auth.js.map