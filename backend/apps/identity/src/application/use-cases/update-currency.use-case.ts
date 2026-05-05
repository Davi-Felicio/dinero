import { Inject, Injectable } from '@nestjs/common';
import { IUseCase, Result } from '@dinero/shared';
import { IUserPreferenceRepository } from '../../domain/repositories/user-preference.repository';
import { UserPreferenceEntity } from '../../domain/entities/user-preference.entity';
import { Currency } from '../../domain/value-objects/currency.vo';
import { INJECTION_TOKENS } from '../../injection-tokens';

export interface UpdateCurrencyInput {
  userId: string;
  currency: string;
}

export interface UpdateCurrencyOutput {
  defaultCurrency: string;
  darkMode: boolean;
}

@Injectable()
export class UpdateCurrencyUseCase
  implements IUseCase<UpdateCurrencyInput, UpdateCurrencyOutput>
{
  constructor(
    @Inject(INJECTION_TOKENS.USER_PREFERENCE_REPOSITORY)
    private readonly userPreferenceRepository: IUserPreferenceRepository,
  ) {}

  async execute(input: UpdateCurrencyInput): Promise<Result<UpdateCurrencyOutput>> {
    let newCurrency: Currency;
    try {
      newCurrency = Currency.create(input.currency);
    } catch (err) {
      return Result.fail((err as Error).message);
    }

    let pref = await this.userPreferenceRepository.findByUserId(input.userId);
    if (!pref) {
      pref = UserPreferenceEntity.create({
        userId: input.userId,
        defaultCurrency: newCurrency,
        darkMode: true,
      });
    } else {
      pref.changeCurrency(newCurrency);
    }

    await this.userPreferenceRepository.save(pref);

    return Result.ok({
      defaultCurrency: pref.defaultCurrency.code,
      darkMode: pref.darkMode,
    });
  }
}
