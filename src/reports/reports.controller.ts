import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Medical Reports & Telemedicine Documents')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Public()
  @Get('examination/:examinationId')
  @ApiOperation({ summary: 'Tekshiruv bo‘yicha rasmiy telemeditsina xulosasi va pasportini yuklash (JSON/PDF Format)' })
  getClinicalReport(@Param('examinationId') examinationId: string) {
    return this.reportsService.generateClinicalReport(examinationId);
  }
}
