# Agent Instructions

## Code Quality

- Prefer the simplest, most intuitive solution
- Prefer editing existing files over creating new ones
- If there is a simpler or smaller approach, say so before adding complexity
- No over-engineering: don't add features, abstractions, or error handling beyond what's asked
- Keep edits surgical: every changed line should trace to the user's request; avoid drive-by refactors, formatting, or adjacent cleanup
- For new files, inspect ~2 files of the same type first and mirror their structure/style/conventions. Exception: one-off artifacts (RCA, notes, plans, proposals, suggestions) — keep those token-light.
- Step-down rule: high-level behavior at top, details below. In classes: constructor → public API → private helpers.
- Fix root causes. Reason from first principles — no band-aids.
- Remove code made unused by your change; mention unrelated dead code instead of deleting it.
- Comments: only for non-obvious _why_. Prefer naming/structure.
- Markdown you produce: tight, high-signal, no noise.
- For new or heavily changed files, prefer focused files; don't split unrelated existing files unless asked.

## Workflow

- Re-skim this guide when requirements shift.
- Surface ambiguity: if multiple plausible interpretations exist, state them and ask instead of silently choosing.
- Read existing code before modifying
- Git status/diffs are read-only. Never revert or assume missing changes were yours.
- Plan before coding on non-trivial tasks. Research docs, review the codebase, ask about trade-offs if unsure.
- For non-trivial work, define verification before coding. For bugs, reproduce with a failing test/script when practical.
- Research dependencies and confirm fit with the user before adding.
- If the user asks for advice, planning, or review, don't implement. If they ask for implementation and scope is clear, proceed.
- Verify changes work before claiming completion

## Collaboration

- If you're unsure about trade-offs, ask the user explicitly.
- Respond point-by-point to review feedback
- Don't push, open PRs, or merge without explicit approval

## Tools

Prefer modern CLI tools:
- `sd` over `sed`, `fd` over `find`, `rg` over `grep`, `procs` over `ps`
- `gh` for all GitHub operations (including fetching github.com content)

Pre-installed: `fd`, `rg`, `ast-grep`, `pnpm`, `git`, `mise`, `uv`, `tmux`, `imagemagick`, `ffmpeg`, `pandoc`


## Testing

- Test behavior, not implementation — assert on outcomes, not internals
- Don't mock what you don't own; prefer fakes/stubs over deep mocking
- Tests should survive refactors — if only the implementation changes, tests shouldn't break

## Safety

- Use `trash` over `rm` — recoverable deletion
- Ask before destructive or hard-to-reverse actions (force push, reset --hard, drop tables, delete branches)
- Never commit secrets, credentials, or .env files
- Investigate unexpected state before overwriting — it may be in-progress work
