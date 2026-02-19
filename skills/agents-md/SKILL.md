---
name: agents-md
description: Generate, review, and maintain AGENTS.md (or CLAUDE.md) files. Use when creating, auditing, or updating AI agent instruction files for a codebase.
---

# AGENTS.md Generator & Reviewer

Generate, review, and maintain AGENTS.md files optimized for AI coding agents.

## Workflow Decision

Determine the task type:

- **Creating a new AGENTS.md?** → Follow "Generate" below
- **Reviewing an existing AGENTS.md?** → Follow "Review" below
- **Updating an existing AGENTS.md?** → Follow "Update" below

---

## Generate

### Phase 1: Analyze the Repository

Before writing anything, analyze and report:

1. **Repository type**: Monorepo, multi-package, or simple project?
2. **Tech stack**: Languages, frameworks, versions, key tools
3. **Major directories** needing their own scoped AGENTS.md
4. **Build system**: Package manager, workspaces, task runner
5. **Testing setup**: Test runner, test locations, coverage tools
6. **Key patterns**: Naming conventions, file organization, existing examples
7. **Existing config**: Extract commands from Makefile, package.json, pyproject.toml, go.mod, etc.

Present findings to the user before generating files. Ask about any gaps.

### Phase 2: Reconcile CLAUDE.md and AGENTS.md

Check for existing files at the project root:

- **No CLAUDE.md exists** → Create `CLAUDE.md` with `@AGENTS.md`. Continue to Phase 3.
- **CLAUDE.md exists but is just `@AGENTS.md`** → Already correct. Continue.
- **CLAUDE.md has content, no AGENTS.md exists** → Rename `CLAUDE.md` to `AGENTS.md`, create new `CLAUDE.md` with `@AGENTS.md`. Treat the renamed file as an existing AGENTS.md (switch to Update workflow).
- **CLAUDE.md has content AND AGENTS.md exists** → Ask the user how to proceed (merge, replace, or keep both).

The end state is always: `CLAUDE.md` starts with `@AGENTS.md`, and all agent-agnostic instructions live in `AGENTS.md`. Claude Code-specific instructions (hooks, MCP servers, slash commands, permissions, rules files, etc.) go in `CLAUDE.md` after the `@AGENTS.md` line.

### Phase 3: Write the Root AGENTS.md

Target: **30-60 lines** for the root file. Maximum 300 lines. Every line must be universally applicable — no task-specific content in the root.

Include all six essential sections:

```markdown
# Project Name

## Stack
[Tech stack with specific versions: "React 18, TypeScript 5.3, Vite 5, Tailwind 3.4"]

## Commands
[Copy-paste ready commands with full flags — build, test, lint, typecheck]

## Structure
[Directory layout with purposes and access levels (read/write/never modify)]

## Conventions
[Code style via concrete examples referencing actual project files, not prose]
[Naming: functions, classes, constants with real examples from the codebase]

## Git
[Commit format, branching strategy, PR process]

## Boundaries

### Always
[Mandatory practices for every session]

### Ask First
[Actions requiring human approval]

### Never
[Absolute prohibitions — always include "Never commit secrets"]
```

**Key rules:**
- Commands must be copy-paste ready with full syntax
- Reference actual project files (`src/components/Button.tsx`), not hypothetical ones
- Delegate code formatting to tools/hooks, not instructions
- Use `file:line` references instead of embedding code snippets

### Phase 4: Write Scoped Sub-Files

For each major subsystem (app, service, package), create a scoped AGENTS.md:

```markdown
# Package Name

## Purpose
[1-2 lines: what it does, primary tech]

## Commands
[Package-specific: dev, build, test, lint]

## Patterns
[Concrete examples with actual file paths]
- DO: Pattern from `src/components/Button.tsx`
- DON'T: Anti-pattern like `src/legacy/OldButton.tsx`

## Key Files
[Important files to understand the package]

## Gotchas
[Non-obvious pitfalls specific to this package]
```

Sub-files should have MORE detail than the root — they're only loaded when the agent works in that directory.

### Phase 5: Present Output

Present files in order with paths:

```
--- File: AGENTS.md (root) ---
[content]

--- File: apps/web/AGENTS.md ---
[content]
```

### Quality Gate

Before presenting, verify:
- `CLAUDE.md` exists with `@AGENTS.md`
- Root file is under 300 lines (ideally 30-60)
- Root links to all sub-files
- Every command is copy-paste ready
- Examples reference real project paths
- No duplication between root and sub-files
- "Never commit secrets" or equivalent is present

---

## Review

Read [references/review-checklist.md](references/review-checklist.md) for the full scoring rubric.

### Process

1. Read the existing AGENTS.md (and any sub-files)
2. Read [references/best-practices.md](references/best-practices.md) for the complete best practices guide
3. Score each section using the checklist (0-2 per section, /20 total)
4. For each gap, provide a specific recommendation with a concrete example of what to add
5. Flag any anti-patterns found (vague instructions, missing commands, embedded snippets, etc.)

### Report Format

```markdown
## AGENTS.md Review

### Score: X/16

### Strengths
- [What's working well]

### Issues
1. **[Section]**: [Problem] → [Specific fix with example]
2. ...

### Recommended Changes
[Concrete diff-style suggestions or rewritten sections]
```

---

## Update

1. Read the existing AGENTS.md
2. Identify what changed in the codebase (new packages, changed commands, updated stack)
3. Apply changes while preserving manual content
4. Verify the file still meets the quality gate from the Generate workflow

---

## References

- **[references/best-practices.md](references/best-practices.md)** — Comprehensive best practices guide synthesized from analysis of 2,500+ repositories. Read when generating or reviewing.
- **[references/review-checklist.md](references/review-checklist.md)** — Scoring rubric and checklist for auditing AGENTS.md files. Read when reviewing.
