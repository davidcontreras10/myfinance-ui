# Architecture

How the frontend is organized. For what the app is for, see [product.md](product.md).

## Stack

Angular 16 (NgModule-based), TypeScript 5, RxJS, Bootstrap 5, ng-bootstrap, Angular CDK (drag-and-drop).
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

## Configuration

`src/environments/environment.ts` (dev) and `environment.prod.ts` (swapped in by `ng build`) define
`baseApi`. Dev points at the local API (`https://localhost:44324`); prod at the Azure Web App. The dev
server runs on port 4350, which the backend allow-lists in CORS.

## CI / deployment

`.github/workflows/azure-static-web-apps-*.yml` builds on pushes and PRs and deploys to Azure Static Web
Apps from `master`. `staticwebapp.config.json` rewrites all routes to `index.html` (SPA fallback).
