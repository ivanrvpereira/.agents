# .agents — Project Knowledge Base


Centralized configuration repository for AI coding agents. Manages shared and agent-specific configs for [Claude Code](https://docs.anthropic.com/en/docs/claude-code), [Pi](https://github.com/mariozechner/pi), and [Codex](https://developers.openai.com/codex) via symlinks.

## Structure

```
AGENTS.md        # Project knowledge base → ./CLAUDE.md context
_claude.md       # Claude Code instructions → ~/.claude/CLAUDE.md
bin/sync         # Symlink manager (creates all links below)
bin/add-skill    # Validate a local skill before syncing
skills/          # Shared skills; auto/ (model-invocable) + on-demand/ (manual)
skills/VENDORED.md # Registry of copied upstream skills + their sources
claude/          # Claude Code: settings, commands, scripts
pi/              # Pi: settings, extensions, skills
codex/           # Codex: config.toml, hooks
```

## Commands

| Action | Command |
|--------|---------|
| Sync configs | `bin/sync` |
| Preview sync | `bin/sync --dry-run` |
| Sync + install plugins | `bin/sync --bootstrap` |
| Remove stale links | `bin/sync --prune` |
| Validate local skill | `bin/add-skill skill-name` |
| Add vendored skill | Copy upstream skill into `skills/auto/` or `skills/on-demand/`, add a row to `skills/VENDORED.md` |
| Update vendored skills | Ask an AI agent to follow the update workflow in `skills/VENDORED.md` |
| Update vendored Pi extensions | Ask an AI agent to follow the update workflow in `pi/extensions/VENDORED.md` |

## How Syncing Works

`bin/sync` creates symlinks from this repo into each agent's config directory:

**Core links**:
- `_claude.md` → `~/.claude/CLAUDE.md`
- Each discovered skill directory under `skills/` → `~/.claude/skills/` (flattened; Pi reads shared skills recursively from `~/.agents/skills`)
- Each discovered skill directory under `skills/` → `~/.codex/skills/`; conflicting non-symlink Codex skills are backed up first

**Claude Code** (`~/.claude/`):
- `claude/settings.json` → settings (permissions, hooks, plugins, model config)
- `claude/commands/` → slash commands (e.g. `/day-summary`)
- `claude/scripts/` → automation scripts (sleep management)
- `claude/statusline-command.sh` → status bar display

**Pi** (`~/.pi/agent/`):
- `pi/APPEND_SYSTEM.md` → behavioral instructions appended to Pi's system prompt (Pi only; not loaded by Claude/Codex)
- `pi/settings.json` → model config, packages
- `pi/extensions/` → per-extension symlinks
- `pi/skills/` → Pi-only skills

**Codex** (`~/.codex/`):
- `codex/config.toml` → model, approvals, permission profile, plugins
- `codex/hooks.json` → Codex lifecycle hooks
- `skills/` → shared skills, backing up conflicting non-symlink Codex skills

The sync script backs up existing non-symlink files as `.bak` before replacing them. It's idempotent — safe to run repeatedly.

## Conventions

- **Shared config** goes at root or in `skills/` — all agents get it
- **Agent-specific config** goes in `claude/`, `pi/`, or `codex/` — only that agent gets it
- **Skills are bucketed by invocation:** `skills/auto/<name>/` = model may auto-invoke (no `disable-model-invocation`); `skills/on-demand/<name>/` = manual-only (`disable-model-invocation: true`). `bin/sync` flattens the bucket folders away, so skill folder names must be globally unique and the folder must match the flag.
- **Vendored skills** are copied from upstream into a bucket and recorded in `skills/VENDORED.md` (source + pinned ref). We own the copies and may customize them; update them via the workflow in that file.
- **Vendored Pi extensions** are copied from upstream repos into `pi/extensions/` and recorded in `pi/extensions/VENDORED.md` (source + pinned ref + update workflow).
- **Private/company commands** do not belong here — use a separate private repo
- After adding or moving files, run `bin/sync` to update symlinks

## Web Content & Research

- **GitHub content**: Always use `gh` CLI for github.com — never crawl/scrape GitHub URLs. Use `gh api`, `gh repo view`, `gh pr view`, `gh issue view`, etc.

## Validation

- Preview symlink changes: `bin/sync --dry-run`
- Verify sync state: `ls -la ~/.claude/CLAUDE.md` (should point to this repo)

## Boundaries

### Always
- Run `bin/sync --dry-run` before `bin/sync` to preview changes
- Keep `pi/APPEND_SYSTEM.md` concise — every line is appended to every Pi session's system prompt

### Ask First
- Running `bin/sync --prune` (deletes stale symlinks)
- Modifying `claude/settings.json` (affects permissions across all projects)
- Editing `pi/APPEND_SYSTEM.md` (appended to the system prompt of every Pi session)

### Never
- Commit secrets or API keys
- Edit symlink targets directly — edit source files in this repo instead

## Plugins & Skills

- Some plugins are disabled globally — enable per-project in `.claude/settings.json` under `enabledPlugins`
- Never add/remove package-provided skills by editing `pi/settings.json` `skills` arrays
- Skills live in `skills/auto/` or `skills/on-demand/`; vendored copies are tracked in `skills/VENDORED.md`
- Add a skill: copy/author it into the right bucket, then run `bin/add-skill <name>` and `bin/sync`
- Update vendored skills: follow the update workflow in `skills/VENDORED.md`

## Key Files

- `claude/settings.json` — permissions (allow/deny/ask), hooks, plugins, model defaults. This is the most complex file; changes affect what Claude Code can do across all projects.
- `claude/install-plugins.sh` — declarative plugin installation from multiple marketplaces. Run via `bin/sync --bootstrap`.
- `codex/config.toml` — Codex model, permission profile, network allowlist, plugins, and trusted projects.
- `codex/hooks.json` — Codex lifecycle hooks.
- `pi/APPEND_SYSTEM.md` — Pi-only behavioral instructions, appended to Pi's system prompt via `~/.pi/agent/APPEND_SYSTEM.md`. Keep concise — every line applies to all Pi sessions.
- `AGENTS.md` — repository knowledge for this config repo.
