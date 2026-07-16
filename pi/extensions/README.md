# Pi Extensions

Custom extensions for [Pi](https://github.com/mariozechner/pi). `bin/sync` symlinks each `.ts` file into `~/.pi/agent/extensions/`.

## done-notify.ts

Notifies when the agent finishes and is ready for input — macOS notification via `osascript`, OSC 777 escape sequence elsewhere.

## prompt-stash.ts

Stash the prompt you're typing and restore it later, per project.

- `Ctrl+Q` with text in the editor: stash it and clear the editor
- `Ctrl+Q` with an empty editor (or `/stash`): pick a stashed prompt to restore
- Stored globally in `~/.pi/agent/prompt-stash.json`, keyed by project cwd — survives restarts, nothing written into the repo

## status-bar.ts

Custom footer replacing the built-in status bar. Adds context token count with usage coloring (green < 80k, yellow > 80k, red > 120k), git stats (modified/new/deleted, ahead/behind, stash), cache hit ratio, and cost rate.

## tmux-fork.ts

`/split` — fork the current session into a new tmux pane to explore two directions side by side.

```
/split                    vertical split (new pane below)
/split h                  horizontal split (pane to the right)
/split [h] <prompt>       also send a prompt to the forked session
```

Requires running inside tmux ≥ 3.0. Prompts starting with `-` or `@` are space-prefixed so pi's CLI parses them as messages, not options/attachments.
