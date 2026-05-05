import { IsString, MinLength } from 'class-validator';

export class CreateBankConnectionDto {
  @IsString()
  institutionId!: string;

  @IsString()
  @MinLength(2)
  institutionName!: string;
}
