import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { ReviewCaseDto, RequestReanalysisDto } from './dto/review-case.dto';
import { NotificationGateway } from '../notifications/notification.gateway';
import { ExaminationStatus, DoctorDecision, NotificationType, RiskLevel, UserRole } from '@prisma/client';

@Injectable()
export class DoctorsService {
  private readonly logger = new Logger(DoctorsService.name);

  constructor(
    private prisma: PrismaService,
    private gateway: NotificationGateway,
    @InjectQueue('medical-ai-queue') private aiQueue: Queue,
  ) {}

  async getDoctorsList() {
    return this.prisma.user.findMany({
      where: {
        role: {
          in: [
            UserRole.DOCTOR,
            UserRole.RADIOLOGIST,
            UserRole.CARDIOLOGIST,
            UserRole.ONCOLOGIST,
            UserRole.NEUROLOGIST,
            UserRole.SUPER_ADMIN,
          ],
        },
        isActive: true,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        specialty: true,
        licenseNumber: true,
      },
      orderBy: { fullName: 'asc' },
    });
  }

  async getDoctorWorklist(params: { specialty?: string; riskLevel?: RiskLevel; status?: string }) {
    const statusFilter = params.status === 'COMPLETED'
      ? [ExaminationStatus.COMPLETED, ExaminationStatus.REJECTED]
      : [ExaminationStatus.DOCTOR_REVIEW, ExaminationStatus.ANALYZED, ExaminationStatus.QUEUED, ExaminationStatus.PROCESSING];

    const where: any = {
      status: { in: statusFilter },
    };

    if (params.riskLevel) {
      where.riskLevel = params.riskLevel;
    }

    return this.prisma.examination.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      include: {
        patient: true,
        clinic: true,
        nurse: {
          select: { id: true, fullName: true, phone: true },
        },
        uploads: true,
        aiResults: {
          orderBy: { generatedAt: 'desc' },
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
    });
  }

  async submitReview(dto: ReviewCaseDto, doctorId: string) {
    const exam = await this.prisma.examination.findUnique({
      where: { id: dto.examinationId },
      include: { patient: true, nurse: true },
    });

    if (!exam) {
      throw new NotFoundException(`Tekshiruv topilmadi (ID: ${dto.examinationId})`);
    }

    const doctor = await this.prisma.user.findUnique({
      where: { id: doctorId },
    });

    if (!doctor) {
      throw new NotFoundException(`Shifokor topilmadi (ID: ${doctorId})`);
    }

    // Generate or use digital signature hash
    const signaturePayload = `${doctorId}-${exam.id}-${dto.decision}-${Date.now()}`;
    const digitalSignature =
      dto.digitalSignature ||
      doctor.digitalSignature ||
      `ED25519-SIG-${crypto.createHash('sha256').update(signaturePayload).digest('hex').substring(0, 32).toUpperCase()}`;

    // Create DoctorReview record
    const review = await this.prisma.doctorReview.create({
      data: {
        examinationId: dto.examinationId,
        doctorId,
        specialty: doctor.specialty || 'Umumiy amaliyot shifokori',
        decision: dto.decision,
        finalDiagnosis: dto.finalDiagnosis,
        recommendations: dto.recommendations,
        notes: dto.notes,
        digitalSignature,
      },
    });

    // Determine status update
    let nextStatus: ExaminationStatus = ExaminationStatus.COMPLETED;
    if (dto.decision === DoctorDecision.REJECTED) {
      nextStatus = ExaminationStatus.REJECTED;
    } else if (dto.decision === DoctorDecision.REANALYSIS_REQUESTED) {
      nextStatus = ExaminationStatus.QUEUED;
    }

    await this.prisma.examination.update({
      where: { id: dto.examinationId },
      data: { status: nextStatus },
    });

    // Log Audit
    await this.prisma.auditLog.create({
      data: {
        userId: doctorId,
        action: 'DOCTOR_REVIEW_COMPLETED',
        resource: 'DoctorReview',
        resourceId: review.id,
        details: {
          examinationId: dto.examinationId,
          decision: dto.decision,
          signature: digitalSignature,
        },
      },
    });

    // Notify Nurse and broadcast to room
    this.gateway.emitDoctorReviewCompleted(dto.examinationId, {
      review,
      doctor: { fullName: doctor.fullName, specialty: doctor.specialty },
      status: nextStatus,
    });

    if (exam.nurseId) {
      await this.prisma.notification.create({
        data: {
          userId: exam.nurseId,
          title: '👨‍⚕️ Shifokor xulosasi tayyor!',
          message: `${exam.patient.fullName} bo‘yicha ${doctor.fullName} tomonidan xulosa tasdiqlandi: "${dto.finalDiagnosis}".`,
          type: NotificationType.DOCTOR_REVIEWED,
          data: { examinationId: exam.id, reviewId: review.id },
        },
      });
    }

    return review;
  }

  async requestReanalysis(dto: RequestReanalysisDto, doctorId: string) {
    const exam = await this.prisma.examination.findUnique({
      where: { id: dto.examinationId },
      include: { uploads: true },
    });

    if (!exam || exam.uploads.length === 0) {
      throw new BadRequestException('Qayta tahlil qilish uchun yuklangan fayl topilmadi');
    }

    const primaryUpload = exam.uploads[0];

    // Re-queue to BullMQ
    await this.aiQueue.add(
      'reanalyze-case',
      {
        examinationId: exam.id,
        uploadId: primaryUpload.id,
        fileType: primaryUpload.fileType,
        minioKey: primaryUpload.minioKey,
        patientId: exam.patientId,
      },
      { priority: 1 }, // High priority re-run
    );

    await this.prisma.examination.update({
      where: { id: dto.examinationId },
      data: { status: ExaminationStatus.QUEUED },
    });

    return { message: 'Qayta SI tahlili navbatga qo‘yildi', examinationId: dto.examinationId };
  }
}
