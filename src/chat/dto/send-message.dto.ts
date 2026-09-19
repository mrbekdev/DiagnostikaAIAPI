import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({ example: 'user-uuid-here', description: 'Xabarni qabul qiluvchi shifokor/hamshira ID si' })
  @IsNotEmpty()
  @IsString()
  receiverId: string;

  @ApiProperty({ example: 'Assalomu alaykum, bemor rentgen tahlilini ko‘rib bering.', description: 'Xabar matni' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiPropertyOptional({ example: 'http://localhost:3001/api/v1/diagnostics/file/...', description: 'Biriktirilgan tibbiy fayl havolasi' })
  @IsOptional()
  @IsString()
  fileUrl?: string;
}
