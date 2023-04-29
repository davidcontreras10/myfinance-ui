import { CurrencyAmountPipe } from './currency-amount.pipe';

describe('CurrencyAmountPipe', () => {
  it('create an instance', () => {
    const pipe = new CurrencyAmountPipe();
    expect(pipe).toBeTruthy();
  });
});
