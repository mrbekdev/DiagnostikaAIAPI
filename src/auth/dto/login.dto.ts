import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@telemed.uz', description: 'Foydalanuvchi elektron pochtasi' })
  @IsEmail({}, { message: "To'g'ri email manzilini kiriting" })
  @IsNotEmpty({ message: 'Email kiritilishi shart' })
  email: string;

  @ApiProperty({ example: 'Admin12345!', description: 'Maxfiy parol' })
  @IsString()
  @IsNotEmpty({ message: 'Parol kiritilishi shart' })
  @MinLength(6, { message: "Parol kamida 6 ta belgidan iborat bo'lishi kerak" })
  password: string;
}
