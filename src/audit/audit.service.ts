import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async getLogs(params: {
    userId?: string;
    action?: string;
    resource?: string;
    skip?: number;
    take?: number;
  }) {
    const { userId, action, resource, skip, take } = params;
    const skipNum = Number(skip) >= 0 ? Number(skip) : 0;
    const takeNum = Number(take) > 0 ? Number(take) : 50;

    const where: any = {};
    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (resource) where.resource = resource;

    const [total, logs] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        skip: skipNum,
        take: takeNum,
        orderBy: { timestamp: 'desc' },
        include: {
          user: {
            select: { id: true, fullName: true, email: true, role: true },
          },
        },
      }),
    ]);

    return { total, skip: skipNum, take: takeNum, data: logs };
  }
}
