import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DoctorsService } from './doctors.service';
import { ReviewCaseDto, RequestReanalysisDto } from './dto/review-case.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RiskLevel, UserRole } from '@prisma/client';

@ApiTags('Doctor Review & Tele-Consultation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get('list')
  @ApiOperation({ summary: 'Barcha mavjud mutaxassis shifokorlar ro‘yxati' })
  getDoctorsList() {
    return this.doctorsService.getDoctorsList();
  }

  @Get('worklist')
  @Roles(
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.DOCTOR,
    UserRole.CARDIOLOGIST,
    UserRole.RADIOLOGIST,
    UserRole.ONCOLOGIST,
    UserRole.NEUROLOGIST,
    UserRole.NURSE,
  )
  @ApiOperation({ summary: 'Shifokor ish stoli: ko‘rib chiqish kutilayotgan shoshilinch holatlar navbati' })
  @ApiQuery({ name: 'riskLevel', enum: RiskLevel, required: false })
  @ApiQuery({ name: 'status', required: false })
  getDoctorWorklist(
    @Query('riskLevel') riskLevel?: RiskLevel,
    @Query('status') status?: string,
  ) {
    return this.doctorsService.getDoctorWorklist({ riskLevel, status });
  }

  @Post('review')
  @Roles(
    UserRole.DOCTOR,
    UserRole.CARDIOLOGIST,
    UserRole.RADIOLOGIST,
    UserRole.ONCOLOGIST,
    UserRole.NEUROLOGIST,
    UserRole.SUPER_ADMIN,
  )
  @ApiOperation({ summary: 'Tibbiy xulosani tasdiqlash va raqamli imzo (ERI) bilan yakunlash' })
  submitReview(@Body() dto: ReviewCaseDto, @CurrentUser('id') doctorId: string) {
    return this.doctorsService.submitReview(dto, doctorId);
  }

  @Post('reanalysis')
  @Roles(
    UserRole.DOCTOR,
    UserRole.CARDIOLOGIST,
    UserRole.RADIOLOGIST,
    UserRole.SUPER_ADMIN,
  )
  @ApiOperation({ summary: 'SI modelidan tasvirni qayta chuqur tahlil qilishni so‘rash' })
  requestReanalysis(
    @Body() dto: RequestReanalysisDto,
    @CurrentUser('id') doctorId: string,
  ) {
    return this.doctorsService.requestReanalysis(dto, doctorId);
  }
}
