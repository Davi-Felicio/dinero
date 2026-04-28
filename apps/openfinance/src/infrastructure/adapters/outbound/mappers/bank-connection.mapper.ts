import { UniqueEntityID } from '@dinero/shared';
import {
  BankConnectionEntity,
  ConnectionStatus,
} from '../../../../domain/entities/bank-connection.entity';

type BankConnectionPrismaModel = {
  id: string;
  userId: string;
  institutionId: string;
  institutionName: string;
  consentId: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

export class BankConnectionMapper {
  static toDomain(raw: BankConnectionPrismaModel): BankConnectionEntity {
    return BankConnectionEntity.reconstitute(
      {
        userId: raw.userId,
        institutionId: raw.institutionId,
        institutionName: raw.institutionName,
        consentId: raw.consentId ?? undefined,
        status: raw.status as ConnectionStatus,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPersistence(connection: BankConnectionEntity) {
    return {
      id: connection.id.toValue(),
      userId: connection.userId,
      institutionId: connection.institutionId,
      institutionName: connection.institutionName,
      consentId: connection.consentId ?? null,
      status: connection.status,
      createdAt: connection.createdAt,
      updatedAt: connection.updatedAt,
    };
  }
}
