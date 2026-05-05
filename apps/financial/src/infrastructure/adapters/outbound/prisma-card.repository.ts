import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ICardRepository } from '../../../domain/repositories/card.repository';
import { CardEntity } from '../../../domain/entities/card.entity';
import { CardMapper } from './mappers/card.mapper';

@Injectable()
export class PrismaCardRepository implements ICardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(card: CardEntity): Promise<void> {
    const data = CardMapper.toPersistence(card);
    await this.prisma.card.upsert({
      where: { id: data.id },
      create: data,
      update: {
        name: data.name,
        brand: data.brand,
        lastDigits: data.lastDigits,
        currentBill: data.currentBill,
        creditLimit: data.creditLimit,
        dueDay: data.dueDay,
        updatedAt: data.updatedAt,
      },
    });
  }

  async findById(id: string): Promise<CardEntity | null> {
    const raw = await this.prisma.card.findUnique({ where: { id } });
    return raw ? CardMapper.toDomain(raw) : null;
  }

  async findAllByUserId(userId: string): Promise<CardEntity[]> {
    const raws = await this.prisma.card.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
    return raws.map(CardMapper.toDomain);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.card.delete({ where: { id } });
  }
}
