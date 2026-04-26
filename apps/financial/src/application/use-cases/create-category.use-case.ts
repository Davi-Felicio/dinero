import { Inject, Injectable } from '@nestjs/common';
import { IUseCase, Result } from '@dinero/shared';
import { ICategoryRepository } from '../../domain/repositories/category.repository';
import { CategoryEntity } from '../../domain/entities/category.entity';
import { INJECTION_TOKENS } from '../../injection-tokens';

export interface CreateCategoryInput {
  userId: string;
  name: string;
  icon?: string;
  color?: string;
  budget?: number;
  isDefault?: boolean;
}

@Injectable()
export class CreateCategoryUseCase implements IUseCase<CreateCategoryInput, any> {
  constructor(
    @Inject(INJECTION_TOKENS.CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(input: CreateCategoryInput): Promise<Result<any>> {
    const category = CategoryEntity.create({
      userId: input.userId,
      name: input.name,
      icon: input.icon,
      color: input.color,
      budget: input.budget,
      isDefault: input.isDefault ?? false,
    });

    await this.categoryRepository.save(category);

    return Result.ok({
      id: category.id.toValue(),
      userId: category.userId,
      name: category.name,
      icon: category.icon,
      color: category.color,
      budget: category.budget,
      isDefault: category.isDefault,
    });
  }
}
