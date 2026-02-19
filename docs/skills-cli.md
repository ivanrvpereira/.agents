# npx skills CLI Reference

## Install

```sh
npx skills add <source> [options]
```

**Sources:** `owner/repo`, `owner/repo@skill-name`, full GitHub/GitLab URL, local path

**Key flags:**

| Flag | Description |
|------|-------------|
| `-g, --global` | Install to `~/` instead of project |
| `-a, --agent <name>` | Target specific agent(s) (e.g. `claude-code`, `pi`) |
| `-s, --skill <name>` | Install specific skill(s) from a repo |
| `-y, --yes` | Skip confirmation prompts |
| `-l, --list` | Preview skills in a repo without installing |
| `--all` | Install all skills for all agents, no prompts |

**Examples:**

```sh
# Install one skill globally for Claude Code and Pi only
npx skills add vercel-labs/skills -g -s find-skills -a claude-code -a pi --yes

# Install a local skill for both agents
npx skills add ~/.agents/skills/crwl -g -a claude-code -a pi --yes

# Install all skills from a repo globally
npx skills add owner/repo --all -g

# Preview what's available before installing
npx skills add owner/repo -l
```

## Manage

```sh
npx skills list -g                        # list global skills
npx skills list -g -a claude-code         # filter by agent
npx skills remove <skill> -g --yes        # remove without prompts
npx skills remove <skill> -g -a pi --yes  # remove from one agent only
```

## Discover & Update

```sh
npx skills find [query]   # search registry by keyword
npx skills check          # check for available updates
npx skills update -g      # update all global skills
```

## Create

```sh
npx skills init my-skill  # scaffold a new SKILL.md
```

A skill is a directory containing a `SKILL.md` with YAML frontmatter:

```yaml
---
name: my-skill
description: What this skill does and when to use it
---
```

## Lock File

External skills are tracked in `.skill-lock.json` at the install root (e.g. `~/.agents/.skill-lock.json`). Local/hand-crafted skills are **not** tracked there.

## Env Vars

| Variable | Effect |
|----------|--------|
| `INSTALL_INTERNAL_SKILLS=1` | Show hidden (internal) skills |
| `DISABLE_TELEMETRY=1` | Opt out of anonymous usage analytics |
