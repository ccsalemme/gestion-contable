import { Permission, UserPermission } from '@/types';
export declare const permissionsApi: {
    getAll: () => Promise<import("axios").AxiosResponse<Permission[], any, {}>>;
    getById: (id: string) => Promise<import("axios").AxiosResponse<Permission, any, {}>>;
    create: (data: Omit<Permission, "id">) => Promise<import("axios").AxiosResponse<Permission, any, {}>>;
    update: (id: string, data: Partial<Permission>) => Promise<import("axios").AxiosResponse<Permission, any, {}>>;
    delete: (id: string) => Promise<import("axios").AxiosResponse<unknown, any, {}>>;
    assignToUser: (userId: string, permissionId: string) => Promise<import("axios").AxiosResponse<UserPermission, any, {}>>;
    revokeFromUser: (userId: string, permissionId: string) => Promise<import("axios").AxiosResponse<unknown, any, {}>>;
};
//# sourceMappingURL=permissions.d.ts.map