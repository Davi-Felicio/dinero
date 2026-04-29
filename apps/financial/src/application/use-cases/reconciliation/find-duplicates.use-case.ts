import { Injectable } from '@nestjs/common';
import { IUseCase, Result } from '@dinero/shared';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

export interface FindDuplicatesInput {
  userId: string;
}

export interface DuplicateTransactionItem {
  id: string;
  localId: string | null;
  description: string;
  date: string;
  createdAt: string;
}

export interface DuplicateGroup {
  amount: number;
  currency: string;
  transactions: DuplicateTransactionItem[];
}

export interface FindDuplicatesOutput {
  totalGroups: number;
  groups: DuplicateGroup[];
}

@Injectable()
export class FindDuplicatesUseCase implements IUseCase<FindDuplicatesInput, FindDuplicatesOutput> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(input: FindDuplicatesInput): Promise<Result<FindDuplicatesOutput>> {
    const { userId } = input;

    const rows = await this.prisma.transaction.findMany({
      where: { userId, deletedAt: null },
      orderBy: { date: 'asc' },
    });

    const visited = new Set<string>();
    const groups: DuplicateGroup[] = [];

    for (let i = 0; i < rows.length; i++) {
      const a = rows[i];
      if (visited.has(a.id)) continue;

      const group: DuplicateTransactionItem[] = [];

      for (let j = i + 1; j < rows.length; j++) {
        const b = rows[j];
        if (visited.has(b.id)) continue;

        if (this.areLikelyDuplicates(a, b)) {
          if (group.length === 0) {
            group.push({ id: a.id, localId: a.localId, description: a.description, date: a.date.toISOString(), createdAt: a.createdAt.toISOString() });
            visited.add(a.id);
          }
          group.push({ id: b.id, localId: b.localId, description: b.description, date: b.date.toISOString(), createdAt: b.createdAt.toISOString() });
          visited.add(b.id);
        }
      }

      if (group.length >= 2) {
        groups.push({ amount: a.amount.toNumber(), currency: a.currency, transactions: group });
      }
    }

    return Result.ok({ totalGroups: groups.length, groups });
  }

  private areLikelyDuplicates(a: any, b: any): boolean {
    const sameAmount = Math.abs(Number(a.amount) - Number(b.amount)) < 0.01;
    const sameCurrency = a.currency === b.currency;
    const timeDiffMs = Math.abs(a.date.getTime() - b.date.getTime());
    const closeInTime = timeDiffMs < 5 * 60 * 1000;
    const descA = a.description.toLowerCase().trim();
    const descB = b.description.toLowerCase().trim();
    const similarDesc = descA === descB || descA.startsWith(descB) || descB.startsWith(descA);
    return sameAmount && sameCurrency && closeInTime && similarDesc;
  }
}
