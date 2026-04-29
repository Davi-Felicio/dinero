import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard, JwtPayload } from '@dinero/shared';
import { SyncPushUseCase } from '../../../application/use-cases/sync/sync-push.use-case';
import { SyncPullUseCase } from '../../../application/use-cases/sync/sync-pull.use-case';
import { SyncStatusUseCase } from '../../../application/use-cases/sync/sync-status.use-case';
import { SyncPushDto } from './dtos/sync-push.dto';

@Controller('sync')
@UseGuards(JwtAuthGuard)
export class SyncController {
  constructor(
    private readonly syncPushUseCase: SyncPushUseCase,
    private readonly syncPullUseCase: SyncPullUseCase,
    private readonly syncStatusUseCase: SyncStatusUseCase,
  ) {}

  @Post('push')
  @HttpCode(HttpStatus.OK)
  async push(
    @Req() req: Request & { user: JwtPayload },
    @Body() dto: SyncPushDto,
  ) {
    const result = await this.syncPushUseCase.execute({
      userId: req.user.sub,
      transactions: dto.transactions,
    });
    if (result.isFailure()) {
      throw new BadRequestException(result.error);
    }
    return { data: result.getValue() };
  }

  @Get('pull')
  async pull(
    @Req() req: Request & { user: JwtPayload },
    @Query('since') since?: string,
  ) {
    let sinceDate: Date | undefined;
    if (since) {
      sinceDate = new Date(since);
      if (isNaN(sinceDate.getTime())) {
        throw new BadRequestException('Invalid since date format. Use ISO 8601.');
      }
    }

    const result = await this.syncPullUseCase.execute({
      userId: req.user.sub,
      since: sinceDate,
    });
    if (result.isFailure()) {
      throw new BadRequestException(result.error);
    }
    return { data: result.getValue() };
  }

  @Get('status')
  async status(@Req() req: Request & { user: JwtPayload }) {
    const result = await this.syncStatusUseCase.execute({ userId: req.user.sub });
    if (result.isFailure()) {
      throw new BadRequestException(result.error);
    }
    return { data: result.getValue() };
  }
}
