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
var OfflineSyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfflineSyncService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let OfflineSyncService = OfflineSyncService_1 = class OfflineSyncService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(OfflineSyncService_1.name);
    }
    async processSyncBatch(dto, nurseId) {
        this.logger.log(`Processing offline sync batch: ${dto.patients.length} patients, ${dto.examinations.length} exams.`);
        const syncedPatients = [];
        const syncedExaminations = [];
        const errors = [];
        for (const p of dto.patients) {
            try {
                const existing = await this.prisma.patient.findUnique({
                    where: { pinfl: p.pinfl },
                });
                if (existing) {
                    syncedPatients.push({ pinfl: p.pinfl, id: existing.id, status: 'ALREADY_EXISTS' });
                }
                else {
                    const created = await this.prisma.patient.create({
                        data: {
                            ...p,
                            birthDate: new Date(p.birthDate),
                            createdById: nurseId,
                        },
                    });
                    syncedPatients.push({ pinfl: p.pinfl, id: created.id, status: 'CREATED' });
                }
            }
            catch (err) {
                this.logger.error(`Error syncing patient ${p.pinfl}: ${err.message}`);
                errors.push({ type: 'PATIENT', pinfl: p.pinfl, error: err.message });
            }
        }
        for (const ex of dto.examinations) {
            try {
                const patient = await this.prisma.patient.findUnique({
                    where: { pinfl: ex.patientPinfl },
                });
                if (!patient) {
                    errors.push({ type: 'EXAMINATION', syncId: ex.clientSyncId, error: `Bemor (PINFL: ${ex.patientPinfl}) topilmadi` });
                    continue;
                }
                const existingExam = await this.prisma.examination.findUnique({
                    where: { syncId: ex.clientSyncId },
                });
                if (existingExam) {
                    syncedExaminations.push({ syncId: ex.clientSyncId, id: existingExam.id, status: 'ALREADY_SYNCED' });
                }
                else {
                    const createdExam = await this.prisma.examination.create({
                        data: {
                            patientId: patient.id,
                            clinicId: ex.clinicId,
                            nurseId,
                            nurseNotes: ex.nurseNotes,
                            syncId: ex.clientSyncId,
                            status: client_1.ExaminationStatus.DRAFT,
                            createdAt: new Date(ex.createdAt || Date.now()),
                        },
                    });
                    syncedExaminations.push({ syncId: ex.clientSyncId, id: createdExam.id, status: 'CREATED' });
                }
            }
            catch (err) {
                this.logger.error(`Error syncing exam ${ex.clientSyncId}: ${err.message}`);
                errors.push({ type: 'EXAMINATION', syncId: ex.clientSyncId, error: err.message });
            }
        }
        return {
            success: true,
            syncedAt: new Date().toISOString(),
            patientsSynced: syncedPatients.length,
            examinationsSynced: syncedExaminations.length,
            syncedPatients,
            syncedExaminations,
            errors,
        };
    }
};
exports.OfflineSyncService = OfflineSyncService;
exports.OfflineSyncService = OfflineSyncService = OfflineSyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OfflineSyncService);
//# sourceMappingURL=offline-sync.service.js.map