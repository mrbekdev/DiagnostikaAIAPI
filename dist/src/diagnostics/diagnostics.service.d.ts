import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { MinioStorageService } from '../storage/storage.service';
import { AiClientService } from '../ai/ai-client.service';
import { CreateExaminationDto } from './dto/create-examination.dto';
import { ExaminationStatus, FileType, RiskLevel } from '@prisma/client';
export declare class DiagnosticsService {
    private prisma;
    private storage;
    private aiClient;
    private aiQueue;
    private readonly logger;
    constructor(prisma: PrismaService, storage: MinioStorageService, aiClient: AiClientService, aiQueue: Queue);
    createExamination(dto: CreateExaminationDto, nurseId: string): Promise<{
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
    }>;
    uploadDiagnosticFile(examinationId: string, file: Express.Multer.File, fileType: FileType, metadataJson?: string): Promise<{
        uploadId: string;
        examinationId: string;
        fileType: import(".prisma/client").$Enums.FileType;
        fileName: string;
        fileSize: number;
        checksum: string;
        viewUrl: string;
        status: string;
    }>;
    getExaminationDetails(id: string): Promise<{
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
                licenseNumber: string;
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
        telemedSessions: {
            id: string;
            nurseId: string;
            examinationId: string;
            notes: string | null;
            doctorId: string;
            roomName: string;
            startedAt: Date;
            endedAt: Date | null;
            durationSec: number | null;
            recordingKey: string | null;
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
    }>;
    sendToDoctor(examinationId: string, dto: {
        doctorId: string;
        notes?: string;
        priority?: number;
    }): Promise<{
        doctorReviews: ({
            doctor: {
                id: string;
                fullName: string;
                specialty: string;
                licenseNumber: string;
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
        uploads: {
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
    }>;
    listExaminations(params: {
        status?: ExaminationStatus;
        riskLevel?: RiskLevel;
        patientId?: string;
        nurseId?: string;
        skip?: number;
        take?: number;
    }): Promise<{
        total: number;
        skip: number;
        take: number;
        data: ({
            doctorReviews: ({
                doctor: {
                    id: string;
                    fullName: string;
                    specialty: string;
                    licenseNumber: string;
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
            uploads: {
                id: string;
                fileType: import(".prisma/client").$Enums.FileType;
                originalName: string;
            }[];
            aiResults: {
                id: string;
                riskLevel: import(".prisma/client").$Enums.RiskLevel;
                confidence: number;
                findings: import("@prisma/client/runtime/library").JsonValue;
                technicalSummary: string;
                patientExplanationUzbek: string;
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
    }>;
    getFileBuffer(key: string): Promise<Buffer<ArrayBufferLike>>;
}
