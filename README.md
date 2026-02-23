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
AGENTS.md          # Project knowledge base (symlinked as CLAUDE.md context)
_agents.md         # Shared agent instructions (symlinked to both agents)
_claude.md         # Claude wrapper (@AGENTS.md + Exa tools)
CLAUDE.md          # Project-level CLAUDE.md (@AGENTS.md)
.skill-lock.json   # Tracks external skills for updates
bin/sync           # Unified symlink manager
bin/add-skill      # Install local skill to both agents
skills/            # Shared skills (local + remote)
claude/            # Claude Code configs (settings, commands, scripts)
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

# Add a local skill to both agents
bin/add-skill my-skill

# Add an external skill
npx skills add owner/repo -g

# Update all external skills
npx skills update -g
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
| `marker` | Parse documents (PDF, images, PPTX, DOCX, XLSX, HTML, EPUB) to markdown via marker-pdf |
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

Then install it: `bin/add-skill my-skill`

## Adding agent-specific content

- **Claude Code**: Add files under `claude/` (commands, scripts)
- **Pi**: Add extensions under `pi/extensions/`, skills under `pi/skills/`
