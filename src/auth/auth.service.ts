import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
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
    ) {}

    async register(
        registerUserDto: RegisterUserDto,
    ): Promise<{ access_token: string; user: ValidateUserResult }> {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: registerUserDto.email },
        });

        if (existingUser) {
            throw new ConflictException('Пользователь с таким email уже существует');
        }

        const hashedPassword = await bcrypt.hash(registerUserDto.password, 10);

        const user = await this.prisma.user.create({
            data: {
                email: registerUserDto.email,
                password: hashedPassword,
                name: registerUserDto.name,
                // Default role is set in schema.prisma
            },
        });

        const { password: _, ...result } = user;

        // Generate access token for the newly registered user
        const payload = { email: user.email, sub: user.id, role: user.role };
        const access_token = this.jwtService.sign(payload);

        return {
            access_token,
            user: {
                id: result.id,
                email: result.email,
                role: result.role,
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
