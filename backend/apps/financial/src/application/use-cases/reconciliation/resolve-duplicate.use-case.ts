import { Injectable } from '@nestjs/common';
import { IUseCase, Result } from '@dinero/shared';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

export interface ResolveDuplicateInput {
  userId: string;
  keepId: string;
  removeIds: string[];
}

export interface ResolveDuplicateOutput {
  kept: string;
  removed: number;
}

@Injectable()
export class ResolveDuplicateUseCase implements IUseCase<ResolveDuplicateInput, ResolveDuplicateOutput> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(input: ResolveDuplicateInput): Promise<Result<ResolveDuplicateOutput>> {
    const { userId, keepId, removeIds } = input;

    if (removeIds.includes(keepId)) {
      return Result.fail('keepId cannot be in removeIds');
    }

    const keeper = await this.prisma.transaction.findUnique({ where: { id: keepId } });
    if (!keeper || keeper.userId !== userId || keeper.deletedAt !== null) {
      return Result.fail('Transaction to keep not found');
    }

    const { count } = await this.prisma.transaction.updateMany({
      where: { id: { in: removeIds }, userId, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    return Result.ok({ kept: keepId, removed: count });
  }
}
