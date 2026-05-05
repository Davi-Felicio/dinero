import { UniqueEntityID } from '@dinero/shared';
import { CategoryEntity } from '../../../../domain/entities/category.entity';

type CategoryPrismaModel = {
  id: string;
  userId: string | null;
  name: string;
  icon: string | null;
  color: string | null;
  budget: { toNumber(): number } | null;
  isDefault: boolean;
  createdAt: Date;
};

export class CategoryMapper {
  static toDomain(raw: CategoryPrismaModel): CategoryEntity {
    return CategoryEntity.reconstitute(
      {
        userId: raw.userId ?? undefined,
        name: raw.name,
        icon: raw.icon ?? undefined,
        color: raw.color ?? undefined,
        budget: raw.budget ? raw.budget.toNumber() : undefined,
        isDefault: raw.isDefault,
        createdAt: raw.createdAt,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPersistence(category: CategoryEntity) {
    return {
      id: category.id.toValue(),
      userId: category.userId ?? null,
      name: category.name,
      icon: category.icon ?? null,
      color: category.color ?? null,
      budget: category.budget ?? null,
      isDefault: category.isDefault,
      createdAt: category.createdAt,
    };
  }
}
