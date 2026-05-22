import { LoginDto, RegisterDto, AuthResponse } from '@/types';
export declare const authApi: {
    login: (credentials: LoginDto) => Promise<import("axios").AxiosResponse<AuthResponse, any, {}>>;
    register: (data: RegisterDto) => Promise<import("axios").AxiosResponse<AuthResponse, any, {}>>;
};
//# sourceMappingURL=auth.d.ts.map