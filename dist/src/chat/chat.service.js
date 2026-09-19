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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const telemedicine_gateway_1 = require("../telemedicine/telemedicine.gateway");
let ChatService = class ChatService {
    constructor(prisma, telemedGateway) {
        this.prisma = prisma;
        this.telemedGateway = telemedGateway;
    }
    async getSafeUserId(userId) {
        if (userId) {
            const user = await this.prisma.user.findUnique({ where: { id: userId } });
            if (user)
                return user.id;
        }
        const fallback = await this.prisma.user.findFirst();
        return fallback ? fallback.id : userId || '';
    }
    async getContacts(currentUserId) {
        const safeCurrentUserId = await this.getSafeUserId(currentUserId);
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
        const contactsWithMeta = await Promise.all(users.map(async (contact) => {
            const lastMsg = await this.prisma.chatMessage.findFirst({
                where: {
                    OR: [
                        { senderId: safeCurrentUserId, receiverId: contact.id },
                        { senderId: contact.id, receiverId: safeCurrentUserId },
                    ],
                },
                orderBy: { createdAt: 'desc' },
            });
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
        }));
        return contactsWithMeta.sort((a, b) => {
            const timeA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
            const timeB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
            return timeB - timeA;
        });
    }
    async getHistory(currentUserId, otherUserId) {
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
    async sendMessage(senderId, dto) {
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
            }
            else {
                throw new common_1.NotFoundException('Xabar qabul qiluvchi xodim topilmadi.');
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
        try {
            if (this.telemedGateway?.server) {
                this.telemedGateway.server.to(`user_${safeReceiverId}`).emit('new-direct-message', message);
                this.telemedGateway.server.to(`user_${safeSenderId}`).emit('new-direct-message', message);
            }
        }
        catch (e) {
        }
        return message;
    }
    async markAsRead(currentUserId, senderId) {
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
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => telemedicine_gateway_1.TelemedicineGateway))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        telemedicine_gateway_1.TelemedicineGateway])
], ChatService);
//# sourceMappingURL=chat.service.js.map