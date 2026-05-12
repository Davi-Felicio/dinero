import { Inject, Injectable } from '@nestjs/common';
import { IUseCase, Result } from '@dinero/shared';
import { INJECTION_TOKENS } from '../../injection-tokens';
import {
  IAssetQuotationService,
  IAssetQuote,
  IAssetQuoteInput,
} from '../ports/asset-quotation.service';
import { getErrorMessage } from './get-error-message';

@Injectable()
export class GetAssetQuoteUseCase implements IUseCase<IAssetQuoteInput, IAssetQuote> {
  constructor(
    @Inject(INJECTION_TOKENS.ASSET_QUOTATION_SERVICE)
    private readonly quotationService: IAssetQuotationService,
  ) {}

  async execute(input: IAssetQuoteInput): Promise<Result<IAssetQuote>> {
    try {
      return Result.ok(await this.quotationService.getQuote(input));
    } catch (error: unknown) {
      return Result.fail(getErrorMessage(error));
    }
  }
}
