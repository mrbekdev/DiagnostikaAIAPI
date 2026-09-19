import { FileType } from '@prisma/client';
export declare class TriggerAiAnalysisDto {
    examinationId: string;
    uploadId: string;
    fileType: FileType;
    patientContext?: string;
}
export declare class VoiceTriageDto {
    transcriptText: string;
    patientInfo?: string;
}
