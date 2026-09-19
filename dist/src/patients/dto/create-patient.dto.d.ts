import { Gender } from '@prisma/client';
export declare class CreatePatientDto {
    fullName: string;
    pinfl: string;
    passport: string;
    birthDate: string;
    age: number;
    gender: Gender;
    region: string;
    district: string;
    village: string;
    latitude?: number;
    longitude?: number;
    phone?: string;
    complaints?: string;
}
export declare class UpdatePatientDto {
    fullName?: string;
    age?: number;
    village?: string;
    phone?: string;
    complaints?: string;
}
