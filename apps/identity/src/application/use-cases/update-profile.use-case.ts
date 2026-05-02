import { Inject, Injectable } from '@nestjs/common';
import { IUseCase, Result } from '@dinero/shared';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { INJECTION_TOKENS } from '../../injection-tokens';

export interface UpdateProfileInput {
  userId: string;
  name?: string;
  phone?: string;
  birthDate?: string;
  location?: string;
}

export interface UpdateProfileOutput {
  id: string;
  name: string;
  email: string;
  phone?: string;
  birthDate?: string;
  location?: string;
}

@Injectable()
export class UpdateProfileUseCase implements IUseCase<UpdateProfileInput, UpdateProfileOutput> {
  constructor(
    @Inject(INJECTION_TOKENS.USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(input: UpdateProfileInput): Promise<Result<UpdateProfileOutput>> {
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      return Result.fail('User not found');
    }

    user.updateProfile({
      name: input.name,
      phone: input.phone,
      birthDate: input.birthDate ? new Date(input.birthDate) : undefined,
      location: input.location,
    });

    await this.userRepository.save(user);

    return Result.ok({
      id: user.id.toValue(),
      name: user.name,
      email: user.email.value,
      phone: user.phone,
      birthDate: user.birthDate?.toISOString(),
      location: user.location,
    });
  }
}
