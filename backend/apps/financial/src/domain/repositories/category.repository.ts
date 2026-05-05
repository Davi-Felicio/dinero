import { CategoryEntity } from '../entities/category.entity';

export interface ICategoryRepository {
  save(category: CategoryEntity): Promise<void>;
  findById(id: string): Promise<CategoryEntity | null>;
  findAllByUserId(userId: string): Promise<CategoryEntity[]>;
  findDefaults(): Promise<CategoryEntity[]>;
  delete(id: string): Promise<void>;
}
