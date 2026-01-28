// dto/lock-slot.dto.ts
import { IsInt, IsISO8601 } from 'class-validator';

export class LockSlotDto {
  @IsInt()
  consultantId: number;

  @IsISO8601()
  startAt: string; // ISO string from frontend
}
