import { Inject, Injectable } from '@nestjs/common';
import { IUseCase, Result } from '@dinero/shared';
import { IAssetRepository } from '../../domain/repositories/asset.repository';
import { INJECTION_TOKENS } from '../../injection-tokens';

@Injectable()
export class ListAssetsUseCase implements IUseCase<void, any[]> {
  constructor(
    @Inject(INJECTION_TOKENS.ASSET_REPOSITORY)
    private readonly assetRepository: IAssetRepository,
  ) {}

  async execute(): Promise<Result<any[]>> {
    const assets = await this.assetRepository.findAll();
    return Result.ok(
      assets.map((a) => ({
        id: a.id.toValue(),
        ticker: a.ticker,
        name: a.name,
        type: a.type,
      })),
    );
  }
}
