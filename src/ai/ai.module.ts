import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';
import { AiClientService } from './ai-client.service';
import { AiQueueProcessor } from './ai-queue.processor';
import { AiController } from './ai.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'medical-ai-queue',
    }),
    ConfigModule,
    NotificationsModule,
    StorageModule,
  ],
  controllers: [AiController],
  providers: [AiClientService, AiQueueProcessor],
  exports: [AiClientService, BullModule],
})
export class AiModule {}
