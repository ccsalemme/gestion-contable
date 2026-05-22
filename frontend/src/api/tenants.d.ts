import { Tenant } from '@/types';
export declare const tenantsApi: {
    list: () => Promise<import("axios").AxiosResponse<Tenant[], any, {}>>;
    getById: (id: string) => Promise<import("axios").AxiosResponse<Tenant, any, {}>>;
    create: (data: any) => Promise<import("axios").AxiosResponse<Tenant, any, {}>>;
    update: (id: string, data: any) => Promise<import("axios").AxiosResponse<Tenant, any, {}>>;
    delete: (id: string) => Promise<import("axios").AxiosResponse<void, any, {}>>;
};
//# sourceMappingURL=tenants.d.ts.map