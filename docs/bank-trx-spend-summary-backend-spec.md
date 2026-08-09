# Bank Transactions — Spend Summary: backend spec

Context for whoever implements the backend endpoint for the new "Spend Summary by Bank"
feature on the Bank Transactions page. This doc is the frontend session's compilation of
every business rule/decision made while designing it — the frontend (`myfinance-ui`) side
is already built and committed against this contract, currently backed by mock data since
the endpoint doesn't exist yet.

## Domain background

- A MyFinance **Account** is a virtual/internal account. Some accounts are flagged as
  representing a real-world **bank account** — only those participate in this summary.
  Accounts not flagged this way (budget/category-style accounts) are excluded entirely.
- A bank-flagged Account is linked to a **financial entity** (the real bank, e.g. "Bac San
  Jose", "Banco Nacional", "Scotiabank") via `financialEntityId`/`financialEntityName`.
  - This is a *different, unrelated* concept from the existing `FinancialEntityFile` enum
    (`Scotiabank=1, Promerica=2, BacSanJose=3`), which only selects which bank's file
    *format* to parse on upload. Don't conflate the two — `financialEntityId` here is an
    open-ended id/name pair (arbitrary banks), not that closed enum.
  - There's already a similar, existing endpoint for a related but different purpose:
    `GET /api/Accounts/finance/summary` returns `FinancialSummaryAccount[]` (flat list,
    each row already carrying `financialEntityId`/`financialEntityName`) used to show
    **current account balances** grouped by bank on the main Finance view. The new
    endpoint below is a **different** summary — spend *within a specific set of
    transactions*, not standing balances — but can likely reuse the same
    account↔financial-entity lookup on the backend.
- Every Account has its own **default currency** (`currencyId`). A transaction can be
  recorded against an account in a *different* currency than the account's default
  (exchange rate conversion happens elsewhere in the app), but the account itself always
  has exactly one default currency.
- A bank transaction row's natural/composite key is **`(transactionId, financialEntityId)`**
  — `transactionId` alone is not guaranteed unique across financial entities. (Mirrors the
  existing frontend convention `getHashedId() = "${financialEntityId}-${transactionId}"`.)

## Feature purpose

After a batch of uploaded bank-transaction rows gets processed (submitted → turned into
real expense records), the user wants to see **how much was spent, grouped by bank, then
by account, broken down by currency** — e.g.:

```
Bank            Account          Dollar      Colones         Total
Bac San Jose    CUENTA BAC       $16,799.90  ₡1,248,406.50   $19,249.83
Bac San Jose    BAC COLONES      $10.00      ₡30,000.00      ₡35,000.00
Banco Nacional  BN DÓLARES       $13,667.76  -               $13,667.76
Banco Nacional  BN COLONES       -           ₡1,884,250.20   ₡1,884,250.20
Scotiabank      Scotiabank_COL   -           ₡2,346,268.00   ₡2,346,268.00
```

This is a **manual-trigger-turned-automatic** feature: the frontend recomputes it any time
its in-memory transaction list changes (upload, search, submit, delete, reset, clear), by
sending **every currently-loaded row whose status is `Processed`** — not just "the last
submitted batch." So the backend should compute the summary strictly over the exact set of
`(transactionId, financialEntityId)` pairs it's given, with no hidden date-range, session,
or "since last call" state.

## API contract

**Endpoint:** `POST /api/BankTransactionsFiles/summary` (does not exist yet — this is the
one piece of work needed)

### Request

```ts
interface BankTrxSpendSummaryRequestItem {
  transactionId: string;
  financialEntityId: number;
}

// body:
{
  transactions: BankTrxSpendSummaryRequestItem[]
}
```

### Response

```ts
interface BankTrxSpendSummaryResponse {
  currencies: BankTrxSpendSummaryCurrency[];   // union of every currency that appears anywhere in the result
  banks: BankTrxSpendSummaryBank[];
}

interface BankTrxSpendSummaryCurrency {
  currencyId: number;
  symbol: string;   // e.g. "$"
  name: string;      // e.g. "Dollar"
}

interface BankTrxSpendSummaryBank {
  financialEntityId: number;
  financialEntityName: string;
  accounts: BankTrxSpendSummaryAccount[];      // one entry per bank-flagged Account that has spend among the requested transactions
}

interface BankTrxSpendSummaryAccount {
  accountId: number;
  accountName: string;
  currencyId: number;                          // this account's own default currency (drives which cell is "the" total's currency)
  currencyAmounts: BankTrxSpendSummaryCurrencyAmount[]; // ONLY currencies this account actually has spend in for the given transactions
  total: number;                                // sum of all this account's currencyAmounts, converted into `currencyId` (the account's default currency)
}

interface BankTrxSpendSummaryCurrencyAmount {
  currencyId: number;
  amount: number;
}
```

### Business rules for the response shape

1. **`currencies` is the global, top-level list** — the union of every currency that shows
   up across the whole result, in a stable order. The frontend uses this array (not each
   account's own currencies) to build the table's columns, so every account's
   `currencyAmounts` should use `currencyId` values that exist in this top-level list.
2. **Omit, don't zero.** If an account has no spend in a given currency, don't include an
   entry for it in that account's `currencyAmounts` at all — the frontend renders a `-` for
   any currency in the global list that's absent from a given account's array. Sending a
   `{ currencyId, amount: 0 }` entry would be wrong; it would render `0` instead of `-`.
3. **`total` is per-account, converted into that account's own default currency**
   (`currencyId` on the same object) — not a fixed reporting currency, and not a raw sum
   across mismatched currencies. This conversion is entirely a backend responsibility; the
   frontend just displays `total` labeled with whatever `currencyId` the account declares
   as its default.
4. **Grouping is strictly Bank → Account.** No further grouping/sorting rules were
   specified beyond that — order of banks/accounts in the array is up to the backend
   (frontend renders in the order received).
5. **Only bank-flagged accounts appear.** If none of the accounts touched by the requested
   transactions are flagged as bank accounts, return `{ currencies: [], banks: [] }` — this
   is a valid, expected empty result (the frontend already handles it by rendering nothing),
   not an error.
6. **The request list can mix transactions across many different financial entities and
   dates** — it's whatever the frontend currently has loaded as `Processed`, not scoped to
   a single upload batch or a single bank.

## Not part of this endpoint (context only, no action needed)

- **"Pending" semantics** (`isPending` on transactions): a pending transaction is recorded
  in MyFinance (counted toward the account's MyFinance balance) but not yet reflected in
  the real bank balance, so reconciliation excludes it from the real-balance comparison.
  This already exists and is unrelated to the new endpoint — mentioned here only so the
  backend session has the same shared vocabulary if it comes up.
