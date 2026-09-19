import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
export declare class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    private configService;
    server: Server;
    private readonly logger;
    constructor(jwtService: JwtService, configService: ConfigService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleJoinCase(client: Socket, data: {
        examinationId: string;
    }): {
        status: string;
        room: string;
    };
    emitAiAnalysisStarted(examinationId: string, data: any): void;
    emitAiAnalysisFinished(examinationId: string, result: any): void;
    emitDoctorReviewCompleted(examinationId: string, review: any): void;
    emitTelemetryUpdate(clinicId: string, telemetry: any): void;
}
