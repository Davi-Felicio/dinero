import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard, JwtPayload } from '@dinero/shared';
import { CreateTransactionDto } from '../../../application/dtos/create-transaction.dto';
import { UpdateTransactionDto } from '../../../application/dtos/update-transaction.dto';
import { CreateTransactionUseCase } from '../../../application/use-cases/create-transaction.use-case';
import { ListTransactionsUseCase } from '../../../application/use-cases/list-transactions.use-case';
import { GetTransactionByIdUseCase } from '../../../application/use-cases/get-transaction-by-id.use-case';
import { UpdateTransactionUseCase } from '../../../application/use-cases/update-transaction.use-case';
import { DeleteTransactionUseCase } from '../../../application/use-cases/delete-transaction.use-case';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionController {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    private readonly listTransactionsUseCase: ListTransactionsUseCase,
    private readonly getTransactionByIdUseCase: GetTransactionByIdUseCase,
    private readonly updateTransactionUseCase: UpdateTransactionUseCase,
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
    if (result.isFailure()) {
      throw new NotFoundException(result.error);
    }
    return result.getValue();
  }

  @Get()
  async list(
    @Req() req: Request & { user: JwtPayload },
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    const result = await this.listTransactionsUseCase.execute({
      userId: req.user.sub,
      page,
      limit,
    });
    return result.getValue();
  }

  @Get(':id')
  async findOne(
    @Req() req: Request & { user: JwtPayload },
    @Param('id') id: string,
  ) {
    const result = await this.getTransactionByIdUseCase.execute({ id, userId: req.user.sub });
    if (result.isFailure()) {
      throw new NotFoundException(result.error);
    }
    return result.getValue();
  }

  @Patch(':id')
  async update(
    @Req() req: Request & { user: JwtPayload },
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    const result = await this.updateTransactionUseCase.execute({ id, userId: req.user.sub, dto });
    if (result.isFailure()) {
      throw new NotFoundException(result.error);
    }
    return result.getValue();
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Req() req: Request & { user: JwtPayload },
    @Param('id') id: string,
  ) {
    const result = await this.deleteTransactionUseCase.execute({ id, userId: req.user.sub });
    if (result.isFailure()) {
      throw new NotFoundException(result.error);
    }
  }
}
