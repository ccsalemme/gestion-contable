import { AxiosRequestConfig } from 'axios';
declare class ApiClient {
    private client;
    constructor();
    get<T>(url: string, config?: AxiosRequestConfig): Promise<import("axios").AxiosResponse<T, any, {}>>;
    post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<import("axios").AxiosResponse<T, any, {}>>;
    put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<import("axios").AxiosResponse<T, any, {}>>;
    delete<T>(url: string, config?: AxiosRequestConfig): Promise<import("axios").AxiosResponse<T, any, {}>>;
}
export declare const apiClient: ApiClient;
export {};
//# sourceMappingURL=client.d.ts.map