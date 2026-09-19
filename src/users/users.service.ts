import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(role?: UserRole, category?: string) {
    let whereClause: any = {};
    if (category === 'doctors') {
      whereClause.role = {
        in: [
          UserRole.DOCTOR,
          UserRole.CARDIOLOGIST,
          UserRole.RADIOLOGIST,
          UserRole.ONCOLOGIST,
          UserRole.NEUROLOGIST,
        ],
      };
    } else if (role) {
      whereClause.role = role;
    }

    return this.prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        specialty: true,
        licenseNumber: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        specialty: true,
        licenseNumber: true,
        digitalSignature: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            conductedExams: true,
            doctorReviews: true,
            createdPatients: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`Foydalanuvchi topilmadi (ID: ${id})`);
    }

    return user;
  }

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });
    if (existing) {
      throw new ConflictException('Ushbu email bilan ro‘yxatdan o‘tgan foydalanuvchi mavjud');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase().trim(),
        passwordHash,
        fullName: dto.fullName,
        phone: dto.phone,
        role: dto.role,
        specialty: dto.specialty,
        licenseNumber: dto.licenseNumber,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        specialty: true,
        licenseNumber: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        specialty: true,
        licenseNumber: true,
        digitalSignature: true,
        isActive: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
