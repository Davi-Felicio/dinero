import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { TransactionType } from '../../domain/entities/transaction.entity';
import { Currency } from '../../domain/value-objects/money.vo';

export class CreateTransactionDto {
  @IsEnum(['INCOME', 'EXPENSE'])
  type!: TransactionType;

  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsOptional()
  @IsEnum(['BRL', 'USD', 'EUR', 'GBP'])
  currency?: Currency;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  amountBrl?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  exchangeRate?: number;

  @IsString()
  @MinLength(1)
  description!: string;

  @IsOptional()
  @IsString()
  merchant?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsDateString()
  date!: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  cardId?: string;
}
