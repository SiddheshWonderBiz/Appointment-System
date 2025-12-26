import { 
  IsEmail,
  IsNotEmpty,
  IsString,
  IsEnum,
  MinLength,
  Matches 
} from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @Matches(/^[A-Za-z\s]+$/, { message: 'Name must contain only letters and spaces' })
  name: string;

  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @Matches(
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    { message: 'Password must contain uppercase, lowercase, number, and special character' }
  )
  password: string;

  @IsEnum(Role, { message: 'Invalid role selected' })
  role: Role;

  @IsString()
  @Matches(/^[A-Za-z\s]*$/, { message: 'Specialty must contain only letters' })
  specialty?: string; 
}
