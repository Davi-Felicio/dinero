import { Inject, Injectable } from '@nestjs/common';
import { IUseCase, Result } from '@dinero/shared';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { INJECTION_TOKENS } from '../../injection-tokens';

export interface DeleteAccountInput {
  userId: string;
}

export interface DeleteAccountOutput {
  deleted: true;
}

@Injectable()
export class DeleteAccountUseCase
  implements IUseCase<DeleteAccountInput, DeleteAccountOutput>
{
  constructor(
    @Inject(INJECTION_TOKENS.USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(input: DeleteAccountInput): Promise<Result<DeleteAccountOutput>> {
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      return Result.fail('User not found');
    }

    await this.userRepository.delete(input.userId);

    return Result.ok({ deleted: true });
  }
}
