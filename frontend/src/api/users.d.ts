import { User, UserRole } from '@/types';
export interface CreateUserDto {
    email: string;
    password: string;
    role: UserRole;
}
export interface UpdateUserDto {
    email?: string;
    role?: UserRole;
    active?: boolean;
}
export declare const usersApi: {
    getAll: () => Promise<import("axios").AxiosResponse<User[], any, {}>>;
    getById: (id: string) => Promise<import("axios").AxiosResponse<User, any, {}>>;
    create: (data: CreateUserDto) => Promise<import("axios").AxiosResponse<User, any, {}>>;
    update: (id: string, data: UpdateUserDto) => Promise<import("axios").AxiosResponse<User, any, {}>>;
    delete: (id: string) => Promise<import("axios").AxiosResponse<unknown, any, {}>>;
    getMe: () => Promise<import("axios").AxiosResponse<User, any, {}>>;
};
//# sourceMappingURL=users.d.ts.map