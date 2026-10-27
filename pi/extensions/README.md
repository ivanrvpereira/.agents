# Pi Extensions

Custom extensions for [Pi](https://github.com/earendil-works/pi). `bin/sync` symlinks each `.ts` file and extension directory into `~/.pi/agent/extensions/`.

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

## pi-rex/

Local extension, started from [edmundmiller/dotfiles pi-rex](https://github.com/edmundmiller/dotfiles/tree/main/packages/pi-packages/pi-rex) (MIT, see `pi-rex/LICENSE`) and no longer synced with it. It replaces the old `/split` extension.
It only forks the current conversation into a new Rex split or tab.

```text
/rex-fork          choose a right split or new tab
/rex-fork split    fork into a right split
/rex-fork tab      fork into a new tab
```

`Ctrl+Alt+F` forks into a split. `Ctrl+Alt+T` forks into a tab.
The shortcuts do not require changes to the Rex configuration.
Forks copy the selected conversation branch, take focus, and share the original project files without worktree isolation.
Forks require an idle, saved Pi conversation directly inside Rex, with `rex` and `pi` on PATH.
The old `/split` command is no longer available.

Everything else about Rex comes from elsewhere: Pi reports task status to Rex itself (OSC 7501, since Pi 1.1), and the `rex` skill from `rex skill setup` teaches the model the `rex` CLI. The extension adds nothing to the system prompt: returning `systemPrompt` from an extension makes Pi rewrite the start of every request, so any tool change mid-session would miss the whole prompt cache.
See [pi-rex/README.md](./pi-rex/README.md) for recovery instructions.

## Vendored extensions

`answer.ts`, `btw.ts`, `files.ts`, `review.ts`, `session-breakdown.ts`, and `todos.ts` are vendored copies from [mitsuhiko/agent-stuff](https://github.com/mitsuhiko/agent-stuff).
Sources, pinned refs, rationale, and the update workflow live in [VENDORED.md](./VENDORED.md).
