import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { TransactionType } from '../../domain/entities/transaction.entity';
import { Currency } from '../../domain/value-objects/money.vo';

export class CreateTransactionDto {
  @IsUUID()
  userId: string;

  @IsEnum(['INCOME', 'EXPENSE'])
  type: TransactionType;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsEnum(['BRL', 'USD', 'EUR', 'GBP'])
  @IsOptional()
  currency?: Currency;

  @IsString()
  description: string;

  @IsDateString()
  date: string;

  @IsString()
  @IsOptional()
  merchant?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsUUID()
  @IsOptional()
  cardId?: string;
}
