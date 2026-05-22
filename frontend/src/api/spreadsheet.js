import { apiClient } from './client';
export const spreadsheetApi = {
    getData: (tenantId) => apiClient.get(`/spreadsheet/${tenantId}`),
    sync: (tenantId) => apiClient.post(`/spreadsheet/${tenantId}/sync`),
    updateCell: (tenantId, data) => apiClient.put(`/spreadsheet/${tenantId}/cell`, data),
};
//# sourceMappingURL=spreadsheet.js.map