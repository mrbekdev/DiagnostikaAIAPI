import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PatientsService } from './patients.service';
import { CreatePatientDto, UpdatePatientDto } from './dto/create-patient.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Patients Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  @ApiOperation({ summary: 'Barcha bemorlar ro‘yxatini qidiruv va filtrlash bilan olish' })
  @ApiQuery({ name: 'search', required: false, description: 'F.I.Sh., PINFL, Pasport yoki qishloq nomi' })
  @ApiQuery({ name: 'region', required: false })
  @ApiQuery({ name: 'district', required: false })
  @ApiQuery({ name: 'village', required: false })
  @ApiQuery({ name: 'skip', required: false })
  @ApiQuery({ name: 'take', required: false })
  findAll(
    @Query('search') search?: string,
    @Query('region') region?: string,
    @Query('district') district?: string,
    @Query('village') village?: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.patientsService.findAll({ search, region, district, village, skip, take });
  }

  @Get('search/pinfl')
  @ApiOperation({ summary: 'PINFL yoki Pasport orqali bemorni tezkor topish' })
  @ApiQuery({ name: 'q', required: true, description: 'PINFL yoki Pasport' })
  findByPinfl(@Query('q') query: string) {
    return this.patientsService.findByPinflOrPassport(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Bemorning to‘liq tibbiy kartasi va barcha tekshiruvlarini olish' })
  findOne(@Param('id') id: string) {
    return this.patientsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Yangi bemorni ro‘yxatdan o‘tkazish (Hamshira / Shifokor)' })
  create(@Body() dto: CreatePatientDto, @CurrentUser('id') createdById: string) {
    return this.patientsService.create(dto, createdById);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Bemor ma’lumotlarini yangilash' })
  update(@Param('id') id: string, @Body() dto: UpdatePatientDto) {
    return this.patientsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Bemorni o‘chirish' })
  remove(@Param('id') id: string) {
    return this.patientsService.remove(id);
  }
}
