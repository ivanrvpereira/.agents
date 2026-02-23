# .agents

Centralized configuration for AI coding agents. Manages shared and agent-specific configs for [Claude Code](https://docs.anthropic.com/en/docs/claude-code) and [Pi](https://pi.dev).

## Setup

```bash
git clone git@github.com:ivanrvpereira/.agents.git ~/.agents
~/.agents/bin/sync --bootstrap
npx skills update -g  # restore external skills
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

All skills live in `skills/`. They are symlinked to Claude Code and auto-discovered by Pi from `~/.agents/skills` (since Pi v0.54.0).

### Local (hand-crafted)

| Skill | Description |
|-------|-------------|
| [`agent-browser`](skills/agent-browser/SKILL.md) | Browser automation for AI agents |
| [`agents-md`](skills/agents-md/SKILL.md) | Generate/review AGENTS.md files |
| [`crwl`](skills/crwl/SKILL.md) | Web crawling with Crawl4AI CLI |
| [`hcloud`](skills/hcloud/SKILL.md) | Hetzner Cloud infrastructure via hcloud CLI |
| [`marp`](skills/marp/SKILL.md) | Slide presentations from Markdown |
| [`marker`](skills/marker/SKILL.md) | Parse documents (PDF, images, PPTX, DOCX, XLSX, HTML, EPUB) to markdown via marker-pdf |
| [`prd`](skills/prd/SKILL.md) | Generate Product Requirements Documents |
| [`skill-creator`](skills/skill-creator/SKILL.md) | Guide for creating new skills |

### Remote (via `npx skills`, tracked in `.skill-lock.json`)

| Skill | Description | Source |
|-------|-------------|--------|
| [`deep-research`](https://github.com/199-biotechnologies/claude-deep-research-skill/blob/main/SKILL.md) | Multi-source research with citation tracking and verification | [199-biotechnologies/claude-deep-research-skill](https://github.com/199-biotechnologies/claude-deep-research-skill) |
| [`find-skills`](https://github.com/vercel-labs/skills/blob/main/skills/find-skills/SKILL.md) | Discover and install agent skills by capability | [vercel-labs/skills](https://github.com/vercel-labs/skills) |
| [`frontend-design`](https://github.com/mitsuhiko/agent-stuff/blob/main/skills/frontend-design/SKILL.md) | Design and implement production-ready frontend interfaces | [mitsuhiko/agent-stuff](https://github.com/mitsuhiko/agent-stuff) |
| [`git-commit`](https://github.com/goncalossilva/.agents/blob/main/skills/git-commit/SKILL.md) | Focused, reviewable commits with clear rationale | [goncalossilva/.agents](https://github.com/goncalossilva/.agents) |
| [`github`](https://github.com/mitsuhiko/agent-stuff/blob/main/skills/github/SKILL.md) | GitHub operations via `gh` CLI (issues, PRs, CI runs, API) | [mitsuhiko/agent-stuff](https://github.com/mitsuhiko/agent-stuff) |
| [`mermaid`](https://github.com/mitsuhiko/agent-stuff/blob/main/skills/mermaid/SKILL.md) | Create and edit Mermaid diagrams with validation | [mitsuhiko/agent-stuff](https://github.com/mitsuhiko/agent-stuff) |
| [`oracle`](https://github.com/goncalossilva/.agents/blob/main/skills/oracle/SKILL.md) | Get a second opinion from another LLM on code, design, or debugging | [goncalossilva/.agents](https://github.com/goncalossilva/.agents) |
| [`sentry`](https://github.com/mitsuhiko/agent-stuff/blob/main/skills/sentry/SKILL.md) | Fetch and analyze Sentry issues, events, and logs | [mitsuhiko/agent-stuff](https://github.com/mitsuhiko/agent-stuff) |
| [`summarize`](https://github.com/mitsuhiko/agent-stuff/blob/main/skills/summarize/SKILL.md) | Fetch a URL or convert files (PDF/DOCX/HTML) to Markdown | [mitsuhiko/agent-stuff](https://github.com/mitsuhiko/agent-stuff) |
| [`tmux`](https://github.com/mitsuhiko/agent-stuff/blob/main/skills/tmux/SKILL.md) | Remote control tmux sessions for interactive CLIs | [mitsuhiko/agent-stuff](https://github.com/mitsuhiko/agent-stuff) |
| [`uv`](https://github.com/mitsuhiko/agent-stuff/blob/main/skills/uv/SKILL.md) | Python package and script management with `uv` | [mitsuhiko/agent-stuff](https://github.com/mitsuhiko/agent-stuff) |
| [`vercel-composition-patterns`](https://github.com/vercel-labs/agent-skills/blob/main/skills/composition-patterns/SKILL.md) | React composition patterns (compound components, render props, context) | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) |
| [`vercel-react-best-practices`](https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/SKILL.md) | React and Next.js performance optimization guidelines | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) |
| [`web-design-guidelines`](https://github.com/vercel-labs/agent-skills/blob/main/skills/web-design-guidelines/SKILL.md) | Review UI for accessibility, design, and UX best practices | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) |

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
