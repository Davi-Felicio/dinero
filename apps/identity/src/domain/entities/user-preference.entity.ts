import { Entity, UniqueEntityID } from '@dinero/shared';

export interface IUserPreferenceProps {
  userId: string;
  defaultCurrency: string;
  darkMode: boolean;
}

export class UserPreferenceEntity extends Entity<IUserPreferenceProps> {
  private constructor(props: IUserPreferenceProps, id?: UniqueEntityID) {
    super(props, id);
  }

  static create(props: IUserPreferenceProps, id?: UniqueEntityID): UserPreferenceEntity {
    return new UserPreferenceEntity(props, id);
  }

  static reconstitute(props: IUserPreferenceProps, id: UniqueEntityID): UserPreferenceEntity {
    return new UserPreferenceEntity(props, id);
  }

  get userId(): string { return this.props.userId; }
  get defaultCurrency(): string { return this.props.defaultCurrency; }
  get darkMode(): boolean { return this.props.darkMode; }
}
