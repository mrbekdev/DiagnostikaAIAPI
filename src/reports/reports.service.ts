import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MinioStorageService } from '../storage/storage.service';

@Injectable()
export class ReportsService {
  constructor(
    private prisma: PrismaService,
    private storage: MinioStorageService,
  ) {}

  async generateClinicalReport(examinationId: string) {
    const exam = await this.prisma.examination.findUnique({
      where: { id: examinationId },
      include: {
        patient: true,
        clinic: true,
        nurse: {
          select: { id: true, fullName: true, phone: true },
        },
        uploads: true,
        aiResults: {
          orderBy: { generatedAt: 'desc' },
        },
        doctorReviews: {
          include: {
            doctor: {
              select: { id: true, fullName: true, specialty: true, licenseNumber: true },
            },
          },
        },
      },
    });

    if (!exam) {
      throw new NotFoundException(`Tekshiruv topilmadi (ID: ${examinationId})`);
    }

    const latestAi = exam.aiResults[0] || null;
    const latestDoctorReview = exam.doctorReviews[0] || null;

    // Build structured official national telemedicine report
    return {
      reportId: `REP-${exam.id.substring(0, 8).toUpperCase()}`,
      issuedDate: new Date().toISOString(),
      platform: 'Hududiy SI-Mobil Diagnostika - O‘zbekiston Respublikasi Sog‘liqni Saqlash Telemeditsina Tizimi',
      patient: {
        fullName: exam.patient.fullName,
        pinfl: exam.patient.pinfl,
        passport: exam.patient.passport,
        age: exam.patient.age,
        gender: exam.patient.gender,
        region: exam.patient.region,
        district: exam.patient.district,
        village: exam.patient.village,
        complaints: exam.patient.complaints,
      },
      mobileClinic: exam.clinic
        ? {
            name: exam.clinic.name,
            plateNumber: exam.clinic.plateNumber,
            region: exam.clinic.region,
            nurse: exam.nurse?.fullName,
          }
        : null,
      preliminaryAiAssessment: latestAi
        ? {
            riskLevel: latestAi.riskLevel,
            confidencePercent: latestAi.confidence,
            modelVersion: latestAi.modelVersion,
            findings: latestAi.findings,
            technicalSummary: latestAi.technicalSummary,
            patientExplanationUzbek: latestAi.patientExplanationUzbek,
            disclaimer:
              'DIQQAT: Sun’iy intellekt tahlili faqat yordamchi skrining maqsadida taqdim etiladi va mustaqil yakuniy klinik tashxis hisoblanmaydi. Yakuniy tashxis litsenziyaga ega shifokor tomonidan tasdiqlangan.',
          }
        : null,
      doctorConfirmation: latestDoctorReview
        ? {
            doctorName: latestDoctorReview.doctor.fullName,
            specialty: latestDoctorReview.specialty,
            licenseNumber: latestDoctorReview.doctor.licenseNumber,
            decision: latestDoctorReview.decision,
            finalDiagnosis: latestDoctorReview.finalDiagnosis,
            recommendations: latestDoctorReview.recommendations,
            digitalSignature: latestDoctorReview.digitalSignature,
            approvedAt: latestDoctorReview.approvedAt,
          }
        : {
            status: 'PENDING_DOCTOR_REVIEW',
            message: 'Toshkentdagi mutaxassis shifokor ko‘rigi kutilmoqda.',
          },
      diagnosticFiles: exam.uploads.map((u) => ({
        id: u.id,
        fileType: u.fileType,
        originalName: u.originalName,
        uploadedAt: u.createdAt,
      })),
    };
  }
}
