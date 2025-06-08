import { CrmProvider } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCrmConnectionDto {
    @IsNumber()
    @IsNotEmpty()
    userId!: number;

    @IsEnum(CrmProvider)
    @IsNotEmpty()
    provider!: CrmProvider;

    @IsString()
    @IsNotEmpty()
    accessToken!: string;

    @IsString()
    @IsOptional()
    refreshToken?: string;

    @IsString()
    @IsOptional()
    domain?: string;

    @IsOptional()
    otherData?: any;

    @IsOptional()
    expiresAt?: Date;
}
