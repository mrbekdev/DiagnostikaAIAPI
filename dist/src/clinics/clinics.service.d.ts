import { PrismaService } from '../prisma/prisma.service';
import { CreateClinicDto, UpdateLocationDto } from './dto/create-clinic.dto';
export declare class ClinicsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
        assignedNurse: {
            id: string;
            email: string;
            fullName: string;
            phone: string;
        };
        _count: {
            examinations: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        plateNumber: string;
        region: string;
        district: string;
        currentLat: number;
        currentLng: number;
        isOnline: boolean;
        lastPing: Date | null;
        assignedNurseId: string | null;
    })[]>;
    findLive(): Promise<{
        id: string;
        name: string;
        plateNumber: string;
        region: string;
        district: string;
        currentLat: number;
        currentLng: number;
        isOnline: boolean;
        lastPing: Date;
        assignedNurse: {
            id: string;
            fullName: string;
            phone: string;
        };
        _count: {
            examinations: number;
        };
    }[]>;
    findOne(id: string): Promise<{
        assignedNurse: {
            id: string;
            email: string;
            fullName: string;
            phone: string;
        };
        examinations: ({
            patient: {
                id: string;
                fullName: string;
                phone: string | null;
                createdAt: Date;
                updatedAt: Date;
                region: string;
                district: string;
                pinfl: string;
                passport: string;
                birthDate: Date;
                age: number;
                gender: import(".prisma/client").$Enums.Gender;
                village: string;
                latitude: number | null;
                longitude: number | null;
                complaints: string | null;
                createdById: string;
            };
            aiResults: {
                id: string;
                riskLevel: import(".prisma/client").$Enums.RiskLevel;
                examinationId: string;
                confidence: number;
                findings: import("@prisma/client/runtime/library").JsonValue;
                overlayImageUrl: string | null;
                highlightedRegions: import("@prisma/client/runtime/library").JsonValue | null;
                technicalSummary: string;
                patientExplanationUzbek: string;
                modelVersion: string;
                latencyMs: number;
                generatedAt: Date;
                uploadId: string | null;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.ExaminationStatus;
            priority: number;
            riskLevel: import(".prisma/client").$Enums.RiskLevel | null;
            nurseNotes: string | null;
            syncId: string | null;
            patientId: string;
            clinicId: string | null;
            nurseId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        plateNumber: string;
        region: string;
        district: string;
        currentLat: number;
        currentLng: number;
        isOnline: boolean;
        lastPing: Date | null;
        assignedNurseId: string | null;
    }>;
    create(dto: CreateClinicDto): Promise<{
        assignedNurse: {
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
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        plateNumber: string;
        region: string;
        district: string;
        currentLat: number;
        currentLng: number;
        isOnline: boolean;
        lastPing: Date | null;
        assignedNurseId: string | null;
    }>;
    updateLocation(id: string, dto: UpdateLocationDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        plateNumber: string;
        region: string;
        district: string;
        currentLat: number;
        currentLng: number;
        isOnline: boolean;
        lastPing: Date | null;
        assignedNurseId: string | null;
    }>;
}
