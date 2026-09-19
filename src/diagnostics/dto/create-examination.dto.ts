import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { FileType } from '@prisma/client';

export class CreateExaminationDto {
  @ApiProperty({ example: 'uuid-patient-id' })
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @ApiPropertyOptional({ example: 'uuid-clinic-id' })
  @IsOptional()
  @IsString()
  clinicId?: string;

  @ApiPropertyOptional({
    example: 'Bemorning umumiy ahvoli: nafas olish tezlashgan, saturatsiya 92%',
  })
  @IsOptional()
  @IsString()
  nurseNotes?: string;

  @ApiPropertyOptional({ example: 'offline-client-sync-uuid-99' })
  @IsOptional()
  @IsString()
  syncId?: string;
}

export class UploadDiagnosticDto {
  @ApiProperty({ enum: FileType, example: FileType.XRAY })
  @IsEnum(FileType)
  fileType: FileType;

  @ApiPropertyOptional({ example: '{"modality": "CR", "view": "PA"}' })
  @IsOptional()
  @IsString()
  metadataJson?: string;
}
