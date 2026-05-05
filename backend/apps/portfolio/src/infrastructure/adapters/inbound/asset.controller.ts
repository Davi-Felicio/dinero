import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@dinero/shared';
import { ListAssetsUseCase } from '../../../application/use-cases/list-assets.use-case';

@Controller('assets')
@UseGuards(JwtAuthGuard)
export class AssetController {
  constructor(private readonly listAssetsUseCase: ListAssetsUseCase) {}

  @Get()
  async list() {
    const result = await this.listAssetsUseCase.execute();
    return { data: result.getValue() };
  }
}
