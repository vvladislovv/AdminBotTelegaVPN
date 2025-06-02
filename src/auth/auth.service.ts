import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { MeService } from '../me/me.service';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterUserDto } from './dto/register-user.dto';

export interface ValidateUserResult {
    id: number;
    email: string;
    role: string;
}

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private meService: MeService,
    ) {}

    async register(registerUserDto: RegisterUserDto, referralCode?: string) {
        const { email, password, name } = registerUserDto;

        // Проверяем, существует ли пользователь
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw new ConflictException('User already exists');
        }

        // Хешируем пароль
        const hashedPassword = await bcrypt.hash(password, 10);

        // Создаем пользователя
        const user = await this.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: 'USER',
            },
        });

        // Если есть реферальный код, обрабатываем его
        if (referralCode) {
            await this.meService.processReferralRegistration(referralCode, user.id);
        }

        // Генерируем токен
        const token = this.jwtService.sign({ id: user.id, email: user.email });

        return {
            access_token: token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        };
    }

    async validateUser(email: string, password: string): Promise<ValidateUserResult | null> {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (user && (await bcrypt.compare(password, user.password))) {
            const { password: _, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: ValidateUserResult) {
        const payload = { email: user.email, sub: user.id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
        };
    }

    async validateToken(token: string) {
        try {
            const payload = this.jwtService.verify(token);
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
            });
            if (!user) {
                throw new UnauthorizedException();
            }
            return user;
        } catch {
            throw new UnauthorizedException();
        }
    }

    hasToken(request: any): boolean {
        const authHeader = request.headers.authorization;
        return !!authHeader && authHeader.startsWith('Bearer ');
    }
}
