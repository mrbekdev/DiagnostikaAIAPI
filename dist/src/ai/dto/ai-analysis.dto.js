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
exports.VoiceTriageDto = exports.TriggerAiAnalysisDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class TriggerAiAnalysisDto {
}
exports.TriggerAiAnalysisDto = TriggerAiAnalysisDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-exam-id' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], TriggerAiAnalysisDto.prototype, "examinationId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-upload-id' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], TriggerAiAnalysisDto.prototype, "uploadId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.FileType, example: client_1.FileType.XRAY }),
    (0, class_validator_1.IsEnum)(client_1.FileType),
    __metadata("design:type", String)
], TriggerAiAnalysisDto.prototype, "fileType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Bemor shikoyati: qattiq yo‘tal va isitma' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TriggerAiAnalysisDto.prototype, "patientContext", void 0);
class VoiceTriageDto {
}
exports.VoiceTriageDto = VoiceTriageDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Boshim juda qattiq og‘riyapti va ko‘zlarim qorong‘ilashyapti' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], VoiceTriageDto.prototype, "transcriptText", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Ergash Normurodovich, 62 yosh' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VoiceTriageDto.prototype, "patientInfo", void 0);
//# sourceMappingURL=ai-analysis.dto.js.map