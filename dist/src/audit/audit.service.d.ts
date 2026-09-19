import { PrismaService } from '../prisma/prisma.service';
export declare class AuditService {
    private prisma;
    constructor(prisma: PrismaService);
    getLogs(params: {
        userId?: string;
        action?: string;
        resource?: string;
        skip?: number;
        take?: number;
    }): Promise<{
        total: number;
        skip: number;
        take: number;
        data: ({
            user: {
                id: string;
                email: string;
                fullName: string;
                role: import(".prisma/client").$Enums.UserRole;
            };
        } & {
            id: string;
            action: string;
            resource: string;
            resourceId: string | null;
            ipAddress: string | null;
            userAgent: string | null;
            details: import("@prisma/client/runtime/library").JsonValue | null;
            timestamp: Date;
            userId: string | null;
        })[];
    }>;
}
