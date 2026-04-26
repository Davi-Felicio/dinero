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
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard, JwtPayload } from '@dinero/shared';
import { CreateTransactionUseCase } from '../../../application/use-cases/create-transaction.use-case';
import { ListTransactionsUseCase } from '../../../application/use-cases/list-transactions.use-case';
import { DeleteTransactionUseCase } from '../../../application/use-cases/delete-transaction.use-case';
import { CreateTransactionDto } from '../../../application/dtos/create-transaction.dto';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionController {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    private readonly listTransactionsUseCase: ListTransactionsUseCase,
    private readonly deleteTransactionUseCase: DeleteTransactionUseCase,
  ) {}

  @Post()
  async create(
    @Req() req: Request & { user: JwtPayload },
    @Body() dto: CreateTransactionDto,
  ) {
    const result = await this.createTransactionUseCase.execute({
      userId: req.user.sub,
      type: dto.type,
      amount: dto.amount,
      currency: dto.currency ?? 'BRL',
      amountBrl: dto.amountBrl,
      exchangeRate: dto.exchangeRate,
      description: dto.description,
      merchant: dto.merchant,
      location: dto.location,
      date: dto.date,
      categoryId: dto.categoryId,
      cardId: dto.cardId,
    });
    return { data: result.getValue() };
  }

  @Get()
  async list(
    @Req() req: Request & { user: JwtPayload },
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const result = await this.listTransactionsUseCase.execute({
      userId: req.user.sub,
      page: Math.max(1, parseInt(page, 10) || 1),
      limit: Math.min(100, Math.max(1, parseInt(limit, 10) || 20)),
    });
    const output = result.getValue();
    return {
      data: output.items,
      meta: { page: output.page, limit: output.limit, total: output.total },
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Req() req: Request & { user: JwtPayload },
    @Param('id') id: string,
  ) {
    const result = await this.deleteTransactionUseCase.execute({ id, userId: req.user.sub });
    if (result.isFailure()) {
      if (result.error === 'Transaction not found') throw new NotFoundException(result.error);
      throw new ForbiddenException(result.error);
    }
  }
}
