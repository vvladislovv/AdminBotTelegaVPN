import {
    Body,
    Controller,
    Get,
    Post,
    Query,
    Request,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService, ValidateUserResult } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RequestUser } from './interfaces/request.interface';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('register')
    @ApiOperation({ summary: 'Регистрация нового пользователя' })
    @ApiResponse({
        status: 201,
        description: 'Пользователь успешно зарегистрирован и авторизован',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'number' },
                email: { type: 'string' },
                role: { type: 'string' },
                access_token: { type: 'string' },
            },
        },
    })
    @ApiResponse({ status: 400, description: 'Неверные данные' })
    @ApiResponse({ status: 409, description: 'Пользователь с таким email уже существует' })
    async register(
        @Body() registerUserDto: RegisterUserDto,
        @Query('ref') referralCode?: string,
    ): Promise<{ access_token: string; user: ValidateUserResult }> {
        return this.authService.register(registerUserDto, referralCode);
    }

    @UseGuards(LocalAuthGuard)
    @Post('login')
    @ApiOperation({ summary: 'Вход в систему' })
    @ApiResponse({ status: 200, description: 'Успешный вход' })
    @ApiResponse({ status: 401, description: 'Неверные учетные данные' })
    async login(@Request() req: { user: RequestUser }, @Body() loginDto: LoginDto) {
        return this.authService.login(req.user);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Получить информацию о текущем пользователе' })
    @ApiResponse({ status: 200, description: 'Информация о пользователе' })
    @ApiResponse({ status: 401, description: 'Не авторизован' })
    getProfile(@Request() req: { user: RequestUser }) {
        return req.user;
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Выход из системы' })
    @ApiResponse({ status: 200, description: 'Успешный выход' })
    @ApiResponse({ status: 401, description: 'Требуется авторизация' })
    async logout(@Request() req: { user?: RequestUser }) {
        if (!this.authService.hasToken(req)) {
            throw new UnauthorizedException('Требуется авторизация');
        }
        return { message: 'Successfully logged out' };
    }
}
