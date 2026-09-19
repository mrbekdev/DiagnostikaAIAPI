import { Controller, Post, Body, Get, Param, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import axios from 'axios';
import { AiClientService } from './ai-client.service';
import { VoiceTriageDto } from './dto/ai-analysis.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Medical AI Engine')
@Controller('ai')
export class AiController {
  constructor(
    private readonly aiClient: AiClientService,
    private readonly prisma: PrismaService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('voice-triage')
  @ApiOperation({ summary: 'Ovozli shikoyatni matn/simptom tahlili va xavfsiz tibbiy maslahat (Whisper Voice Triage)' })
  voiceTriage(@Body() dto: VoiceTriageDto) {
    return this.aiClient.voiceTriage(dto.transcriptText, dto.patientInfo);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('results/:examinationId')
  @ApiOperation({ summary: 'Tekshiruv bo‘yicha barcha SI xulosalari va Grad-CAM xaritalarini olish' })
  async getAiResults(@Param('examinationId') examinationId: string) {
    return this.prisma.aiResult.findMany({
      where: { examinationId },
      include: {
        upload: true,
      },
      orderBy: { generatedAt: 'desc' },
    });
  }

  @Public()
  @Get('tts')
  @ApiOperation({ summary: 'O‘zbek tilidagi matnni tabiiy va tiniq neyroovozda sintez qilish (FastAPI Neural Edge-TTS Stream)' })
  @ApiQuery({ name: 'text', required: true, description: 'O‘qilishi kerak bo‘lgan o‘zbekcha matn' })
  @ApiQuery({ name: 'voice', required: false, description: 'Ovoz tanlash (uz-UZ-MadinaNeural yoki uz-UZ-SardorNeural)' })
  @ApiQuery({ name: 'rate', required: false, description: 'Ovoz tezligi (+15%, +18%, +20%)' })
  async streamTextToSpeech(
    @Query('text') text: string,
    @Query('voice') voice: string,
    @Query('rate') rate: string,
    @Res() res: Response,
  ) {
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
      // 1. Primary: FastAPI AI Microservice Edge-TTS
      const fastApiUrl = `http://localhost:8000/voice/tts?text=${encoded}&voice=${encodeURIComponent(selectedVoice)}&rate=${encodeURIComponent(selectedRate)}`;
      const response = await axios.get(fastApiUrl, {
        responseType: 'stream',
        timeout: 10000,
      });

      res.set({
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400',
      });

      response.data.pipe(res);
    } catch (fastApiError) {
      // 2. Fallback: Edge-TTS or Google TTS
      try {
        const fallbackUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=uz&client=tw-ob&q=${encoded}`;
        const fbResponse = await axios.get(fallbackUrl, {
          responseType: 'stream',
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Referer: 'https://translate.google.com/',
          },
          timeout: 8000,
        });

        res.set({
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'public, max-age=86400',
        });

        fbResponse.data.pipe(res);
      } catch (err) {
        res.status(500).json({ error: 'Ovoz sintezida xatolik yuz berdi' });
      }
    }
  }
}
