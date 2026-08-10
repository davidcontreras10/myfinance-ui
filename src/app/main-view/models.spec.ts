import { BankTrxReqRespPair } from './models';
import { BankTransactionStatus } from '../services/models';

describe('BankTrxReqRespPair.areTrxsAmountsValid', () => {
  function makePair(bankAmount: number, splitAmounts: number[]): BankTrxReqRespPair {
    const pair = new BankTrxReqRespPair();
    pair.current = {
      dbStatus: BankTransactionStatus.Inserted,
      fileTransaction: { originalAmount: bankAmount } as any,
      processData: {
        transactions: splitAmounts.map((amount, i) => ({ originalAmount: amount, spendId: i } as any))
      }
    } as any;
    pair.original = pair.current;
    return pair;
  }

  it('treats a split as valid when the parts sum to the bank amount, despite floating point addition error', () => {
    // 10 + 5.53 === 15.530000000000001 in JS, not === 15.53 by strict equality - this is
    // the exact scenario that was incorrectly flagged as invalid before the fix.
    const pair = makePair(15.53, [10, 5.53]);
    expect(pair.areTrxsAmountsValid).toBe(true);
  });

  it('treats a split as invalid when the parts genuinely do not sum to the bank amount', () => {
    const pair = makePair(15.53, [10, 5]);
    expect(pair.areTrxsAmountsValid).toBe(false);
  });

  it('is always valid for a single (non-split) transaction, regardless of amount', () => {
    const pair = makePair(15.53, [15.53]); // only one entry => isMultipleTrx is false
    expect(pair.areTrxsAmountsValid).toBe(true);
  });
});
