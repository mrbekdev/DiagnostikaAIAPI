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
exports.MapService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let MapService = class MapService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardStatistics() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const [totalPatients, uniqueVillages, aiProcessedToday, criticalCases, confirmedDiagnoses, onlineClinics, totalClinics,] = await Promise.all([
            this.prisma.patient.count(),
            this.prisma.patient.findMany({
                select: { village: true },
                distinct: ['village'],
            }),
            this.prisma.aiResult.count({
                where: { generatedAt: { gte: today } },
            }),
            this.prisma.examination.count({
                where: {
                    OR: [
                        { riskLevel: client_1.RiskLevel.CRITICAL },
                        { riskLevel: client_1.RiskLevel.HIGH },
                    ],
                },
            }),
            this.prisma.doctorReview.count({
                where: { decision: client_1.DoctorDecision.APPROVED },
            }),
            this.prisma.mobileClinic.count({
                where: { isOnline: true },
            }),
            this.prisma.mobileClinic.count(),
        ]);
        return {
            villagesCovered: uniqueVillages.length,
            patientsScreened: totalPatients,
            aiProcessedToday,
            urgentCases: criticalCases,
            confirmedDiagnoses,
            clinicOnlineCount: onlineClinics,
            totalFleetCount: totalClinics,
            lastUpdated: new Date().toISOString(),
        };
    }
    async getCoverage() {
        const uzbekistanRegions = [
            'Qoraqalpog\'iston Respublikasi',
            'Andijon viloyati',
            'Buxoro viloyati',
            'Jizzax viloyati',
            'Qashqadaryo viloyati',
            'Navoiy viloyati',
            'Namangan viloyati',
            'Samarqand viloyati',
            'Surxondaryo viloyati',
            'Sirdaryo viloyati',
            'Toshkent viloyati',
            'Farg‘ona viloyati',
            'Xorazm viloyati',
            'Toshkent shahri',
        ];
        const patientsByRegion = await this.prisma.patient.groupBy({
            by: ['region'],
            _count: { id: true },
        });
        const clinicsByRegion = await this.prisma.mobileClinic.groupBy({
            by: ['region'],
            _count: { id: true },
        });
        const villagesByRegion = await this.prisma.patient.groupBy({
            by: ['region', 'village'],
        });
        const coverageMap = uzbekistanRegions.map((regionName) => {
            const p = patientsByRegion.find((r) => regionName.toLowerCase().includes(r.region.toLowerCase()) || r.region.toLowerCase().includes(regionName.toLowerCase()));
            const c = clinicsByRegion.find((r) => regionName.toLowerCase().includes(r.region.toLowerCase()) || r.region.toLowerCase().includes(regionName.toLowerCase()));
            const vCount = villagesByRegion.filter((v) => regionName.toLowerCase().includes(v.region.toLowerCase()) || v.region.toLowerCase().includes(regionName.toLowerCase())).length;
            return {
                region: regionName,
                patientsScreened: p ? p._count.id : 0,
                activeClinics: c ? c._count.id : 0,
                villagesReached: vCount,
                telemedicineReadiness: '100%',
            };
        });
        return {
            totalRegions: uzbekistanRegions.length,
            coverage: coverageMap,
        };
    }
    async getRegionStatistics() {
        const riskDistribution = await this.prisma.examination.groupBy({
            by: ['riskLevel'],
            _count: { id: true },
            where: { riskLevel: { not: null } },
        });
        const statusDistribution = await this.prisma.examination.groupBy({
            by: ['status'],
            _count: { id: true },
        });
        const regionalDetails = await this.prisma.patient.groupBy({
            by: ['region', 'district'],
            _count: { id: true },
        });
        return {
            riskDistribution: riskDistribution.map((r) => ({
                riskLevel: r.riskLevel,
                count: r._count.id,
            })),
            statusDistribution: statusDistribution.map((s) => ({
                status: s.status,
                count: s._count.id,
            })),
            regionalDetails,
        };
    }
};
exports.MapService = MapService;
exports.MapService = MapService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MapService);
//# sourceMappingURL=map.service.js.map