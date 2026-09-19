import { Module } from '@nestjs/common';
import { TelemedicineService } from './telemedicine.service';
import { TelemedicineController } from './telemedicine.controller';
import { TelemedicineGateway } from './telemedicine.gateway';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TelemedicineController],
  providers: [TelemedicineService, TelemedicineGateway],
  exports: [TelemedicineService, TelemedicineGateway],
})
export class TelemedicineModule {}
