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
exports.UploadDiagnosticDto = exports.CreateExaminationDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class CreateExaminationDto {
}
exports.CreateExaminationDto = CreateExaminationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-patient-id' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateExaminationDto.prototype, "patientId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'uuid-clinic-id' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateExaminationDto.prototype, "clinicId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Bemorning umumiy ahvoli: nafas olish tezlashgan, saturatsiya 92%',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateExaminationDto.prototype, "nurseNotes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'offline-client-sync-uuid-99' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateExaminationDto.prototype, "syncId", void 0);
class UploadDiagnosticDto {
}
exports.UploadDiagnosticDto = UploadDiagnosticDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.FileType, example: client_1.FileType.XRAY }),
    (0, class_validator_1.IsEnum)(client_1.FileType),
    __metadata("design:type", String)
], UploadDiagnosticDto.prototype, "fileType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '{"modality": "CR", "view": "PA"}' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UploadDiagnosticDto.prototype, "metadataJson", void 0);
//# sourceMappingURL=create-examination.dto.js.map