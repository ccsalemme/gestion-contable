declare class ApiClient {
    private client;
    constructor();
    get<T>(url: string): Promise<import("axios").AxiosResponse<T, any, {}>>;
    post<T>(url: string, data?: any): Promise<import("axios").AxiosResponse<T, any, {}>>;
    put<T>(url: string, data?: any): Promise<import("axios").AxiosResponse<T, any, {}>>;
    delete<T>(url: string): Promise<import("axios").AxiosResponse<T, any, {}>>;
}
export declare const apiClient: ApiClient;
export {};
//# sourceMappingURL=client.d.ts.map