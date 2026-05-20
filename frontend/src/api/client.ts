import axios, { AxiosInstance, AxiosError } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      },
    )
  }

  get<T>(url: string) {
    return this.client.get<T>(url)
  }

  post<T>(url: string, data?: any) {
    return this.client.post<T>(url, data)
  }

  put<T>(url: string, data?: any) {
    return this.client.put<T>(url, data)
  }

  delete<T>(url: string) {
    return this.client.delete<T>(url)
  }
}

export const apiClient = new ApiClient()
