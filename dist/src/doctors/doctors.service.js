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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var DoctorsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorsService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const crypto = require("crypto");
const prisma_service_1 = require("../prisma/prisma.service");
const notification_gateway_1 = require("../notifications/notification.gateway");
const client_1 = require("@prisma/client");
let DoctorsService = DoctorsService_1 = class DoctorsService {
    constructor(prisma, gateway, aiQueue) {
        this.prisma = prisma;
        this.gateway = gateway;
        this.aiQueue = aiQueue;
        this.logger = new common_1.Logger(DoctorsService_1.name);
    }
    async getDoctorsList() {
        return this.prisma.user.findMany({
            where: {
                role: {
                    in: [
                        client_1.UserRole.DOCTOR,
                        client_1.UserRole.RADIOLOGIST,
                        client_1.UserRole.CARDIOLOGIST,
                        client_1.UserRole.ONCOLOGIST,
                        client_1.UserRole.NEUROLOGIST,
                        client_1.UserRole.SUPER_ADMIN,
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
    async getDoctorWorklist(params) {
        const statusFilter = params.status === 'COMPLETED'
            ? [client_1.ExaminationStatus.COMPLETED, client_1.ExaminationStatus.REJECTED]
            : [client_1.ExaminationStatus.DOCTOR_REVIEW, client_1.ExaminationStatus.ANALYZED, client_1.ExaminationStatus.QUEUED, client_1.ExaminationStatus.PROCESSING];
        const where = {
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
    async submitReview(dto, doctorId) {
        const exam = await this.prisma.examination.findUnique({
            where: { id: dto.examinationId },
            include: { patient: true, nurse: true },
        });
        if (!exam) {
            throw new common_1.NotFoundException(`Tekshiruv topilmadi (ID: ${dto.examinationId})`);
        }
        const doctor = await this.prisma.user.findUnique({
            where: { id: doctorId },
        });
        if (!doctor) {
            throw new common_1.NotFoundException(`Shifokor topilmadi (ID: ${doctorId})`);
        }
        const signaturePayload = `${doctorId}-${exam.id}-${dto.decision}-${Date.now()}`;
        const digitalSignature = dto.digitalSignature ||
            doctor.digitalSignature ||
            `ED25519-SIG-${crypto.createHash('sha256').update(signaturePayload).digest('hex').substring(0, 32).toUpperCase()}`;
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
        let nextStatus = client_1.ExaminationStatus.COMPLETED;
        if (dto.decision === client_1.DoctorDecision.REJECTED) {
            nextStatus = client_1.ExaminationStatus.REJECTED;
        }
        else if (dto.decision === client_1.DoctorDecision.REANALYSIS_REQUESTED) {
            nextStatus = client_1.ExaminationStatus.QUEUED;
        }
        await this.prisma.examination.update({
            where: { id: dto.examinationId },
            data: { status: nextStatus },
        });
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
                    type: client_1.NotificationType.DOCTOR_REVIEWED,
                    data: { examinationId: exam.id, reviewId: review.id },
                },
            });
        }
        return review;
    }
    async requestReanalysis(dto, doctorId) {
        const exam = await this.prisma.examination.findUnique({
            where: { id: dto.examinationId },
            include: { uploads: true },
        });
        if (!exam || exam.uploads.length === 0) {
            throw new common_1.BadRequestException('Qayta tahlil qilish uchun yuklangan fayl topilmadi');
        }
        const primaryUpload = exam.uploads[0];
        await this.aiQueue.add('reanalyze-case', {
            examinationId: exam.id,
            uploadId: primaryUpload.id,
            fileType: primaryUpload.fileType,
            minioKey: primaryUpload.minioKey,
            patientId: exam.patientId,
        }, { priority: 1 });
        await this.prisma.examination.update({
            where: { id: dto.examinationId },
            data: { status: client_1.ExaminationStatus.QUEUED },
        });
        return { message: 'Qayta SI tahlili navbatga qo‘yildi', examinationId: dto.examinationId };
    }
};
exports.DoctorsService = DoctorsService;
exports.DoctorsService = DoctorsService = DoctorsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, bullmq_1.InjectQueue)('medical-ai-queue')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notification_gateway_1.NotificationGateway,
        bullmq_2.Queue])
], DoctorsService);
//# sourceMappingURL=doctors.service.js.map