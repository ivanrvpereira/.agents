# Pi Extensions

Custom extensions for [Pi](https://github.com/mariozechner/pi). `bin/sync` symlinks each `.ts` file into `~/.pi/agent/extensions/`.

## prompt-stash.ts

Stash the prompt you're typing and restore it later, per project.

- `Ctrl+Q` with text in the editor: stash it and clear the editor
- `Ctrl+Q` with an empty editor (or `/stash`): pick a stashed prompt to restore
- Stored globally in `~/.pi/agent/prompt-stash.json`, keyed by project cwd — survives restarts, nothing written into the repo

## save-last-message.ts

Saves the latest assistant text response directly to a Markdown file without another agent turn.

- `/save-last report.md` — save to a path relative to Pi's current working directory
- `/save-last` — create a timestamped `agent-message-YYYYMMDD-HHMMSS.md` file
- Adds `.md` when the supplied path has no extension and never overwrites an existing file
- Also accepts absolute and `~/`-prefixed paths; surrounding quotes are stripped

## status-bar.ts

Custom footer replacing the built-in status bar. Adds context token count with usage coloring (green < 80k, yellow > 80k, red > 120k), git stats (modified/new/deleted, ahead/behind, stash), cache hit ratio, and cost rate.

## tmux-fork.ts

`/split` — copy the current conversation into a new Rex pane for independent research experiments.
The legacy filename stays unchanged so existing extension symlinks remain valid.

```
/split                    new pane below, ready for input
/split h                  new pane to the right, ready for input
/split [h|v] <prompt>      start the copied session with a prompt
```

Requires a Rex terminal with `rex` on PATH and `REX_SESSION` / `REX_BLOCK` set.
Copies the active branch through the current position, including the latest answer, even after `/tree` navigation.
The original session, working directory, and pane focus stay unchanged.
Repeated splits from an unchanged original session create independent conversations with shared project files.
Prompts retain internal spaces and line breaks, including with `h` or `v`.
Literal prompts starting with `-` or `@` are passed as messages, not options or attachments.
If Rex reports an error, the notification includes the saved session copy so you can recover it without another fork.

## Vendored extensions

`answer.ts`, `btw.ts`, `files.ts`, `review.ts`, `session-breakdown.ts`, `todos.ts` are vendored copies from [mitsuhiko/agent-stuff](https://github.com/mitsuhiko/agent-stuff). Sources, pinned refs, rationale, and the update workflow live in [VENDORED.md](./VENDORED.md).
