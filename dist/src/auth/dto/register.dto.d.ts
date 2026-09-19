import { UserRole } from '@prisma/client';
export declare class RegisterDto {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    role: UserRole;
    specialty?: string;
    licenseNumber?: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
