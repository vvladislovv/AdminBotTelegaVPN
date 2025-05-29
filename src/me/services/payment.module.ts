import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TelegaPayService } from './telega-pay.service';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [TelegaPayService],
    exports: [TelegaPayService],
})
export class PaymentModule {}
