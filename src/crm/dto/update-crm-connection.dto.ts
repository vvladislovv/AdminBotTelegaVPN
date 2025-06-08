import { ApiProperty } from '@nestjs/swagger';
import { CrmProvider } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateCrmConnectionDto {
    @ApiProperty({ enum: CrmProvider, required: false })
    @IsEnum(CrmProvider)
    @IsOptional()
    provider?: CrmProvider;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    accessToken?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    refreshToken?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    domain?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    otherData?: any;

    @ApiProperty({ required: false })
    @IsOptional()
    expiresAt?: Date;
}
