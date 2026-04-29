import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';

export class SyncTransactionItemDto {
  @IsString()
  @IsNotEmpty()
  localId!: string;

  @IsString()
  @IsOptional()
  remoteId?: string;

  @IsIn(['CREATE', 'UPDATE', 'DELETE'])
  operation!: 'CREATE' | 'UPDATE' | 'DELETE';

  @IsIn(['INCOME', 'EXPENSE'])
  type!: 'INCOME' | 'EXPENSE';

  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsIn(['BRL', 'USD', 'EUR', 'GBP'])
  currency!: string;

  @IsNumber()
  @IsOptional()
  amountBrl?: number;

  @IsNumber()
  @IsOptional()
  exchangeRate?: number;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsDateString()
  date!: string;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  cardId?: string;

  @IsDateString()
  updatedAt!: string;
}

export class SyncPushDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncTransactionItemDto)
  transactions!: SyncTransactionItemDto[];
}
