import {
  Controller,
  Get,
  Query,
  Req,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard, JwtPayload } from '@dinero/shared';
import { GetBalanceSummaryUseCase } from '../../../application/use-cases/get-balance-summary.use-case';

@Controller('balance')
@UseGuards(JwtAuthGuard)
export class BalanceController {
  constructor(private readonly getBalanceSummaryUseCase: GetBalanceSummaryUseCase) {}

  @Get('summary')
  async getSummary(
    @Req() req: Request & { user: JwtPayload },
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const result = await this.getBalanceSummaryUseCase.execute({
      userId: req.user.sub,
      startDate,
      endDate,
    });
    if (result.isFailure()) throw new UnprocessableEntityException(result.error);
    return { data: result.getValue() };
  }
}
