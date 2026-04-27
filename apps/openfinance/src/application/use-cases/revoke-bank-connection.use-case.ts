import { Inject, Injectable } from '@nestjs/common';
import { IUseCase, Result } from '@dinero/shared';
import { IBankConnectionRepository } from '../../domain/repositories/bank-connection.repository';
import { INJECTION_TOKENS } from '../../injection-tokens';

export interface RevokeBankConnectionInput {
  id: string;
  userId: string;
}

@Injectable()
export class RevokeBankConnectionUseCase implements IUseCase<RevokeBankConnectionInput, void> {
  constructor(
    @Inject(INJECTION_TOKENS.BANK_CONNECTION_REPOSITORY)
    private readonly bankConnectionRepository: IBankConnectionRepository,
  ) {}

  async execute(input: RevokeBankConnectionInput): Promise<Result<void>> {
    const connection = await this.bankConnectionRepository.findById(input.id);
    if (!connection) return Result.fail('Bank connection not found');
    if (connection.userId !== input.userId) return Result.fail('Forbidden');
    connection.revoke();
    await this.bankConnectionRepository.save(connection);
    return Result.ok();
  }
}
