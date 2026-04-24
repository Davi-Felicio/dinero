import { UniqueEntityID } from '@dinero/shared';
import { UserEntity } from '../../../../domain/entities/user.entity';
import { Email } from '../../../../domain/value-objects/email.vo';

type UserPrismaModel = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  phone: string | null;
  birthDate: Date | null;
  location: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export class UserMapper {
  static toDomain(raw: UserPrismaModel): UserEntity {
    return UserEntity.reconstitute(
      {
        name: raw.name,
        email: Email.create(raw.email),
        passwordHash: raw.passwordHash,
        phone: raw.phone ?? undefined,
        birthDate: raw.birthDate ?? undefined,
        location: raw.location ?? undefined,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPersistence(user: UserEntity): UserPrismaModel {
    return {
      id: user.id.toValue(),
      name: user.name,
      email: user.email.value,
      passwordHash: user.passwordHash,
      phone: user.phone ?? null,
      birthDate: user.birthDate ?? null,
      location: user.location ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
