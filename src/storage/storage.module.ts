import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MinioStorageService } from './storage.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [MinioStorageService],
  exports: [MinioStorageService],
})
export class StorageModule {}
