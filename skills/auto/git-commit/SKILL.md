---
name: git-commit
description: "Read this skill before making git commits"
---

# Git Commit

Use this skill as the playbook for producing reviewable Conventional Commits and a clean, consistent commit history.

## Non-destructive commit organization

Commit hygiene is never a reason to undo implemented work.

- Never revert, restore, checkout, reset, stash, delete, or edit changes solely to make history fit "one commit per feature" or another commit-shaping rule.
- Atomic commits are a staging/message concern, not permission to roll back working-tree content.
- If multiple features are already implemented, either:
  - split them into separate commits only when the split is safe by file or obvious hunk staging and does not alter the working tree, or
  - commit the implemented changes together with a clear Conventional Commit message/body.
- If changes are intertwined or separation is uncertain, ask the user or commit everything together; do not discard or rewrite work to force separation.
- `git reset`/`git restore --staged` may be used only to unstage changes, never to discard working-tree content, unless the user explicitly requests it.

## Phase 1: Review changes

1. Infer from the prompt if the user provided specific file paths/globs and/or additional instructions
2. Check what files have changed with `git status` and `git diff` (limit to argument-specified files if provided)
3. If there are no changes to commit, inform the user and stop
4. If there are ambiguous extra files, ask the user which files to commit
5. Stage only the intended files (all changes if no files specified)

Rules:

- Keep commits small, focused, and atomic
- Avoid commits that mix unrelated changes (e.g., "Address feedback")
- Treat caller-provided arguments as commit guidance:
  - Freeform instructions should influence scope, summary, and body
  - File paths or globs should limit which files are staged and committed
  - If arguments combine files and instructions, honor both
- Never stage or commit files that look like secrets (e.g. `.env`, credentials, API keys)

## Phase 2: Generate commit message

1. Use a concise Conventional Commits-style subject:

   `<type>(<scope>): <summary>`

   - `type` REQUIRED. Use `feat` for new features, `fix` for bug fixes. Other common types: `docs`, `refactor`, `chore`, `test`, `perf`.
   - `scope` OPTIONAL. Short noun in parentheses for the affected area (e.g., `api`, `parser`, `ui`).
   - `summary` REQUIRED. Short, imperative, <= 72 chars, no trailing period.
2. Only when needed (don’t force it for trivial changes), write a body:
   - Add a blank line after the subject
   - Do not hard-wrap body lines; keep each sentence or bullet on a single line
   - Focus on "what" and "why", not the "how"
   - Explain the motivation
   - Mention side effects, trade-offs, or alternatives considered
   - Reference relevant issue IDs / tickets at the bottom if known
3. Check recent commit style and common scopes: `git log -n 50 --pretty=format:%s`
4. Generate a message that follows Conventional Commits and fits the repo’s style

Rules:

- Do not include breaking-change markers or footers unless explicitly requested
- Do not add sign-offs (no `Signed-off-by`)
- Do not add yourself as an author or contributor
- Do not include "Generated with ...", "Co-Authored-By: ...", or any AI attribution

## Phase 3: Commit

1. Commit staged changes with `git commit`

Rules:

- Avoid `git commit --amend` unless explicitly requested
- Do not bypass hooks with `git commit --no-verify`
  - If `git commit` fails due to hooks, fix issues and retry
- Use `git commit -m "<subject>"` when there is no body
- Use `git commit -F` (or heredoc) when there is a body, never newline escapes in `-m`
- Never push to remotes unless explicitly requested
