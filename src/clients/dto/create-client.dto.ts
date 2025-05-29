import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateClientDto {
    @ApiProperty({ example: 'John Doe', description: 'Client name' })
    @IsString()
    @IsNotEmpty()
    name!: string;

    @ApiProperty({ example: 'john@example.com', description: 'Client email' })
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @ApiProperty({ example: '+1234567890', description: 'Client phone number' })
    @IsString()
    @IsNotEmpty()
    phone!: string;

    @ApiProperty({ example: 'password123', description: 'Client password' })
    @IsString()
    @MinLength(6)
    @IsNotEmpty()
    password!: string;
}
