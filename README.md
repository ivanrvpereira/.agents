# .agents

Centralized configuration for AI coding agents. Manages shared and agent-specific configs for [Claude Code](https://docs.anthropic.com/en/docs/claude-code) and [Pi](https://pi.dev).

## Setup

```bash
git clone git@github.com:ivanpereira/.agents.git ~/.agents
~/.agents/bin/sync --bootstrap
npx skills update  # restore external skills
```

## Structure

```
AGENTS.md          # Shared instructions (symlinked to both agents)
bin/sync           # Unified symlink manager
skills/            # Shared skills
skills/vendor/     # External skills (via npx skills)
claude/            # Claude Code configs (settings, rules, commands, scripts)
pi/                # Pi configs (settings, extensions, skills)
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

# Add an external skill
npx skills add owner/repo -g

# Update all external skills
npx skills update
```

## Adding a new skill

Create a directory under `skills/` with a `SKILL.md` file:

```
skills/my-skill/
└── SKILL.md
```

Then run `bin/sync` to symlink it to all agents.

## Adding agent-specific content

- **Claude Code**: Add files under `claude/` (rules, commands, scripts)
- **Pi**: Add extensions under `pi/extensions/`, skills under `pi/skills/`
