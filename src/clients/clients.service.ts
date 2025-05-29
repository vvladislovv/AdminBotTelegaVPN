import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
    constructor(private readonly prisma: PrismaService) {}

    async create(createClientDto: CreateClientDto) {
        return this.prisma.user.create({
            data: {
                ...createClientDto,
                role: 'CLIENT',
            },
        });
    }

    async findAll() {
        return this.prisma.user.findMany({
            where: {
                role: 'CLIENT',
            },
        });
    }

    async findOne(id: number) {
        const client = await this.prisma.user.findFirst({
            where: {
                id,
                role: 'CLIENT',
            },
        });

        if (!client) {
            throw new NotFoundException(`Client with ID ${id} not found`);
        }

        return client;
    }

    async update(id: number, updateClientDto: UpdateClientDto) {
        try {
            return await this.prisma.user.update({
                where: {
                    id,
                    role: 'CLIENT',
                },
                data: updateClientDto,
            });
        } catch (error) {
            throw new NotFoundException(`Client with ID ${id} not found`);
        }
    }

    async remove(id: number) {
        try {
            return await this.prisma.user.delete({
                where: {
                    id,
                    role: 'CLIENT',
                },
            });
        } catch (error) {
            throw new NotFoundException(`Client with ID ${id} not found`);
        }
    }
}
