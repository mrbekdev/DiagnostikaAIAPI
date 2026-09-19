import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TelemedicineService } from './telemedicine.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Telemedicine & Live Video Consultations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('telemedicine')
export class TelemedicineController {
  constructor(private readonly telemedService: TelemedicineService) {}

  @Post('session/start')
  @ApiOperation({ summary: 'Shifokor va Qishloq Hamshirasi o‘rtasida jonli video/audio konsultatsiya xonasini ochish' })
  startSession(
    @Body() body: { examinationId: string; nurseId: string },
    @CurrentUser('id') doctorId: string,
  ) {
    return this.telemedService.createSession({
      examinationId: body.examinationId,
      doctorId,
      nurseId: body.nurseId,
    });
  }

  @Post('session/:id/end')
  @ApiOperation({ summary: 'Konsultatsiyani yakunlash va xulosalarni saqlash' })
  endSession(
    @Param('id') sessionId: string,
    @Body() body: { notes?: string; recordingKey?: string },
  ) {
    return this.telemedService.endSession(sessionId, body.notes, body.recordingKey);
  }

  @Get('sessions/:examinationId')
  @ApiOperation({ summary: 'Tekshiruv bo‘yicha o‘tkazilgan telemeditsina konsultatsiyalari tarixi' })
  getSessionHistory(@Param('examinationId') examinationId: string) {
    return this.telemedService.getSessionHistory(examinationId);
  }
}
