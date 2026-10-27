---
name: git-commit
description: "Read this skill before making git commits"
---

# Git Commit

Produce focused Conventional Commits that fit the repo's history.

## Never undo work to shape history

Commit hygiene is never a reason to change the working tree. Use `git reset` or `git restore --staged` only to unstage. When changes are intertwined, split them only by file or by an obvious hunk; otherwise ask the user or commit them together with a clear message.

## 1. Stage

1. Read `git status` and `git diff`. If the caller named files, globs, or instructions, limit scope to them and let the instructions shape the message.
2. If there is nothing to commit, say so and stop. If unrelated or ambiguous files are present, ask which to commit.
3. Stage only the intended files, one logical change per commit. Never stage files that look like secrets (`.env`, credentials, keys).

## 2. Write the message

1. Match the repo's style and scopes: `git log -n 50 --pretty=format:%s`.
2. Subject: `<type>(<scope>): <summary>`. Type is `feat`, `fix`, `docs`, `refactor`, `chore`, `test`, or `perf`; scope is optional; summary is imperative, at most 72 characters, no trailing period.
3. Add a body only when the change needs it: a blank line after the subject, then what changed and why, side effects, and trade-offs. One sentence or bullet per line, never hard-wrapped. Issue references go at the bottom.
4. No breaking-change footers unless asked. No sign-offs, co-author lines, or AI attribution.

## 3. Commit

- `git commit -m "<subject>"` without a body; `git commit -F <file>` or a heredoc with one.
- If a hook fails, fix the cause and retry. Never use `--no-verify`.
- No `--amend` and no push unless the user asks.
