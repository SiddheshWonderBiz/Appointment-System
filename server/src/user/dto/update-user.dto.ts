import { IsOptional, IsString, IsEmail, Matches } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z\s]+$/, {
    message: 'Name must contain only letters and spaces',
  })
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Invalid email' })
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z\s]*$/, { message: 'Specialty must only contain letters' })
  specialty?: string;
}
