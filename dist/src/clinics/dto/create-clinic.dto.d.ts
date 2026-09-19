export declare class CreateClinicDto {
    name: string;
    plateNumber: string;
    region: string;
    district: string;
    currentLat?: number;
    currentLng?: number;
    assignedNurseId?: string;
}
export declare class UpdateLocationDto {
    latitude: number;
    longitude: number;
    isOnline?: boolean;
}
