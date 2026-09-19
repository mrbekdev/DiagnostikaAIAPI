import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
import { DiagnosticsService } from './diagnostics.service';
import { CreateExaminationDto, UploadDiagnosticDto } from './dto/create-examination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { ExaminationStatus, FileType, RiskLevel } from '@prisma/client';

@ApiTags('Diagnostics & File Uploads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('diagnostics')
export class DiagnosticsController {
  constructor(private readonly diagnosticsService: DiagnosticsService) {}

  @Post('examinations')
  @ApiOperation({ summary: 'Yangi tibbiy tekshiruv (tashrif) kartasini ochish' })
  createExamination(
    @Body() dto: CreateExaminationDto,
    @CurrentUser('id') nurseId: string,
  ) {
    return this.diagnosticsService.createExamination(dto, nurseId);
  }

  @Post('examinations/:id/send-to-doctor')
  @ApiOperation({ summary: 'Tekshiruvni tanlangan shifokorga ko‘rib chiqish uchun yuborish' })
  sendToDoctor(
    @Param('id') examinationId: string,
    @Body() dto: { doctorId: string; notes?: string; priority?: number },
  ) {
    return this.diagnosticsService.sendToDoctor(examinationId, dto);
  }

  @Post('examinations/:id/upload')
  @ApiOperation({ summary: 'Tibbiy fayl yuklash (Rentgen, EKG, Qon tahlili - maks 200MB) va SI tahliliga yuborish' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        fileType: { type: 'string', enum: ['XRAY', 'ECG', 'BLOOD'], example: 'XRAY' },
        metadataJson: { type: 'string', example: '{"bodyPart": "CHEST", "view": "PA"}' },
      },
      required: ['file', 'fileType'],
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 200 * 1024 * 1024 }, // 200MB
      fileFilter: (req, file, cb) => {
        // Supported: JPG, PNG, DICOM (.dcm), PDF, CSV
        const allowedExtensions = /\.(jpg|jpeg|png|dcm|dicom|pdf|csv)$/i;
        if (!file.originalname.match(allowedExtensions)) {
          return cb(
            new BadRequestException(
              'Ruxsat etilmagan fayl formati. Faqat JPG, PNG, DICOM (.dcm), PDF va CSV fayllari qabul qilinadi.',
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  uploadDiagnosticFile(
    @Param('id') examinationId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('fileType') fileType: FileType,
    @Body('metadataJson') metadataJson?: string,
  ) {
    return this.diagnosticsService.uploadDiagnosticFile(
      examinationId,
      file,
      fileType,
      metadataJson,
    );
  }

  @Get('examinations/:id')
  @ApiOperation({ summary: 'Tekshiruv tafsilotlari, barcha fayllar, SI natijalari va shifokor xulosasini ko‘rish' })
  getExaminationDetails(@Param('id') id: string) {
    return this.diagnosticsService.getExaminationDetails(id);
  }

  @Get('examinations')
  @ApiOperation({ summary: 'Tekshiruvlar ro‘yxati (xavf darajasi va status bo‘yicha filtr)' })
  @ApiQuery({ name: 'status', enum: ExaminationStatus, required: false })
  @ApiQuery({ name: 'riskLevel', enum: RiskLevel, required: false })
  @ApiQuery({ name: 'patientId', required: false })
  @ApiQuery({ name: 'skip', required: false })
  @ApiQuery({ name: 'take', required: false })
  listExaminations(
    @Query('status') status?: ExaminationStatus,
    @Query('riskLevel') riskLevel?: RiskLevel,
    @Query('patientId') patientId?: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.diagnosticsService.listExaminations({ status, riskLevel, patientId, skip, take });
  }

  @Public()
  @Get('file/:key(*)')
  @ApiOperation({ summary: 'Yuklangan tibbiy faylni to‘g‘ridan-to‘g‘ri ko‘rish yoki yuklab olish' })
  async streamDiagnosticFile(@Param('key') key: string, @Res() res: any) {
    try {
      const decodedKey = decodeURIComponent(key);
      const buffer = await this.diagnosticsService.getFileBuffer(decodedKey);

      if (buffer.toString('utf-8', 0, 5).includes('<svg')) {
        res.setHeader('Content-Type', 'image/svg+xml');
      } else {
        const ext = decodedKey.split('.').pop()?.toLowerCase() || 'png';
        const mimeMap: Record<string, string> = {
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
    } catch {
      res.status(404).send('File not found');
    }
  }
}
