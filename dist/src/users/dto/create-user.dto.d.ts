import { UserRole } from '@prisma/client';
export declare class CreateUserDto {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    role: UserRole;
    specialty?: string;
    licenseNumber?: string;
}
export declare class UpdateUserDto {
    fullName?: string;
    phone?: string;
    role?: UserRole;
    specialty?: string;
    licenseNumber?: string;
    digitalSignature?: string;
    isActive?: boolean;
}
