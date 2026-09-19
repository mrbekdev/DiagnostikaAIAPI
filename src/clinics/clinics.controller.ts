import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ClinicsService } from './clinics.service';
import { CreateClinicDto, UpdateLocationDto } from './dto/create-clinic.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Mobile Clinics')
@Controller('clinics')
export class ClinicsController {
  constructor(private readonly clinicsService: ClinicsService) {}

  @Public()
  @Get('live')
  @ApiOperation({ summary: 'Barcha mobil klinikalarning jonli GPS joylashuvlari va holatini olish' })
  getLiveClinics() {
    return this.clinicsService.findLive();
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mobil klinikalar to‘liq ro‘yxati' })
  findAll() {
    return this.clinicsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bitta mobil klinika tafsilotlari va tekshiruvlari' })
  findOne(@Param('id') id: string) {
    return this.clinicsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Yangi mobil klinika qo‘shish' })
  create(@Body() dto: CreateClinicDto) {
    return this.clinicsService.create(dto);
  }

  @Put(':id/location')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mobil klinika GPS koordinatalarini jonli yangilash (GPS Telemetriya)' })
  updateLocation(@Param('id') id: string, @Body() dto: UpdateLocationDto) {
    return this.clinicsService.updateLocation(id, dto);
  }
}
