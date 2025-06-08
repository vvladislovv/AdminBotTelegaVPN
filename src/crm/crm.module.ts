import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { AmocrmService } from './adapters/amocrm/amocrm.service';
import { Bitrix24Service } from './adapters/bitrix24/bitrix24.service';
import { TelegaVpnService } from './adapters/telegavpn/telegavpn.service';
import { CrmConnectionsController } from './crm-connections.controller';
import { CrmConnectionsService } from './crm-connections.service';
import { CrmController } from './crm.controller';
import { CrmService } from './crm.service';

@Module({
    imports: [ConfigModule, HttpModule, PrismaModule],
    controllers: [CrmController, CrmConnectionsController],
    providers: [
        CrmService,
        PrismaService,
        AmocrmService,
        TelegaVpnService,
        CrmConnectionsService,
        Bitrix24Service,
        {
            provide: 'CRM_SERVICE',
            useFactory: (
                configService: ConfigService,
                amocrmService: AmocrmService,
                bitrix24Service: Bitrix24Service,
            ) => {
                const provider = configService.get<string>('CRM_PROVIDER', 'amocrm');
                switch (provider) {
                    case 'amocrm':
                        return amocrmService;
                    case 'bitrix24':
                        return bitrix24Service;
                    default:
                        throw new Error(`Unknown CRM provider: ${provider}`);
                }
            },
            inject: [ConfigService, AmocrmService, Bitrix24Service],
        },
        {
            provide: 'TELEGAVPN_SERVICE',
            useClass: TelegaVpnService,
        },
    ],
    exports: [CrmService, CrmConnectionsService],
})
export class CrmModule {}
