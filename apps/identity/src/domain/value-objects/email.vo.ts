import { ValueObject } from '@dinero/shared';

interface IEmailProps {
  value: string;
}

export class Email extends ValueObject<IEmailProps> {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  private constructor(props: IEmailProps) {
    super(props);
  }

  static create(email: string): Email {
    const normalized = email.trim().toLowerCase();
    if (!Email.EMAIL_REGEX.test(normalized)) {
      throw new Error(`Invalid email: ${email}`);
    }
    return new Email({ value: normalized });
  }

  get value(): string {
    return this.props.value;
  }

  toString(): string {
    return this.props.value;
  }
}
