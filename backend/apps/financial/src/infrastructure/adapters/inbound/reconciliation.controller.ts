import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Query,
} from '@nestjs/common';
import { FindDuplicatesUseCase } from '../../../application/use-cases/reconciliation/find-duplicates.use-case';
import { ResolveDuplicateUseCase } from '../../../application/use-cases/reconciliation/resolve-duplicate.use-case';
import { ResolveDuplicateDto } from './dtos/resolve-duplicate.dto';

@Controller('reconciliation')
export class ReconciliationController {
  constructor(
    private readonly findDuplicates: FindDuplicatesUseCase,
    private readonly resolveDuplicate: ResolveDuplicateUseCase,
  ) {}

  @Get('duplicates')
  async list(@Query('userId') userId: string) {
    if (!userId) {
      throw new BadRequestException('userId query param is required');
    }
    const result = await this.findDuplicates.execute({ userId });
    if (result.isFailure()) {
      throw new BadRequestException(result.error);
    }
    return { data: result.getValue() };
  }

  @Post('resolve')
  async resolve(@Body() dto: ResolveDuplicateDto) {
    const result = await this.resolveDuplicate.execute({
      userId: dto.userId,
      keepId: dto.keepId,
      removeIds: dto.removeIds,
    });
    if (result.isFailure()) {
      if (result.error === 'Transaction to keep not found') {
        throw new NotFoundException(result.error);
      }
      throw new BadRequestException(result.error);
    }
    return { data: result.getValue() };
  }
}
