import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { ReviewCaseDto, RequestReanalysisDto } from './dto/review-case.dto';
import { NotificationGateway } from '../notifications/notification.gateway';
import { RiskLevel } from '@prisma/client';
export declare class DoctorsService {
    private prisma;
    private gateway;
    private aiQueue;
    private readonly logger;
    constructor(prisma: PrismaService, gateway: NotificationGateway, aiQueue: Queue);
    getDoctorsList(): Promise<{
        id: string;
        email: string;
        fullName: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        specialty: string;
        licenseNumber: string;
    }[]>;
    getDoctorWorklist(params: {
        specialty?: string;
        riskLevel?: RiskLevel;
        status?: string;
    }): Promise<({
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
    })[]>;
    submitReview(dto: ReviewCaseDto, doctorId: string): Promise<{
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
    }>;
    requestReanalysis(dto: RequestReanalysisDto, doctorId: string): Promise<{
        message: string;
        examinationId: string;
    }>;
}
