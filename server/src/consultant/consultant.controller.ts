import { Controller, Get } from '@nestjs/common';
import { ConsultantService } from './consultant.service';

@Controller('consultant')
export class ConsultantController {
    constructor(private consultantService: ConsultantService) { }

    @Get('list')
    getAllConsultants() {
        return this.consultantService.getAllConsultants();
    }
}
