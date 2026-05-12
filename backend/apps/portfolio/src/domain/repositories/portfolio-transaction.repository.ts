import { PortfolioTransactionEntity } from '../entities/portfolio-transaction.entity';

export interface IPortfolioTransactionRepository {
  save(transaction: PortfolioTransactionEntity): Promise<void>;
  findAllByUserId(
    userId: string,
    page: number,
    limit: number,
  ): Promise<PortfolioTransactionEntity[]>;
  countByUserId(userId: string): Promise<number>;
}
