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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const doctors_service_1 = require("./doctors.service");
const review_case_dto_1 = require("./dto/review-case.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
let DoctorsController = class DoctorsController {
    constructor(doctorsService) {
        this.doctorsService = doctorsService;
    }
    getDoctorsList() {
        return this.doctorsService.getDoctorsList();
    }
    getDoctorWorklist(riskLevel, status) {
        return this.doctorsService.getDoctorWorklist({ riskLevel, status });
    }
    submitReview(dto, doctorId) {
        return this.doctorsService.submitReview(dto, doctorId);
    }
    requestReanalysis(dto, doctorId) {
        return this.doctorsService.requestReanalysis(dto, doctorId);
    }
};
exports.DoctorsController = DoctorsController;
__decorate([
    (0, common_1.Get)('list'),
    (0, swagger_1.ApiOperation)({ summary: 'Barcha mavjud mutaxassis shifokorlar ro‘yxati' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DoctorsController.prototype, "getDoctorsList", null);
__decorate([
    (0, common_1.Get)('worklist'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN, client_1.UserRole.DOCTOR, client_1.UserRole.CARDIOLOGIST, client_1.UserRole.RADIOLOGIST, client_1.UserRole.ONCOLOGIST, client_1.UserRole.NEUROLOGIST, client_1.UserRole.NURSE),
    (0, swagger_1.ApiOperation)({ summary: 'Shifokor ish stoli: ko‘rib chiqish kutilayotgan shoshilinch holatlar navbati' }),
    (0, swagger_1.ApiQuery)({ name: 'riskLevel', enum: client_1.RiskLevel, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false }),
    __param(0, (0, common_1.Query)('riskLevel')),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DoctorsController.prototype, "getDoctorWorklist", null);
__decorate([
    (0, common_1.Post)('review'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.DOCTOR, client_1.UserRole.CARDIOLOGIST, client_1.UserRole.RADIOLOGIST, client_1.UserRole.ONCOLOGIST, client_1.UserRole.NEUROLOGIST, client_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Tibbiy xulosani tasdiqlash va raqamli imzo (ERI) bilan yakunlash' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [review_case_dto_1.ReviewCaseDto, String]),
    __metadata("design:returntype", void 0)
], DoctorsController.prototype, "submitReview", null);
__decorate([
    (0, common_1.Post)('reanalysis'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.DOCTOR, client_1.UserRole.CARDIOLOGIST, client_1.UserRole.RADIOLOGIST, client_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'SI modelidan tasvirni qayta chuqur tahlil qilishni so‘rash' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [review_case_dto_1.RequestReanalysisDto, String]),
    __metadata("design:returntype", void 0)
], DoctorsController.prototype, "requestReanalysis", null);
exports.DoctorsController = DoctorsController = __decorate([
    (0, swagger_1.ApiTags)('Doctor Review & Tele-Consultation'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('doctors'),
    __metadata("design:paramtypes", [doctors_service_1.DoctorsService])
], DoctorsController);
//# sourceMappingURL=doctors.controller.js.map