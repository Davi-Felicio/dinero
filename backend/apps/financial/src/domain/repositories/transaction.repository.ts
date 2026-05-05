import { TransactionEntity } from '../entities/transaction.entity';

export interface ITransactionRepository {
  save(transaction: TransactionEntity): Promise<void>;
  findById(id: string): Promise<TransactionEntity | null>;
  findByIdAndUserId(id: string, userId: string): Promise<TransactionEntity | null>;
  findAllByUserId(userId: string, page: number, limit: number): Promise<TransactionEntity[]>;
  countByUserId(userId: string): Promise<number>;
  softDelete(id: string): Promise<void>;
}
