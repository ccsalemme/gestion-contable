import { apiClient } from './client'
import { LoginDto, RegisterDto, AuthResponse } from '@/types'

export const authApi = {
  login: (credentials: LoginDto) =>
    apiClient.post<AuthResponse>('/auth/login', credentials),

  register: (data: RegisterDto) =>
    apiClient.post<AuthResponse>('/auth/register', data),
}
