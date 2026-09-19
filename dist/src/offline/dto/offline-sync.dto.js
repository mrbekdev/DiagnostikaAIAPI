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
exports.OfflineSyncBatchDto = exports.OfflineExaminationItemDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const create_patient_dto_1 = require("../../patients/dto/create-patient.dto");
class OfflineExaminationItemDto {
}
exports.OfflineExaminationItemDto = OfflineExaminationItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'sync-uuid-client-1234' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], OfflineExaminationItemDto.prototype, "clientSyncId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '31508740120015' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], OfflineExaminationItemDto.prototype, "patientPinfl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'uuid-clinic-id' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OfflineExaminationItemDto.prototype, "clinicId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Oflayn rejimda qabul qilingan bemor, shikoyatlari qayd etildi' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OfflineExaminationItemDto.prototype, "nurseNotes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-09-18T08:30:00.000Z' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OfflineExaminationItemDto.prototype, "createdAt", void 0);
class OfflineSyncBatchDto {
}
exports.OfflineSyncBatchDto = OfflineSyncBatchDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [create_patient_dto_1.CreatePatientDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => create_patient_dto_1.CreatePatientDto),
    __metadata("design:type", Array)
], OfflineSyncBatchDto.prototype, "patients", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [OfflineExaminationItemDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => OfflineExaminationItemDto),
    __metadata("design:type", Array)
], OfflineSyncBatchDto.prototype, "examinations", void 0);
//# sourceMappingURL=offline-sync.dto.js.map