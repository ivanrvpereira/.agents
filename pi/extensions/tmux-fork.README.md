# tmux-fork (`/split`)

Pi extension that forks the current session into a new tmux pane, so you can branch a conversation and explore two directions side by side.

## What it does

Registers a `/split` command that:

1. Grabs the current session file.
2. Opens a new tmux pane (below by default, or to the right) in the same working directory.
3. Launches pi in that pane with `--fork <session>`, resuming the full conversation history as a new, independent session.
4. Optionally sends an initial prompt to the forked session.

## Usage

```
/split                    vertical split (new pane below)
/split h                  horizontal split (new pane to the right)
/split fix the tests      vertical split + send prompt
/split h try approach B   horizontal split + send prompt
```

A leading `h` or `v` is treated as the split direction; everything after it is the prompt.

## Requirements

- Must be running inside a tmux session (fails with a notice otherwise).
- tmux >= 3.0 — the command is passed as multiple arguments to `split-window`, which exec's it directly without a shell.

## Notes

- The fork reuses the same pi entrypoint that launched the current session (falls back to `pi` on PATH).
- Prompts starting with `-` or `@` are prefixed with a space so pi's CLI parser treats them as messages rather than options or file attachments (pi has no `--` separator).
