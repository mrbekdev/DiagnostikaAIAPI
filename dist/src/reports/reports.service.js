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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const storage_service_1 = require("../storage/storage.service");
let ReportsService = class ReportsService {
    constructor(prisma, storage) {
        this.prisma = prisma;
        this.storage = storage;
    }
    async generateClinicalReport(examinationId) {
        const exam = await this.prisma.examination.findUnique({
            where: { id: examinationId },
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
            },
        });
        if (!exam) {
            throw new common_1.NotFoundException(`Tekshiruv topilmadi (ID: ${examinationId})`);
        }
        const latestAi = exam.aiResults[0] || null;
        const latestDoctorReview = exam.doctorReviews[0] || null;
        return {
            reportId: `REP-${exam.id.substring(0, 8).toUpperCase()}`,
            issuedDate: new Date().toISOString(),
            platform: 'Hududiy SI-Mobil Diagnostika - O‘zbekiston Respublikasi Sog‘liqni Saqlash Telemeditsina Tizimi',
            patient: {
                fullName: exam.patient.fullName,
                pinfl: exam.patient.pinfl,
                passport: exam.patient.passport,
                age: exam.patient.age,
                gender: exam.patient.gender,
                region: exam.patient.region,
                district: exam.patient.district,
                village: exam.patient.village,
                complaints: exam.patient.complaints,
            },
            mobileClinic: exam.clinic
                ? {
                    name: exam.clinic.name,
                    plateNumber: exam.clinic.plateNumber,
                    region: exam.clinic.region,
                    nurse: exam.nurse?.fullName,
                }
                : null,
            preliminaryAiAssessment: latestAi
                ? {
                    riskLevel: latestAi.riskLevel,
                    confidencePercent: latestAi.confidence,
                    modelVersion: latestAi.modelVersion,
                    findings: latestAi.findings,
                    technicalSummary: latestAi.technicalSummary,
                    patientExplanationUzbek: latestAi.patientExplanationUzbek,
                    disclaimer: 'DIQQAT: Sun’iy intellekt tahlili faqat yordamchi skrining maqsadida taqdim etiladi va mustaqil yakuniy klinik tashxis hisoblanmaydi. Yakuniy tashxis litsenziyaga ega shifokor tomonidan tasdiqlangan.',
                }
                : null,
            doctorConfirmation: latestDoctorReview
                ? {
                    doctorName: latestDoctorReview.doctor.fullName,
                    specialty: latestDoctorReview.specialty,
                    licenseNumber: latestDoctorReview.doctor.licenseNumber,
                    decision: latestDoctorReview.decision,
                    finalDiagnosis: latestDoctorReview.finalDiagnosis,
                    recommendations: latestDoctorReview.recommendations,
                    digitalSignature: latestDoctorReview.digitalSignature,
                    approvedAt: latestDoctorReview.approvedAt,
                }
                : {
                    status: 'PENDING_DOCTOR_REVIEW',
                    message: 'Toshkentdagi mutaxassis shifokor ko‘rigi kutilmoqda.',
                },
            diagnosticFiles: exam.uploads.map((u) => ({
                id: u.id,
                fileType: u.fileType,
                originalName: u.originalName,
                uploadedAt: u.createdAt,
            })),
        };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        storage_service_1.MinioStorageService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map