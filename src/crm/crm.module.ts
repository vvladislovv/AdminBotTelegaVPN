import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AmocrmService } from './adapters/amocrm/amocrm.service';
import { TelegaVpnService } from './adapters/telegavpn/telegavpn.service';
import { CrmController } from './crm.controller';
import { CrmService } from './crm.service';

@Module({
    imports: [ConfigModule],
    controllers: [CrmController],
    providers: [
        CrmService,
        {
            provide: 'CRM_SERVICE',
            useClass: AmocrmService,
        },
        {
            provide: 'TELEGAVPN_SERVICE',
            useClass: TelegaVpnService,
        },
        AmocrmService,
    ],
    exports: [CrmService],
})
export class CrmModule {}
