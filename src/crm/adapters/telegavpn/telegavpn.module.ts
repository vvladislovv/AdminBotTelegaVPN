import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TelegaVpnService } from './telegavpn.service';

@Module({
    imports: [ConfigModule],
    providers: [TelegaVpnService],
    exports: [TelegaVpnService],
})
export class TelegaVpnModule {}
