export declare const sheetsApi: {
    sync: (tenantId: string) => Promise<import("axios").AxiosResponse<unknown, any, {}>>;
    getSheetData: (tenantId: string, sheetId: string, range?: string) => Promise<import("axios").AxiosResponse<unknown, any, {}>>;
    updateSheetData: (tenantId: string, sheetId: string, data: any) => Promise<import("axios").AxiosResponse<unknown, any, {}>>;
};
//# sourceMappingURL=sheets.d.ts.map