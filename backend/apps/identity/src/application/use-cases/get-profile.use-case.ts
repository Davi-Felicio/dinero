import { Inject, Injectable } from '@nestjs/common';
import { IUseCase, Result } from '@dinero/shared';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { IUserPreferenceRepository } from '../../domain/repositories/user-preference.repository';
import { INJECTION_TOKENS } from '../../injection-tokens';

export interface GetProfileInput {
  userId: string;
}

export interface GetProfileOutput {
  id: string;
  name: string;
  email: string;
  phone?: string;
  birthDate?: string;
  location?: string;
  defaultCurrency: string;
  createdAt: string;
}

@Injectable()
export class GetProfileUseCase implements IUseCase<GetProfileInput, GetProfileOutput> {
  constructor(
    @Inject(INJECTION_TOKENS.USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(INJECTION_TOKENS.USER_PREFERENCE_REPOSITORY)
    private readonly userPreferenceRepository: IUserPreferenceRepository,
  ) {}

  async execute(input: GetProfileInput): Promise<Result<GetProfileOutput>> {
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      return Result.fail('User not found');
    }

    const pref = await this.userPreferenceRepository.findByUserId(input.userId);
    const defaultCurrency = pref?.defaultCurrency.code ?? 'BRL';

    return Result.ok({
      id: user.id.toValue(),
      name: user.name,
      email: user.email.value,
      phone: user.phone,
      birthDate: user.birthDate?.toISOString(),
      location: user.location,
      defaultCurrency,
      createdAt: user.createdAt.toISOString(),
    });
  }
}
