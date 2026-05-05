import { Injectable } from '@nestjs/common';
import { UniqueEntityID } from '@dinero/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { IUserPreferenceRepository } from '../../../domain/repositories/user-preference.repository';
import { UserPreferenceEntity } from '../../../domain/entities/user-preference.entity';

@Injectable()
export class PrismaUserPreferenceRepository implements IUserPreferenceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(pref: UserPreferenceEntity): Promise<void> {
    await this.prisma.userPreference.upsert({
      where: { userId: pref.userId },
      create: {
        id: pref.id.toValue(),
        userId: pref.userId,
        defaultCurrency: pref.defaultCurrency.code,
        darkMode: pref.darkMode,
      },
      update: {
        defaultCurrency: pref.defaultCurrency.code,
        darkMode: pref.darkMode,
      },
    });
  }

  async findByUserId(userId: string): Promise<UserPreferenceEntity | null> {
    const raw = await this.prisma.userPreference.findUnique({ where: { userId } });
    if (!raw) return null;
    return UserPreferenceEntity.reconstitute(
      {
        userId: raw.userId,
        defaultCurrency: raw.defaultCurrency,
        darkMode: raw.darkMode,
      },
      new UniqueEntityID(raw.id),
    );
  }
}
