import { IsDateString, IsInt, IsString } from "class-validator";

export class CreateAppointmentDto {
    @IsInt()
    consultantId: number;

    

    @IsDateString()
    startAt: string;

    @IsDateString()
    endAt: string;

    @IsString()
    purpose: string;

}