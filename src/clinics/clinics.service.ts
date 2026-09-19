import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClinicDto, UpdateLocationDto } from './dto/create-clinic.dto';

@Injectable()
export class ClinicsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.mobileClinic.findMany({
      include: {
        assignedNurse: {
          select: { id: true, fullName: true, phone: true, email: true },
        },
        _count: {
          select: { examinations: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findLive() {
    return this.prisma.mobileClinic.findMany({
      select: {
        id: true,
        name: true,
        plateNumber: true,
        region: true,
        district: true,
        currentLat: true,
        currentLng: true,
        isOnline: true,
        lastPing: true,
        assignedNurse: {
          select: { id: true, fullName: true, phone: true },
        },
        _count: {
          select: {
            examinations: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const clinic = await this.prisma.mobileClinic.findUnique({
      where: { id },
      include: {
        assignedNurse: {
          select: { id: true, fullName: true, phone: true, email: true },
        },
        examinations: {
          include: {
            patient: true,
            aiResults: true,
          },
          take: 20,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!clinic) {
      throw new NotFoundException(`Mobil klinika topilmadi (ID: ${id})`);
    }

    return clinic;
  }

  async create(dto: CreateClinicDto) {
    const existing = await this.prisma.mobileClinic.findUnique({
      where: { plateNumber: dto.plateNumber },
    });
    if (existing) {
      throw new ConflictException(`Ushbu davlat raqamli (${dto.plateNumber}) klinika allaqachon mavjud`);
    }

    return this.prisma.mobileClinic.create({
      data: dto,
      include: {
        assignedNurse: true,
      },
    });
  }

  async updateLocation(id: string, dto: UpdateLocationDto) {
    await this.findOne(id);
    return this.prisma.mobileClinic.update({
      where: { id },
      data: {
        currentLat: dto.latitude,
        currentLng: dto.longitude,
        isOnline: dto.isOnline ?? true,
        lastPing: new Date(),
      },
    });
  }
}
