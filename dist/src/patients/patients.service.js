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
exports.PatientsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const storage_service_1 = require("../storage/storage.service");
let PatientsService = class PatientsService {
    constructor(prisma, storage) {
        this.prisma = prisma;
        this.storage = storage;
    }
    async findAll(params) {
        const { search, region, district, village, skip, take } = params;
        const skipNum = Number(skip) >= 0 ? Number(skip) : 0;
        const takeNum = Number(take) > 0 ? Number(take) : 50;
        const where = {};
        if (region)
            where.region = region;
        if (district)
            where.district = district;
        if (village)
            where.village = { contains: village, mode: 'insensitive' };
        if (search) {
            where.OR = [
                { fullName: { contains: search, mode: 'insensitive' } },
                { pinfl: { contains: search } },
                { passport: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
                { district: { contains: search, mode: 'insensitive' } },
                { region: { contains: search, mode: 'insensitive' } },
                { village: { contains: search, mode: 'insensitive' } },
                { complaints: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [total, patients] = await Promise.all([
            this.prisma.patient.count({ where }),
            this.prisma.patient.findMany({
                where,
                skip: skipNum,
                take: takeNum,
                orderBy: { createdAt: 'desc' },
                include: {
                    createdBy: {
                        select: {
                            id: true,
                            fullName: true,
                            role: true,
                        },
                    },
                    examinations: {
                        select: {
                            id: true,
                            status: true,
                            riskLevel: true,
                            createdAt: true,
                        },
                        take: 1,
                        orderBy: { createdAt: 'desc' },
                    },
                },
            }),
        ]);
        return {
            total,
            skip,
            take,
            data: patients,
        };
    }
    async findOne(id) {
        const patient = await this.prisma.patient.findUnique({
            where: { id },
            include: {
                createdBy: {
                    select: { id: true, fullName: true, role: true },
                },
                examinations: {
                    include: {
                        clinic: true,
                        nurse: {
                            select: { id: true, fullName: true, phone: true },
                        },
                        uploads: true,
                        aiResults: true,
                        doctorReviews: {
                            include: {
                                doctor: {
                                    select: { id: true, fullName: true, specialty: true },
                                },
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!patient) {
            throw new common_1.NotFoundException(`Bemor topilmadi (ID: ${id})`);
        }
        const examinationsWithUrls = await Promise.all(patient.examinations.map(async (exam) => {
            const uploadsWithUrls = await Promise.all(exam.uploads.map(async (u) => ({
                ...u,
                downloadUrl: await this.storage.getPresignedUrl(u.minioKey),
            })));
            return {
                ...exam,
                uploads: uploadsWithUrls,
            };
        }));
        return {
            ...patient,
            examinations: examinationsWithUrls,
        };
    }
    async findByPinflOrPassport(query) {
        return this.prisma.patient.findFirst({
            where: {
                OR: [
                    { pinfl: query },
                    { passport: { equals: query, mode: 'insensitive' } },
                ],
            },
        });
    }
    async create(dto, createdById) {
        const existing = await this.prisma.patient.findUnique({
            where: { pinfl: dto.pinfl },
        });
        if (existing) {
            throw new common_1.ConflictException(`Ushbu PINFL (${dto.pinfl}) bilan ro‘yxatga olingan bemor mavjud: ${existing.fullName}`);
        }
        let safeCreatedById = createdById;
        if (createdById) {
            const user = await this.prisma.user.findUnique({ where: { id: createdById } });
            if (!user) {
                const fallback = await this.prisma.user.findFirst();
                if (fallback)
                    safeCreatedById = fallback.id;
            }
        }
        else {
            const fallback = await this.prisma.user.findFirst();
            if (fallback)
                safeCreatedById = fallback.id;
        }
        return this.prisma.patient.create({
            data: {
                fullName: dto.fullName,
                pinfl: dto.pinfl,
                passport: dto.passport,
                birthDate: new Date(dto.birthDate),
                age: dto.age,
                gender: dto.gender,
                region: dto.region,
                district: dto.district,
                village: dto.village,
                latitude: dto.latitude,
                longitude: dto.longitude,
                phone: dto.phone,
                complaints: dto.complaints,
                createdById: safeCreatedById,
            },
            include: {
                createdBy: {
                    select: { id: true, fullName: true, role: true },
                },
            },
        });
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.patient.update({
            where: { id },
            data: dto,
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.patient.delete({
            where: { id },
        });
    }
};
exports.PatientsService = PatientsService;
exports.PatientsService = PatientsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        storage_service_1.MinioStorageService])
], PatientsService);
//# sourceMappingURL=patients.service.js.map