import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard, JwtPayload } from '@dinero/shared';
import { AddPortfolioAssetUseCase } from '../../../application/use-cases/add-portfolio-asset.use-case';
import { GetPortfolioUseCase } from '../../../application/use-cases/get-portfolio.use-case';
import { AddPortfolioAssetDto } from '../../../application/dtos/add-portfolio-asset.dto';

@Controller('portfolio')
@UseGuards(JwtAuthGuard)
export class PortfolioController {
  constructor(
    private readonly addPortfolioAssetUseCase: AddPortfolioAssetUseCase,
    private readonly getPortfolioUseCase: GetPortfolioUseCase,
  ) {}

  @Get()
  async list(@Req() req: Request & { user: JwtPayload }) {
    const result = await this.getPortfolioUseCase.execute({ userId: req.user.sub });
    return { data: result.getValue() };
  }

  @Post('assets')
  async add(
    @Req() req: Request & { user: JwtPayload },
    @Body() dto: AddPortfolioAssetDto,
  ) {
    const result = await this.addPortfolioAssetUseCase.execute({
      userId: req.user.sub,
      ticker: dto.ticker,
      quantity: dto.quantity,
      averagePrice: dto.averagePrice,
    });
    if (result.isFailure()) {
      throw new NotFoundException(result.error);
    }
    return { data: result.getValue() };
  }
}
