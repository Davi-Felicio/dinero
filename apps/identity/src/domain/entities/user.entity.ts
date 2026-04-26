import { AggregateRoot, UniqueEntityID } from '@dinero/shared';
import { Email } from '../value-objects/email.vo';

export interface IUserProps {
  name: string;
  email: Email;
  passwordHash: string;
  phone?: string;
  birthDate?: Date;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class UserEntity extends AggregateRoot<IUserProps> {
  private constructor(props: IUserProps, id?: UniqueEntityID) {
    super(props, id);
  }

  static create(props: Omit<IUserProps, 'createdAt' | 'updatedAt'>, id?: UniqueEntityID): UserEntity {
    if (!props.name || props.name.trim().length < 2) {
      throw new Error('Name must have at least 2 characters');
    }
    return new UserEntity(
      { ...props, createdAt: new Date(), updatedAt: new Date() },
      id,
    );
  }

  static reconstitute(props: IUserProps, id: UniqueEntityID): UserEntity {
    return new UserEntity(props, id);
  }

  get name(): string { return this.props.name; }
  get email(): Email { return this.props.email; }
  get passwordHash(): string { return this.props.passwordHash; }
  get phone(): string | undefined { return this.props.phone; }
  get birthDate(): Date | undefined { return this.props.birthDate; }
  get location(): string | undefined { return this.props.location; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  updateProfile(data: { name?: string; phone?: string; birthDate?: Date; location?: string }): void {
    if (data.name !== undefined && data.name.trim().length < 2) {
      throw new Error('Name must have at least 2 characters');
    }
    Object.assign(this.props, {
      ...data,
      updatedAt: new Date(),
    });
  }
}
