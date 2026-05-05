import { IsIn, IsString } from 'class-validator';
import { SUPPORTED_CURRENCIES } from '../../domain/value-objects/currency.vo';

export class UpdateCurrencyDto {
  @IsString()
  @IsIn([...SUPPORTED_CURRENCIES], {
    message: `Currency must be one of: ${SUPPORTED_CURRENCIES.join(', ')}`,
  })
  currency!: string;
}
