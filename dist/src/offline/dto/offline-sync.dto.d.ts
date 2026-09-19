import { CreatePatientDto } from '../../patients/dto/create-patient.dto';
export declare class OfflineExaminationItemDto {
    clientSyncId: string;
    patientPinfl: string;
    clinicId?: string;
    nurseNotes?: string;
    createdAt: string;
}
export declare class OfflineSyncBatchDto {
    patients: CreatePatientDto[];
    examinations: OfflineExaminationItemDto[];
}
