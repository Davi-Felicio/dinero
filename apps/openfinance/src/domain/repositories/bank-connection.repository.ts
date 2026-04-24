import { BankConnectionEntity } from '../entities/bank-connection.entity';

export interface IBankConnectionRepository {
  save(connection: BankConnectionEntity): Promise<void>;
  findById(id: string): Promise<BankConnectionEntity | null>;
  findAllByUserId(userId: string): Promise<BankConnectionEntity[]>;
  delete(id: string): Promise<void>;
}
