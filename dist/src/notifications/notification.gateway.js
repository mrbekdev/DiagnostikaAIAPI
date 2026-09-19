"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var NotificationGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const common_1 = require("@nestjs/common");
const socket_io_1 = require("socket.io");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
let NotificationGateway = NotificationGateway_1 = class NotificationGateway {
    constructor(jwtService, configService) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.logger = new common_1.Logger(NotificationGateway_1.name);
    }
    async handleConnection(client) {
        try {
            const authHeader = client.handshake.headers.authorization || client.handshake.auth?.token;
            if (!authHeader) {
                this.logger.debug(`Anonymous client connected: ${client.id}`);
                return;
            }
            const token = authHeader.replace('Bearer ', '');
            const secret = this.configService.get('JWT_SECRET', 'super-secret-telemed-jwt-key-uzbekistan-2026-secure-random');
            const payload = this.jwtService.verify(token, { secret });
            client.data.user = payload;
            client.join(`role:${payload.role}`);
            client.join(`user:${payload.sub}`);
            this.logger.log(`User connected to Socket.IO: ${payload.email} (Role: ${payload.role})`);
        }
        catch (err) {
            this.logger.warn(`WebSocket auth error for client ${client.id}: ${err.message}`);
        }
    }
    handleDisconnect(client) {
        this.logger.debug(`Client disconnected: ${client.id}`);
    }
    handleJoinCase(client, data) {
        if (data?.examinationId) {
            client.join(`exam:${data.examinationId}`);
            this.logger.log(`Client ${client.id} joined exam room: exam:${data.examinationId}`);
            return { status: 'joined', room: `exam:${data.examinationId}` };
        }
    }
    emitAiAnalysisStarted(examinationId, data) {
        this.server.to(`exam:${examinationId}`).emit('ai:started', { examinationId, ...data });
        this.server.emit('global:ai_progress', { examinationId, status: 'PROCESSING' });
    }
    emitAiAnalysisFinished(examinationId, result) {
        this.server.to(`exam:${examinationId}`).emit('ai:finished', result);
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
    emitDoctorReviewCompleted(examinationId, review) {
        this.server.to(`exam:${examinationId}`).emit('doctor:reviewed', review);
        this.server.emit('global:stats_updated', { trigger: 'doctor_review' });
    }
    emitTelemetryUpdate(clinicId, telemetry) {
        this.server.emit('clinic:telemetry', { clinicId, ...telemetry });
    }
};
exports.NotificationGateway = NotificationGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], NotificationGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join-case'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], NotificationGateway.prototype, "handleJoinCase", null);
exports.NotificationGateway = NotificationGateway = NotificationGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
        namespace: '/realtime',
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService])
], NotificationGateway);
//# sourceMappingURL=notification.gateway.js.map