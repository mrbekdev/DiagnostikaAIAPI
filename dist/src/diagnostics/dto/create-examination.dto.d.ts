import { FileType } from '@prisma/client';
export declare class CreateExaminationDto {
    patientId: string;
    clinicId?: string;
    nurseNotes?: string;
    syncId?: string;
}
export declare class UploadDiagnosticDto {
    fileType: FileType;
    metadataJson?: string;
}
