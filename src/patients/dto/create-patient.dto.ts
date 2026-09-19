import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
  Max,
  IsDateString,
} from 'class-validator';
import { Gender } from '@prisma/client';

export class CreatePatientDto {
  @ApiProperty({ example: 'Ergash Normurodovich Sobirov' })
  @IsString()
  @IsNotEmpty({ message: 'Bemor F.I.Sh. kiritilishi shart' })
  fullName: string;

  @ApiProperty({ example: '31508740120015', description: '14 xonali JShShIR / PINFL' })
  @IsString()
  @Length(14, 14, { message: 'PINFL 14 xonali raqam bo‘lishi kerak' })
  pinfl: string;

  @ApiProperty({ example: 'AA4829104', description: 'Pasport / ID karta seriya va raqami' })
  @IsString()
  @IsNotEmpty()
  passport: string;

  @ApiProperty({ example: '1964-08-15' })
  @IsDateString()
  birthDate: string;

  @ApiProperty({ example: 62 })
  @IsNumber()
  @Min(0)
  @Max(130)
  age: number;

  @ApiProperty({ enum: Gender, example: Gender.MALE })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({ example: 'Surxondaryo' })
  @IsString()
  @IsNotEmpty()
  region: string;

  @ApiProperty({ example: 'Boysun' })
  @IsString()
  @IsNotEmpty()
  district: string;

  @ApiProperty({ example: 'Derbent qishlog‘i' })
  @IsString()
  @IsNotEmpty()
  village: string;

  @ApiPropertyOptional({ example: 38.1921 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: 67.0145 })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ example: '+998912345678' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    example: '3 kundan beri kuchli yo‘tal, hansirash va 38.5 daraja isitma',
  })
  @IsOptional()
  @IsString()
  complaints?: string;
}

export class UpdatePatientDto {
  @ApiPropertyOptional({ example: 'Ergash Normurodovich Sobirov' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ example: 62 })
  @IsOptional()
  @IsNumber()
  age?: number;

  @ApiPropertyOptional({ example: 'Derbent qishlog‘i' })
  @IsOptional()
  @IsString()
  village?: string;

  @ApiPropertyOptional({ example: '+998912345678' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: '3 kundan beri kuchli yo‘tal' })
  @IsOptional()
  @IsString()
  complaints?: string;
}
