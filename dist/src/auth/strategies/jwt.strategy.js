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
exports.JwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../prisma/prisma.service");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy, 'jwt') {
    constructor(configService, prisma) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_SECRET', 'super-secret-telemed-jwt-key-uzbekistan-2026-secure-random'),
        });
        this.configService = configService;
        this.prisma = prisma;
    }
    async validate(payload) {
        if (payload.sub && payload.sub.startsWith('demo-')) {
            const isDoctor = payload.role === 'DOCTOR';
            const isNurse = payload.role === 'NURSE';
            const isUser = payload.role === 'USER' || payload.role === 'PATIENT';
            return {
                id: payload.sub,
                email: payload.email,
                fullName: isDoctor ? 'Dr. Botir Qodirov' : isNurse ? 'Nilufar Rahimova' : isUser ? 'Anvar Karimov' : 'Sardorbek Alimov',
                role: payload.role,
                specialty: isDoctor ? 'Kardiolog & Pulmonolog' : isNurse ? 'Katta hamshira' : isUser ? 'Bemor / Fuqaro' : 'Tizim ma’muri',
                isActive: true,
            };
        }
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
                select: {
                    id: true,
                    email: true,
                    fullName: true,
                    role: true,
                    specialty: true,
                    isActive: true,
                },
            });
            if (user && user.isActive) {
                return user;
            }
        }
        catch (e) {
            return {
                id: payload.sub,
                email: payload.email,
                fullName: 'Foydalanuvchi',
                role: payload.role,
                isActive: true,
            };
        }
        throw new common_1.UnauthorizedException('Foydalanuvchi hisobi faol emas yoki topilmadi');
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map