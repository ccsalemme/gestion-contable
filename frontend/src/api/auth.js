import { apiClient } from './client';
export const authApi = {
    login: (credentials) => apiClient.post('/auth/login', credentials),
    register: (data) => apiClient.post('/auth/register', data),
    logout: () => {
        localStorage.removeItem('authToken');
    },
};
//# sourceMappingURL=auth.js.map