import { PrismaService } from '@/prisma/prisma.service';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { ValidatePromoCodeDto } from './dto/validate-promo-code.dto';

@Injectable()
export class AdminService {
    private readonly logger = new Logger(AdminService.name);

    constructor(private readonly prisma: PrismaService) {}

    // Promo Code Management
    async createPromoCode(adminId: number, dto: CreatePromoCodeDto) {
        const promoCode = await this.prisma.promoCode.create({
            data: {
                code: dto.code,
                discount: dto.discount,
                type: dto.type,
                maxUses: dto.maxUses,
                expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
                createdBy: adminId,
                isActive: true,
            },
        });

        this.logger.log(`Promo code ${dto.code} created by admin ${adminId}`);
        return promoCode;
    }

    async getAllPromoCodes() {
        return this.prisma.promoCode.findMany({
            include: {
                creator: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    },
                },
            },
        });
    }

    async getPromoCode(id: number) {
        const promoCode = await this.prisma.promoCode.findUnique({
            where: { id },
            include: {
                creator: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    },
                },
            },
        });

        if (!promoCode) {
            throw new NotFoundException(`Promo code with ID ${id} not found`);
        }

        return promoCode;
    }

    async updatePromoCode(id: number, dto: Partial<CreatePromoCodeDto>) {
        const promoCode = await this.prisma.promoCode.update({
            where: { id },
            data: {
                code: dto.code,
                discount: dto.discount,
                type: dto.type,
                maxUses: dto.maxUses,
                expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
            },
        });

        this.logger.log(`Promo code ${id} updated`);
        return promoCode;
    }

    async deletePromoCode(id: number) {
        await this.prisma.promoCode.delete({
            where: { id },
        });

        this.logger.log(`Promo code ${id} deleted`);
        return { success: true };
    }

    async togglePromoCodeStatus(id: number) {
        const promoCode = await this.prisma.promoCode.findUnique({
            where: { id },
        });

        if (!promoCode) {
            throw new NotFoundException(`Promo code with ID ${id} not found`);
        }

        const updatedPromoCode = await this.prisma.promoCode.update({
            where: { id },
            data: {
                isActive: !promoCode.isActive,
            },
        });

        this.logger.log(`Promo code ${id} status toggled to ${updatedPromoCode.isActive}`);
        return updatedPromoCode;
    }

    // CRM Management
    async getAllCrmConnections() {
        return this.prisma.crmConnection.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    },
                },
            },
        });
    }

    async getCrmConnection(id: number) {
        const connection = await this.prisma.crmConnection.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    },
                },
            },
        });

        if (!connection) {
            throw new NotFoundException(`CRM connection with ID ${id} not found`);
        }

        return connection;
    }

    async deleteCrmConnection(id: number) {
        await this.prisma.crmConnection.delete({
            where: { id },
        });

        this.logger.log(`CRM connection ${id} deleted`);
        return { success: true };
    }

    async toggleCrmConnectionStatus(id: number) {
        const connection = await this.prisma.crmConnection.findUnique({
            where: { id },
        });

        if (!connection) {
            throw new NotFoundException(`CRM connection with ID ${id} not found`);
        }

        const updatedConnection = await this.prisma.crmConnection.update({
            where: { id },
            data: {
                isActive: !connection.isActive,
            },
        });

        this.logger.log(`CRM connection ${id} status toggled to ${updatedConnection.isActive}`);
        return updatedConnection;
    }

    async validatePromoCode(dto: ValidatePromoCodeDto) {
        const promoCode = await this.prisma.promoCode.findUnique({
            where: { code: dto.code },
        });

        if (!promoCode) {
            throw new NotFoundException('Промокод не найден');
        }

        if (!promoCode.isActive) {
            throw new BadRequestException('Промокод неактивен');
        }

        if (promoCode.expiresAt && new Date(promoCode.expiresAt) < new Date()) {
            throw new BadRequestException('Срок действия промокода истек');
        }

        if (promoCode.maxUses && promoCode.usedCount >= promoCode.maxUses) {
            throw new BadRequestException('Промокод больше не может быть использован');
        }

        let discountAmount = 0;
        if (promoCode.type === 'PERCENTAGE') {
            discountAmount = (dto.amount * promoCode.discount) / 100;
        } else {
            discountAmount = promoCode.discount;
        }

        const finalAmount = Math.max(0, dto.amount - discountAmount);

        return {
            isValid: true,
            originalAmount: dto.amount,
            discountAmount,
            finalAmount,
            promoCode: {
                code: promoCode.code,
                type: promoCode.type,
                discount: promoCode.discount,
            },
        };
    }
}
