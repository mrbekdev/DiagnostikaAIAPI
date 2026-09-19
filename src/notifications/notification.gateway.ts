import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/realtime',
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationGateway.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const authHeader = client.handshake.headers.authorization || client.handshake.auth?.token;
      if (!authHeader) {
        this.logger.debug(`Anonymous client connected: ${client.id}`);
        return;
      }

      const token = authHeader.replace('Bearer ', '');
      const secret = this.configService.get<string>(
        'JWT_SECRET',
        'super-secret-telemed-jwt-key-uzbekistan-2026-secure-random',
      );
      const payload = this.jwtService.verify(token, { secret });

      client.data.user = payload;
      // Join role room & user-specific room
      client.join(`role:${payload.role}`);
      client.join(`user:${payload.sub}`);

      this.logger.log(`User connected to Socket.IO: ${payload.email} (Role: ${payload.role})`);
    } catch (err) {
      this.logger.warn(`WebSocket auth error for client ${client.id}: ${err.message}`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-case')
  handleJoinCase(@ConnectedSocket() client: Socket, @MessageBody() data: { examinationId: string }) {
    if (data?.examinationId) {
      client.join(`exam:${data.examinationId}`);
      this.logger.log(`Client ${client.id} joined exam room: exam:${data.examinationId}`);
      return { status: 'joined', room: `exam:${data.examinationId}` };
    }
  }

  // Broadcasters
  emitAiAnalysisStarted(examinationId: string, data: any) {
    this.server.to(`exam:${examinationId}`).emit('ai:started', { examinationId, ...data });
    this.server.emit('global:ai_progress', { examinationId, status: 'PROCESSING' });
  }

  emitAiAnalysisFinished(examinationId: string, result: any) {
    this.server.to(`exam:${examinationId}`).emit('ai:finished', result);
    // Alert doctor rooms and super admins
    this.server.to('role:DOCTOR').to('role:RADIOLOGIST').to('role:CARDIOLOGIST').to('role:SUPER_ADMIN').emit('doctor:new_case', {
      examinationId,
      result,
    });

    if (result.riskLevel === 'CRITICAL' || result.riskLevel === 'HIGH') {
      this.server.emit('emergency:alert', {
        examinationId,
        riskLevel: result.riskLevel,
        confidence: result.confidence,
        timestamp: new Date().toISOString(),
      });
    }
  }

  emitDoctorReviewCompleted(examinationId: string, review: any) {
    this.server.to(`exam:${examinationId}`).emit('doctor:reviewed', review);
    this.server.emit('global:stats_updated', { trigger: 'doctor_review' });
  }

  emitTelemetryUpdate(clinicId: string, telemetry: any) {
    this.server.emit('clinic:telemetry', { clinicId, ...telemetry });
  }
}
