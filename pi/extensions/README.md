# Pi Extensions

Custom extensions for [Pi](https://github.com/mariozechner/pi). `bin/sync` symlinks each `.ts` file into `~/.pi/agent/extensions/`.

## cache-keepalive.ts

Keeps the Anthropic prompt cache warm across idle pauses (default on, Anthropic-only). A pass-through tap on global fetch captures the exact wire bytes (URL, headers, body) of the session's last main LLM request; after ~50 min idle (jittered, inside the 1h cache TTL), it replays them byte-identical with `stream: true`, hard-aborting at `message_start` — refreshing the whole cached prefix at cache-read price (0.1×) instead of paying a 2× rewrite on cold resume. Verifies `cache_read_input_tokens` per ping and auto-disables on a miss. Session file is never touched.

Byte-identity matters twice: payload changes (e.g. stripping `thinking`) invalidate the messages-level cache, and on subscription OAuth Anthropic fingerprints header + body serialization to classify requests as Claude Code (plan limits) vs third-party harness ("extra usage") — reconstructed requests get rejected; captured wire bytes pass (verified empirically). Set `PI_CACHE_KEEPALIVE_DEBUG=1` to log pings to `/tmp/cache-keepalive-debug.jsonl`.

Stops on two conditions: session ping budget exhausted (24 per session by default), or a ping that fails to hit the cache (auto-disable). Every ping outcome (hit/miss/error) is recorded to `~/.pi/agent/cache-keepalive-stats.json`.

- `/keepalive [on|off|status|stats]` — toggle, inspect state, or browse recorded ping history (default on)
- Status line: `♨ R148k ping@15:29 (3/24)` → `♨ cap 24/24 · cold ~17:21` — absolute times, no render ticks
- Env: `PI_CACHE_KEEPALIVE=off` to disable, `PI_CACHE_KEEPALIVE_DELAY` (sec), `PI_CACHE_KEEPALIVE_PINGS` (session cap, default 24), `PI_CACHE_KEEPALIVE_MIN_TOKENS` (skip small contexts, default 10k — shows `♨ ctx … — no ping` when skipped)
- Skips `openai-codex/*` models (automatic ~5–10 min cache, can't usefully be kept warm)

## done-notify.ts

Notifies when the agent finishes and is ready for input — macOS notification via `osascript`, OSC 777 escape sequence elsewhere.

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

`/split` — fork the current session into a new tmux pane to explore two directions side by side.

```
/split                    vertical split (new pane below)
/split h                  horizontal split (pane to the right)
/split [h] <prompt>       also send a prompt to the forked session
```

Requires running inside tmux ≥ 3.0. Prompts starting with `-` or `@` are space-prefixed so pi's CLI parses them as messages, not options/attachments.

## Vendored extensions

`answer.ts`, `btw.ts`, `files.ts`, `review.ts`, `session-breakdown.ts`, `todos.ts` are vendored copies from [mitsuhiko/agent-stuff](https://github.com/mitsuhiko/agent-stuff). Sources, pinned refs, rationale, and the update workflow live in [VENDORED.md](./VENDORED.md).
