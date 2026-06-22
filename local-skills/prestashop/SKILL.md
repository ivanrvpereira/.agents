---
name: prestashop
description: "Work on PrestaShop core, module, and theme projects. Use for PrestaShop architecture, CQRS/domain code, Symfony back office, legacy ObjectModel/controllers, modules, hooks, multistore, translations, upgrades, tests, or themes."
---

# PrestaShop

Use this skill to work safely in PrestaShop repositories without flattening modern, legacy, module, and theme conventions into one generic PHP/Symfony workflow.

## First moves

1. Read local instructions first: `AGENTS.md`, `CLAUDE.md`, `.ai/CONTEXT.md`, `.github/copilot-instructions.md`, or module/theme docs when present. Local project context overrides this skill.
2. Classify the project before editing:
   - **Core**: `composer.json` name `prestashop/prestashop`, plus `src/Core/Domain/`, `src/Adapter/`, `src/PrestaShopBundle/`, `classes/`, `admin-dev/`.
   - **Module**: a main PHP file extending `Module`, `config.xml`, `composer.json` type/dependencies, optional `config/services.yml`, controllers, hooks, upgrade scripts.
   - **Theme**: `config/theme.yml`, Smarty templates under `templates/`, assets/source build files, optional child-theme relationship.
3. Identify the target version/branch from `git branch`, `composer.json`, changelog, or issue/PR context. Preserve backward compatibility and target the lowest maintained branch that can receive the fix.
4. Build an impact map with `fd`/`rg`: relevant domain/component, controllers, forms, grids, templates, hooks, translations, tests, and upgrade paths.
5. Define verification before coding. Prefer the narrowest meaningful test/lint command, then broaden if the change crosses layers.

## Core project workflow

When the repository has `.ai/CONTEXT.md`, read it, then read only the relevant `.ai/Domain/{Domain}/CONTEXT.md` and/or `.ai/Component/{Component}/CONTEXT.md` files. Use their skills if they exist.

Typical core layering:

| Layer | Common paths | Guidance |
|---|---|---|
| Domain | `src/Core/Domain/` | Commands, queries, value objects, exceptions, handler interfaces; keep business language here. |
| Adapter | `src/Adapter/` | Concrete handlers and bridges to legacy, Doctrine, filesystem, services, APIs. |
| Symfony bundle | `src/PrestaShopBundle/` | Controllers, form types, grids, Twig, routes, service wiring. Keep controllers thin. |
| Legacy | `classes/`, `controllers/` | Modify only when the feature/bug is truly legacy-bound; avoid introducing new legacy dependencies. |
| BO UI | `admin-dev/themes/new-theme/` | TypeScript/JavaScript, Vue, SCSS, webpack assets. |
| FO/theme | `themes/` | Smarty templates and theme assets; respect theme inheritance and overrides. |

Before adding a new CQRS object, route, entity usage, or hook, check existing live/generated indexes when available:

```bash
./bin/console prestashop:list:commands-and-queries
./bin/console debug:router
rg "hookName|dispatchHook|registerHook" app/Resources/hooks src modules themes
```

If the app cannot boot, fall back to local generated/context files and direct source search.

## Design rules to keep in mind

- Prefer modern Symfony/CQRS/Doctrine paths for new core work; use legacy `ObjectModel`, `Db`, and legacy controllers only when surrounding code or compatibility requires it.
- Keep controllers, form handlers, and grid factories orchestration-only; put business decisions in domain handlers/services.
- Do not make handlers call other handlers. Compose multiple commands/queries at the application/controller level.
- Use value objects and domain-specific exceptions for validation boundaries; catch specific exceptions in UI/API layers.
- Register services through the project/module DI configuration; avoid hidden `new` dependencies in controllers/services.
- Always consider multistore, multilingual data, permissions, CSRF, hooks, translations, and upgrade/install paths.
- Match surrounding file headers, strictness, naming, typing, and service style instead of imposing unrelated cleanup.

## Module workflow

1. Inspect the module's declared compatibility (`config.xml`, `composer.json`, README/docs) and the PrestaShop versions it supports.
2. Prefer hooks, Symfony services/routes, commands, and documented extension points. Avoid core edits and overrides unless explicitly requested and justified.
3. Make install/uninstall/upgrade logic idempotent: database schema, configuration keys, tabs, hooks, and assets should be safe to re-run when possible.
4. Keep configuration multistore-aware when the setting is shop-scoped; avoid using global configuration accidentally.
5. Put tests inside the module when it has its own harness; otherwise use the host PrestaShop test setup only after confirming it is intended.

## Theme workflow

- Edit source templates/assets, not generated cache or compiled build output, unless the repository intentionally tracks built assets.
- Check `config/theme.yml`, parent/child theme inheritance, template overrides, hooks/positions, translations, and responsive behavior.
- For front-office changes, test both the changed template path and any hook/module rendering path that feeds it.

## Verification commands

Prefer project scripts over invented commands. Common PrestaShop core commands are:

```bash
composer php-cs-fixer:dry
composer phpstan
vendor/bin/phpunit -c tests/Unit/phpunit.xml --filter <TestOrClass>
vendor/bin/phpunit -c tests/Integration/phpunit.xml --filter <TestOrClass>
vendor/bin/behat -c tests/Integration/Behaviour/behat.yml --strict --no-snippets <feature-or-tags>
```

For back-office assets, inspect the local `package.json` first; commonly:

```bash
cd admin-dev/themes/new-theme && npm run lint && npm test
```

If database, installer, browser, or asset dependencies are unavailable, state exactly what could not be run and why.

## Completion checklist

- Local instructions and relevant PrestaShop context were read.
- Existing patterns were followed; no broad refactor or dependency was added without approval.
- BC, multistore, translations, permissions/security, hooks, and upgrades were considered where relevant.
- Tests/lints were run or explicitly reported as not run with the blocker.
