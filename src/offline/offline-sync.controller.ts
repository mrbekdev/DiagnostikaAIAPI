import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OfflineSyncService } from './offline-sync.service';
import { OfflineSyncBatchDto } from './dto/offline-sync.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Rural Offline Synchronization')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('offline')
export class OfflineSyncController {
  constructor(private readonly syncService: OfflineSyncService) {}

  @Post('sync')
  @ApiOperation({
    summary: 'Internet aloqasi yo‘q tog‘li/cho‘l qishloqlarda to‘plangan ma’lumotlarni sinxronizatsiya qilish',
  })
  syncOfflineBatch(
    @Body() dto: OfflineSyncBatchDto,
    @CurrentUser('id') nurseId: string,
  ) {
    return this.syncService.processSyncBatch(dto, nurseId);
  }
}
