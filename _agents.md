# Agent Instructions

## Core Behavior

- Prefer the simplest, most intuitive solution that satisfies the request.
- Avoid over-engineering, extra abstractions, and unasked-for features.
- Keep edits surgical: every changed line should trace to the user's request.
- Prefer editing existing files over creating new ones.
- Read relevant code/docs before modifying behavior.
- Mirror local style and conventions. For new files inspect other files of the same type first to learn the style.
- Fix root causes, not symptoms.
- Remove code made unused by your change; mention unrelated dead code instead of deleting it.
- Comments should explain non-obvious why, not obvious what.
- Markdown should be concise, high-signal, and low-noise.

## Workflow

- If the task matches a skill, load and follow that skill.
- Ask when requirements, ownership, risks, or tradeoffs are ambiguous.
- For non-trivial work, state a short plan and verification path before coding.
- If the user asks for advice, planning, or review, do not implement.
- If the user asks for implementation and scope is clear, proceed.
- Verify changes before claiming completion.
- Validate all delegated/subagent work independently before reporting done — a delegate's report is a claim, not a fact.
- If the result is verifiable in the browser, verify it there (e.g. devbrowser); otherwise verify through the task's native surface (CLI run, tests, API call).

## Tools

- Prefer purpose-built tools over generic shell pipelines.
- Use `ast-grep` when code structure matters.
- Prefer `sd` over `sed`, `fd` over `find`, and `uv` over raw `pip`/`python`/`venv`.
- Use modern tools explicitly:
  - Use `fd` instead of `find`: `fd -e py` for extensions, `fd -g '*.py'` for globs; do not pass shell globs like `*.py` as fd regexes.
  - Use `rg` instead of `grep`: use `-g '*.py'` or `--type py`; `rg` does not support `--include`.
  - Add `|| true` when `rg`, `grep`, or `fd` may validly return no matches.
  - Use `sd` instead of `sed` for replacements.
  - Use `fffind`/`ffgrep` before speculative `ls`/`rg` searches.

## Collaboration & Safety

- Preserve user work; never overwrite, delete, reset, or discard it without approval.
- Do not commit, push, open PRs, merge, or force-push unless explicitly asked.
- Ask before destructive or hard-to-reverse actions.
- Never commit secrets, credentials, or `.env` files.
- Investigate unexpected state before overwriting it.
