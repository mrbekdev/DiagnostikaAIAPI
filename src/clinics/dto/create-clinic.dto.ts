import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateClinicDto {
  @ApiProperty({ example: 'Mobil Brigada #4 - Xorazm (Xiva tumani)' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '90 855 DAA' })
  @IsString()
  @IsNotEmpty()
  plateNumber: string;

  @ApiProperty({ example: 'Xorazm' })
  @IsString()
  @IsNotEmpty()
  region: string;

  @ApiProperty({ example: 'Xiva' })
  @IsString()
  @IsNotEmpty()
  district: string;

  @ApiPropertyOptional({ example: 41.3783 })
  @IsOptional()
  @IsNumber()
  currentLat?: number;

  @ApiPropertyOptional({ example: 60.3639 })
  @IsOptional()
  @IsNumber()
  currentLng?: number;

  @ApiPropertyOptional({ example: 'uuid-nurse-id' })
  @IsOptional()
  @IsString()
  assignedNurseId?: string;
}

export class UpdateLocationDto {
  @ApiProperty({ example: 41.2995 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: 69.2401 })
  @IsNumber()
  longitude: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isOnline?: boolean;
}
