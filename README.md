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

## Skills

All skills live in `skills/` and are symlinked to both Claude Code and Pi.

### Local (hand-crafted)

| Skill | Description |
|-------|-------------|
| `agent-browser` | Browser automation for AI agents |
| `agents-md` | Generate/review AGENTS.md files |
| `crwl` | Web crawling with Crawl4AI CLI |
| `hcloud` | Hetzner Cloud infrastructure via hcloud CLI |
| `marp` | Slide presentations from Markdown |
| `parse-pdf` | Parse PDFs to markdown |
| `prd` | Generate Product Requirements Documents |
| `skill-creator` | Guide for creating new skills |

### Remote (via `npx skills`, tracked in `.skill-lock.json`)

| Skill | Source |
|-------|--------|
| `deep-research` | `199-biotechnologies/claude-deep-research-skill` |
| `find-skills` | `vercel-labs/skills` |
| `frontend-design` | `mitsuhiko/agent-stuff` |
| `git-commit` | `goncalossilva/.agents` |
| `github` | `mitsuhiko/agent-stuff` |
| `mermaid` | `mitsuhiko/agent-stuff` |
| `oracle` | `goncalossilva/.agents` |
| `sentry` | `mitsuhiko/agent-stuff` |
| `summarize` | `mitsuhiko/agent-stuff` |
| `tmux` | `mitsuhiko/agent-stuff` |
| `uv` | `mitsuhiko/agent-stuff` |
| `vercel-composition-patterns` | `vercel-labs/agent-skills` |
| `vercel-react-best-practices` | `vercel-labs/agent-skills` |
| `web-design-guidelines` | `vercel-labs/agent-skills` |

To update remote skills: `npx skills update -g`

## Adding a new skill

Create a directory under `skills/` with a `SKILL.md` file:

```
skills/my-skill/
└── SKILL.md
```

Then install it: `npx skills add ~/.agents/skills/my-skill -g -a claude-code -a pi --yes`

## Adding agent-specific content

- **Claude Code**: Add files under `claude/` (rules, commands, scripts)
- **Pi**: Add extensions under `pi/extensions/`, skills under `pi/skills/`
