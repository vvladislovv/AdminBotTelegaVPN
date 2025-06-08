import { EncryptionUtils } from '@/common/utils/encryption.utils';
import { PrismaService } from '@/prisma/prisma.service';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CrmConnection, CrmProvider, Prisma } from '@prisma/client';
import { CreateCrmConnectionDto } from './dto/create-crm-connection.dto';
import { UpdateCrmConnectionDto } from './dto/update-crm-connection.dto';

@Injectable()
export class CrmConnectionsService {
    private readonly logger = new Logger(CrmConnectionsService.name);

    constructor(private readonly prisma: PrismaService) {}

    async createConnection(dto: CreateCrmConnectionDto): Promise<CrmConnection> {
        const encryptedAccessToken = EncryptionUtils.encrypt(dto.accessToken);
        const encryptedRefreshToken = dto.refreshToken
            ? EncryptionUtils.encrypt(dto.refreshToken)
            : null;
        const encryptedDomain = dto.domain ? EncryptionUtils.encrypt(dto.domain) : null;
        const encryptedOtherData = dto.otherData
            ? EncryptionUtils.encrypt(JSON.stringify(dto.otherData))
            : null;

        const upsertedConnection = await this.prisma.crmConnection.upsert({
            where: { userId: dto.userId },
            update: {
                provider: dto.provider as CrmProvider,
                accessToken: encryptedAccessToken,
                refreshToken: encryptedRefreshToken,
                expiresAt: dto.expiresAt,
                domain: encryptedDomain,
                otherData: encryptedOtherData as any,
            },
            create: {
                userId: dto.userId,
                provider: dto.provider as CrmProvider,
                accessToken: encryptedAccessToken,
                refreshToken: encryptedRefreshToken,
                expiresAt: dto.expiresAt,
                domain: encryptedDomain,
                otherData: encryptedOtherData as any,
            },
        });

        this.logger.log(`CRM Connection for userId ${dto.userId} was created or updated.`);

        return this.decryptCrmConnection(upsertedConnection);
    }

    async getAllConnections(): Promise<CrmConnection[]> {
        const connections = await this.prisma.crmConnection.findMany();
        return connections.map(this.decryptCrmConnection);
    }

    async getConnection(id: number): Promise<CrmConnection> {
        const connection = await this.prisma.crmConnection.findUnique({
            where: { id },
        });
        if (!connection) {
            throw new NotFoundException(`CrmConnection with ID ${id} not found.`);
        }
        return this.decryptCrmConnection(connection);
    }

    async updateConnection(id: number, dto: UpdateCrmConnectionDto): Promise<CrmConnection> {
        const updateData: any = {
            provider: dto.provider as CrmProvider,
        };

        if (dto.accessToken) {
            updateData.accessToken = EncryptionUtils.encrypt(dto.accessToken);
        }
        if (dto.refreshToken) {
            updateData.refreshToken = EncryptionUtils.encrypt(dto.refreshToken);
        }
        if (dto.expiresAt) {
            updateData.expiresAt = dto.expiresAt;
        }
        if (dto.domain) {
            updateData.domain = EncryptionUtils.encrypt(dto.domain);
        }
        if (dto.otherData) {
            updateData.otherData = EncryptionUtils.encrypt(JSON.stringify(dto.otherData));
        }

        try {
            const updatedConnection = await this.prisma.crmConnection.update({
                where: { id },
                data: updateData,
            });
            return this.decryptCrmConnection(updatedConnection);
        } catch (error: unknown) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new NotFoundException(
                        `CrmConnection with ID ${id} not found for update.`,
                    );
                } else if (error.code === 'P2002') {
                    throw new BadRequestException(
                        `A record with the provided unique data already exists.`,
                    );
                } else {
                    this.logger.error(
                        `Prisma error during updateConnection: ${error.message}`,
                        error.stack,
                    );
                    throw new BadRequestException(`Database error: ${error.message}`);
                }
            } else if (error instanceof Error) {
                this.logger.error(
                    `Unknown error during updateConnection: ${error.message}`,
                    error.stack,
                );
                throw error;
            } else {
                this.logger.error(
                    `Unknown error during updateConnection: ${JSON.stringify(error)}`,
                );
                throw new Error('An unexpected error occurred.');
            }
        }
    }

    async deleteConnection(id: number): Promise<CrmConnection> {
        try {
            const deletedConnection = await this.prisma.crmConnection.delete({
                where: { id },
            });
            return this.decryptCrmConnection(deletedConnection);
        } catch (error: unknown) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new NotFoundException(
                        `CrmConnection with ID ${id} not found for deletion.`,
                    );
                } else {
                    this.logger.error(
                        `Prisma error during deleteConnection: ${error.message}`,
                        error.stack,
                    );
                    throw new BadRequestException(`Database error: ${error.message}`);
                }
            } else if (error instanceof Error) {
                this.logger.error(
                    `Unknown error during deleteConnection: ${error.message}`,
                    error.stack,
                );
                throw error;
            } else {
                this.logger.error(
                    `Unknown error during deleteConnection: ${JSON.stringify(error)}`,
                );
                throw new Error('An unexpected error occurred.');
            }
        }
    }

    async getConnectionByUserId(userId: number): Promise<CrmConnection> {
        const connection = await this.prisma.crmConnection.findFirst({
            where: { userId },
        });
        if (!connection) {
            throw new NotFoundException(`CrmConnection for userId ${userId} not found.`);
        }
        return this.decryptCrmConnection(connection);
    }

    private decryptCrmConnection(connection: CrmConnection): CrmConnection {
        const decryptedConnection = { ...connection };

        if (decryptedConnection.accessToken) {
            decryptedConnection.accessToken = EncryptionUtils.decrypt(
                decryptedConnection.accessToken,
            );
        }
        if (decryptedConnection.refreshToken) {
            decryptedConnection.refreshToken = EncryptionUtils.decrypt(
                decryptedConnection.refreshToken,
            );
        }
        if (decryptedConnection.domain) {
            decryptedConnection.domain = EncryptionUtils.decrypt(decryptedConnection.domain);
        }
        if (decryptedConnection.otherData) {
            try {
                // otherData is stored as Json, but encrypted as string.
                // We need to decrypt it first, then parse the JSON string.
                const decryptedOtherDataString = EncryptionUtils.decrypt(
                    decryptedConnection.otherData as string,
                );
                decryptedConnection.otherData = JSON.parse(decryptedOtherDataString);
            } catch (e: any) {
                this.logger.error(`Failed to decrypt or parse otherData: ${e.message}`);
                decryptedConnection.otherData = null; // Set to null on error
            }
        }
        return decryptedConnection;
    }
}
