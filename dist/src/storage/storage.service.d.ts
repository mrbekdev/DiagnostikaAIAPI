import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class MinioStorageService implements OnModuleInit {
    private configService;
    private readonly logger;
    private minioClient;
    private bucketName;
    private localUploadsDir;
    private isMinioAvailable;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    uploadFile(fileBuffer: Buffer, originalName: string, mimeType: string, folder?: string): Promise<{
        minioKey: string;
        checksum: string;
        size: number;
    }>;
    private saveFileLocally;
    getPresignedUrl(minioKey: string, expirySeconds?: number): Promise<string>;
    getFileBuffer(minioKey: string): Promise<Buffer>;
    scanFileForSafety(fileBuffer: Buffer): Promise<{
        isSafe: boolean;
        details: string;
    }>;
}
