# Architecture

How the frontend is organized. For what the app is for, see [product.md](product.md).

## Stack

Angular 18 (NgModule-based; upgrade notes in [angular-upgrade.md](angular-upgrade.md)), TypeScript 5, RxJS, Bootstrap 5, ng-bootstrap, Angular CDK (drag-and-drop).
Tests: Karma + Jasmine. Built and hosted as an Azure Static Web App.

## Structure (`src/app`)

- `app.module.ts` — the single root module; every component is declared here.
- `app-routing.module.ts` — all routes. Authenticated routes use `AuthGuard`; `/login` uses `LoginGuard`.
- Feature folders, one per screen: `main-view/` (the main finance view and its many sub-components,
  including `bank-transactions/`), `accounts/`, `new-account/`, `transaction-types/`, `debt-manager/`,
  `automatic-tasks/` (scheduled tasks), `login/`, `menu-page/`.
- Shared UI: `main-nav-bar/`, `main-spinner/`, `core-spinner/`, `error-modal/`, `toast-container/`,
  `bs-icon/`, `draggable-grid/`, plus `currency-amount.pipe.ts`, `clickOutside.directive.ts`, `utils.ts`.
- `services/` — API services (`*-api.service.ts`, one per backend area) and app services (spinner,
  toaster, navigation, model/view-model helpers). `services/models.ts` holds shared API models.
- `interceptors/` — HTTP interceptors (see below).

## Authentication

`AuthService` stores the JWT and its expiry in `localStorage` (key `jwtToken`). `AuthGuard` blocks
unauthenticated routes. `HttpTokenInterceptor` attaches the token to API requests.

## HTTP layer

Components talk to the API through the `services/*-api.service.ts` classes, using `environment.baseApi`.
Three interceptors are registered globally: token (adds the JWT), spinner (shows the global loading
spinner while requests are in flight), and notify (surfaces HTTP errors/events to the user via the
error modal and toasts).

## Account hierarchy (accounts/new-account)

The backend (`MyFinanceAPI`) enforces the one-parent, two-level account hierarchy rule described in
product.md; the UI only renders and edits what the API returns/validates, it doesn't re-derive the rules.

- `AccountViewModel` (list item, from `GET /api/Accounts/{accountGroupId}`) and `EditAccountViewModel`
  (from `GET /api/Accounts?accountIds=`) both carry `parentAccountId`, `parentAccountName` and
  `subAccounts: SubAccountViewModel[]` (`{ accountId, accountName, accountGroupId }`) — `subAccounts` is
  always complete, even for sub-accounts that live in a different account group.
- `BasicAccountIncluded` (the parent-candidate list, from `getPossibleAccountInclude`/
  `accountIncludeViewModels`) carries `hasParent: boolean`; the UI filters candidates to `!hasParent`
  since a sub-account can't itself become a main account. The API also applies the new-account rules
  there (see the API's `docs/architecture.md`): `methodIds` holds only the valid exchange methods (one,
  already selected, when determined), `requiresMethodChoice` says the user must pick, and
  `requiredFinancialEntityId` is the entity a sub-account of that main account must have.
- `NewAccountComponent`/`acc-view-model.ts` use a single `selectedParentAcc?` (not an array) even though
  `accountIncludes` on the request models stays an array of 0 or 1 entries — that's the API's existing
  contract shape, unchanged. The UI sends the selected method's id, but the server picks the method itself
  whenever the rules determine it; it only honors the client's value when `requiresMethodChoice`.
- When creating (not editing), choosing a main account sets the financial entity to
  `requiredFinancialEntityId` and locks the field; clearing it unlocks the field. The exchange-method
  picker (`#exchange-method`, required) appears only when `requiresMethodChoice`; otherwise the chosen
  method is shown as automatic. A candidate with no `methodIds` is disabled in the dropdown, and
  `parentIssue()` blocks saving rather than letting the main account be dropped silently. Edits are not
  constrained yet (existing accounts may break the entity rule until the planned data fix).
- **Advanced settings** (`#advanced-settings`, collapsed by default, in the add and edit forms) holds Period Type,
  Account Type, Default transactions currency and the "pending by default" switch. It uses `[ngbCollapse]`, not `*ngIf`, so the fields stay in the form and are still validated;
  it opens by itself (`advancedNeedsAttention`) when either has no value, so Save is never blocked by a hidden field.
  On add, the API's suggestions are applied: the period type marked `isSelected`, and the account type from
  `suggestedAccountTypeIdForMainAccount` / `suggestedAccountTypeIdForSubAccount`, which follows whether a main
  account is chosen until the user picks a type (`onAccountTypeChanged`). They're suggestions, not rules.
- **Style** (`#style-settings`) is a second collapsed bar of the same kind (shared `.fold` styles) with the header
  and border colors. Colors are optional and have defaults, so the section never opens by itself. The bar shows
  two swatches of the current colors, and the panel has a preview that copies the finance screen's account card
  (5px frame in the border color; the header color only behind the title row). The color inputs bind to
  `inputModel.headerColor` / `borderColor`; the form still reads them from the `headerColor` / `borderColor` controls.
- The parent-account `<select>` is disabled both when editing an account that already has sub-accounts
  (`inputModel.hasSubAccounts`) and when arriving via "+ Add child" from `AccountsComponent` (carries
  `parentAccountId`/`parentAccountName` as query params into `accounts/new`, applied once candidates load).
- `AccountsComponent` renders a single-column tree (not the old 2-column grid) by reusing
  `DraggableGridComponent` with `columnsNumber: 1`. Account group membership decides what's listed:
  every account in the group's response gets its own reorderable card (matching the pre-hierarchy
  behavior), with a "root account" / "sub-account of X" caption. A root's expandable nested list shows
  only its sub-accounts that live in *other* groups (labeled with the group name); same-group
  sub-accounts already have their own card. Don't nest same-group sub-accounts: it hides them from
  reordering, and users deliberately group a main account with its most-reviewed sub-accounts.
- The group `<select>` must bind options with `[ngValue]` (not `[value]`) so `accountGroupId` stays a
  number — comparisons against `subAccounts[].accountGroupId` silently fail on a string.
- Deleting an account with sub-accounts doesn't cascade server-side — they silently become top-level — so
  the delete confirmation is UI-side (`onDeleteClick` reads `account.subAccounts.length`).

## AI classification hints (accounts screen)

Bank transactions are classified with AI on the backend, and an account is only offered to the AI if it has a
**hint**: free text saying what belongs in it. The UI lets the user set or clear it:

- Each account on the accounts screen (cards and the nested sub-account rows) has a small chip: `+ AI hint`
  when there is none, `AI hint ✓` (accented) when there is. It opens `AccountAiHintModalComponent`, a modal
  separate from the account form, which reads and writes the hint through
  `GET`/`PUT /api/Accounts/{accountId}/ai-classification-hint` (`AccountViewApiService.getAiClassificationHint`
  / `updateAiClassificationHint`). The API's `docs/account-ai-hints.md` describes the contract.
- The chip's state comes from `hasAiClassificationHint` on the account list items and on each `subAccounts`
  entry; the hint text itself is only returned by the GET. The modal closes with `{ accountId, hasHint }` and
  `AccountsComponent.openAiHint` updates that flag in place, without reloading the list.
- API rules the UI follows: the field must be present, so clearing sends `null` (never `undefined`, which the
  JSON would drop and the API would reject); the API trims the text; the limit is 4000 characters
  (`AI_CLASSIFICATION_HINT_MAX_LENGTH`); an account that isn't the user's returns 404. Changes apply to new
  classifications only: earlier results are cached and aren't redone.

## Configuration

`src/environments/environment.ts` (dev) and `environment.prod.ts` (swapped in by `ng build`) define
`baseApi`. Dev points at the local API (`https://localhost:44324`); prod at the Azure Web App. The dev
server runs on port 4350, which the backend allow-lists in CORS.

## CI / deployment

`.github/workflows/azure-static-web-apps-*.yml` builds on pushes and PRs and deploys to Azure Static Web
Apps from `master`. `staticwebapp.config.json` rewrites all routes to `index.html` (SPA fallback).
