import { IsEmail, IsOptional, IsString, Length, Matches } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @Length(2, 100)
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  // E.164-ish shape: optional "+", digits, spaces and dashes, 7-30 chars.
  @Matches(/^\+?[0-9\s\-()]{7,30}$/, { message: 'phone must be a valid phone number' })
  phone?: string;
}
