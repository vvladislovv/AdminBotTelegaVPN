import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AmocrmService } from './amocrm.service';

@Module({
    imports: [ConfigModule],
    providers: [AmocrmService],
    exports: [AmocrmService],
})
export class AmocrmModule {}
