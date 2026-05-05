import { Inject, Injectable } from '@nestjs/common';
import { IUseCase, Result } from '@dinero/shared';
import { IBankConnectionRepository } from '../../domain/repositories/bank-connection.repository';
import { INJECTION_TOKENS } from '../../injection-tokens';

export interface ListBankConnectionsInput {
  userId: string;
}

@Injectable()
export class ListBankConnectionsUseCase implements IUseCase<ListBankConnectionsInput, any[]> {
  constructor(
    @Inject(INJECTION_TOKENS.BANK_CONNECTION_REPOSITORY)
    private readonly bankConnectionRepository: IBankConnectionRepository,
  ) {}

  async execute(input: ListBankConnectionsInput): Promise<Result<any[]>> {
    const connections = await this.bankConnectionRepository.findAllByUserId(input.userId);
    return Result.ok(
      connections.map((c) => ({
        id: c.id.toValue(),
        institutionId: c.institutionId,
        institutionName: c.institutionName,
        status: c.status,
        consentId: c.consentId,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      })),
    );
  }
}
