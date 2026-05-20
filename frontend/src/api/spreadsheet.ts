import { apiClient } from './client'
import { SpreadsheetData } from '@/types'

export const spreadsheetApi = {
  getData: (tenantId: string) =>
    apiClient.get<SpreadsheetData>(`/spreadsheet/${tenantId}`),

  sync: (tenantId: string) =>
    apiClient.post<any>(`/spreadsheet/${tenantId}/sync`),

  updateCell: (tenantId: string, data: any) =>
    apiClient.put<any>(`/spreadsheet/${tenantId}/cell`, data),
}
