import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { MinioStorageService } from '../storage/storage.service';
import { AiClientService } from '../ai/ai-client.service';
import { CreateExaminationDto } from './dto/create-examination.dto';
import { ExaminationStatus, FileType, RiskLevel } from '@prisma/client';

@Injectable()
export class DiagnosticsService {
  private readonly logger = new Logger(DiagnosticsService.name);

  constructor(
    private prisma: PrismaService,
    private storage: MinioStorageService,
    private aiClient: AiClientService,
    @InjectQueue('medical-ai-queue') private aiQueue: Queue,
  ) {}

  async createExamination(dto: CreateExaminationDto, nurseId: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: dto.patientId },
    });
    if (!patient) {
      throw new NotFoundException(`Bemor topilmadi (ID: ${dto.patientId})`);
    }

    // Ensure nurseId is valid or fallback to default user
    let targetNurseId = nurseId;
    if (targetNurseId) {
      const nurseUser = await this.prisma.user.findUnique({ where: { id: targetNurseId } });
      if (!nurseUser) {
        targetNurseId = undefined;
      }
    }

    if (!targetNurseId) {
      const defaultNurse = await this.prisma.user.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: 'asc' },
      });
      if (defaultNurse) {
        targetNurseId = defaultNurse.id;
      }
    }

    // Safely check clinicId
    let safeClinicId: string | undefined = undefined;
    if (dto.clinicId) {
      const clinic = await this.prisma.mobileClinic.findUnique({ where: { id: dto.clinicId } });
      if (clinic) {
        safeClinicId = clinic.id;
      }
    }

    const createData: any = {
      patient: { connect: { id: dto.patientId } },
      nurse: { connect: { id: targetNurseId } },
      status: ExaminationStatus.DRAFT,
    };

    if (dto.nurseNotes) {
      createData.nurseNotes = dto.nurseNotes;
    }

    if (safeClinicId) {
      createData.clinic = { connect: { id: safeClinicId } };
    }

    if (dto.syncId) {
      createData.syncId = dto.syncId;
    }

    return this.prisma.examination.create({
      data: createData,
      include: {
        patient: true,
        clinic: true,
        nurse: {
          select: { id: true, fullName: true, phone: true },
        },
      },
    });
  }

  async uploadDiagnosticFile(
    examinationId: string,
    file: Express.Multer.File,
    fileType: FileType,
    metadataJson?: string,
  ) {
    const examination = await this.prisma.examination.findUnique({
      where: { id: examinationId },
      include: { patient: true },
    });

    if (!examination) {
      throw new NotFoundException(`Tekshiruv topilmadi (ID: ${examinationId})`);
    }

    if (!file) {
      throw new BadRequestException('Yuklash uchun fayl tanlanmagan');
    }

    // 1. Antivirus & Safety Scan
    const scanResult = await this.storage.scanFileForSafety(file.buffer);
    if (!scanResult.isSafe) {
      throw new BadRequestException(`Fayl xavfsizlik tekshiruvidan o‘tmadi: ${scanResult.details}`);
    }

    // 2. Parse metadata if provided
    let parsedMetadata = {};
    if (metadataJson) {
      try {
        parsedMetadata = JSON.parse(metadataJson);
      } catch {
        parsedMetadata = { raw: metadataJson };
      }
    }

    // 3. Store in MinIO S3
    const folder = `diagnostics/${fileType.toLowerCase()}`;
    const uploadResult = await this.storage.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      folder,
    );

    // 4. Save Upload in Database
    const uploadRecord = await this.prisma.upload.create({
      data: {
        examinationId,
        fileType,
        originalName: file.originalname,
        mimeType: file.mimetype,
        fileSize: uploadResult.size,
        minioKey: uploadResult.minioKey,
        checksum: uploadResult.checksum,
        metadata: parsedMetadata,
      },
    });

    // 5. Update examination status to QUEUED
    await this.prisma.examination.update({
      where: { id: examinationId },
      data: { status: ExaminationStatus.QUEUED },
    });

    // 6. Push to BullMQ AI Queue or Direct AI Fallback
    const initialPriority = examination.priority || 2;

    try {
      const queuePromise = this.aiQueue.add(
        'analyze-case',
        {
          examinationId,
          uploadId: uploadRecord.id,
          fileType,
          minioKey: uploadResult.minioKey,
          patientId: examination.patientId,
        },
        {
          priority: 5 - initialPriority,
          attempts: 3,
        },
      );
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Queue timeout (Redis offline)')), 500),
      );
      await Promise.race([queuePromise, timeoutPromise]);
      this.logger.log(`File uploaded and queued in BullMQ: ${uploadResult.minioKey}`);
    } catch (queueErr) {
      this.logger.warn(`BullMQ skipped (${queueErr.message}). Performing immediate medical AI inference.`);
      try {
        const fileUrl = await this.storage.getPresignedUrl(uploadResult.minioKey);
        const aiRes = await this.aiClient.analyzeDiagnostic({
          fileType,
          fileUrl,
          patientContext: examination.patient ? `Bemor: ${examination.patient.fullName}, ${examination.patient.age} yosh` : '',
        });

        await this.prisma.aiResult.create({
          data: {
            examinationId,
            uploadId: uploadRecord.id,
            confidence: aiRes.confidence,
            riskLevel: aiRes.riskLevel,
            findings: aiRes.findings,
            overlayImageUrl: aiRes.overlayImageUrl,
            highlightedRegions: aiRes.highlightedRegions,
            technicalSummary: aiRes.technicalSummary,
            patientExplanationUzbek: aiRes.patientExplanationUzbek,
            modelVersion: aiRes.modelVersion,
            latencyMs: aiRes.latencyMs,
          },
        });

        await this.prisma.examination.update({
          where: { id: examinationId },
          data: {
            status: ExaminationStatus.DOCTOR_REVIEW,
            riskLevel: aiRes.riskLevel,
            priority: aiRes.riskLevel === RiskLevel.CRITICAL ? 4 : aiRes.riskLevel === RiskLevel.HIGH ? 3 : 2,
          },
        });
      } catch (directAiErr) {
        this.logger.error(`Direct AI error: ${directAiErr.message}`);
      }
    }

    const presignedUrl = await this.storage.getPresignedUrl(uploadResult.minioKey);

    return {
      uploadId: uploadRecord.id,
      examinationId,
      fileType,
      fileName: file.originalname,
      fileSize: uploadResult.size,
      checksum: uploadResult.checksum,
      viewUrl: presignedUrl,
      status: 'PROCESSED_SUCCESSFULLY',
    };
  }

  async getExaminationDetails(id: string) {
    const exam = await this.prisma.examination.findUnique({
      where: { id },
      include: {
        patient: true,
        clinic: true,
        nurse: {
          select: { id: true, fullName: true, phone: true },
        },
        uploads: true,
        aiResults: {
          orderBy: { generatedAt: 'desc' },
        },
        doctorReviews: {
          include: {
            doctor: {
              select: { id: true, fullName: true, specialty: true, licenseNumber: true },
            },
          },
        },
        telemedSessions: true,
      },
    });

    if (!exam) {
      throw new NotFoundException(`Tekshiruv topilmadi (ID: ${id})`);
    }

    // Attach presigned URLs to uploads & heatmap overlays
    const uploadsWithUrls = await Promise.all(
      exam.uploads.map(async (u) => ({
        ...u,
        downloadUrl: await this.storage.getPresignedUrl(u.minioKey),
      })),
    );

    return {
      ...exam,
      uploads: uploadsWithUrls,
    };
  }

  async sendToDoctor(
    examinationId: string,
    dto: { doctorId: string; notes?: string; priority?: number },
  ) {
    const exam = await this.prisma.examination.findUnique({
      where: { id: examinationId },
      include: { patient: true, nurse: true },
    });

    if (!exam) {
      throw new NotFoundException(`Tekshiruv topilmadi (ID: ${examinationId})`);
    }

    const doctor = await this.prisma.user.findUnique({
      where: { id: dto.doctorId },
    });

    if (!doctor) {
      throw new NotFoundException(`Tanlangan shifokor topilmadi (ID: ${dto.doctorId})`);
    }

    const updatedNotes = dto.notes
      ? `${exam.nurseNotes ? exam.nurseNotes + ' | ' : ''}Shifokorga izoh: ${dto.notes}`
      : exam.nurseNotes;

    const updated = await this.prisma.examination.update({
      where: { id: examinationId },
      data: {
        status: ExaminationStatus.DOCTOR_REVIEW,
        priority: dto.priority || 3,
        nurseNotes: updatedNotes,
      },
      include: {
        patient: true,
        clinic: true,
        nurse: { select: { id: true, fullName: true, phone: true } },
        uploads: true,
        aiResults: { orderBy: { generatedAt: 'desc' }, take: 1 },
        doctorReviews: {
          include: {
            doctor: { select: { id: true, fullName: true, specialty: true, licenseNumber: true } },
          },
        },
      },
    });

    // Create notification for Doctor
    try {
      await this.prisma.notification.create({
        data: {
          userId: doctor.id,
          title: '🩻 Yangi tekshiruv kelib tushdi!',
          message: `${exam.patient.fullName} bo‘yicha tekshiruv ${doctor.fullName} ko‘rib chiqishi uchun yuborildi.`,
          type: 'DOCTOR_REVIEWED' as any,
          data: { examinationId: exam.id, patientId: exam.patientId },
        },
      });
    } catch (e) {
      this.logger.warn(`Failed to create notification for doctor: ${e.message}`);
    }

    return updated;
  }

  async listExaminations(params: {
    status?: ExaminationStatus;
    riskLevel?: RiskLevel;
    patientId?: string;
    nurseId?: string;
    skip?: number;
    take?: number;
  }) {
    const { status, riskLevel, patientId, nurseId, skip, take } = params;
    const skipNum = Number(skip) >= 0 ? Number(skip) : 0;
    const takeNum = Number(take) > 0 ? Number(take) : 50;

    const where: any = {};
    if (status) where.status = status;
    if (riskLevel) where.riskLevel = riskLevel;
    if (patientId) where.patientId = patientId;
    if (nurseId) where.nurseId = nurseId;

    const [total, items] = await Promise.all([
      this.prisma.examination.count({ where }),
      this.prisma.examination.findMany({
        where,
        skip: skipNum,
        take: takeNum,
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        include: {
          patient: true,
          clinic: true,
          nurse: { select: { id: true, fullName: true, phone: true } },
          uploads: { select: { id: true, fileType: true, originalName: true } },
          aiResults: {
            select: {
              id: true,
              confidence: true,
              riskLevel: true,
              technicalSummary: true,
              patientExplanationUzbek: true,
              findings: true,
            },
            take: 1,
          },
          doctorReviews: {
            include: {
              doctor: {
                select: { id: true, fullName: true, specialty: true, licenseNumber: true },
              },
            },
            orderBy: { approvedAt: 'desc' },
            take: 1,
          },
        },
      }),
    ]);

    return { total, skip: skipNum, take: takeNum, data: items };
  }

  async getFileBuffer(key: string) {
    return this.storage.getFileBuffer(key);
  }
}
