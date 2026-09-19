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
exports.ClinicsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ClinicsService = class ClinicsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.mobileClinic.findMany({
            include: {
                assignedNurse: {
                    select: { id: true, fullName: true, phone: true, email: true },
                },
                _count: {
                    select: { examinations: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findLive() {
        return this.prisma.mobileClinic.findMany({
            select: {
                id: true,
                name: true,
                plateNumber: true,
                region: true,
                district: true,
                currentLat: true,
                currentLng: true,
                isOnline: true,
                lastPing: true,
                assignedNurse: {
                    select: { id: true, fullName: true, phone: true },
                },
                _count: {
                    select: {
                        examinations: true,
                    },
                },
            },
        });
    }
    async findOne(id) {
        const clinic = await this.prisma.mobileClinic.findUnique({
            where: { id },
            include: {
                assignedNurse: {
                    select: { id: true, fullName: true, phone: true, email: true },
                },
                examinations: {
                    include: {
                        patient: true,
                        aiResults: true,
                    },
                    take: 20,
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!clinic) {
            throw new common_1.NotFoundException(`Mobil klinika topilmadi (ID: ${id})`);
        }
        return clinic;
    }
    async create(dto) {
        const existing = await this.prisma.mobileClinic.findUnique({
            where: { plateNumber: dto.plateNumber },
        });
        if (existing) {
            throw new common_1.ConflictException(`Ushbu davlat raqamli (${dto.plateNumber}) klinika allaqachon mavjud`);
        }
        return this.prisma.mobileClinic.create({
            data: dto,
            include: {
                assignedNurse: true,
            },
        });
    }
    async updateLocation(id, dto) {
        await this.findOne(id);
        return this.prisma.mobileClinic.update({
            where: { id },
            data: {
                currentLat: dto.latitude,
                currentLng: dto.longitude,
                isOnline: dto.isOnline ?? true,
                lastPing: new Date(),
            },
        });
    }
};
exports.ClinicsService = ClinicsService;
exports.ClinicsService = ClinicsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ClinicsService);
//# sourceMappingURL=clinics.service.js.map