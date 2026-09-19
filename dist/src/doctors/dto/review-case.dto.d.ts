import { DoctorDecision } from '@prisma/client';
export declare class ReviewCaseDto {
    examinationId: string;
    decision: DoctorDecision;
    finalDiagnosis: string;
    recommendations?: string;
    notes?: string;
    digitalSignature?: string;
}
export declare class RequestReanalysisDto {
    examinationId: string;
    reason: string;
}
