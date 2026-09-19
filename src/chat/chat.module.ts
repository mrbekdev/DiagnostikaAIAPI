import { Module, forwardRef } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { TelemedicineModule } from '../telemedicine/telemedicine.module';

@Module({
  imports: [PrismaModule, forwardRef(() => TelemedicineModule)],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
