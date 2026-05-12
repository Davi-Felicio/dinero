import { Inject, Injectable } from '@nestjs/common';
import { IUseCase, Result } from '@dinero/shared';
import { INJECTION_TOKENS } from '../../injection-tokens';
import {
  IAssetQuotationService,
  ISearchAssetsInput,
  ISearchAssetsOutput,
} from '../ports/asset-quotation.service';
import { getErrorMessage } from './get-error-message';

@Injectable()
export class SearchAssetsUseCase implements IUseCase<ISearchAssetsInput, ISearchAssetsOutput> {
  constructor(
    @Inject(INJECTION_TOKENS.ASSET_QUOTATION_SERVICE)
    private readonly quotationService: IAssetQuotationService,
  ) {}

  async execute(input: ISearchAssetsInput): Promise<Result<ISearchAssetsOutput>> {
    try {
      return Result.ok(await this.quotationService.searchAssets(input));
    } catch (error: unknown) {
      return Result.fail(getErrorMessage(error));
    }
  }
}
