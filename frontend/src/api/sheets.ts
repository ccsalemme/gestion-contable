import { apiClient } from './client'

export interface SheetRow {
  [key: string]: string | number | boolean | null
}

export interface SheetMetadata {
  sheetId: number;
  title: string;
  index: number;
  rowCount?: number;
  columnCount?: number;
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

  updateCell: (sheetId: string, range: string, value: any) =>
    apiClient.put('/sheets/update-cell', { sheetId, range, value }),

  updateCells: (sheetId: string, updates: Array<{range: string, value: any}>) =>
    apiClient.put('/sheets/update-cells', { sheetId, updates }),

  exportData: (sheetId: string, format: 'json' | 'csv', range?: string) =>
    apiClient.post('/sheets/export', { sheetId, format, range }),

  getSheetMetadata: (sheetId: string) =>
    apiClient.get<{success: boolean, sheets: SheetMetadata[]}>(`/sheets/metadata/${sheetId}`),

  getSheetDataByName: (sheetId: string, sheetName: string, range?: string) => {
    const params: any = {}
    if (range) params.range = range
    return apiClient.get<SheetRow[]>(`/sheets/sheet-data/${sheetId}/${encodeURIComponent(sheetName)}`, { params })
  },
}
