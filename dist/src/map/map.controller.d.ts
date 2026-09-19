import { MapService } from './map.service';
export declare class MapController {
    private readonly mapService;
    constructor(mapService: MapService);
    getDashboardStats(): Promise<{
        villagesCovered: number;
        patientsScreened: number;
        aiProcessedToday: number;
        urgentCases: number;
        confirmedDiagnoses: number;
        clinicOnlineCount: number;
        totalFleetCount: number;
        lastUpdated: string;
    }>;
    getCoverage(): Promise<{
        totalRegions: number;
        coverage: {
            region: string;
            patientsScreened: number;
            activeClinics: number;
            villagesReached: number;
            telemedicineReadiness: string;
        }[];
    }>;
    getRegionStatistics(): Promise<{
        riskDistribution: {
            riskLevel: import(".prisma/client").$Enums.RiskLevel;
            count: number;
        }[];
        statusDistribution: {
            status: import(".prisma/client").$Enums.ExaminationStatus;
            count: number;
        }[];
        regionalDetails: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.PatientGroupByOutputType, ("region" | "district")[]> & {
            _count: {
                id: number;
            };
        })[];
    }>;
}
