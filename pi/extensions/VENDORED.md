# Vendored Pi Extensions

Extensions copied from upstream repos instead of installed as pi packages. We
**own** these copies and may customize them.

Why vendored: the `git:` package install pulled a 295MB / ~11k-file
`node_modules` tree (including a redundant copy of pi itself) into
`~/.pi/agent/git/`, and every package update churned those files — triggering
Microsoft Defender first-open scan storms that produced intermittent 5–15s pi
boots. The vendored files only import pi-provided modules
(`@earendil-works/*`, `typebox`), so they work standalone as local extensions.

## Update workflow

For each row: fetch the source repo (use the librarian skill's cached checkout
under `~/.cache/checkouts/github.com/<org>/<repo>`), then diff the upstream
path against the local file since `Pinned ref`.

- If `Customized = no`: copy the upstream version over the local one.
- If `Customized = yes`: show the diff and merge by hand, preserving local changes.

Then bump `Pinned ref` to the commit you synced from, run `bin/sync --yes`, and
verify boot with: `pi --mode rpc --no-session </dev/null` (all extensions must
load without diagnostics). Ask an AI agent to run this.

## Registry

| Extension | Source | Upstream path | Pinned ref | Customized | Notes |
|-----------|--------|---------------|-----------|-----------|-------|
| answer.ts | mitsuhiko/agent-stuff | extensions/answer.ts | 4bce45560fa5 | no | |
| btw.ts | mitsuhiko/agent-stuff | extensions/btw.ts | 4bce45560fa5 | no | |
| files.ts | mitsuhiko/agent-stuff | extensions/files.ts | 13bc8f87970b | no | |
| review.ts | mitsuhiko/agent-stuff | extensions/review.ts | 4bce45560fa5 | no | |
| session-breakdown.ts | mitsuhiko/agent-stuff | extensions/session-breakdown.ts | 13bc8f87970b | no | |
| todos.ts | mitsuhiko/agent-stuff | extensions/todos.ts | 4bce45560fa5 | no | |

_Local (non-vendored) extensions are not listed here: cache-keepalive,
done-notify, prompt-stash, save-last-message, status-bar, tmux-fork._
