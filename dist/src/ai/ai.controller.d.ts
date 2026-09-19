import { Response } from 'express';
import { AiClientService } from './ai-client.service';
import { VoiceTriageDto } from './dto/ai-analysis.dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class AiController {
    private readonly aiClient;
    private readonly prisma;
    constructor(aiClient: AiClientService, prisma: PrismaService);
    voiceTriage(dto: VoiceTriageDto): Promise<any>;
    getAiResults(examinationId: string): Promise<({
        upload: {
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
        };
    } & {
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
    })[]>;
    streamTextToSpeech(text: string, voice: string, rate: string, res: Response): Promise<void>;
}
