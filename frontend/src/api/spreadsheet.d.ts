import { SpreadsheetData } from '@/types';
export declare const spreadsheetApi: {
    getData: (tenantId: string) => Promise<import("axios").AxiosResponse<SpreadsheetData, any, {}>>;
    sync: (tenantId: string) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    updateCell: (tenantId: string, data: any) => Promise<import("axios").AxiosResponse<any, any, {}>>;
};
//# sourceMappingURL=spreadsheet.d.ts.map