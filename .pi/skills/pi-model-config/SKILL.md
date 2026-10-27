---
name: pi-model-config
description: "Know how Pi model selection is configured and changed: default model, thinking level, one-off model switches, and the Ctrl+P / Ctrl+Space model cycle for this repo."
---

# Pi Model Config

Use this skill when the user asks how to change Pi models or wants edits to:
- the default model/provider/thinking level
- the active model for a session
- the model cycle list (Ctrl+P / Ctrl+Space)

## Where model selection lives

All persistent model config is in one file, the source in the private companion repo (linked to `~/.pi/agent/settings.json` by `bin/sync`):

- `~/.agents-private/pi/settings.json`

Relevant fields:

- `defaultProvider` — provider selected on new sessions
- `defaultModel` — model id selected on new sessions
- `defaultThinkingLevel` — default thinking level
- `enabledModels` — the model cycle list, in cycle order, each entry with its own thinking level

### Model cycle keys

`pi/keybindings.json` binds both `ctrl+p` and `ctrl+space` to `app.model.cycleForward`, so both keys cycle `enabledModels`. Adding a model to `enabledModels` is the whole change; there is no second list to keep aligned.

### Refreshing model catalogs

- `pi update --models` — immediately refresh configured providers’ model catalogs only; it does not update Pi or extensions.
- `/model` also refreshes configured providers in the background.
- Catalogs are cached in `~/.pi/agent/models-store.json` for offline use.

### One-off/session model changes

Use Pi itself rather than editing files:

- `/model` — switch model in the current interactive session
- `/settings` — adjust thinking level and related runtime settings
- CLI: `pi --provider <provider> --model <model[:thinking]> --thinking <level>`
- CLI: `pi --models <provider/model:thinking,...>` for one process's cycle list

## Workflow for config edits

1. Inspect current state
   - Read `~/.agents-private/pi/settings.json`
2. Check prior intent from history (in `~/.agents-private`)
   - `git -C ~/.agents-private log --oneline -- pi/settings.json`
   - `git -C ~/.agents-private show <commit> -- pi/settings.json` for recent config commits
3. Confirm valid model ids
   - `pi --list-models`
4. Make the requested change
   - Defaults: update `defaultProvider`, `defaultModel`, `defaultThinkingLevel`
   - Cycle list: update `enabledModels`
5. Clean up stale entries
   - Remove duplicates
   - Remove deprecated models if requested
   - Preserve unrelated config
6. Verify
   - `jq . ~/.agents-private/pi/settings.json` parses
   - `git -C ~/.agents-private diff -- pi/settings.json` shows only the intended lines (the file may carry other uncommitted changes; leave them alone)
   - Tell the user to run `/reload` in live sessions; `bin/sync` is only needed if the `~/.pi/agent/settings.json` symlink is missing

## Conventions

- Use exact model IDs from `pi --list-models`.
- `enabledModels` format: `provider/model:thinking`.
- Thinking levels: `off|low|medium|high|xhigh`; CLI also documents `minimal`.
- Interpret “extra high” or “max” as `xhigh` unless the user says otherwise.
- Keep ordering exactly as requested.
- Keep this skill project-local under `.pi/skills/pi-model-config/`; do not move it to global `pi/skills/` unless the user explicitly wants it system-wide.
