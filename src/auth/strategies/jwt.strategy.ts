import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

interface JwtPayload {
    sub?: number;
    id?: number;
    email: string;
    role?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
        private prisma: PrismaService,
    ) {
        const jwtSecret = configService.get<string>('JWT_SECRET');
        if (!jwtSecret) {
            throw new Error('JWT_SECRET is not defined');
        }

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtSecret,
        });
    }

    async validate(payload: JwtPayload) {
        console.log('JWT Payload received:', payload);
        
        // Handle both 'sub' and 'id' fields for backward compatibility
        const userId = payload.sub || payload.id;
        
        console.log('Extracted userId:', userId);
        
        if (!userId) {
            console.log('No userId found in payload');
            return null;
        }

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        console.log('User found:', user ? 'Yes' : 'No');

        if (!user) {
            return null;
        }

        const result = {
            id: userId,
            email: payload.email || user.email,
            role: payload.role || user.role,
        };
        
        console.log('Returning user:', result);
        return result;
    }
}
