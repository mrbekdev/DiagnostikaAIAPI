import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationGateway } from './notification.gateway';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private gateway: NotificationGateway,
  ) {}

  async getUserNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async createNotification(params: {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    data?: any;
  }) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: params.userId,
        title: params.title,
        message: params.message,
        type: params.type,
        data: params.data,
      },
    });

    // Real-time dispatch
    this.gateway.server.to(`user:${params.userId}`).emit('notification:new', notification);

    return notification;
  }

  // SMS Ready integration hook
  async sendSmsAlert(phone: string, text: string) {
    // In production, integrate with PlayMobile / Eskiz SMS Gateway in Uzbekistan
    console.log(`[SMS-GATEWAY-UZ] Sending to ${phone}: ${text}`);
    return { status: 'QUEUED_OR_SENT', recipient: phone };
  }
}
