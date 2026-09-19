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
exports.DiagnosticsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const diagnostics_service_1 = require("./diagnostics.service");
const create_examination_dto_1 = require("./dto/create-examination.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const public_decorator_1 = require("../common/decorators/public.decorator");
const client_1 = require("@prisma/client");
let DiagnosticsController = class DiagnosticsController {
    constructor(diagnosticsService) {
        this.diagnosticsService = diagnosticsService;
    }
    createExamination(dto, nurseId) {
        return this.diagnosticsService.createExamination(dto, nurseId);
    }
    sendToDoctor(examinationId, dto) {
        return this.diagnosticsService.sendToDoctor(examinationId, dto);
    }
    uploadDiagnosticFile(examinationId, file, fileType, metadataJson) {
        return this.diagnosticsService.uploadDiagnosticFile(examinationId, file, fileType, metadataJson);
    }
    getExaminationDetails(id) {
        return this.diagnosticsService.getExaminationDetails(id);
    }
    listExaminations(status, riskLevel, patientId, skip, take) {
        return this.diagnosticsService.listExaminations({ status, riskLevel, patientId, skip, take });
    }
    async streamDiagnosticFile(key, res) {
        try {
            const decodedKey = decodeURIComponent(key);
            const buffer = await this.diagnosticsService.getFileBuffer(decodedKey);
            if (buffer.toString('utf-8', 0, 5).includes('<svg')) {
                res.setHeader('Content-Type', 'image/svg+xml');
            }
            else {
                const ext = decodedKey.split('.').pop()?.toLowerCase() || 'png';
                const mimeMap = {
                    png: 'image/png',
                    jpg: 'image/jpeg',
                    jpeg: 'image/jpeg',
                    pdf: 'application/pdf',
                    dcm: 'application/dicom',
                    csv: 'text/csv',
                    svg: 'image/svg+xml',
                };
                res.setHeader('Content-Type', mimeMap[ext] || 'image/png');
            }
            res.setHeader('Cache-Control', 'public, max-age=86400');
            res.send(buffer);
        }
        catch {
            res.status(404).send('File not found');
        }
    }
};
exports.DiagnosticsController = DiagnosticsController;
__decorate([
    (0, common_1.Post)('examinations'),
    (0, swagger_1.ApiOperation)({ summary: 'Yangi tibbiy tekshiruv (tashrif) kartasini ochish' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_examination_dto_1.CreateExaminationDto, String]),
    __metadata("design:returntype", void 0)
], DiagnosticsController.prototype, "createExamination", null);
__decorate([
    (0, common_1.Post)('examinations/:id/send-to-doctor'),
    (0, swagger_1.ApiOperation)({ summary: 'Tekshiruvni tanlangan shifokorga ko‘rib chiqish uchun yuborish' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DiagnosticsController.prototype, "sendToDoctor", null);
__decorate([
    (0, common_1.Post)('examinations/:id/upload'),
    (0, swagger_1.ApiOperation)({ summary: 'Tibbiy fayl yuklash (Rentgen, EKG, Qon tahlili - maks 200MB) va SI tahliliga yuborish' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
                fileType: { type: 'string', enum: ['XRAY', 'ECG', 'BLOOD'], example: 'XRAY' },
                metadataJson: { type: 'string', example: '{"bodyPart": "CHEST", "view": "PA"}' },
            },
            required: ['file', 'fileType'],
        },
    }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        limits: { fileSize: 200 * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
            const allowedExtensions = /\.(jpg|jpeg|png|dcm|dicom|pdf|csv)$/i;
            if (!file.originalname.match(allowedExtensions)) {
                return cb(new common_1.BadRequestException('Ruxsat etilmagan fayl formati. Faqat JPG, PNG, DICOM (.dcm), PDF va CSV fayllari qabul qilinadi.'), false);
            }
            cb(null, true);
        },
    })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)('fileType')),
    __param(3, (0, common_1.Body)('metadataJson')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String]),
    __metadata("design:returntype", void 0)
], DiagnosticsController.prototype, "uploadDiagnosticFile", null);
__decorate([
    (0, common_1.Get)('examinations/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Tekshiruv tafsilotlari, barcha fayllar, SI natijalari va shifokor xulosasini ko‘rish' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DiagnosticsController.prototype, "getExaminationDetails", null);
__decorate([
    (0, common_1.Get)('examinations'),
    (0, swagger_1.ApiOperation)({ summary: 'Tekshiruvlar ro‘yxati (xavf darajasi va status bo‘yicha filtr)' }),
    (0, swagger_1.ApiQuery)({ name: 'status', enum: client_1.ExaminationStatus, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'riskLevel', enum: client_1.RiskLevel, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'patientId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'skip', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'take', required: false }),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('riskLevel')),
    __param(2, (0, common_1.Query)('patientId')),
    __param(3, (0, common_1.Query)('skip')),
    __param(4, (0, common_1.Query)('take')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number, Number]),
    __metadata("design:returntype", void 0)
], DiagnosticsController.prototype, "listExaminations", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('file/:key(*)'),
    (0, swagger_1.ApiOperation)({ summary: 'Yuklangan tibbiy faylni to‘g‘ridan-to‘g‘ri ko‘rish yoki yuklab olish' }),
    __param(0, (0, common_1.Param)('key')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DiagnosticsController.prototype, "streamDiagnosticFile", null);
exports.DiagnosticsController = DiagnosticsController = __decorate([
    (0, swagger_1.ApiTags)('Diagnostics & File Uploads'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('diagnostics'),
    __metadata("design:paramtypes", [diagnostics_service_1.DiagnosticsService])
], DiagnosticsController);
//# sourceMappingURL=diagnostics.controller.js.map