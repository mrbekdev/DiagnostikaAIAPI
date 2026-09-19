import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SendMessageDto } from './dto/send-message.dto';
import { TelemedicineGateway } from '../telemedicine/telemedicine.gateway';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => TelemedicineGateway))
    private telemedGateway: TelemedicineGateway,
  ) {}

  private async getSafeUserId(userId?: string): Promise<string> {
    if (userId) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user) return user.id;
    }
    const fallback = await this.prisma.user.findFirst();
    return fallback ? fallback.id : userId || '';
  }

  async getContacts(currentUserId: string) {
    const safeCurrentUserId = await this.getSafeUserId(currentUserId);

    // 1. Fetch all doctors, nurses, and admins except current user
    const users = await this.prisma.user.findMany({
      where: {
        id: { not: safeCurrentUserId },
        isActive: true,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        specialty: true,
        licenseNumber: true,
        createdAt: true,
      },
      orderBy: { fullName: 'asc' },
    });

    // 2. Fetch last messages & unread counts for each contact
    const contactsWithMeta = await Promise.all(
      users.map(async (contact) => {
        // Last message between current user and this contact
        const lastMsg = await this.prisma.chatMessage.findFirst({
          where: {
            OR: [
              { senderId: safeCurrentUserId, receiverId: contact.id },
              { senderId: contact.id, receiverId: safeCurrentUserId },
            ],
          },
          orderBy: { createdAt: 'desc' },
        });

        // Unread messages from this contact to current user
        const unreadCount = await this.prisma.chatMessage.count({
          where: {
            senderId: contact.id,
            receiverId: safeCurrentUserId,
            isRead: false,
          },
        });

        return {
          ...contact,
          lastMessage: lastMsg
            ? {
                id: lastMsg.id,
                content: lastMsg.content,
                createdAt: lastMsg.createdAt,
                isMine: lastMsg.senderId === safeCurrentUserId,
                isRead: lastMsg.isRead,
              }
            : null,
          unreadCount,
        };
      }),
    );

    // Sort: users with most recent messages first
    return contactsWithMeta.sort((a, b) => {
      const timeA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const timeB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  }

  async getHistory(currentUserId: string, otherUserId: string) {
    const safeCurrentUserId = await this.getSafeUserId(currentUserId);

    const messages = await this.prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderId: safeCurrentUserId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: safeCurrentUserId },
        ],
      },
      include: {
        sender: {
          select: { id: true, fullName: true, role: true, specialty: true },
        },
        receiver: {
          select: { id: true, fullName: true, role: true, specialty: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Auto mark received messages as read
    await this.prisma.chatMessage.updateMany({
      where: {
        senderId: otherUserId,
        receiverId: safeCurrentUserId,
        isRead: false,
      },
      data: { isRead: true },
    });

    return messages;
  }

  async sendMessage(senderId: string, dto: SendMessageDto) {
    const safeSenderId = await this.getSafeUserId(senderId);

    let safeReceiverId = dto.receiverId;
    const receiver = await this.prisma.user.findUnique({
      where: { id: dto.receiverId },
    });

    if (!receiver) {
      const fallbackReceiver = await this.prisma.user.findFirst({
        where: { id: { not: safeSenderId } },
      });
      if (fallbackReceiver) {
        safeReceiverId = fallbackReceiver.id;
      } else {
        throw new NotFoundException('Xabar qabul qiluvchi xodim topilmadi.');
      }
    }

    const message = await this.prisma.chatMessage.create({
      data: {
        senderId: safeSenderId,
        receiverId: safeReceiverId,
        content: dto.content,
        fileUrl: dto.fileUrl,
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

    // Real-time broadcast to both sender and receiver sockets
    try {
      if (this.telemedGateway?.server) {
        this.telemedGateway.server.to(`user_${safeReceiverId}`).emit('new-direct-message', message);
        this.telemedGateway.server.to(`user_${safeSenderId}`).emit('new-direct-message', message);
      }
    } catch (e) {
      // ignore
    }

    return message;
  }

  async markAsRead(currentUserId: string, senderId: string) {
    const safeCurrentUserId = await this.getSafeUserId(currentUserId);

    return this.prisma.chatMessage.updateMany({
      where: {
        senderId,
        receiverId: safeCurrentUserId,
        isRead: false,
      },
      data: { isRead: true },
    });
  }
}
