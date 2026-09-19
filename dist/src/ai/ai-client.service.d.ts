import { ConfigService } from '@nestjs/config';
import { FileType, RiskLevel } from '@prisma/client';
export interface AiInferenceResponse {
    confidence: number;
    riskLevel: RiskLevel;
    findings: Array<{
        name: string;
        confidence: number;
        region?: string;
        urgency?: string;
    }>;
    overlayImageUrl?: string;
    highlightedRegions?: any;
    technicalSummary: string;
    patientExplanationUzbek: string;
    modelVersion: string;
    latencyMs: number;
}
export declare class AiClientService {
    private configService;
    private readonly logger;
    private baseUrl;
    private timeoutMs;
    constructor(configService: ConfigService);
    analyzeDiagnostic(params: {
        fileType: FileType;
        fileUrl: string;
        patientContext?: string;
        metadata?: any;
    }): Promise<AiInferenceResponse>;
    voiceTriage(transcript: string, patientInfo?: string): Promise<any>;
    private executeFallbackInference;
}
