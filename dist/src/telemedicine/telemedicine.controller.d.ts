import { TelemedicineService } from './telemedicine.service';
export declare class TelemedicineController {
    private readonly telemedService;
    constructor(telemedService: TelemedicineService);
    startSession(body: {
        examinationId: string;
        nurseId: string;
    }, doctorId: string): Promise<{
        nurse: {
            id: string;
            fullName: string;
            phone: string;
        };
        examination: {
            patient: {
                id: string;
                fullName: string;
                phone: string | null;
                createdAt: Date;
                updatedAt: Date;
                region: string;
                district: string;
                pinfl: string;
                passport: string;
                birthDate: Date;
                age: number;
                gender: import(".prisma/client").$Enums.Gender;
                village: string;
                latitude: number | null;
                longitude: number | null;
                complaints: string | null;
                createdById: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.ExaminationStatus;
            priority: number;
            riskLevel: import(".prisma/client").$Enums.RiskLevel | null;
            nurseNotes: string | null;
            syncId: string | null;
            patientId: string;
            clinicId: string | null;
            nurseId: string;
        };
        doctor: {
            id: string;
            fullName: string;
            specialty: string;
        };
    } & {
        id: string;
        nurseId: string;
        examinationId: string;
        notes: string | null;
        doctorId: string;
        roomName: string;
        startedAt: Date;
        endedAt: Date | null;
        durationSec: number | null;
        recordingKey: string | null;
    }>;
    endSession(sessionId: string, body: {
        notes?: string;
        recordingKey?: string;
    }): Promise<{
        id: string;
        nurseId: string;
        examinationId: string;
        notes: string | null;
        doctorId: string;
        roomName: string;
        startedAt: Date;
        endedAt: Date | null;
        durationSec: number | null;
        recordingKey: string | null;
    }>;
    getSessionHistory(examinationId: string): Promise<({
        nurse: {
            id: string;
            fullName: string;
        };
        doctor: {
            id: string;
            fullName: string;
            specialty: string;
        };
    } & {
        id: string;
        nurseId: string;
        examinationId: string;
        notes: string | null;
        doctorId: string;
        roomName: string;
        startedAt: Date;
        endedAt: Date | null;
        durationSec: number | null;
        recordingKey: string | null;
    })[]>;
}
