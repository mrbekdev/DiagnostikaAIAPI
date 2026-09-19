import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    getContacts(currentUserId: string): Promise<{
        lastMessage: {
            id: string;
            content: string;
            createdAt: Date;
            isMine: boolean;
            isRead: boolean;
        };
        unreadCount: number;
        id: string;
        email: string;
        fullName: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        specialty: string;
        licenseNumber: string;
        createdAt: Date;
    }[]>;
    getHistory(currentUserId: string, otherUserId: string): Promise<({
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
    })[]>;
    sendMessage(currentUserId: string, dto: SendMessageDto): Promise<{
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
    }>;
    markAsRead(currentUserId: string, senderId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
