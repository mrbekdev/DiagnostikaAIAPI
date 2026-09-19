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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(role, category) {
        let whereClause = {};
        if (category === 'doctors') {
            whereClause.role = {
                in: [
                    client_1.UserRole.DOCTOR,
                    client_1.UserRole.CARDIOLOGIST,
                    client_1.UserRole.RADIOLOGIST,
                    client_1.UserRole.ONCOLOGIST,
                    client_1.UserRole.NEUROLOGIST,
                ],
            };
        }
        else if (role) {
            whereClause.role = role;
        }
        return this.prisma.user.findMany({
            where: whereClause,
            select: {
                id: true,
                email: true,
                fullName: true,
                phone: true,
                role: true,
                specialty: true,
                licenseNumber: true,
                isActive: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                fullName: true,
                phone: true,
                role: true,
                specialty: true,
                licenseNumber: true,
                digitalSignature: true,
                isActive: true,
                createdAt: true,
                _count: {
                    select: {
                        conductedExams: true,
                        doctorReviews: true,
                        createdPatients: true,
                    },
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException(`Foydalanuvchi topilmadi (ID: ${id})`);
        }
        return user;
    }
    async create(dto) {
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase().trim() },
        });
        if (existing) {
            throw new common_1.ConflictException('Ushbu email bilan ro‘yxatdan o‘tgan foydalanuvchi mavjud');
        }
        const passwordHash = await bcrypt.hash(dto.password, 10);
        return this.prisma.user.create({
            data: {
                email: dto.email.toLowerCase().trim(),
                passwordHash,
                fullName: dto.fullName,
                phone: dto.phone,
                role: dto.role,
                specialty: dto.specialty,
                licenseNumber: dto.licenseNumber,
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                specialty: true,
                licenseNumber: true,
                isActive: true,
                createdAt: true,
            },
        });
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.user.update({
            where: { id },
            data: dto,
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                specialty: true,
                licenseNumber: true,
                digitalSignature: true,
                isActive: true,
                updatedAt: true,
            },
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.user.update({
            where: { id },
            data: { isActive: false },
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map