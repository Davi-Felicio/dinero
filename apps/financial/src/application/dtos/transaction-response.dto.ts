import { TransactionEntity } from '../../domain/entities/transaction.entity';

export class TransactionResponseDto {
  id!: string;
  userId!: string;
  type!: string;
  amount!: number;
  currency!: string;
  amountBrl?: number;
  exchangeRate?: number;
  description!: string;
  merchant?: string;
  location?: string;
  date!: string;
  categoryId?: string;
  cardId?: string;
  syncStatus!: string;
  createdAt!: string;
  updatedAt!: string;

  static fromEntity(t: TransactionEntity): TransactionResponseDto {
    const dto = new TransactionResponseDto();
    dto.id = t.id.toValue();
    dto.userId = t.userId;
    dto.type = t.type;
    dto.amount = t.amount.amount;
    dto.currency = t.amount.currency;
    dto.amountBrl = t.amountBrl?.amount;
    dto.exchangeRate = t.exchangeRate;
    dto.description = t.description;
    dto.merchant = t.merchant;
    dto.location = t.location;
    dto.date = t.date.toISOString();
    dto.categoryId = t.categoryId;
    dto.cardId = t.cardId;
    dto.syncStatus = t.syncStatus;
    dto.createdAt = t.createdAt.toISOString();
    dto.updatedAt = t.updatedAt.toISOString();
    return dto;
  }
}

export class PaginatedTransactionResponseDto {
  data!: TransactionResponseDto[];
  total!: number;
  page!: number;
  limit!: number;
  totalPages!: number;
}
