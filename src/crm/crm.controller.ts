import { Body, Controller, Post } from '@nestjs/common';
import { CrmService } from './crm.service';

@Controller('crm')
export class CrmController {
    constructor(private readonly crmService: CrmService) {}

    @Post('contact')
    async createContact(@Body() createUserDto: any) {
        // dummyConnection должен быть CrmConnection, здесь просто пример
        const dummyConnection = {} as any;
        return this.crmService.createContact(dummyConnection, createUserDto);
    }
}
