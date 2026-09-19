import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OfflineSyncBatchDto } from './dto/offline-sync.dto';
import { ExaminationStatus } from '@prisma/client';

@Injectable()
export class OfflineSyncService {
  private readonly logger = new Logger(OfflineSyncService.name);

  constructor(private prisma: PrismaService) {}

  async processSyncBatch(dto: OfflineSyncBatchDto, nurseId: string) {
    this.logger.log(`Processing offline sync batch: ${dto.patients.length} patients, ${dto.examinations.length} exams.`);

    const syncedPatients: any[] = [];
    const syncedExaminations: any[] = [];
    const errors: any[] = [];

    // 1. Sync Patients (Upsert based on PINFL)
    for (const p of dto.patients) {
      try {
        const existing = await this.prisma.patient.findUnique({
          where: { pinfl: p.pinfl },
        });

        if (existing) {
          syncedPatients.push({ pinfl: p.pinfl, id: existing.id, status: 'ALREADY_EXISTS' });
        } else {
          const created = await this.prisma.patient.create({
            data: {
              ...p,
              birthDate: new Date(p.birthDate),
              createdById: nurseId,
            },
          });
          syncedPatients.push({ pinfl: p.pinfl, id: created.id, status: 'CREATED' });
        }
      } catch (err) {
        this.logger.error(`Error syncing patient ${p.pinfl}: ${err.message}`);
        errors.push({ type: 'PATIENT', pinfl: p.pinfl, error: err.message });
      }
    }

    // 2. Sync Examinations (Reconcile syncId)
    for (const ex of dto.examinations) {
      try {
        const patient = await this.prisma.patient.findUnique({
          where: { pinfl: ex.patientPinfl },
        });

        if (!patient) {
          errors.push({ type: 'EXAMINATION', syncId: ex.clientSyncId, error: `Bemor (PINFL: ${ex.patientPinfl}) topilmadi` });
          continue;
        }

        const existingExam = await this.prisma.examination.findUnique({
          where: { syncId: ex.clientSyncId },
        });

        if (existingExam) {
          syncedExaminations.push({ syncId: ex.clientSyncId, id: existingExam.id, status: 'ALREADY_SYNCED' });
        } else {
          const createdExam = await this.prisma.examination.create({
            data: {
              patientId: patient.id,
              clinicId: ex.clinicId,
              nurseId,
              nurseNotes: ex.nurseNotes,
              syncId: ex.clientSyncId,
              status: ExaminationStatus.DRAFT,
              createdAt: new Date(ex.createdAt || Date.now()),
            },
          });
          syncedExaminations.push({ syncId: ex.clientSyncId, id: createdExam.id, status: 'CREATED' });
        }
      } catch (err) {
        this.logger.error(`Error syncing exam ${ex.clientSyncId}: ${err.message}`);
        errors.push({ type: 'EXAMINATION', syncId: ex.clientSyncId, error: err.message });
      }
    }

    return {
      success: true,
      syncedAt: new Date().toISOString(),
      patientsSynced: syncedPatients.length,
      examinationsSynced: syncedExaminations.length,
      syncedPatients,
      syncedExaminations,
      errors,
    };
  }
}
