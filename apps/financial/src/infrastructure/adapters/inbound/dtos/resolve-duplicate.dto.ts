import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString } from 'class-validator';

export class ResolveDuplicateDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  keepId!: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  removeIds!: string[];
}
