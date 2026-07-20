# ~/.agents Setup Notes — fresh laptop (2026-06-08)

Issues / friction found while running `~/.agents/bin/sync --bootstrap` on a new machine.
Local / untracked — use to improve the repo later, then delete.

## Prerequisites discovered

- `bin/sync --bootstrap` installs Claude Code plugins, so it expects `claude` (Claude Code) on PATH.
- `npx skills update -g` (per README) needs node/npm — provided by mise/Homebrew from the dotfiles bootstrap, so **dotfiles must be bootstrapped first**.

## Findings

- [x] **`bin/sync --bootstrap --yes` succeeded** — linked shared `CLAUDE.md`/`AGENTS.md` into `~/.claude`, `~/.pi/agent`, `~/.codex`; 33 skills each into Claude + Codex; Pi extensions; backed up existing `~/.claude/settings.json` → `.bak` and linked. Added marketplaces + installed plugins.
- [x] **`npx skills update -g` succeeded** — all 7 external skill sources already up to date.
- [ ] **One plugin failed to install: `cc-caffeine@samber`** (`[WARN] failed: cc-caffeine@samber`). All other plugins (superpowers, context7, plannotator, the LSPs, dev-browser, llm-application-dev) installed fine. Worth checking whether the `samber` marketplace dropped/renamed `cc-caffeine`, and removing/replacing it in the Claude settings plugin list if so.
- [x] Prereqs present on PATH: `claude`, `pi`, `codex`, `node`, `npx` (all from Homebrew/mise). `~/.pi` was created by sync.
- [ ] **`gemini` CLI missing** — the dotfiles `gemini-cli` brew formula didn't put a `gemini` on PATH (and the daily `update-agents` job updates gemini-cli). Tracked in the dotfiles notes; not an `~/.agents` issue.
