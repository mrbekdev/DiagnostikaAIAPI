import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePatientDto } from '../../patients/dto/create-patient.dto';

export class OfflineExaminationItemDto {
  @ApiProperty({ example: 'sync-uuid-client-1234' })
  @IsString()
  @IsNotEmpty()
  clientSyncId: string;

  @ApiProperty({ example: '31508740120015' })
  @IsString()
  @IsNotEmpty()
  patientPinfl: string;

  @ApiPropertyOptional({ example: 'uuid-clinic-id' })
  @IsOptional()
  @IsString()
  clinicId?: string;

  @ApiPropertyOptional({ example: 'Oflayn rejimda qabul qilingan bemor, shikoyatlari qayd etildi' })
  @IsOptional()
  @IsString()
  nurseNotes?: string;

  @ApiProperty({ example: '2026-09-18T08:30:00.000Z' })
  @IsString()
  createdAt: string;
}

export class OfflineSyncBatchDto {
  @ApiProperty({ type: [CreatePatientDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePatientDto)
  patients: CreatePatientDto[];

  @ApiProperty({ type: [OfflineExaminationItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OfflineExaminationItemDto)
  examinations: OfflineExaminationItemDto[];
}
