import { apiClient } from './client'

export interface SheetRow {
  [key: string]: string | number | boolean | null
}

export const sheetsApi = {
  getSheetData: (sheetId?: string, range?: string) => {
    const params: any = {}
    if (sheetId) params.sheetId = sheetId
    if (range) params.range = range
    return apiClient.get<SheetRow[]>('/sheets', { params })
  },

  getDefaultSheet: () => 
    apiClient.get<SheetRow[]>('/sheets/default'),

  debugTest: () =>
    apiClient.get('/sheets/debug/test'),
}
