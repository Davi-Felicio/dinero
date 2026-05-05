import { IsNumber, IsPositive, IsString } from 'class-validator';

export class AddPortfolioAssetDto {
  @IsString()
  ticker!: string;

  @IsNumber()
  @IsPositive()
  quantity!: number;

  @IsNumber()
  @IsPositive()
  averagePrice!: number;
}
