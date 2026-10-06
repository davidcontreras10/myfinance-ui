# Upgrading Angular

Notes from upgrading one major version at a time (16 → 17 → … → 21 so far). Work happens on a feature branch,
one commit per major version, so a regression bisects to a single hop.

## Routine (per major version)

1. Read the [update guide](https://angular.dev/update-guide) for the hop.
2. Commit or stash first, then `npx ng update @angular/core@N @angular/cli@N`. It rewrites `package.json`,
   reinstalls and runs the code migrations.
3. Bump the companions `ng update` doesn't touch: `@angular/cdk` (same major) and
   `@ng-bootstrap/ng-bootstrap` (one major per Angular major, offset by one: Angular 16 → 15, 17 → 16, … 21 → 20; check
   `npm view @ng-bootstrap/ng-bootstrap@X peerDependencies`).
4. `ng build` (catches template errors that `tsc`/`ng test` miss), then the full test run, then commit.
5. Review migration output: they sometimes reformat whole files. Keep the real change and revert the noise.

Test baseline: some specs are unedited scaffolds that already fail (no `HttpClient`/router providers). At
Angular 21 that is 23 failing / 209 passing (it was 33 / 199 through Angular 20; ten of those started passing
at 21). Compare the list of failing names, not just the count.

## Node

Each Angular major supports a specific Node range, and the CLI's own check is strict. Read it from the
published packages (`npm view @angular/core@N engines.node`) or the update guide. On Windows with nvm,
prepend the version's folder to `PATH` for one shell instead of `nvm use`.

| Angular | Node accepted |
|---|---|
| 20, 21 | `^20.19.0 \|\| ^22.12.0 \|\| >=24.0.0` |
| 22 | `^22.22.3 \|\| ^24.15.0 \|\| >=26.0.0` |

(Not looked up for older majors; in practice 17 ran on Node 18.19.0, and 18 to 21 on Node 22.13.0.) Also pin the CLI version in
every `ng update` (`@angular/core@N @angular/cli@N`): without a version, `ng update` downloads a temporary
*latest* CLI to run itself, which can demand a newer Node than the project does.

## Gotchas

- **npm cache symlink (Windows):** if `%LOCALAPPDATA%\npm-cache` is a symlink/junction, Node can fail with
  `ENOENT … npm-cache\tmp` or `EEXIST … _cacache\tmp`. Point one command at another folder with
  `npm_config_cache=<dir>` rather than changing the user's npm config.
- **Slow installs:** `ng update` runs `npm install` after clearing `node_modules`; on a busy hard disk this
  takes 10–40 minutes and looks hung. Check the newest file in `<cache>\_logs` before killing it.
- **Interrupted `ng update`:** if it dies after `package.json` is rewritten but before the migrations run,
  `ng update --migrate-only` is unreliable. Restore `package.json`, `npm ci`, and rerun the full command.
- **`package.json` newline:** `ng update` can drop the trailing newline; restore it.
- **ng-bootstrap 16 removed the legacy accordion** (`ngb-accordion`/`ngb-panel`). The accounts accordion
  uses `ngbAccordion`/`ngbAccordionItem` (`accounts-accordeon.component.html`).
- **Angular 18:** `HttpClientModule` was replaced by `provideHttpClient(withInterceptorsFromDi())` in
  `app.module.ts`; the interceptors stay registered through `HTTP_INTERCEPTORS`.
- **Angular 19:** the standalone migration adds `standalone: false` to every existing component, directive and
  pipe (the app stays NgModule-based) but also re-indents each decorator. Keep just the one added line per file.
- **Angular 21 is zoneless by default.** The app still uses zone.js, so `main.ts` passes
  `provideZoneChangeDetection()` to `bootstrapModule` (the migration adds it; don't remove it, or the screen
  stops updating). `src/test.ts` has a global `beforeEach` adding the same provider: without it TestBed runs
  zoneless and the suite hangs (Karma "Disconnected, because no message in 30000 ms" at a different test each
  run) or specs fail with `NG0100 ExpressionChangedAfterItHasBeenChecked`. To find a hanging test, temporarily
  add a spec file whose reporter `console.log`s each `specStarted` name.
- **Angular 21 runs the `*ngIf`/`*ngFor` → `@if`/`@for` migration automatically** (about 39 templates, ~4,700
  lines). It was reverted from the upgrade commit and is a possible separate follow-up; the old directives still
  compile.
- **NG8107 (`?.` on a non-nullable type) is suppressed in `tsconfig.json`.** `strictPropertyInitialization` is
  off, so fields like `new-account`'s `viewModel` or `task-detail`'s `selectedTask` are typed non-null but are
  `undefined` until loaded or selected, and specs create components without their inputs. Removing those `?.`
  throws. Only remove one when the value is truly never null (e.g. an injected service).
- Optional migrations are separate follow-ups, not part of a version hop (see below). `provide-initializer`
  needs nothing here (no `APP_INITIALIZER`/`ENVIRONMENT_INITIALIZER` use); `router-current-navigation` is done.

## Follow-ups (not done yet)

Deliberately left out of the 16 → 21 work, roughly from least to most risky. We also stay one major behind
`latest` on purpose (Angular 22 needs Node `^22.22.3`), to let others hit the early issues first.

1. **Application builder** (`ng update @angular/cli --name use-application-builder`): esbuild/Vite instead of
   webpack, faster builds. It moves the build output to `dist/myfinance-ui/browser`, but the Azure workflow in
   `.github/workflows/azure-static-web-apps-*.yml` deploys `output_location: "dist/myfinance-ui"`. Change both in
   the same commit or a deploy publishes the wrong folder (production is the only environment). Also check the
   `polyfills` entries and the karma test target after the switch.
2. **Control-flow syntax** (`ng update @angular/core --name control-flow-migration`, converts `*ngIf`/`*ngFor`/
   `*ngSwitch` to `@if`/`@for`/`@switch`). Angular 21 ran it automatically on ~39 templates (~4,700 lines
   changed); it was reverted from the upgrade commit. Do it as its own commits, reviewed in batches; the old
   directives still compile. An unpinned `ng update` may download a newer temporary CLI that needs a newer
   Node (see above), so check that first.
3. **Honest nullable types, then drop the NG8107 suppression in `tsconfig.json`.** The root cause is
   `strictPropertyInitialization: false`: `new-account`'s `viewModel`, `task-detail`'s `selectedTask` and similar
   fields are typed non-null but are `undefined` until loaded or selected. Mark them optional and handle null in
   the component code (a ripple of `this.viewModel.x` call sites), or make the specs pass the inputs that
   `acc-group` and `trx-table` currently survive without only because of `?.`.
4. **The ~23 scaffold specs that still fail** (no `HttpClient`/router/forms providers; some only pass in the
   full run because state leaks between specs, e.g. `BankTransactionsComponent should create`). Fix or delete
   them so a red run means something.
