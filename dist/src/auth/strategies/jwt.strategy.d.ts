import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
export interface JwtPayload {
    sub: string;
    email: string;
    role: string;
}
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private configService;
    private prisma;
    constructor(configService: ConfigService, prisma: PrismaService);
    validate(payload: JwtPayload): Promise<{
        id: string;
        email: string;
        fullName: string;
        role: string;
        specialty: string;
        isActive: boolean;
    } | {
        id: string;
        email: string;
        fullName: string;
        role: string;
        isActive: boolean;
        specialty?: undefined;
    }>;
}
export {};
