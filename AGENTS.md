# AGENTS.md

Instructions for AI coding tools (Claude Code, Codex, Copilot, …) working in this repository. This is the
canonical file; tool-specific files (`CLAUDE.md`, `.github/copilot-instructions.md`) only point here.

## Keeping this documentation up to date

If you learn something a future session would need (a new feature, a domain rule, a convention, a gotcha,
a changed command), record it in the repository docs — this file or a file under `docs/` — not in a
tool-specific file (`CLAUDE.md`, `.github/copilot-instructions.md`, a tool's memory, etc.). Those files
only point here. Keep additions short and durable; skip anything obvious from the code or likely to go
stale. Put product/domain facts in `docs/product.md` and structure/technical facts in
`docs/architecture.md`. The same applies to the sibling repository's docs when the fact belongs there.

## What this is

myfinance-ui — the Angular 16 frontend of a personal finance app (accounts and sub-accounts reconciled
against one real bank account, transactions, bank statement import, transfers, debt requests, scheduled
tasks). Solo, non-commercial project. Deployed as an Azure Static Web App.

## Read first

- [docs/product.md](docs/product.md) — what the app is for, screens/features, glossary (note: "Spend"
  means any transaction, expense or income).
- [docs/architecture.md](docs/architecture.md) — module structure, routing, auth, HTTP layer, config, CI.
- Other files in [docs/](docs/) are specs for individual features.

## Related repository

The backend is a separate repo: `MyFinanceAPI` (.NET 8, usually checked out next to this one). The base URL
is set in `src/environments/` (dev: `https://localhost:44324`, prod: the Azure Web App). The backend
allow-lists this app's origins in CORS, including `localhost:4350` (the dev server port in `angular.json`).
API JSON is camelCase. Several `docs/` specs in this repo describe backend contracts the UI depends on; when
a UI change needs an API change, update the backend repo too.

## Commands

```bash
npm install
npm start          # ng serve on http://localhost:4350
npm run build      # output in dist/
npm test           # Karma + Jasmine (needs Chrome)
```

To run one spec headless (set `CHROME_BIN` to your Chrome executable first):

```bash
npx ng test --watch=false --browsers=ChromeHeadless --include 'src/app/new-account/**/*.spec.ts'
```

Many components and services have `.spec.ts` files, but don't assume behavior is pinned by tests — check
the code and call sites when changing something. Some specs are unedited Angular scaffolds that already
fail (they provide no `HttpClient` or router), so a red full run isn't necessarily new. Prefer testing a
component's logic directly, without `TestBed` (see `bank-transactions.component.spec.ts`), or provide the
services it injects.

## Conventions

- NgModule-based Angular (not standalone components). New components are declared in
  `src/app/app.module.ts`; new routes go in `src/app/app-routing.module.ts` behind `AuthGuard`.
- API calls go through the services in `src/app/services/` (`*-api.service.ts`); components don't call
  `HttpClient` directly. Use the existing base URL from `environment.baseApi`.
- UI is Bootstrap 5 + ng-bootstrap. Match the look of neighboring screens rather than introducing new
  styling libraries.
- Use the theme tokens in `src/styles.css` (`--st-border`, `--st-ink`, `--st-accent`, …) for new styles, and the
  shared `.fold` pattern in `new-account.component.css` for collapsible sections, instead of one-off colors.
- Words users see say "transaction" where the code says `spend` (e.g. the "Default Transaction Type" field is
  `spendTypeId`). Change the label, not the code names.
- Don't commit secrets or environment-specific URLs other than the two in `src/environments/`.
- Ask before every `git commit`, push or pull request, even when you were asked to do the work: say what would be
  committed (files, one-line message, branch) and wait for a yes. A yes covers only that one commit.
- Branching: **`develop` is the working branch** — start new work, branches, worktrees and new sessions from it
  (the git default branch is `master`, so tools often start from `master` by mistake; switch to `develop` first).
  **`master` is production**, and **production is the only environment** (no dev or staging): merging to `master`
  is a production release, and the API's release runs its database migrations first (see the API repo's
  `docs/architecture.md`, "CI / deployment").
