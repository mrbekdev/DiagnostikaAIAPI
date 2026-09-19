import { PrismaService } from '../prisma/prisma.service';
import { MinioStorageService } from '../storage/storage.service';
import { CreatePatientDto, UpdatePatientDto } from './dto/create-patient.dto';
export declare class PatientsService {
    private prisma;
    private storage;
    constructor(prisma: PrismaService, storage: MinioStorageService);
    findAll(params: {
        search?: string;
        region?: string;
        district?: string;
        village?: string;
        skip?: number;
        take?: number;
    }): Promise<{
        total: number;
        skip: number;
        take: number;
        data: ({
            examinations: {
                id: string;
                createdAt: Date;
                status: import(".prisma/client").$Enums.ExaminationStatus;
                riskLevel: import(".prisma/client").$Enums.RiskLevel;
            }[];
            createdBy: {
                id: string;
                fullName: string;
                role: import(".prisma/client").$Enums.UserRole;
            };
        } & {
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
        })[];
    }>;
    findOne(id: string): Promise<{
        examinations: {
            uploads: {
                downloadUrl: string;
                id: string;
                createdAt: Date;
                fileType: import(".prisma/client").$Enums.FileType;
                originalName: string;
                mimeType: string;
                fileSize: number;
                minioKey: string;
                previewKey: string | null;
                checksum: string | null;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                examinationId: string;
            }[];
            doctorReviews: ({
                doctor: {
                    id: string;
                    fullName: string;
                    specialty: string;
                };
            } & {
                id: string;
                specialty: string;
                digitalSignature: string;
                examinationId: string;
                decision: import(".prisma/client").$Enums.DoctorDecision;
                finalDiagnosis: string;
                recommendations: string | null;
                notes: string | null;
                approvedAt: Date;
                doctorId: string;
            })[];
            clinic: {
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
            };
            nurse: {
                id: string;
                fullName: string;
                phone: string;
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
        }[];
        createdBy: {
            id: string;
            fullName: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
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
    }>;
    findByPinflOrPassport(query: string): Promise<{
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
    }>;
    create(dto: CreatePatientDto, createdById: string): Promise<{
        createdBy: {
            id: string;
            fullName: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
    } & {
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
    }>;
    update(id: string, dto: UpdatePatientDto): Promise<{
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
    }>;
    remove(id: string): Promise<{
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
    }>;
}
