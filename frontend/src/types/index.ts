// API Types
export interface ApiResponse<T> {
  data: T
  message?: string
  error?: string
  statusCode: number
}

// Auth Types
export interface User {
  id: string
  email: string
  role: UserRole
  active: boolean
  createdAt: string
  updatedAt: string
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN_CLIENT = 'ADMIN_CLIENT',
  USER_FINAL = 'USER_FINAL',
}

export interface AuthCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken?: string
}

// Tenant Types
export interface Tenant {
  id: string
  name: string
  sheetId: string
  active: boolean
  createdAt: string
  updatedAt: string
}

// Spreadsheet Types
export interface SpreadsheetData {
  id: string
  tenantId: string
  data: Record<string, unknown>[]
  lastSync: string
}

export interface CellValue {
  value: string | number | boolean | null
  formula?: string
}

// Auth DTO Types
export interface LoginDto {
  email: string
  password: string
}

export interface RegisterDto {
  email: string
  password: string
}

// Permission Types
export interface Permission {
  id: string
  name: string
  description: string
}

export interface UserPermission {
  id: string
  userId: string
  permissionId: string
  permission: Permission
}

// Log Types
export interface AuditLog {
  id: string
  userId: string
  action: string
  metadata: Record<string, unknown>
  createdAt: string
}
