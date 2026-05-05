import { Inject, Injectable } from '@nestjs/common';
import { IUseCase, Result } from '@dinero/shared';
import { IBankConnectionRepository } from '../../domain/repositories/bank-connection.repository';
import { BankConnectionEntity } from '../../domain/entities/bank-connection.entity';
import { INJECTION_TOKENS } from '../../injection-tokens';

export interface CreateBankConnectionInput {
  userId: string;
  institutionId: string;
  institutionName: string;
}

@Injectable()
export class CreateBankConnectionUseCase implements IUseCase<CreateBankConnectionInput, any> {
  constructor(
    @Inject(INJECTION_TOKENS.BANK_CONNECTION_REPOSITORY)
    private readonly bankConnectionRepository: IBankConnectionRepository,
  ) {}

  async execute(input: CreateBankConnectionInput): Promise<Result<any>> {
    const connection = BankConnectionEntity.create({
      userId: input.userId,
      institutionId: input.institutionId,
      institutionName: input.institutionName,
    });

    await this.bankConnectionRepository.save(connection);

    return Result.ok({
      id: connection.id.toValue(),
      userId: connection.userId,
      institutionId: connection.institutionId,
      institutionName: connection.institutionName,
      status: connection.status,
      createdAt: connection.createdAt.toISOString(),
    });
  }
}
