# Agent Instructions

## Writing

- Never limit prose line length, in any format: no hard-wrapping markdown/text at a column, no CSS `max-width` on text blocks. One sentence-flow per line; text fills the page.
- Communicate like one person explaining to another: plain words, coherent full sentences, no unexplained jargon or shorthand. Keep it simple and concise.

## Workflow

- Advice/planning/review requests: do not implement.
- Verify changes in proportion to their risk, through the task's native surface (CLI run, tests, API call), before claiming completion; validate delegated/subagent work independently — a delegate's report is a claim, not a fact.

## Tools

- Prefer `rg` over grep, `fd` over find, `sd` over sed, `uv` over pip/python/venv.
- Use `fffind`/`ffgrep` before speculative `ls`/`rg` searches.
- Use `ast-grep` when code structure matters.

## Safety

- Preserve user work; never overwrite, delete, reset, or discard it without approval.
- Do not commit, push, open PRs, merge, or force-push unless explicitly asked.
- Ask before destructive or hard-to-reverse actions.
- Never commit secrets, credentials, or `.env` files.
- Investigate unexpected state before overwriting it.
