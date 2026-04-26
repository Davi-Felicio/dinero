import { Inject, Injectable } from '@nestjs/common';
import { IUseCase, Result } from '@dinero/shared';
import { IUserRepository } from '../../domain/repositories/user.repository';
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
  createdAt: string;
}

@Injectable()
export class GetProfileUseCase implements IUseCase<GetProfileInput, GetProfileOutput> {
  constructor(
    @Inject(INJECTION_TOKENS.USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(input: GetProfileInput): Promise<Result<GetProfileOutput>> {
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      return Result.fail('User not found');
    }

    return Result.ok({
      id: user.id.toValue(),
      name: user.name,
      email: user.email.value,
      phone: user.phone,
      birthDate: user.birthDate?.toISOString(),
      location: user.location,
      createdAt: user.createdAt.toISOString(),
    });
  }
}
