import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { AiClientService } from './ai-client.service';
import { MinioStorageService } from '../storage/storage.service';
import { NotificationGateway } from '../notifications/notification.gateway';
import { FileType } from '@prisma/client';
export interface AiJobData {
    examinationId: string;
    uploadId: string;
    fileType: FileType;
    minioKey: string;
    patientId: string;
}
export declare class AiQueueProcessor extends WorkerHost {
    private prisma;
    private aiClient;
    private storage;
    private gateway;
    private readonly logger;
    constructor(prisma: PrismaService, aiClient: AiClientService, storage: MinioStorageService, gateway: NotificationGateway);
    process(job: Job<AiJobData>): Promise<any>;
}
