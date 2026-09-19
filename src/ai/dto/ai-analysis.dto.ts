import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { FileType } from '@prisma/client';

export class TriggerAiAnalysisDto {
  @ApiProperty({ example: 'uuid-exam-id' })
  @IsString()
  @IsNotEmpty()
  examinationId: string;

  @ApiProperty({ example: 'uuid-upload-id' })
  @IsString()
  @IsNotEmpty()
  uploadId: string;

  @ApiProperty({ enum: FileType, example: FileType.XRAY })
  @IsEnum(FileType)
  fileType: FileType;

  @ApiPropertyOptional({ example: 'Bemor shikoyati: qattiq yo‘tal va isitma' })
  @IsOptional()
  @IsString()
  patientContext?: string;
}

export class VoiceTriageDto {
  @ApiProperty({ example: 'Boshim juda qattiq og‘riyapti va ko‘zlarim qorong‘ilashyapti' })
  @IsString()
  @IsNotEmpty()
  transcriptText: string;

  @ApiPropertyOptional({ example: 'Ergash Normurodovich, 62 yosh' })
  @IsOptional()
  @IsString()
  patientInfo?: string;
}
