import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/telemedicine-signaling',
})
export class TelemedicineGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TelemedicineGateway.name);
  
  // Map of userId -> Set of active socketIds
  private userSockets: Map<string, Set<string>> = new Map();
  // Map of socketId -> userId
  private socketToUser: Map<string, string> = new Map();

  constructor(private prisma: PrismaService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Socket client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const userId = this.socketToUser.get(client.id);
    if (userId) {
      const sockets = this.userSockets.get(userId);
      if (sockets) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
          // Broadcast user offline
          this.server.emit('user-status-changed', { userId, status: 'OFFLINE' });
        }
      }
      this.socketToUser.delete(client.id);
      this.logger.log(`User ${userId} disconnected (Socket: ${client.id})`);
    }
  }

  @SubscribeMessage('register-user')
  handleRegisterUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; user?: any },
  ) {
    if (!data?.userId) return;

    this.socketToUser.set(client.id, data.userId);
    if (!this.userSockets.has(data.userId)) {
      this.userSockets.set(data.userId, new Set());
    }
    this.userSockets.get(data.userId)!.add(client.id);

    // Join personal user room
    client.join(`user_${data.userId}`);
    this.logger.log(`User registered: ${data.userId} on socket ${client.id}`);

    // Broadcast online status
    this.server.emit('user-status-changed', { userId: data.userId, status: 'ONLINE' });

    // Send currently online user list back to client
    const onlineUserIds = Array.from(this.userSockets.keys());
    client.emit('online-users', { onlineUserIds });

    return { status: 'registered', onlineUserIds };
  }

  // 1. One-to-One Direct Messaging
  @SubscribeMessage('send-direct-message')
  async handleSendDirectMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { senderId: string; receiverId: string; content: string; fileUrl?: string },
  ) {
    if (!data?.senderId || !data?.receiverId || !data?.content) return;

    try {
      let safeSenderId = data.senderId;
      const sender = await this.prisma.user.findUnique({ where: { id: data.senderId } });
      if (!sender) {
        const fallback = await this.prisma.user.findFirst();
        if (fallback) safeSenderId = fallback.id;
      }

      let safeReceiverId = data.receiverId;
      const receiver = await this.prisma.user.findUnique({ where: { id: data.receiverId } });
      if (!receiver) {
        const fallbackReceiver = await this.prisma.user.findFirst({ where: { id: { not: safeSenderId } } });
        if (fallbackReceiver) safeReceiverId = fallbackReceiver.id;
      }

      // Save message to Postgres Database
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

      // Emit to receiver's private room
      this.server.to(`user_${safeReceiverId}`).emit('new-direct-message', message);
      // Emit to sender's own devices/tabs
      this.server.to(`user_${safeSenderId}`).emit('new-direct-message', message);

      return { success: true, message };
    } catch (err) {
      this.logger.error(`Failed to persist chat message: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  // 2. Video/Audio Call Signaling (One-to-One Teleconsultation)
  @SubscribeMessage('call-user')
  handleCallUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: {
      caller: { id: string; fullName: string; role: string; specialty?: string };
      targetUserId: string;
      roomName: string;
      callType?: 'video' | 'audio';
    },
  ) {
    this.logger.log(`Call initiated from ${data.caller?.fullName} to User ${data.targetUserId}`);
    // Notify target user
    this.server.to(`user_${data.targetUserId}`).emit('incoming-call', {
      caller: data.caller,
      roomName: data.roomName,
      callType: data.callType || 'video',
    });
  }

  @SubscribeMessage('accept-call')
  handleAcceptCall(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomName: string; callerId: string; acceptor: any },
  ) {
    this.logger.log(`Call accepted by ${data.acceptor?.fullName} for room: ${data.roomName}`);
    this.server.to(`user_${data.callerId}`).emit('call-accepted', {
      roomName: data.roomName,
      acceptor: data.acceptor,
    });
  }

  @SubscribeMessage('reject-call')
  handleRejectCall(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomName: string; callerId: string; reason?: string },
  ) {
    this.logger.log(`Call rejected for room: ${data.roomName}`);
    this.server.to(`user_${data.callerId}`).emit('call-rejected', {
      roomName: data.roomName,
      reason: data.reason || 'Foydalanuvchi band yoki qo‘ng‘iroqni rad etdi.',
    });
  }

  @SubscribeMessage('end-call')
  handleEndCall(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomName: string; targetUserId?: string },
  ) {
    if (data.roomName) {
      this.server.to(data.roomName).emit('call-ended', { roomName: data.roomName });
    }
    if (data.targetUserId) {
      this.server.to(`user_${data.targetUserId}`).emit('call-ended', { roomName: data.roomName });
    }
  }

  // 3. WebRTC Peer-to-Peer Signaling in Room
  @SubscribeMessage('join-room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomName: string; user: { id: string; name: string; role: string } },
  ) {
    client.join(data.roomName);
    this.logger.log(`User ${data.user?.name} joined WebRTC room: ${data.roomName}`);

    // Notify other peers in room
    client.to(data.roomName).emit('user-connected', {
      socketId: client.id,
      user: data.user,
    });

    return { status: 'joined', room: data.roomName };
  }

  @SubscribeMessage('offer')
  handleOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { targetSocketId?: string; roomName: string; offer: any; senderName?: string },
  ) {
    if (data.targetSocketId) {
      this.server.to(data.targetSocketId).emit('offer', {
        offer: data.offer,
        fromSocketId: client.id,
        senderName: data.senderName,
      });
    } else {
      client.to(data.roomName).emit('offer', {
        offer: data.offer,
        fromSocketId: client.id,
        senderName: data.senderName,
      });
    }
  }

  @SubscribeMessage('answer')
  handleAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { targetSocketId?: string; roomName?: string; answer: any },
  ) {
    if (data.targetSocketId) {
      this.server.to(data.targetSocketId).emit('answer', {
        answer: data.answer,
        fromSocketId: client.id,
      });
    } else if (data.roomName) {
      client.to(data.roomName).emit('answer', {
        answer: data.answer,
        fromSocketId: client.id,
      });
    }
  }

  @SubscribeMessage('ice-candidate')
  handleIceCandidate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { targetSocketId?: string; roomName: string; candidate: any },
  ) {
    if (data.targetSocketId) {
      this.server.to(data.targetSocketId).emit('ice-candidate', {
        candidate: data.candidate,
        fromSocketId: client.id,
      });
    } else {
      client.to(data.roomName).emit('ice-candidate', {
        candidate: data.candidate,
        fromSocketId: client.id,
      });
    }
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomName: string; userId: string },
  ) {
    client.leave(data.roomName);
    client.to(data.roomName).emit('user-disconnected', { socketId: client.id, userId: data.userId });
  }
}
