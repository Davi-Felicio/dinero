import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard, JwtPayload, Result } from '@dinero/shared';
import {
  CreatePortfolioTransactionDto,
  ListTransactionsQueryDto,
  PortfolioHistoryQueryDto,
} from '../../../application/dtos/portfolio.dto';
import {
  CreatePortfolioTransactionUseCase,
  ICreatePortfolioTransactionOutput,
} from '../../../application/use-cases/create-portfolio-transaction.use-case';
import {
  GetPortfolioSummaryUseCase,
  IGetPortfolioSummaryOutput,
  IPortfolioPositionOutput,
} from '../../../application/use-cases/get-portfolio-summary.use-case';
import {
  IListPortfolioTransactionsOutput,
  ListPortfolioTransactionsUseCase,
} from '../../../application/use-cases/list-portfolio-transactions.use-case';

@Controller()
@UseGuards(JwtAuthGuard)
export class PortfolioController {
  constructor(
    private readonly createPortfolioTransactionUseCase: CreatePortfolioTransactionUseCase,
    private readonly getPortfolioSummaryUseCase: GetPortfolioSummaryUseCase,
    private readonly listPortfolioTransactionsUseCase: ListPortfolioTransactionsUseCase,
  ) {}

  @Get()
  async current(
    @Req() req: Request & { user: JwtPayload },
    @Query() query: PortfolioHistoryQueryDto,
  ): Promise<IGetPortfolioSummaryOutput> {
    return this.getSummary(req.user.sub, query);
  }

  @Get('summary')
  async summary(
    @Req() req: Request & { user: JwtPayload },
    @Query() query: PortfolioHistoryQueryDto,
  ): Promise<IGetPortfolioSummaryOutput> {
    return this.getSummary(req.user.sub, query);
  }

  @Get('positions')
  async positions(
    @Req() req: Request & { user: JwtPayload },
    @Query() query: PortfolioHistoryQueryDto,
  ): Promise<IPortfolioPositionOutput[]> {
    const result = await this.getPortfolioSummaryUseCase.execute({
      userId: req.user.sub,
      range: query.range,
      interval: query.interval,
    });

    return this.unwrap(result).positions;
  }

  @Post('transactions')
  async addTransaction(
    @Req() req: Request & { user: JwtPayload },
    @Body() body: CreatePortfolioTransactionDto,
  ): Promise<ICreatePortfolioTransactionOutput> {
    const result = await this.createPortfolioTransactionUseCase.execute({
      userId: req.user.sub,
      ticker: body.ticker,
      name: body.name,
      assetType: body.assetType,
      type: body.type,
      quantity: body.quantity,
      unitPrice: body.unitPrice,
      costs: body.costs,
      operationDate: new Date(body.operationDate),
    });

    return this.unwrap(result);
  }

  @Get('transactions')
  async transactions(
    @Req() req: Request & { user: JwtPayload },
    @Query() query: ListTransactionsQueryDto,
  ): Promise<IListPortfolioTransactionsOutput> {
    const result = await this.listPortfolioTransactionsUseCase.execute({
      userId: req.user.sub,
      page: query.page,
      limit: query.limit,
    });

    return this.unwrap(result);
  }

  private async getSummary(
    userId: string,
    query: PortfolioHistoryQueryDto,
  ): Promise<IGetPortfolioSummaryOutput> {
    const result = await this.getPortfolioSummaryUseCase.execute({
      userId,
      range: query.range,
      interval: query.interval,
    });

    return this.unwrap(result);
  }

  private unwrap<T>(result: Result<T>): T {
    if (result.isFailure()) {
      throw new BadRequestException(result.error);
    }

    return result.getValue();
  }
}
