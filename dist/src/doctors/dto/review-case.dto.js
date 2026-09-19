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
exports.RequestReanalysisDto = exports.ReviewCaseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class ReviewCaseDto {
}
exports.ReviewCaseDto = ReviewCaseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-examination-id' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ReviewCaseDto.prototype, "examinationId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.DoctorDecision, example: client_1.DoctorDecision.APPROVED }),
    (0, class_validator_1.IsEnum)(client_1.DoctorDecision),
    __metadata("design:type", String)
], ReviewCaseDto.prototype, "decision", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Chap tomonlama o‘tkir o‘choqli pnevmoniya, o‘rtacha og‘ir kechishi.',
        description: 'Shifokor tomonidan tasdiqlangan yakuniy klinik tashxis',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Yakuniy klinik tashxis kiritilishi shart' }),
    __metadata("design:type", String)
], ReviewCaseDto.prototype, "finalDiagnosis", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Sefriakson 1.0g kunda 2 marta m/o 5 kun. Ko‘p suyuqlik ichish va ambulator nazorat.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReviewCaseDto.prototype, "recommendations", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Rentgenogrammadagi soyalanish AI aniqlagan lokalizatsiya bilan to‘liq mos keldi.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReviewCaseDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'ED25519-SIG-7789-JAMSHID-XODJAYEV-TASHKENT-REPUBLIC-MED',
        description: 'Shifokorning elektron raqamli imzosi (ERI)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReviewCaseDto.prototype, "digitalSignature", void 0);
class RequestReanalysisDto {
}
exports.RequestReanalysisDto = RequestReanalysisDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-examination-id' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RequestReanalysisDto.prototype, "examinationId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Iltimos, plevral sinuslarni qayta sinchiklab tahlil qiling' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RequestReanalysisDto.prototype, "reason", void 0);
//# sourceMappingURL=review-case.dto.js.map