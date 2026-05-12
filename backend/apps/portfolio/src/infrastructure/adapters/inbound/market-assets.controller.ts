import { BadRequestException, Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, Result } from '@dinero/shared';
import { GetAssetQuoteUseCase } from '../../../application/use-cases/get-asset-quote.use-case';
import { SearchAssetsUseCase } from '../../../application/use-cases/search-assets.use-case';
import {
  GetAssetQuoteQueryDto,
  SearchAssetsQueryDto,
} from '../../../application/dtos/market-assets.dto';
import {
  IAssetQuote,
  ISearchAssetsOutput,
} from '../../../application/ports/asset-quotation.service';

@Controller('assets')
@UseGuards(JwtAuthGuard)
export class MarketAssetsController {
  constructor(
    private readonly searchAssetsUseCase: SearchAssetsUseCase,
    private readonly getAssetQuoteUseCase: GetAssetQuoteUseCase,
  ) {}

  @Get()
  async search(@Query() query: SearchAssetsQueryDto): Promise<ISearchAssetsOutput> {
    const result = await this.searchAssetsUseCase.execute({
      search: query.search,
      type: query.type,
      page: query.page,
      limit: query.limit,
    });

    return this.unwrap(result);
  }

  @Get(':ticker/quote')
  async quote(
    @Param('ticker') ticker: string,
    @Query() query: GetAssetQuoteQueryDto,
  ): Promise<IAssetQuote> {
    const result = await this.getAssetQuoteUseCase.execute({
      ticker,
      type: query.type,
      range: query.range,
      interval: query.interval,
      modules: query.modules,
      dividends: query.dividends,
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
