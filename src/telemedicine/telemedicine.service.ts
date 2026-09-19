import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TelemedicineService {
  constructor(private prisma: PrismaService) {}

  async createSession(params: {
    examinationId: string;
    doctorId: string;
    nurseId: string;
  }) {
    const roomName = `telemed-room-${params.examinationId}-${Date.now()}`;
    return this.prisma.telemedicineSession.create({
      data: {
        examinationId: params.examinationId,
        doctorId: params.doctorId,
        nurseId: params.nurseId,
        roomName,
        startedAt: new Date(),
      },
      include: {
        examination: {
          include: { patient: true },
        },
        doctor: {
          select: { id: true, fullName: true, specialty: true },
        },
        nurse: {
          select: { id: true, fullName: true, phone: true },
        },
      },
    });
  }

  async endSession(sessionId: string, notes?: string, recordingKey?: string) {
    const session = await this.prisma.telemedicineSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException(`Telemeditsina sessiyasi topilmadi (ID: ${sessionId})`);
    }

    const endedAt = new Date();
    const durationSec = Math.floor((endedAt.getTime() - session.startedAt.getTime()) / 1000);

    return this.prisma.telemedicineSession.update({
      where: { id: sessionId },
      data: {
        endedAt,
        durationSec,
        notes,
        recordingKey,
      },
    });
  }

  async getSessionHistory(examinationId: string) {
    return this.prisma.telemedicineSession.findMany({
      where: { examinationId },
      include: {
        doctor: { select: { id: true, fullName: true, specialty: true } },
        nurse: { select: { id: true, fullName: true } },
      },
      orderBy: { startedAt: 'desc' },
    });
  }
}
