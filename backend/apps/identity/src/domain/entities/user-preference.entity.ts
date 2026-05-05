import { Entity, UniqueEntityID } from '@dinero/shared';
import { Currency } from '../value-objects/currency.vo';

export interface IUserPreferenceProps {
  userId: string;
  defaultCurrency: Currency;
  darkMode: boolean;
}

interface IUserPreferenceCreateProps {
  userId: string;
  defaultCurrency: Currency;
  darkMode: boolean;
}

interface IUserPreferenceReconstituteProps {
  userId: string;
  defaultCurrency: string;
  darkMode: boolean;
}

export class UserPreferenceEntity extends Entity<IUserPreferenceProps> {
  private constructor(props: IUserPreferenceProps, id?: UniqueEntityID) {
    super(props, id);
  }

  static create(props: IUserPreferenceCreateProps, id?: UniqueEntityID): UserPreferenceEntity {
    return new UserPreferenceEntity(props, id);
  }

  static reconstitute(
    props: IUserPreferenceReconstituteProps,
    id: UniqueEntityID,
  ): UserPreferenceEntity {
    return new UserPreferenceEntity(
      {
        userId: props.userId,
        defaultCurrency: Currency.create(props.defaultCurrency),
        darkMode: props.darkMode,
      },
      id,
    );
  }

  get userId(): string {
    return this.props.userId;
  }

  get defaultCurrency(): Currency {
    return this.props.defaultCurrency;
  }

  get darkMode(): boolean {
    return this.props.darkMode;
  }

  changeCurrency(newCurrency: Currency): void {
    Object.assign(this.props, { defaultCurrency: newCurrency });
  }

  toggleDarkMode(): void {
    Object.assign(this.props, { darkMode: !this.props.darkMode });
  }
}
