import { OfflineSyncService } from './offline-sync.service';
import { OfflineSyncBatchDto } from './dto/offline-sync.dto';
export declare class OfflineSyncController {
    private readonly syncService;
    constructor(syncService: OfflineSyncService);
    syncOfflineBatch(dto: OfflineSyncBatchDto, nurseId: string): Promise<{
        success: boolean;
        syncedAt: string;
        patientsSynced: number;
        examinationsSynced: number;
        syncedPatients: any[];
        syncedExaminations: any[];
        errors: any[];
    }>;
}
