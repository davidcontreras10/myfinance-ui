# Upgrading Angular

Notes from upgrading one major version at a time (16 → 17 → 18 so far). Work happens on a feature branch,
one commit per major version, so a regression bisects to a single hop.

## Routine (per major version)

1. Read the [update guide](https://angular.dev/update-guide) for the hop.
2. Commit or stash first, then `npx ng update @angular/core@N @angular/cli@N`. It rewrites `package.json`,
   reinstalls and runs the code migrations.
3. Bump the companions `ng update` doesn't touch: `@angular/cdk` (same major) and
   `@ng-bootstrap/ng-bootstrap` (one major per Angular major: Angular 16 → 15, 17 → 16, 18 → 17; check
   `npm view @ng-bootstrap/ng-bootstrap@X peerDependencies`).
4. `ng build` (catches template errors that `tsc`/`ng test` miss), then the full test run, then commit.
5. Review migration output: they sometimes reformat whole files. Keep the real change and revert the noise.

Test baseline: some specs are unedited scaffolds that already fail (no `HttpClient`/router providers). At
Angular 18 that is 33 failing / 199 passing. Compare the list of failing names, not just the count.

## Node

Each Angular major supports a specific Node range, and the CLI's own check is strict. Read it from the
published packages (`npm view @angular/core@N engines.node`) or the update guide. On Windows with nvm,
prepend the version's folder to `PATH` for one shell instead of `nvm use`.

| Angular | Node accepted |
|---|---|
| 20, 21 | `^20.19.0 \|\| ^22.12.0 \|\| >=24.0.0` |
| 22 | `^22.22.3 \|\| ^24.15.0 \|\| >=26.0.0` |

(Not looked up for older majors; in practice 17 ran on Node 18.19.0, and 18, 19 and 20 on Node 22.13.0.) Also pin the CLI version in
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
- Optional migrations (new control flow, `use-application-builder`, standalone) are separate follow-ups, not
  part of a version hop.
