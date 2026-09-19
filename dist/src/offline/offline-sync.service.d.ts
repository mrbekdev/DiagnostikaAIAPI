import { PrismaService } from '../prisma/prisma.service';
import { OfflineSyncBatchDto } from './dto/offline-sync.dto';
export declare class OfflineSyncService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    processSyncBatch(dto: OfflineSyncBatchDto, nurseId: string): Promise<{
        success: boolean;
        syncedAt: string;
        patientsSynced: number;
        examinationsSynced: number;
        syncedPatients: any[];
        syncedExaminations: any[];
        errors: any[];
    }>;
}
