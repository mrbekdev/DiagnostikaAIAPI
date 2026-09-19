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
var TelemedicineGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelemedicineGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const common_1 = require("@nestjs/common");
const socket_io_1 = require("socket.io");
const prisma_service_1 = require("../prisma/prisma.service");
let TelemedicineGateway = TelemedicineGateway_1 = class TelemedicineGateway {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(TelemedicineGateway_1.name);
        this.userSockets = new Map();
        this.socketToUser = new Map();
    }
    handleConnection(client) {
        this.logger.log(`Socket client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        const userId = this.socketToUser.get(client.id);
        if (userId) {
            const sockets = this.userSockets.get(userId);
            if (sockets) {
                sockets.delete(client.id);
                if (sockets.size === 0) {
                    this.userSockets.delete(userId);
                    this.server.emit('user-status-changed', { userId, status: 'OFFLINE' });
                }
            }
            this.socketToUser.delete(client.id);
            this.logger.log(`User ${userId} disconnected (Socket: ${client.id})`);
        }
    }
    handleRegisterUser(client, data) {
        if (!data?.userId)
            return;
        this.socketToUser.set(client.id, data.userId);
        if (!this.userSockets.has(data.userId)) {
            this.userSockets.set(data.userId, new Set());
        }
        this.userSockets.get(data.userId).add(client.id);
        client.join(`user_${data.userId}`);
        this.logger.log(`User registered: ${data.userId} on socket ${client.id}`);
        this.server.emit('user-status-changed', { userId: data.userId, status: 'ONLINE' });
        const onlineUserIds = Array.from(this.userSockets.keys());
        client.emit('online-users', { onlineUserIds });
        return { status: 'registered', onlineUserIds };
    }
    async handleSendDirectMessage(client, data) {
        if (!data?.senderId || !data?.receiverId || !data?.content)
            return;
        try {
            let safeSenderId = data.senderId;
            const sender = await this.prisma.user.findUnique({ where: { id: data.senderId } });
            if (!sender) {
                const fallback = await this.prisma.user.findFirst();
                if (fallback)
                    safeSenderId = fallback.id;
            }
            let safeReceiverId = data.receiverId;
            const receiver = await this.prisma.user.findUnique({ where: { id: data.receiverId } });
            if (!receiver) {
                const fallbackReceiver = await this.prisma.user.findFirst({ where: { id: { not: safeSenderId } } });
                if (fallbackReceiver)
                    safeReceiverId = fallbackReceiver.id;
            }
            const message = await this.prisma.chatMessage.create({
                data: {
                    senderId: safeSenderId,
                    receiverId: safeReceiverId,
                    content: data.content,
                    fileUrl: data.fileUrl,
                },
                include: {
                    sender: {
                        select: { id: true, fullName: true, role: true, specialty: true },
                    },
                    receiver: {
                        select: { id: true, fullName: true, role: true, specialty: true },
                    },
                },
            });
            this.server.to(`user_${safeReceiverId}`).emit('new-direct-message', message);
            this.server.to(`user_${safeSenderId}`).emit('new-direct-message', message);
            return { success: true, message };
        }
        catch (err) {
            this.logger.error(`Failed to persist chat message: ${err.message}`);
            return { success: false, error: err.message };
        }
    }
    handleCallUser(client, data) {
        this.logger.log(`Call initiated from ${data.caller?.fullName} to User ${data.targetUserId}`);
        this.server.to(`user_${data.targetUserId}`).emit('incoming-call', {
            caller: data.caller,
            roomName: data.roomName,
            callType: data.callType || 'video',
        });
    }
    handleAcceptCall(client, data) {
        this.logger.log(`Call accepted by ${data.acceptor?.fullName} for room: ${data.roomName}`);
        this.server.to(`user_${data.callerId}`).emit('call-accepted', {
            roomName: data.roomName,
            acceptor: data.acceptor,
        });
    }
    handleRejectCall(client, data) {
        this.logger.log(`Call rejected for room: ${data.roomName}`);
        this.server.to(`user_${data.callerId}`).emit('call-rejected', {
            roomName: data.roomName,
            reason: data.reason || 'Foydalanuvchi band yoki qo‘ng‘iroqni rad etdi.',
        });
    }
    handleEndCall(client, data) {
        if (data.roomName) {
            this.server.to(data.roomName).emit('call-ended', { roomName: data.roomName });
        }
        if (data.targetUserId) {
            this.server.to(`user_${data.targetUserId}`).emit('call-ended', { roomName: data.roomName });
        }
    }
    handleJoinRoom(client, data) {
        client.join(data.roomName);
        this.logger.log(`User ${data.user?.name} joined WebRTC room: ${data.roomName}`);
        client.to(data.roomName).emit('user-connected', {
            socketId: client.id,
            user: data.user,
        });
        return { status: 'joined', room: data.roomName };
    }
    handleOffer(client, data) {
        if (data.targetSocketId) {
            this.server.to(data.targetSocketId).emit('offer', {
                offer: data.offer,
                fromSocketId: client.id,
                senderName: data.senderName,
            });
        }
        else {
            client.to(data.roomName).emit('offer', {
                offer: data.offer,
                fromSocketId: client.id,
                senderName: data.senderName,
            });
        }
    }
    handleAnswer(client, data) {
        if (data.targetSocketId) {
            this.server.to(data.targetSocketId).emit('answer', {
                answer: data.answer,
                fromSocketId: client.id,
            });
        }
        else if (data.roomName) {
            client.to(data.roomName).emit('answer', {
                answer: data.answer,
                fromSocketId: client.id,
            });
        }
    }
    handleIceCandidate(client, data) {
        if (data.targetSocketId) {
            this.server.to(data.targetSocketId).emit('ice-candidate', {
                candidate: data.candidate,
                fromSocketId: client.id,
            });
        }
        else {
            client.to(data.roomName).emit('ice-candidate', {
                candidate: data.candidate,
                fromSocketId: client.id,
            });
        }
    }
    handleLeaveRoom(client, data) {
        client.leave(data.roomName);
        client.to(data.roomName).emit('user-disconnected', { socketId: client.id, userId: data.userId });
    }
};
exports.TelemedicineGateway = TelemedicineGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], TelemedicineGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('register-user'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], TelemedicineGateway.prototype, "handleRegisterUser", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('send-direct-message'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], TelemedicineGateway.prototype, "handleSendDirectMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('call-user'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], TelemedicineGateway.prototype, "handleCallUser", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('accept-call'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], TelemedicineGateway.prototype, "handleAcceptCall", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('reject-call'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], TelemedicineGateway.prototype, "handleRejectCall", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('end-call'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], TelemedicineGateway.prototype, "handleEndCall", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('join-room'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], TelemedicineGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('offer'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], TelemedicineGateway.prototype, "handleOffer", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('answer'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], TelemedicineGateway.prototype, "handleAnswer", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('ice-candidate'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], TelemedicineGateway.prototype, "handleIceCandidate", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave-room'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], TelemedicineGateway.prototype, "handleLeaveRoom", null);
exports.TelemedicineGateway = TelemedicineGateway = TelemedicineGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: { origin: '*' },
        namespace: '/telemedicine-signaling',
    }),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TelemedicineGateway);
//# sourceMappingURL=telemedicine.gateway.js.map