import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ICategoryRepository } from '../../../domain/repositories/category.repository';
import { CategoryEntity } from '../../../domain/entities/category.entity';
import { CategoryMapper } from './mappers/category.mapper';

@Injectable()
export class PrismaCategoryRepository implements ICategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(category: CategoryEntity): Promise<void> {
    const data = CategoryMapper.toPersistence(category);
    await this.prisma.category.upsert({
      where: { id: data.id },
      create: data,
      update: { name: data.name, icon: data.icon, color: data.color, budget: data.budget },
    });
  }

  async findById(id: string): Promise<CategoryEntity | null> {
    const raw = await this.prisma.category.findUnique({ where: { id } });
    return raw ? CategoryMapper.toDomain(raw) : null;
  }

  async findAllByUserId(userId: string): Promise<CategoryEntity[]> {
    const raws = await this.prisma.category.findMany({
      where: { userId, isDefault: false },
      orderBy: { name: 'asc' },
    });
    return raws.map(CategoryMapper.toDomain);
  }

  async findDefaults(): Promise<CategoryEntity[]> {
    const raws = await this.prisma.category.findMany({
      where: { isDefault: true },
      orderBy: { name: 'asc' },
    });
    return raws.map(CategoryMapper.toDomain);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.category.delete({ where: { id } });
  }
}
