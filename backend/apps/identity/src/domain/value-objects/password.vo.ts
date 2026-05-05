import { Result, ValueObject } from '@dinero/shared';

interface IPasswordProps {
  value: string;
}

export class Password extends ValueObject<IPasswordProps> {
  private static readonly MIN_LENGTH = 8;
  private static readonly UPPERCASE_REGEX = /[A-Z]/;
  private static readonly NUMBER_REGEX = /[0-9]/;

  private constructor(props: IPasswordProps) {
    super(props);
  }

  static validate(plain: string): Result<string> {
    if (typeof plain !== 'string' || plain.length < Password.MIN_LENGTH) {
      return Result.fail<string>(
        'Password must contain at least 8 characters, one uppercase letter and one number',
      );
    }
    if (!Password.UPPERCASE_REGEX.test(plain)) {
      return Result.fail<string>(
        'Password must contain at least 8 characters, one uppercase letter and one number',
      );
    }
    if (!Password.NUMBER_REGEX.test(plain)) {
      return Result.fail<string>(
        'Password must contain at least 8 characters, one uppercase letter and one number',
      );
    }
    return Result.ok<string>(plain);
  }

  static create(plain: string): Password {
    const result = Password.validate(plain);
    if (result.isFailure()) {
      throw new Error(result.error);
    }
    return new Password({ value: result.getValue() });
  }

  get value(): string {
    return this.props.value;
  }
}
