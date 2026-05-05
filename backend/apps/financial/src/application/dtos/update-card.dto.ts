import { IsInt, IsNumber, IsOptional, IsPositive, IsString, Length, Max, Min } from 'class-validator';

export class UpdateCardDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @Length(4, 4)
  @IsOptional()
  lastDigits?: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  creditLimit?: number;

  @IsInt()
  @Min(1)
  @Max(31)
  @IsOptional()
  dueDay?: number;
}
