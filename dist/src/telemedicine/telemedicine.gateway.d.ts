import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
export declare class TelemedicineGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private prisma;
    server: Server;
    private readonly logger;
    private userSockets;
    private socketToUser;
    constructor(prisma: PrismaService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleRegisterUser(client: Socket, data: {
        userId: string;
        user?: any;
    }): {
        status: string;
        onlineUserIds: string[];
    };
    handleSendDirectMessage(client: Socket, data: {
        senderId: string;
        receiverId: string;
        content: string;
        fileUrl?: string;
    }): Promise<{
        success: boolean;
        message: {
            sender: {
                id: string;
                fullName: string;
                role: import(".prisma/client").$Enums.UserRole;
                specialty: string;
            };
            receiver: {
                id: string;
                fullName: string;
                role: import(".prisma/client").$Enums.UserRole;
                specialty: string;
            };
        } & {
            id: string;
            createdAt: Date;
            content: string;
            isRead: boolean;
            fileUrl: string | null;
            senderId: string;
            receiverId: string;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message?: undefined;
    }>;
    handleCallUser(client: Socket, data: {
        caller: {
            id: string;
            fullName: string;
            role: string;
            specialty?: string;
        };
        targetUserId: string;
        roomName: string;
        callType?: 'video' | 'audio';
    }): void;
    handleAcceptCall(client: Socket, data: {
        roomName: string;
        callerId: string;
        acceptor: any;
    }): void;
    handleRejectCall(client: Socket, data: {
        roomName: string;
        callerId: string;
        reason?: string;
    }): void;
    handleEndCall(client: Socket, data: {
        roomName: string;
        targetUserId?: string;
    }): void;
    handleJoinRoom(client: Socket, data: {
        roomName: string;
        user: {
            id: string;
            name: string;
            role: string;
        };
    }): {
        status: string;
        room: string;
    };
    handleOffer(client: Socket, data: {
        targetSocketId?: string;
        roomName: string;
        offer: any;
        senderName?: string;
    }): void;
    handleAnswer(client: Socket, data: {
        targetSocketId?: string;
        roomName?: string;
        answer: any;
    }): void;
    handleIceCandidate(client: Socket, data: {
        targetSocketId?: string;
        roomName: string;
        candidate: any;
    }): void;
    handleLeaveRoom(client: Socket, data: {
        roomName: string;
        userId: string;
    }): void;
}
