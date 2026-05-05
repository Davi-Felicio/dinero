import { Inject, Injectable } from '@nestjs/common';
import { IUseCase, Result } from '@dinero/shared';
import { IUserPreferenceRepository } from '../../domain/repositories/user-preference.repository';
import { INJECTION_TOKENS } from '../../injection-tokens';

export interface GetUserPreferenceInput {
  userId: string;
}

export interface GetUserPreferenceOutput {
  defaultCurrency: string;
  darkMode: boolean;
}

@Injectable()
export class GetUserPreferenceUseCase
  implements IUseCase<GetUserPreferenceInput, GetUserPreferenceOutput>
{
  constructor(
    @Inject(INJECTION_TOKENS.USER_PREFERENCE_REPOSITORY)
    private readonly userPreferenceRepository: IUserPreferenceRepository,
  ) {}

  async execute(input: GetUserPreferenceInput): Promise<Result<GetUserPreferenceOutput>> {
    const pref = await this.userPreferenceRepository.findByUserId(input.userId);
    if (!pref) {
      return Result.ok({ defaultCurrency: 'BRL', darkMode: true });
    }
    return Result.ok({
      defaultCurrency: pref.defaultCurrency.code,
      darkMode: pref.darkMode,
    });
  }
}
