import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';
import { UserRole } from '@prisma/client';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(role?: UserRole, category?: string): Promise<{
        id: string;
        email: string;
        fullName: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        specialty: string;
        licenseNumber: string;
        isActive: boolean;
        createdAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        email: string;
        fullName: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        specialty: string;
        licenseNumber: string;
        digitalSignature: string;
        isActive: boolean;
        createdAt: Date;
        _count: {
            createdPatients: number;
            conductedExams: number;
            doctorReviews: number;
        };
    }>;
    create(dto: CreateUserDto): Promise<{
        id: string;
        email: string;
        fullName: string;
        role: import(".prisma/client").$Enums.UserRole;
        specialty: string;
        licenseNumber: string;
        isActive: boolean;
        createdAt: Date;
    }>;
    update(id: string, dto: UpdateUserDto): Promise<{
        id: string;
        email: string;
        fullName: string;
        role: import(".prisma/client").$Enums.UserRole;
        specialty: string;
        licenseNumber: string;
        digitalSignature: string;
        isActive: boolean;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        email: string;
        passwordHash: string;
        fullName: string;
        phone: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        specialty: string | null;
        licenseNumber: string | null;
        digitalSignature: string | null;
        refreshTokenHash: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
