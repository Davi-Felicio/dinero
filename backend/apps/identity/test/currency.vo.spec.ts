import { Currency } from '../src/domain/value-objects/currency.vo';

describe('Currency value object', () => {
  it('cria Currency com BRL, USD, EUR', () => {
    expect(Currency.create('BRL').code).toBe('BRL');
    expect(Currency.create('USD').code).toBe('USD');
    expect(Currency.create('EUR').code).toBe('EUR');
  });

  it('normaliza lowercase ("brl" → "BRL")', () => {
    expect(Currency.create('brl').code).toBe('BRL');
    expect(Currency.create(' usd ').code).toBe('USD');
    expect(Currency.create('eUr').code).toBe('EUR');
  });

  it('falha com moeda não suportada', () => {
    expect(() => Currency.create('XYZ')).toThrow(/Unsupported currency/);
    expect(() => Currency.create('GBP')).toThrow(/Unsupported currency/);
  });

  it('falha com string vazia', () => {
    expect(() => Currency.create('')).toThrow(/Unsupported currency/);
    expect(() => Currency.create('   ')).toThrow(/Unsupported currency/);
  });

  it('equals() funciona entre duas instâncias iguais', () => {
    const a = Currency.create('BRL');
    const b = Currency.create('brl');
    const c = Currency.create('USD');
    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });
});
