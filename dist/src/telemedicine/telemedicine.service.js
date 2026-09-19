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
exports.TelemedicineService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TelemedicineService = class TelemedicineService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createSession(params) {
        const roomName = `telemed-room-${params.examinationId}-${Date.now()}`;
        return this.prisma.telemedicineSession.create({
            data: {
                examinationId: params.examinationId,
                doctorId: params.doctorId,
                nurseId: params.nurseId,
                roomName,
                startedAt: new Date(),
            },
            include: {
                examination: {
                    include: { patient: true },
                },
                doctor: {
                    select: { id: true, fullName: true, specialty: true },
                },
                nurse: {
                    select: { id: true, fullName: true, phone: true },
                },
            },
        });
    }
    async endSession(sessionId, notes, recordingKey) {
        const session = await this.prisma.telemedicineSession.findUnique({
            where: { id: sessionId },
        });
        if (!session) {
            throw new common_1.NotFoundException(`Telemeditsina sessiyasi topilmadi (ID: ${sessionId})`);
        }
        const endedAt = new Date();
        const durationSec = Math.floor((endedAt.getTime() - session.startedAt.getTime()) / 1000);
        return this.prisma.telemedicineSession.update({
            where: { id: sessionId },
            data: {
                endedAt,
                durationSec,
                notes,
                recordingKey,
            },
        });
    }
    async getSessionHistory(examinationId) {
        return this.prisma.telemedicineSession.findMany({
            where: { examinationId },
            include: {
                doctor: { select: { id: true, fullName: true, specialty: true } },
                nurse: { select: { id: true, fullName: true } },
            },
            orderBy: { startedAt: 'desc' },
        });
    }
};
exports.TelemedicineService = TelemedicineService;
exports.TelemedicineService = TelemedicineService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TelemedicineService);
//# sourceMappingURL=telemedicine.service.js.map