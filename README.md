# .agents

Centralized configuration for AI coding agents. Manages shared and agent-specific configs for [Claude Code](https://docs.anthropic.com/en/docs/claude-code), [Pi](https://pi.dev), and [Codex](https://developers.openai.com/codex).

## Setup

```bash
git clone git@github.com:ivanrvpereira/.agents.git ~/.agents
~/.agents/bin/sync --bootstrap
npx skills update -g  # restore external skills
```

## Structure

```
AGENTS.md          # Project knowledge base (symlinked as CLAUDE.md context)
_claude.md         # Claude Code instructions (Exa tools)
CLAUDE.md          # Project-level CLAUDE.md (@AGENTS.md)
.skill-lock.json   # Tracks external skills for updates
bin/sync           # Unified symlink manager
bin/add-skill      # Validate a local skill before syncing
skills/            # Shared skills (Claude symlinks; Pi auto-discovers)
claude/            # Claude Code configs (settings, commands, scripts)
pi/                # Pi configs (settings, extensions, skills)
codex/             # Codex configs (config.toml, hooks)
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

# Add an external skill
npx skills add owner/repo -g

# Update all external skills
npx skills update -g
```

## Skills

All skills live in `skills/`. They are symlinked to Claude Code and auto-discovered by Pi from `~/.agents/skills` (since Pi v0.54.0).
Codex shared skills are symlinked into `~/.codex/skills`; conflicting non-symlink skills are backed up before replacement.

### Local (hand-crafted)

| Skill | Description |
|-------|-------------|
| [`agents-md`](skills/agents-md/SKILL.md) | Generate/review AGENTS.md files |
| [`brainstorming`](skills/brainstorming/SKILL.md) | Explore intent and design before creative work |
| [`code-review`](skills/auto/code-review/SKILL.md) | Two-axis diff review for standards, risk, and spec fit |
| [`crwl`](skills/crwl/SKILL.md) | Web crawling with Crawl4AI CLI |
| [`git-commit`](skills/git-commit/SKILL.md) | Conventional, focused, reviewable git commits |
| [`handoff`](skills/handoff/SKILL.md) | Write or update HANDOFF.md for a fresh agent |
| [`marp`](skills/marp/SKILL.md) | Slide presentations from Markdown |
| [`marker`](skills/marker/SKILL.md) | Parse documents (PDF, images, PPTX, DOCX, XLSX, HTML, EPUB) to markdown via marker-pdf |
| [`prd`](skills/prd/SKILL.md) | Generate Product Requirements Documents |
| [`receiving-code-review`](skills/receiving-code-review/SKILL.md) | Process code review feedback rigorously |
| [`requesting-code-review`](skills/requesting-code-review/SKILL.md) | Request review before completing major work |
| [`skill-creator`](skills/skill-creator/SKILL.md) | Guide for creating new skills |
| [`using-git-worktrees`](skills/using-git-worktrees/SKILL.md) | Isolate feature work with git worktrees |

### Remote (via `npx skills`, tracked in `.skill-lock.json`)

| Skill | Description | Source |
|-------|-------------|--------|
| [`deep-research`](https://github.com/199-biotechnologies/claude-deep-research-skill/blob/main/SKILL.md) | Multi-source research with citation tracking and verification | [199-biotechnologies/claude-deep-research-skill](https://github.com/199-biotechnologies/claude-deep-research-skill) |
| [`dev-browser`](https://github.com/SawyerHood/dev-browser/blob/main/skills/dev-browser/SKILL.md) | Browser automation with persistent page state | [SawyerHood/dev-browser](https://github.com/SawyerHood/dev-browser) |
| [`frontend-design`](https://github.com/mitsuhiko/agent-stuff/blob/main/skills/frontend-design/SKILL.md) | Design and implement production-ready frontend interfaces | [mitsuhiko/agent-stuff](https://github.com/mitsuhiko/agent-stuff) |
| [`github`](https://github.com/mitsuhiko/agent-stuff/blob/main/skills/github/SKILL.md) | GitHub operations via `gh` CLI (issues, PRs, CI runs, API) | [mitsuhiko/agent-stuff](https://github.com/mitsuhiko/agent-stuff) |
| [`mermaid`](https://github.com/mitsuhiko/agent-stuff/blob/main/skills/mermaid/SKILL.md) | Create and edit Mermaid diagrams with validation | [mitsuhiko/agent-stuff](https://github.com/mitsuhiko/agent-stuff) |
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

Then run `bin/sync` to link it into Claude Code. Pi discovers `~/.agents/skills` directly.

## Adding agent-specific content

- **Claude Code**: Add files under `claude/` (commands, scripts)
- **Pi**: Add extensions under `pi/extensions/`, skills under `pi/skills/`
- **Codex**: Add durable settings under `codex/` and shared skills under `skills/`
