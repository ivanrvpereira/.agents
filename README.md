# .agents

Centralized configuration for AI coding agents. Manages shared and agent-specific configs for [Claude Code](https://docs.anthropic.com/en/docs/claude-code), [Pi](https://pi.dev), and [Codex](https://developers.openai.com/codex).

This public repo holds the scripts and shareable config. Agent settings (`claude/settings.json`, `pi/settings.json`, `pi/mcp.json`, `codex/config.toml`, `codex/hooks.json`) and private skills live in the private companion repo `~/.agents-private`, which `bin/sync` requires. Set `AGENTS_PRIVATE_DIR` to use another location.

## Setup

```bash
git clone git@github.com:ivanrvpereira/.agents.git ~/.agents
git clone git@github.com:ivanrvpereira/agents-private.git ~/.agents-private
~/.agents/bin/sync --bootstrap
```

## Structure

```
AGENTS.md          # Project knowledge base (read by Claude Code, Pi, and Codex)
_claude.md         # Claude Code instructions (Exa tools)
bin/sync           # Unified symlink manager
bin/add-skill      # Validate a local skill before syncing
bin/link-skill     # Enable a project-scoped skill in one project
skills/auto/       # Shared skills the model may invoke on its own
skills/on-demand/  # Shared skills you start by name
skills/VENDORED.md # Skills copied from upstream, with source and pinned commit
skills/private     # Gitignored symlink to ~/.agents-private/skills (created by bin/sync)
claude/            # Claude Code configs (scripts, statusline)
pi/                # Pi configs (APPEND_SYSTEM.md, keybindings, extensions, skills)

~/.agents-private/ # Private repo: claude/settings.json, pi/settings.json, pi/mcp.json,
                   # codex/config.toml, codex/hooks.json, skills/, skills-scoped/
```

## Usage

```bash
# Sync configs to agent directories
bin/sync

# Preview changes
bin/sync --dry-run

# Sync + install Claude Code plugins
bin/sync --bootstrap

# Remove stale symlinks
bin/sync --prune

# Validate a local skill before syncing
bin/add-skill my-skill
```

## Skills

Skills live in two buckets. `skills/auto/` holds skills the model may invoke on its own. `skills/on-demand/` holds skills you start by name (`disable-model-invocation: true`). `bin/sync` links each skill into `~/.claude/skills` and `~/.codex/skills`. Pi reads `~/.agents/skills` directly.

Skills copied from upstream repos are listed in [`skills/VENDORED.md`](skills/VENDORED.md) with their source and pinned commit. The local skills are:

| Skill | Bucket | Description |
|-------|--------|-------------|
| [`adr-writing`](skills/auto/adr-writing/SKILL.md) | auto | Decide whether a decision needs an ADR, then write, amend, or supersede it |
| [`code-review`](skills/auto/code-review/SKILL.md) | auto | Review a change against repo standards and its originating spec |
| [`crwl`](skills/auto/crwl/SKILL.md) | auto | Crawl and extract web content with the Crawl4AI CLI |
| [`git-commit`](skills/auto/git-commit/SKILL.md) | auto | Focused Conventional Commits |
| [`fable-safe-prompt`](skills/on-demand/fable-safe-prompt/SKILL.md) | on-demand | Rewrite Fable prompts so they are clearer and policy-aligned |
| [`implementation-orchestrator`](skills/on-demand/implementation-orchestrator/SKILL.md) | on-demand | Implement an approved plan through delegated workers, review, and per-step commits |
| [`marp`](skills/on-demand/marp/SKILL.md) | on-demand | Slide presentations from Markdown |
| [`oss-repo-review`](skills/on-demand/oss-repo-review/SKILL.md) | on-demand | Audit a GitHub repository against open-source security practices |
| [`supervisor`](skills/on-demand/supervisor/SKILL.md) | on-demand | Conduct implementation orchestrators across assignments through Rex and pi-intercom |

## Adding a new skill

1. Create `skills/auto/<name>/SKILL.md` or `skills/on-demand/<name>/SKILL.md`. Folder names must be unique across both buckets.
2. If it is copied from upstream, add a row to `skills/VENDORED.md`. If it is local, add it to the table above.
3. Run `bin/add-skill <name>`, then `bin/sync`.

## Adding agent-specific content

- **Claude Code**: Add files under `claude/` (scripts)
- **Pi**: Add extensions under `pi/extensions/`, skills under `pi/skills/`
- **Codex**: Add shared skills under `skills/`
- **Agent settings** (Claude/Pi/Codex settings, MCP, Codex hooks): edit them in `~/.agents-private`, not here
