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
} from '@nestjs/common';
import { CreateTransactionDto } from '../../../application/dtos/create-transaction.dto';
import { UpdateTransactionDto } from '../../../application/dtos/update-transaction.dto';
import { CreateTransactionUseCase } from '../../../application/use-cases/create-transaction.use-case';
import { DeleteTransactionUseCase } from '../../../application/use-cases/delete-transaction.use-case';
import { GetTransactionByIdUseCase } from '../../../application/use-cases/get-transaction-by-id.use-case';
import { ListTransactionsUseCase } from '../../../application/use-cases/list-transactions.use-case';
import { UpdateTransactionUseCase } from '../../../application/use-cases/update-transaction.use-case';

@Controller('transactions')
export class TransactionController {
  constructor(
    private readonly createTransaction: CreateTransactionUseCase,
    private readonly listTransactions: ListTransactionsUseCase,
    private readonly getTransactionById: GetTransactionByIdUseCase,
    private readonly updateTransaction: UpdateTransactionUseCase,
    private readonly deleteTransaction: DeleteTransactionUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateTransactionDto) {
    const result = await this.createTransaction.execute(dto);
    if (result.isFailure()) {
      throw new NotFoundException(result.error);
    }
    return result.getValue();
  }

  @Get()
  async list(
    @Query('userId') userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    const result = await this.listTransactions.execute({ userId, page, limit });
    return result.getValue();
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Query('userId') userId: string) {
    const result = await this.getTransactionById.execute({ id, userId });
    if (result.isFailure()) {
      throw new NotFoundException(result.error);
    }
    return result.getValue();
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    const result = await this.updateTransaction.execute({ id, userId, dto });
    if (result.isFailure()) {
      throw new NotFoundException(result.error);
    }
    return result.getValue();
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Query('userId') userId: string) {
    const result = await this.deleteTransaction.execute({ id, userId });
    if (result.isFailure()) {
      throw new NotFoundException(result.error);
    }
  }
}
