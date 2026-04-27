import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IBankConnectionRepository } from '../../../domain/repositories/bank-connection.repository';
import { BankConnectionEntity } from '../../../domain/entities/bank-connection.entity';
import { BankConnectionMapper } from './mappers/bank-connection.mapper';

@Injectable()
export class PrismaBankConnectionRepository implements IBankConnectionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(connection: BankConnectionEntity): Promise<void> {
    const data = BankConnectionMapper.toPersistence(connection);
    await this.prisma.bankConnection.upsert({
      where: { id: data.id },
      create: data,
      update: {
        status: data.status,
        consentId: data.consentId,
        updatedAt: data.updatedAt,
      },
    });
  }

  async findById(id: string): Promise<BankConnectionEntity | null> {
    const raw = await this.prisma.bankConnection.findUnique({ where: { id } });
    return raw ? BankConnectionMapper.toDomain(raw) : null;
  }

  async findAllByUserId(userId: string): Promise<BankConnectionEntity[]> {
    const raws = await this.prisma.bankConnection.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return raws.map(BankConnectionMapper.toDomain);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.bankConnection.delete({ where: { id } });
  }
}
