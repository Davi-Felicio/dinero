import { ValueObject } from '@dinero/shared';

export const SUPPORTED_CURRENCIES = ['BRL', 'USD', 'EUR'] as const;
export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];

interface ICurrencyProps {
  code: CurrencyCode;
}

export class Currency extends ValueObject<ICurrencyProps> {
  private constructor(props: ICurrencyProps) {
    super(props);
  }

  static create(code: string): Currency {
    if (typeof code !== 'string' || code.trim().length === 0) {
      throw new Error(
        `Unsupported currency: "${code}". Supported: ${SUPPORTED_CURRENCIES.join(', ')}`,
      );
    }
    const upper = code.toUpperCase().trim();
    if (!SUPPORTED_CURRENCIES.includes(upper as CurrencyCode)) {
      throw new Error(
        `Unsupported currency: "${code}". Supported: ${SUPPORTED_CURRENCIES.join(', ')}`,
      );
    }
    return new Currency({ code: upper as CurrencyCode });
  }

  get code(): CurrencyCode {
    return this.props.code;
  }

  toString(): string {
    return this.props.code;
  }
}
