import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard, JwtPayload } from '@dinero/shared';
import { CreateCategoryUseCase } from '../../../application/use-cases/create-category.use-case';
import { ListCategoriesUseCase } from '../../../application/use-cases/list-categories.use-case';
import { CreateCategoryDto } from '../../../application/dtos/create-category.dto';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoryController {
  constructor(
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly listCategoriesUseCase: ListCategoriesUseCase,
  ) {}

  @Post()
  async create(
    @Req() req: Request & { user: JwtPayload },
    @Body() dto: CreateCategoryDto,
  ) {
    const result = await this.createCategoryUseCase.execute({
      userId: req.user.sub,
      name: dto.name,
      icon: dto.icon,
      color: dto.color,
      budget: dto.budget,
      isDefault: dto.isDefault,
    });
    return { data: result.getValue() };
  }

  @Get()
  async list(@Req() req: Request & { user: JwtPayload }) {
    const result = await this.listCategoriesUseCase.execute({ userId: req.user.sub });
    return { data: result.getValue() };
  }
}
