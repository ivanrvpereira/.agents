# pi-rex

Fork the current Pi conversation into a new Rex split or tab.
Requires Pi 1.1 or newer and the separately installed Rex app and CLI.

This is a local extension. It started as a copy of
[edmundmiller/dotfiles pi-rex](https://github.com/edmundmiller/dotfiles/tree/main/packages/pi-packages/pi-rex)
(MIT, see `LICENSE`) and is no longer synced with it.

## Use it

```text
/rex-fork          choose a right split or a new tab
/rex-fork split    fork into a right split
/rex-fork tab      fork into a new tab
Ctrl+Alt+F         fork into a right split
Ctrl+Alt+T         fork into a new tab
```

A Rex key binding can send `Ctrl+Alt+F` or `Ctrl+Alt+T`, so you don't type a
command over your editor draft. The draft stays in the original session and is
not copied to the fork.

The fork copies the currently selected conversation branch, including your
selection after `/tree` navigation, into a new session file. The original
session stays open and unchanged. Rex opens the copy with
`pi --session <fork>` and focuses it. Both sessions use the same working
directory and files; this does not create a Git worktree. Avoid concurrent
edits to the same files.

Forking needs a saved conversation, an idle Pi, and a terminal directly inside
Rex (not tmux or screen), with `rex` and `pi` on `PATH`. If Rex cannot confirm
the launch, the error includes the saved fork path. Check Rex before retrying,
or resume that copy with `pi --session <path>`.

## What it does not do

- **Task status in Rex tabs.** Pi has reported working, blocked, done, and
  error itself since 1.1 (OSC 7501). See "Program status" in Pi's
  `docs/terminal-setup.md`. `PI_PROGRAM_STATUS=0|1` overrides detection.
- **Teaching the model the `rex` CLI.** The `rex` skill does that. `rex skill
  setup` installs it, and it loads the guide from the installed Rex CLI when
  needed. Bash commands already see `REX_SESSION`, `REX_BLOCK`, and
  `REX_SERVER`.
- **Adding text to the system prompt.** The upstream version returned
  `systemPrompt` from `before_agent_start` with the full Rex guide. That makes
  Pi rewrite the start of every request, so any tool change in the middle of a
  session misses the whole prompt cache and Anthropic drops earlier thinking
  blocks.
- **Pane capture.** Use `!rex capture -b <pane> --trim --unwrap`; Pi adds the
  output to the conversation. Terminal output is untrusted data.

## Development

There is no `node_modules` here. To run the tests, copy the files to a scratch
directory and link an installed copy of Pi:

```sh
PI_PKG=~/.pi/agent/install/releases/$(cat ~/.pi/agent/install/current-version)/node_modules/@earendil-works/pi-coding-agent  # managed install from pi.dev/install.sh
T=$(mktemp -d) && cp ~/.agents/pi/extensions/pi-rex/*.ts ~/.agents/pi/extensions/pi-rex/*.json "$T"
mkdir -p "$T/node_modules/@earendil-works"
ln -s "$PI_PKG" "$T/node_modules/@earendil-works/"
(cd "$T" && bun test ./index.test.ts)
```

Then check that Pi loads it: `pi --mode rpc --no-session </dev/null`.

To try a change without syncing, start Pi inside a Rex terminal with
`pi -e ~/.agents/pi/extensions/pi-rex/index.ts`.
