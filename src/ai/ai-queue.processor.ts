import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { AiClientService } from './ai-client.service';
import { MinioStorageService } from '../storage/storage.service';
import { NotificationGateway } from '../notifications/notification.gateway';
import { ExaminationStatus, FileType, NotificationType, RiskLevel } from '@prisma/client';

export interface AiJobData {
  examinationId: string;
  uploadId: string;
  fileType: FileType;
  minioKey: string;
  patientId: string;
}

@Processor('medical-ai-queue')
export class AiQueueProcessor extends WorkerHost {
  private readonly logger = new Logger(AiQueueProcessor.name);

  constructor(
    private prisma: PrismaService,
    private aiClient: AiClientService,
    private storage: MinioStorageService,
    private gateway: NotificationGateway,
  ) {
    super();
  }

  async process(job: Job<AiJobData>): Promise<any> {
    const { examinationId, uploadId, fileType, minioKey, patientId } = job.data;
    this.logger.log(`Processing AI diagnostic job ${job.id} for Examination ${examinationId} (${fileType})`);

    try {
      // 1. Mark status as PROCESSING
      await this.prisma.examination.update({
        where: { id: examinationId },
        data: { status: ExaminationStatus.PROCESSING },
      });

      this.gateway.emitAiAnalysisStarted(examinationId, {
        jobId: job.id,
        uploadId,
        fileType,
      });

      // 2. Fetch patient context
      const patient = await this.prisma.patient.findUnique({
        where: { id: patientId },
      });

      const presignedUrl = await this.storage.getPresignedUrl(minioKey, 3600);

      // 3. Invoke AI Inference
      const aiResult = await this.aiClient.analyzeDiagnostic({
        fileType,
        fileUrl: presignedUrl,
        patientContext: patient ? `Bemor: ${patient.fullName}, ${patient.age} yosh, Shikoyatlar: ${patient.complaints || 'Mavjud emas'}` : '',
      });

      // 4. Determine numeric priority from risk level
      const priorityMap: Record<RiskLevel, number> = {
        [RiskLevel.LOW]: 1,
        [RiskLevel.MEDIUM]: 2,
        [RiskLevel.HIGH]: 3,
        [RiskLevel.CRITICAL]: 4,
      };

      // 5. Store AI Result in DB
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

      // 6. Update Examination state
      const updatedExam = await this.prisma.examination.update({
        where: { id: examinationId },
        data: {
          status: ExaminationStatus.DOCTOR_REVIEW,
          riskLevel: aiResult.riskLevel,
          priority: priorityMap[aiResult.riskLevel] || 2,
        },
        include: {
          patient: true,
          nurse: { select: { id: true, fullName: true } },
          uploads: true,
        },
      });

      // 7. Audit log
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

      // 8. Dispatch real-time Socket.IO events to Doctor and Nurse dashboards
      this.gateway.emitAiAnalysisFinished(examinationId, {
        aiResult: createdAiResult,
        examination: updatedExam,
      });

      // 9. Create notification for doctors if urgent
      if (aiResult.riskLevel === RiskLevel.CRITICAL || aiResult.riskLevel === RiskLevel.HIGH) {
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
              type: NotificationType.EMERGENCY_CASE,
              data: { examinationId, riskLevel: aiResult.riskLevel },
            },
          });
        }
      }

      this.logger.log(`AI job ${job.id} completed successfully for Examination ${examinationId}`);
      return createdAiResult;
    } catch (error) {
      this.logger.error(`AI job ${job.id} failed for Examination ${examinationId}:`, error);

      await this.prisma.examination.update({
        where: { id: examinationId },
        data: { status: ExaminationStatus.QUEUED },
      });

      throw error;
    }
  }
}
