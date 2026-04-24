import { TransactionEntity } from '../entities/transaction.entity';

export interface ITransactionRepository {
  save(transaction: TransactionEntity): Promise<void>;
  findById(id: string): Promise<TransactionEntity | null>;
  findAllByUserId(userId: string, page: number, limit: number): Promise<TransactionEntity[]>;
  countByUserId(userId: string): Promise<number>;
  delete(id: string): Promise<void>;
}
