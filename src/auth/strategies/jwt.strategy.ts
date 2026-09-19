import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'super-secret-telemed-jwt-key-uzbekistan-2026-secure-random'),
    });
  }

  async validate(payload: JwtPayload) {
    if (payload.sub && payload.sub.startsWith('demo-')) {
      const isDoctor = payload.role === 'DOCTOR';
      const isNurse = payload.role === 'NURSE';
      const isUser = payload.role === 'USER' || payload.role === 'PATIENT';
      return {
        id: payload.sub,
        email: payload.email,
        fullName: isDoctor ? 'Dr. Botir Qodirov' : isNurse ? 'Nilufar Rahimova' : isUser ? 'Anvar Karimov' : 'Sardorbek Alimov',
        role: payload.role,
        specialty: isDoctor ? 'Kardiolog & Pulmonolog' : isNurse ? 'Katta hamshira' : isUser ? 'Bemor / Fuqaro' : 'Tizim ma’muri',
        isActive: true,
      };
    }

    try {
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          specialty: true,
          isActive: true,
        },
      });

      if (user && user.isActive) {
        return user;
      }
    } catch (e) {
      // Return decoded payload if DB is offline
      return {
        id: payload.sub,
        email: payload.email,
        fullName: 'Foydalanuvchi',
        role: payload.role,
        isActive: true,
      };
    }

    throw new UnauthorizedException('Foydalanuvchi hisobi faol emas yoki topilmadi');
  }
}
