import { PrismaService } from '../prisma/prisma.service';
import { MinioStorageService } from '../storage/storage.service';
export declare class ReportsService {
    private prisma;
    private storage;
    constructor(prisma: PrismaService, storage: MinioStorageService);
    generateClinicalReport(examinationId: string): Promise<{
        reportId: string;
        issuedDate: string;
        platform: string;
        patient: {
            fullName: string;
            pinfl: string;
            passport: string;
            age: number;
            gender: import(".prisma/client").$Enums.Gender;
            region: string;
            district: string;
            village: string;
            complaints: string;
        };
        mobileClinic: {
            name: string;
            plateNumber: string;
            region: string;
            nurse: string;
        };
        preliminaryAiAssessment: {
            riskLevel: import(".prisma/client").$Enums.RiskLevel;
            confidencePercent: number;
            modelVersion: string;
            findings: import("@prisma/client/runtime/library").JsonValue;
            technicalSummary: string;
            patientExplanationUzbek: string;
            disclaimer: string;
        };
        doctorConfirmation: {
            doctorName: string;
            specialty: string;
            licenseNumber: string;
            decision: import(".prisma/client").$Enums.DoctorDecision;
            finalDiagnosis: string;
            recommendations: string;
            digitalSignature: string;
            approvedAt: Date;
            status?: undefined;
            message?: undefined;
        } | {
            status: string;
            message: string;
            doctorName?: undefined;
            specialty?: undefined;
            licenseNumber?: undefined;
            decision?: undefined;
            finalDiagnosis?: undefined;
            recommendations?: undefined;
            digitalSignature?: undefined;
            approvedAt?: undefined;
        };
        diagnosticFiles: {
            id: string;
            fileType: import(".prisma/client").$Enums.FileType;
            originalName: string;
            uploadedAt: Date;
        }[];
    }>;
}
