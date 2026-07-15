# Agent Instructions

## Workflow

- Ask when requirements, ownership, risks, or tradeoffs are ambiguous.
- Advice/planning/review requests: do not implement.
- Verify changes before claiming completion; validate delegated/subagent work independently — a delegate's report is a claim, not a fact.
- If the result is verifiable in the browser, verify it there (e.g. devbrowser); otherwise verify through the task's native surface (CLI run, tests, API call).

## Tools

- Prefer `rg` over grep, `fd` over find, `sd` over sed, `uv` over pip/python/venv.
- Add `|| true` when `rg`, `grep`, or `fd` may validly return no matches.
- Use `fffind`/`ffgrep` before speculative `ls`/`rg` searches.
- Use `ast-grep` when code structure matters.

## Safety

- Preserve user work; never overwrite, delete, reset, or discard it without approval.
- Do not commit, push, open PRs, merge, or force-push unless explicitly asked.
- Ask before destructive or hard-to-reverse actions.
- Never commit secrets, credentials, or `.env` files.
- Investigate unexpected state before overwriting it.
