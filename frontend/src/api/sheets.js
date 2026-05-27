import { apiClient } from './client';
export const sheetsApi = {
    sync: (tenantId) => apiClient.post(`/sheets/sync/${tenantId}`),
    getSheetData: (tenantId, sheetId, range) => apiClient.get(`/sheets/${tenantId}/${sheetId}`, range ? { params: { range } } : undefined),
    updateSheetData: (tenantId, sheetId, data) => apiClient.put(`/sheets/${tenantId}/${sheetId}`, { data }),
};
//# sourceMappingURL=sheets.js.map