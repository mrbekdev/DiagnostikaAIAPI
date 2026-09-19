"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AiQueueProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiQueueProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ai_client_service_1 = require("./ai-client.service");
const storage_service_1 = require("../storage/storage.service");
const notification_gateway_1 = require("../notifications/notification.gateway");
const client_1 = require("@prisma/client");
let AiQueueProcessor = AiQueueProcessor_1 = class AiQueueProcessor extends bullmq_1.WorkerHost {
    constructor(prisma, aiClient, storage, gateway) {
        super();
        this.prisma = prisma;
        this.aiClient = aiClient;
        this.storage = storage;
        this.gateway = gateway;
        this.logger = new common_1.Logger(AiQueueProcessor_1.name);
    }
    async process(job) {
        const { examinationId, uploadId, fileType, minioKey, patientId } = job.data;
        this.logger.log(`Processing AI diagnostic job ${job.id} for Examination ${examinationId} (${fileType})`);
        try {
            await this.prisma.examination.update({
                where: { id: examinationId },
                data: { status: client_1.ExaminationStatus.PROCESSING },
            });
            this.gateway.emitAiAnalysisStarted(examinationId, {
                jobId: job.id,
                uploadId,
                fileType,
            });
            const patient = await this.prisma.patient.findUnique({
                where: { id: patientId },
            });
            const presignedUrl = await this.storage.getPresignedUrl(minioKey, 3600);
            const aiResult = await this.aiClient.analyzeDiagnostic({
                fileType,
                fileUrl: presignedUrl,
                patientContext: patient ? `Bemor: ${patient.fullName}, ${patient.age} yosh, Shikoyatlar: ${patient.complaints || 'Mavjud emas'}` : '',
            });
            const priorityMap = {
                [client_1.RiskLevel.LOW]: 1,
                [client_1.RiskLevel.MEDIUM]: 2,
                [client_1.RiskLevel.HIGH]: 3,
                [client_1.RiskLevel.CRITICAL]: 4,
            };
            const createdAiResult = await this.prisma.aiResult.create({
                data: {
                    examinationId,
                    uploadId,
                    confidence: aiResult.confidence,
                    riskLevel: aiResult.riskLevel,
                    findings: aiResult.findings,
                    overlayImageUrl: aiResult.overlayImageUrl,
                    highlightedRegions: aiResult.highlightedRegions,
                    technicalSummary: aiResult.technicalSummary,
                    patientExplanationUzbek: aiResult.patientExplanationUzbek,
                    modelVersion: aiResult.modelVersion,
                    latencyMs: aiResult.latencyMs,
                },
            });
            const updatedExam = await this.prisma.examination.update({
                where: { id: examinationId },
                data: {
                    status: client_1.ExaminationStatus.DOCTOR_REVIEW,
                    riskLevel: aiResult.riskLevel,
                    priority: priorityMap[aiResult.riskLevel] || 2,
                },
                include: {
                    patient: true,
                    nurse: { select: { id: true, fullName: true } },
                    uploads: true,
                },
            });
            await this.prisma.auditLog.create({
                data: {
                    action: 'AI_DIAGNOSTIC_COMPLETED',
                    resource: 'AiResult',
                    resourceId: createdAiResult.id,
                    details: {
                        examinationId,
                        fileType,
                        riskLevel: aiResult.riskLevel,
                        confidence: aiResult.confidence,
                    },
                },
            });
            this.gateway.emitAiAnalysisFinished(examinationId, {
                aiResult: createdAiResult,
                examination: updatedExam,
            });
            if (aiResult.riskLevel === client_1.RiskLevel.CRITICAL || aiResult.riskLevel === client_1.RiskLevel.HIGH) {
                const doctors = await this.prisma.user.findMany({
                    where: {
                        role: {
                            in: ['DOCTOR', 'RADIOLOGIST', 'CARDIOLOGIST', 'SUPER_ADMIN'],
                        },
                        isActive: true,
                    },
                    select: { id: true },
                });
                for (const doc of doctors) {
                    await this.prisma.notification.create({
                        data: {
                            userId: doc.id,
                            title: `⚠️ Shoshilinch tibbiy holat: ${aiResult.riskLevel}`,
                            message: `${patient?.fullName || 'Bemor'} bo‘yicha SI xulosasi: ${aiResult.findings[0]?.name || 'Xavf aniqlandi'}. Zudlik bilan tekshirish talab etiladi.`,
                            type: client_1.NotificationType.EMERGENCY_CASE,
                            data: { examinationId, riskLevel: aiResult.riskLevel },
                        },
                    });
                }
            }
            this.logger.log(`AI job ${job.id} completed successfully for Examination ${examinationId}`);
            return createdAiResult;
        }
        catch (error) {
            this.logger.error(`AI job ${job.id} failed for Examination ${examinationId}:`, error);
            await this.prisma.examination.update({
                where: { id: examinationId },
                data: { status: client_1.ExaminationStatus.QUEUED },
            });
            throw error;
        }
    }
};
exports.AiQueueProcessor = AiQueueProcessor;
exports.AiQueueProcessor = AiQueueProcessor = AiQueueProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('medical-ai-queue'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_client_service_1.AiClientService,
        storage_service_1.MinioStorageService,
        notification_gateway_1.NotificationGateway])
], AiQueueProcessor);
//# sourceMappingURL=ai-queue.processor.js.map