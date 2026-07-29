---
name: pi-model-config
description: "Know how Pi model selection is configured and changed: default model, thinking level, one-off model switches, Ctrl+P scoped model cycling, and prompt-editor modes for this repo."
---

# Pi Model Config

Use this skill when the user asks how to change Pi models or wants edits to:
- the default model/provider/thinking level
- the active model for a session
- model lists in both `pi/settings.json` (Ctrl+P) and `~/.pi/agent/modes.json` (Ctrl+Space)
- prompt-editor modes (`/mode`, `ctrl+space`, `ctrl+shift+m`)

## Where model selection lives

### Persistent defaults

Edit this repo's source config:

- `pi/settings.json`

Relevant fields:

- `defaultProvider` — provider selected on new sessions
- `defaultModel` — model id selected on new sessions
- `defaultThinkingLevel` — default thinking level
- `enabledModels` — scoped model list used by Ctrl+P / Shift+Ctrl+P

After changing synced config, remind the user to run:

```bash
bin/sync --dry-run
bin/sync
```

or `/reload` if the live Pi session already reads the target file.

### Prompt-editor modes

Edit the local prompt-editor mode file:

- `~/.pi/agent/modes.json`

This controls agent-stuff `prompt-editor` presets:

- `/mode` — picker/command
- `ctrl+shift+m` — picker
- `ctrl+space` — cycle prompt modes

When adding, removing, or replacing models, update both `pi/settings.json` and `~/.pi/agent/modes.json` so Ctrl+P and Ctrl+Space stay aligned. Preserve each file's requested ordering and thinking levels.

### Refreshing model catalogs

- `pi update --models` — immediately refresh configured providers’ model catalogs only; it does not update Pi or extensions.
- `/model` also refreshes configured providers in the background.
- Catalogs are cached in `~/.pi/agent/models-store.json` for offline use.

### One-off/session model changes

Use Pi itself rather than editing files:

- `/model` — switch model in the current interactive session
- `/settings` — adjust thinking level and related runtime settings
- CLI: `pi --provider <provider> --model <model[:thinking]> --thinking <level>`
- CLI: `pi --models <provider/model:thinking,...>` for one process's Ctrl+P cycle list

## Workflow for config edits

1. Inspect current state
   - Read `pi/settings.json`
   - Read `~/.pi/agent/modes.json`
   - For model-list changes, plan matching edits in both files
2. Check prior intent from history
   - `git log --oneline -- pi/settings.json`
   - `git show <commit> -- pi/settings.json` for recent config commits
3. Confirm valid model ids
   - `pi --list-models`
4. Make the requested change
   - Defaults: update `defaultProvider`, `defaultModel`, `defaultThinkingLevel`
   - Model lists: update `enabledModels` in `pi/settings.json` and `modes` in `~/.pi/agent/modes.json`
   - Keep both lists aligned unless the user explicitly requests different Ctrl+P and Ctrl+Space presets
5. Clean up stale entries
   - Remove duplicates
   - Remove deprecated models if requested
   - Preserve unrelated config
6. Verify
   - Re-read changed files
   - `git diff -- pi/settings.json` for repo-tracked config
   - Tell the user whether `/reload` or `bin/sync` is needed

## Conventions

- Use exact model IDs from `pi --list-models`.
- `enabledModels` format: `provider/model:thinking`.
- `modes.json` format: `{ provider, modelId, thinkingLevel }`.
- Thinking levels: `off|low|medium|high|xhigh`; CLI also documents `minimal`.
- Interpret “extra high” or “max” as `xhigh` unless the user says otherwise.
- Keep ordering exactly as requested.
- Keep this skill project-local under `.pi/skills/pi-model-config/`; do not move it to global `pi/skills/` unless the user explicitly wants it system-wide.
