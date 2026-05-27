import { apiClient } from './client'

export const sheetsApi = {
  sync: (tenantId: string) =>
    apiClient.post(`/sheets/sync/${tenantId}`),

  getSheetData: (tenantId: string, sheetId: string, range?: string) =>
    apiClient.get(`/sheets/${tenantId}/${sheetId}`, range ? { params: { range } } : undefined),

  updateSheetData: (tenantId: string, sheetId: string, data: any) =>
    apiClient.put(`/sheets/${tenantId}/${sheetId}`, { data }),
}
