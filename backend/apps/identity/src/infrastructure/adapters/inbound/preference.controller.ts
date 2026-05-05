import {
  Body,
  Controller,
  Get,
  Put,
  Req,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard, JwtPayload } from '@dinero/shared';
import { GetUserPreferenceUseCase } from '../../../application/use-cases/get-user-preference.use-case';
import { UpdateCurrencyUseCase } from '../../../application/use-cases/update-currency.use-case';
import { UpdateCurrencyDto } from '../../../application/dtos/update-currency.dto';

@Controller('preferences')
@UseGuards(JwtAuthGuard)
export class PreferenceController {
  constructor(
    private readonly getUserPreferenceUseCase: GetUserPreferenceUseCase,
    private readonly updateCurrencyUseCase: UpdateCurrencyUseCase,
  ) {}

  @Get('me')
  async getMyPreferences(@Req() req: Request & { user: JwtPayload }) {
    const result = await this.getUserPreferenceUseCase.execute({ userId: req.user.sub });
    if (result.isFailure()) throw new UnprocessableEntityException(result.error);
    return { data: result.getValue() };
  }

  @Put('currency')
  async updateCurrency(
    @Req() req: Request & { user: JwtPayload },
    @Body() dto: UpdateCurrencyDto,
  ) {
    const result = await this.updateCurrencyUseCase.execute({
      userId: req.user.sub,
      currency: dto.currency,
    });
    if (result.isFailure()) throw new UnprocessableEntityException(result.error);
    return { data: result.getValue() };
  }
}
