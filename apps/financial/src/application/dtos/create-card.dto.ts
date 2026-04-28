import { IsInt, IsNumber, IsPositive, IsString, Length, Max, Min } from 'class-validator';

export class CreateCardDto {
  @IsString()
  name!: string;

  @IsString()
  brand!: string;

  @IsString()
  @Length(4, 4)
  lastDigits!: string;

  @IsNumber()
  @IsPositive()
  creditLimit!: number;

  @IsInt()
  @Min(1)
  @Max(31)
  dueDay!: number;
}
