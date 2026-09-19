import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MapService } from './map.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Uzbekistan Map & GIS Telemetry')
@Controller('map')
export class MapController {
  constructor(private readonly mapService: MapService) {}

  @Public()
  @Get('dashboard/live')
  @ApiOperation({ summary: 'Jonli monitoring paneli statistikasi (Live Dashboard Telemetry)' })
  @ApiResponse({ status: 200, description: 'Qamrab olingan qishloqlar, tekshirilgan bemorlar, zudlik talab holatlar' })
  getDashboardStats() {
    return this.mapService.getDashboardStatistics();
  }

  @Public()
  @Get('coverage')
  @ApiOperation({ summary: 'O‘zbekiston viloyatlari bo‘yicha mobil diagnostika qamrovi' })
  getCoverage() {
    return this.mapService.getCoverage();
  }

  @Public()
  @Get('regions/statistics')
  @ApiOperation({ summary: 'Hududlar va xavf darajalari bo‘yicha to‘liq tibbiy statistika' })
  getRegionStatistics() {
    return this.mapService.getRegionStatistics();
  }
}
