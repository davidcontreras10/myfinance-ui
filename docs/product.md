# Product context

> DRAFT — written from the code and the author's notes. The author should correct anything that
> doesn't match the intent. The backend repo (`MyFinanceAPI`) has the fuller domain write-up in its
> `docs/product.md`.

## What this is

The web UI of a personal finance application. The backend (`MyFinanceAPI`) holds the data and rules; this
app lets the user view and manage accounts, record transactions, import and match bank transactions,
move money between accounts, track debts, and manage scheduled tasks.

It is a solo, non-commercial project with a small real user base (the author, family and a friend), so
pragmatic and maintainable-by-one-person beats enterprise-grade.

## Core idea: accounts, sub-accounts, reconciliation

Instead of opening several real bank accounts to separate money mentally (rent, savings, spending),
the user keeps **one real bank account** and splits the money **inside the app** with accounts and
sub-accounts. The sum of the app's sub-accounts must **reconcile** against the real bank balance, so
amounts shown in the UI have to be trustworthy.

## Screens and features

Routes are defined in `src/app/app-routing.module.ts`; all except `login` require authentication.

| Route | What it's for |
|---|---|
| `/` | Menu page — entry point to the other screens. |
| `/finance` | **Main view.** Accounts grouped in an accordion, per-account transactions, add transaction, transfers between accounts, account notes, bank-balance summary, and view preferences (including a compact view). |
| `/bank-trx` | **Bank transactions.** Import bank statement files, review the imported transactions, link them to app transactions, and see spend summaries by bank. |
| `/accounts`, `/accounts/new`, `/accounts/edit/:accountId` | Create, edit and organize accounts and account groups (drag-and-drop ordering). |
| `/transaction-types` | Manage the user's transaction types (categories). |
| `/debt-manager` | Debt requests between users: submitted and received requests, and the transactions behind them. |
| `/scheduled-tasks`, `/scheduled-tasks/new` | View, search, create and edit scheduled/automatic tasks and see their executed runs. Execution happens in a separate Azure Functions project, not in the API or the UI. |
| `/login` | Sign in (JWT). |

## Glossary

- **Spend** — a historical backend name. It means *any* transaction that affects an account balance,
  expense **or** income. UI labels may say "transaction".
- **Reconciliation** — matching the sum of sub-accounts against the real bank balance.
- **Financial entity** — a bank/institution.
- **App transaction vs. bank transaction** — app transactions are what the user records in the app;
  bank transactions come from the bank statement. Linked bank transactions are shown with a consistent
  blue accent in the main view.
- **Currency** — accounts have a default currency; conversion is tailored to Costa Rican banks (rates
  come from the backend).
