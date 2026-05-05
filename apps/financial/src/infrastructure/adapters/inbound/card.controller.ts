import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard, JwtPayload } from '@dinero/shared';
import { CreateCardUseCase } from '../../../application/use-cases/create-card.use-case';
import { ListCardsUseCase } from '../../../application/use-cases/list-cards.use-case';
import { GetCardUseCase } from '../../../application/use-cases/get-card.use-case';
import { UpdateCardUseCase } from '../../../application/use-cases/update-card.use-case';
import { DeleteCardUseCase } from '../../../application/use-cases/delete-card.use-case';
import { CreateCardDto } from '../../../application/dtos/create-card.dto';
import { UpdateCardDto } from '../../../application/dtos/update-card.dto';

@Controller('cards')
@UseGuards(JwtAuthGuard)
export class CardController {
  constructor(
    private readonly createCardUseCase: CreateCardUseCase,
    private readonly listCardsUseCase: ListCardsUseCase,
    private readonly getCardUseCase: GetCardUseCase,
    private readonly updateCardUseCase: UpdateCardUseCase,
    private readonly deleteCardUseCase: DeleteCardUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Req() req: Request & { user: JwtPayload },
    @Body() dto: CreateCardDto,
  ) {
    const result = await this.createCardUseCase.execute({
      userId: req.user.sub,
      name: dto.name,
      brand: dto.brand,
      lastDigits: dto.lastDigits,
      creditLimit: dto.creditLimit,
      dueDay: dto.dueDay,
    });
    if (result.isFailure()) throw new ForbiddenException(result.error);
    return { data: result.getValue() };
  }

  @Get()
  async list(@Req() req: Request & { user: JwtPayload }) {
    const result = await this.listCardsUseCase.execute({ userId: req.user.sub });
    if (result.isFailure()) throw new ForbiddenException(result.error);
    return { data: result.getValue() };
  }

  @Get(':id')
  async findOne(
    @Req() req: Request & { user: JwtPayload },
    @Param('id') id: string,
  ) {
    const result = await this.getCardUseCase.execute({ id, userId: req.user.sub });
    if (result.isFailure()) throw new NotFoundException(result.error);
    return { data: result.getValue() };
  }

  @Patch(':id')
  async update(
    @Req() req: Request & { user: JwtPayload },
    @Param('id') id: string,
    @Body() dto: UpdateCardDto,
  ) {
    const result = await this.updateCardUseCase.execute({ id, userId: req.user.sub, ...dto });
    if (result.isFailure()) throw new NotFoundException(result.error);
    return { data: result.getValue() };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Req() req: Request & { user: JwtPayload },
    @Param('id') id: string,
  ) {
    const result = await this.deleteCardUseCase.execute({ id, userId: req.user.sub });
    if (result.isFailure()) {
      if (result.error === 'Card not found') throw new NotFoundException(result.error);
      throw new ForbiddenException(result.error);
    }
  }
}
