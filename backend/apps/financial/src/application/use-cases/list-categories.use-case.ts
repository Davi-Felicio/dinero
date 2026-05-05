import { Inject, Injectable } from '@nestjs/common';
import { IUseCase, Result } from '@dinero/shared';
import { ICategoryRepository } from '../../domain/repositories/category.repository';
import { INJECTION_TOKENS } from '../../injection-tokens';

export interface ListCategoriesInput {
  userId: string;
}

@Injectable()
export class ListCategoriesUseCase implements IUseCase<ListCategoriesInput, any[]> {
  constructor(
    @Inject(INJECTION_TOKENS.CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(input: ListCategoriesInput): Promise<Result<any[]>> {
    const [userCats, defaultCats] = await Promise.all([
      this.categoryRepository.findAllByUserId(input.userId),
      this.categoryRepository.findDefaults(),
    ]);

    const all = [...defaultCats, ...userCats];
    return Result.ok(
      all.map((c) => ({
        id: c.id.toValue(),
        userId: c.userId,
        name: c.name,
        icon: c.icon,
        color: c.color,
        budget: c.budget,
        isDefault: c.isDefault,
      })),
    );
  }
}
