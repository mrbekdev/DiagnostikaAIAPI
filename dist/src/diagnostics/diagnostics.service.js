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
var DiagnosticsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiagnosticsService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const prisma_service_1 = require("../prisma/prisma.service");
const storage_service_1 = require("../storage/storage.service");
const ai_client_service_1 = require("../ai/ai-client.service");
const client_1 = require("@prisma/client");
let DiagnosticsService = DiagnosticsService_1 = class DiagnosticsService {
    constructor(prisma, storage, aiClient, aiQueue) {
        this.prisma = prisma;
        this.storage = storage;
        this.aiClient = aiClient;
        this.aiQueue = aiQueue;
        this.logger = new common_1.Logger(DiagnosticsService_1.name);
    }
    async createExamination(dto, nurseId) {
        const patient = await this.prisma.patient.findUnique({
            where: { id: dto.patientId },
        });
        if (!patient) {
            throw new common_1.NotFoundException(`Bemor topilmadi (ID: ${dto.patientId})`);
        }
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
        let safeClinicId = undefined;
        if (dto.clinicId) {
            const clinic = await this.prisma.mobileClinic.findUnique({ where: { id: dto.clinicId } });
            if (clinic) {
                safeClinicId = clinic.id;
            }
        }
        const createData = {
            patient: { connect: { id: dto.patientId } },
            nurse: { connect: { id: targetNurseId } },
            status: client_1.ExaminationStatus.DRAFT,
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
    async uploadDiagnosticFile(examinationId, file, fileType, metadataJson) {
        const examination = await this.prisma.examination.findUnique({
            where: { id: examinationId },
            include: { patient: true },
        });
        if (!examination) {
            throw new common_1.NotFoundException(`Tekshiruv topilmadi (ID: ${examinationId})`);
        }
        if (!file) {
            throw new common_1.BadRequestException('Yuklash uchun fayl tanlanmagan');
        }
        const scanResult = await this.storage.scanFileForSafety(file.buffer);
        if (!scanResult.isSafe) {
            throw new common_1.BadRequestException(`Fayl xavfsizlik tekshiruvidan o‘tmadi: ${scanResult.details}`);
        }
        let parsedMetadata = {};
        if (metadataJson) {
            try {
                parsedMetadata = JSON.parse(metadataJson);
            }
            catch {
                parsedMetadata = { raw: metadataJson };
            }
        }
        const folder = `diagnostics/${fileType.toLowerCase()}`;
        const uploadResult = await this.storage.uploadFile(file.buffer, file.originalname, file.mimetype, folder);
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
        await this.prisma.examination.update({
            where: { id: examinationId },
            data: { status: client_1.ExaminationStatus.QUEUED },
        });
        const initialPriority = examination.priority || 2;
        try {
            const queuePromise = this.aiQueue.add('analyze-case', {
                examinationId,
                uploadId: uploadRecord.id,
                fileType,
                minioKey: uploadResult.minioKey,
                patientId: examination.patientId,
            }, {
                priority: 5 - initialPriority,
                attempts: 3,
            });
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Queue timeout (Redis offline)')), 500));
            await Promise.race([queuePromise, timeoutPromise]);
            this.logger.log(`File uploaded and queued in BullMQ: ${uploadResult.minioKey}`);
        }
        catch (queueErr) {
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
                        status: client_1.ExaminationStatus.DOCTOR_REVIEW,
                        riskLevel: aiRes.riskLevel,
                        priority: aiRes.riskLevel === client_1.RiskLevel.CRITICAL ? 4 : aiRes.riskLevel === client_1.RiskLevel.HIGH ? 3 : 2,
                    },
                });
            }
            catch (directAiErr) {
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
    async getExaminationDetails(id) {
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
            throw new common_1.NotFoundException(`Tekshiruv topilmadi (ID: ${id})`);
        }
        const uploadsWithUrls = await Promise.all(exam.uploads.map(async (u) => ({
            ...u,
            downloadUrl: await this.storage.getPresignedUrl(u.minioKey),
        })));
        return {
            ...exam,
            uploads: uploadsWithUrls,
        };
    }
    async sendToDoctor(examinationId, dto) {
        const exam = await this.prisma.examination.findUnique({
            where: { id: examinationId },
            include: { patient: true, nurse: true },
        });
        if (!exam) {
            throw new common_1.NotFoundException(`Tekshiruv topilmadi (ID: ${examinationId})`);
        }
        const doctor = await this.prisma.user.findUnique({
            where: { id: dto.doctorId },
        });
        if (!doctor) {
            throw new common_1.NotFoundException(`Tanlangan shifokor topilmadi (ID: ${dto.doctorId})`);
        }
        const updatedNotes = dto.notes
            ? `${exam.nurseNotes ? exam.nurseNotes + ' | ' : ''}Shifokorga izoh: ${dto.notes}`
            : exam.nurseNotes;
        const updated = await this.prisma.examination.update({
            where: { id: examinationId },
            data: {
                status: client_1.ExaminationStatus.DOCTOR_REVIEW,
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
        try {
            await this.prisma.notification.create({
                data: {
                    userId: doctor.id,
                    title: '🩻 Yangi tekshiruv kelib tushdi!',
                    message: `${exam.patient.fullName} bo‘yicha tekshiruv ${doctor.fullName} ko‘rib chiqishi uchun yuborildi.`,
                    type: 'DOCTOR_REVIEWED',
                    data: { examinationId: exam.id, patientId: exam.patientId },
                },
            });
        }
        catch (e) {
            this.logger.warn(`Failed to create notification for doctor: ${e.message}`);
        }
        return updated;
    }
    async listExaminations(params) {
        const { status, riskLevel, patientId, nurseId, skip, take } = params;
        const skipNum = Number(skip) >= 0 ? Number(skip) : 0;
        const takeNum = Number(take) > 0 ? Number(take) : 50;
        const where = {};
        if (status)
            where.status = status;
        if (riskLevel)
            where.riskLevel = riskLevel;
        if (patientId)
            where.patientId = patientId;
        if (nurseId)
            where.nurseId = nurseId;
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
    async getFileBuffer(key) {
        return this.storage.getFileBuffer(key);
    }
};
exports.DiagnosticsService = DiagnosticsService;
exports.DiagnosticsService = DiagnosticsService = DiagnosticsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, bullmq_1.InjectQueue)('medical-ai-queue')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        storage_service_1.MinioStorageService,
        ai_client_service_1.AiClientService,
        bullmq_2.Queue])
], DiagnosticsService);
//# sourceMappingURL=diagnostics.service.js.map