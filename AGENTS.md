# .agents — Project Knowledge Base

Centralized configuration repository for AI coding agents. Manages shared and agent-specific configs for [Claude Code](https://docs.anthropic.com/en/docs/claude-code) and [Pi](https://github.com/mariozechner/pi) via symlinks.

## Structure

```
AGENTS.md       # Shared agent instructions → ~/.pi/agent/AGENTS.md
_claude.md             # Claude wrapper (@AGENTS.md) → ~/.claude/CLAUDE.md
bin/sync               # Symlink manager (creates all links below)
skills/                # Shared skills → both agents' skills dirs
.skill-lock.json       # Tracks external skills for updates
claude/                # Claude Code: settings, commands, scripts
pi/                    # Pi: settings, extensions, skills
```

## Commands

| Action | Command |
|--------|---------|
| Sync configs | `bin/sync` |
| Preview sync | `bin/sync --dry-run` |
| Sync + install plugins | `bin/sync --bootstrap` |
| Remove stale links | `bin/sync --prune` |
| Add external skill | `npx skills add owner/repo -g -a claude-code -a pi -s skill-name` |
| Update external skills | `npx skills update -g` |

## How Syncing Works

`bin/sync` creates symlinks from this repo into each agent's config directory:

**Shared** (both agents):
- `_claude.md` → `~/.claude/CLAUDE.md`
- `AGENTS.md` → `~/.pi/agent/AGENTS.md`
- Each `skills/<name>/` → `~/.claude/skills/` (Pi reads skills directly from `~/.agents`)

**Claude Code** (`~/.claude/`):
- `claude/settings.json` → settings (permissions, hooks, plugins, model config)
- `claude/commands/` → slash commands (e.g. `/day-summary`)
- `claude/scripts/` → automation scripts (sleep management)
- `claude/statusline-command.sh` → status bar display

**Pi** (`~/.pi/agent/`):
- `pi/settings.json` → model config, packages
- `pi/extensions/` → per-extension symlinks
- `pi/skills/` → Pi-only skills

The sync script backs up existing non-symlink files as `.bak` before replacing them. It's idempotent — safe to run repeatedly.

## Conventions

- **Shared config** goes at root or in `skills/` — both agents get it
- **Agent-specific config** goes in `claude/` or `pi/` — only that agent gets it
- **External skills** are installed via `npx skills add owner/repo -g`, tracked by `.skill-lock.json` at repo root
- **Private/company commands** do not belong here — use a separate private repo
- After adding or moving files, run `bin/sync` to update symlinks

## Web Content & Research

- **GitHub content**: Always use `gh` CLI for github.com — never crawl/scrape GitHub URLs. Use `gh api`, `gh repo view`, `gh pr view`, `gh issue view`, etc.

## Git

- Conventional commits: `type(scope): description`
- Full conventions in `AGENTS.md` → Git section

## Validation

- Preview symlink changes: `bin/sync --dry-run`
- Verify sync state: `ls -la ~/.claude/CLAUDE.md` (should point to this repo)

## Boundaries

### Always
- Run `bin/sync --dry-run` before `bin/sync` to preview changes
- Keep `AGENTS.md` concise — every line applies to all projects

### Ask First
- Running `bin/sync --prune` (deletes stale symlinks)
- Modifying `claude/settings.json` (affects permissions across all projects)
- Editing `AGENTS.md` (applies to all projects for both agents)

### Never
- Commit secrets or API keys
- Edit symlink targets directly — edit source files in this repo instead

## Plugins & Skills

- Some plugins are disabled globally — enable per-project in `.claude/settings.json` under `enabledPlugins`
- External skills are tracked in `.skill-lock.json` — update with `npx skills update -g`
- List installed skills: `npx skills list -g`
- Add external skill: `npx skills add owner/repo -g -s skill-name`

## Key Files

- `claude/settings.json` — permissions (allow/deny/ask), hooks, plugins, model defaults. This is the most complex file; changes affect what Claude Code can do across all projects.
- `claude/install-plugins.sh` — declarative plugin installation from multiple marketplaces. Run via `bin/sync --bootstrap`.
- `AGENTS.md` — shared behavioral instructions loaded by both agents. Keep concise — every line applies globally.
