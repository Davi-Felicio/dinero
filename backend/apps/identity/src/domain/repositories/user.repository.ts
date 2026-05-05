import { UserEntity } from '../entities/user.entity';

export interface IUserRepository {
  save(user: UserEntity): Promise<void>;
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  delete(id: string): Promise<void>;
}
