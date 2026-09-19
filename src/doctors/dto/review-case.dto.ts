import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { DoctorDecision } from '@prisma/client';

export class ReviewCaseDto {
  @ApiProperty({ example: 'uuid-examination-id' })
  @IsString()
  @IsNotEmpty()
  examinationId: string;

  @ApiProperty({ enum: DoctorDecision, example: DoctorDecision.APPROVED })
  @IsEnum(DoctorDecision)
  decision: DoctorDecision;

  @ApiProperty({
    example: 'Chap tomonlama o‘tkir o‘choqli pnevmoniya, o‘rtacha og‘ir kechishi.',
    description: 'Shifokor tomonidan tasdiqlangan yakuniy klinik tashxis',
  })
  @IsString()
  @IsNotEmpty({ message: 'Yakuniy klinik tashxis kiritilishi shart' })
  finalDiagnosis: string;

  @ApiPropertyOptional({
    example: 'Sefriakson 1.0g kunda 2 marta m/o 5 kun. Ko‘p suyuqlik ichish va ambulator nazorat.',
  })
  @IsOptional()
  @IsString()
  recommendations?: string;

  @ApiPropertyOptional({
    example: 'Rentgenogrammadagi soyalanish AI aniqlagan lokalizatsiya bilan to‘liq mos keldi.',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    example: 'ED25519-SIG-7789-JAMSHID-XODJAYEV-TASHKENT-REPUBLIC-MED',
    description: 'Shifokorning elektron raqamli imzosi (ERI)',
  })
  @IsOptional()
  @IsString()
  digitalSignature?: string;
}

export class RequestReanalysisDto {
  @ApiProperty({ example: 'uuid-examination-id' })
  @IsString()
  @IsNotEmpty()
  examinationId: string;

  @ApiProperty({ example: 'Iltimos, plevral sinuslarni qayta sinchiklab tahlil qiling' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
