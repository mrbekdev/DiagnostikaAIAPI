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
exports.AiController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const axios_1 = require("axios");
const ai_client_service_1 = require("./ai-client.service");
const ai_analysis_dto_1 = require("./dto/ai-analysis.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const public_decorator_1 = require("../common/decorators/public.decorator");
const prisma_service_1 = require("../prisma/prisma.service");
let AiController = class AiController {
    constructor(aiClient, prisma) {
        this.aiClient = aiClient;
        this.prisma = prisma;
    }
    voiceTriage(dto) {
        return this.aiClient.voiceTriage(dto.transcriptText, dto.patientInfo);
    }
    async getAiResults(examinationId) {
        return this.prisma.aiResult.findMany({
            where: { examinationId },
            include: {
                upload: true,
            },
            orderBy: { generatedAt: 'desc' },
        });
    }
    async streamTextToSpeech(text, voice, rate, res) {
        const cleanText = (text || 'Tahlil yakunlandi').trim().substring(0, 800);
        const selectedVoice = voice || 'uz-UZ-MadinaNeural';
        const selectedRate = rate || '+18%';
        const encoded = encodeURIComponent(cleanText);
        res.set({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        });
        try {
            const fastApiUrl = `http://localhost:8000/voice/tts?text=${encoded}&voice=${encodeURIComponent(selectedVoice)}&rate=${encodeURIComponent(selectedRate)}`;
            const response = await axios_1.default.get(fastApiUrl, {
                responseType: 'stream',
                timeout: 10000,
            });
            res.set({
                'Content-Type': 'audio/mpeg',
                'Cache-Control': 'public, max-age=86400',
            });
            response.data.pipe(res);
        }
        catch (fastApiError) {
            try {
                const fallbackUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=uz&client=tw-ob&q=${encoded}`;
                const fbResponse = await axios_1.default.get(fallbackUrl, {
                    responseType: 'stream',
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        Referer: 'https://translate.google.com/',
                    },
                    timeout: 8000,
                });
                res.set({
                    'Content-Type': 'audio/mpeg',
                    'Cache-Control': 'public, max-age=86400',
                });
                fbResponse.data.pipe(res);
            }
            catch (err) {
                res.status(500).json({ error: 'Ovoz sintezida xatolik yuz berdi' });
            }
        }
    }
};
exports.AiController = AiController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('voice-triage'),
    (0, swagger_1.ApiOperation)({ summary: 'Ovozli shikoyatni matn/simptom tahlili va xavfsiz tibbiy maslahat (Whisper Voice Triage)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ai_analysis_dto_1.VoiceTriageDto]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "voiceTriage", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('results/:examinationId'),
    (0, swagger_1.ApiOperation)({ summary: 'Tekshiruv bo‘yicha barcha SI xulosalari va Grad-CAM xaritalarini olish' }),
    __param(0, (0, common_1.Param)('examinationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "getAiResults", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('tts'),
    (0, swagger_1.ApiOperation)({ summary: 'O‘zbek tilidagi matnni tabiiy va tiniq neyroovozda sintez qilish (FastAPI Neural Edge-TTS Stream)' }),
    (0, swagger_1.ApiQuery)({ name: 'text', required: true, description: 'O‘qilishi kerak bo‘lgan o‘zbekcha matn' }),
    (0, swagger_1.ApiQuery)({ name: 'voice', required: false, description: 'Ovoz tanlash (uz-UZ-MadinaNeural yoki uz-UZ-SardorNeural)' }),
    (0, swagger_1.ApiQuery)({ name: 'rate', required: false, description: 'Ovoz tezligi (+15%, +18%, +20%)' }),
    __param(0, (0, common_1.Query)('text')),
    __param(1, (0, common_1.Query)('voice')),
    __param(2, (0, common_1.Query)('rate')),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "streamTextToSpeech", null);
exports.AiController = AiController = __decorate([
    (0, swagger_1.ApiTags)('Medical AI Engine'),
    (0, common_1.Controller)('ai'),
    __metadata("design:paramtypes", [ai_client_service_1.AiClientService,
        prisma_service_1.PrismaService])
], AiController);
//# sourceMappingURL=ai.controller.js.map