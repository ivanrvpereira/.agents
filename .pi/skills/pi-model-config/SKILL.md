---
name: pi-model-config
description: "Know how Pi model selection is configured and changed: default model, thinking level, one-off model switches, Ctrl+P scoped model cycling, and prompt-editor modes for this repo."
---

# Pi Model Config

Use this skill when the user asks how to change Pi models or wants edits to:
- the default model/provider/thinking level
- the active model for a session
- Ctrl+P scoped model cycling
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

Keep this aligned with the user's preferred model presets when requested, but do not assume it must always match Ctrl+P. Ask if unclear.

### One-off/session model changes

Use Pi itself rather than editing files:

- `/model` — switch model in the current interactive session
- `/settings` — adjust thinking level and related runtime settings
- CLI: `pi --provider <provider> --model <model[:thinking]> --thinking <level>`
- CLI: `pi --models <provider/model:thinking,...>` for one process's Ctrl+P cycle list

## Workflow for config edits

1. Inspect current state
   - Read `pi/settings.json`
   - Read `~/.pi/agent/modes.json` if prompt-editor modes are involved
2. Check prior intent from history
   - `git log --oneline -- pi/settings.json`
   - `git show <commit> -- pi/settings.json` for recent config commits
3. Confirm valid model ids
   - `pi --list-models`
4. Make the requested change
   - Defaults: update `defaultProvider`, `defaultModel`, `defaultThinkingLevel`
   - Ctrl+P: update `enabledModels` in the exact requested order
   - Prompt modes: update `~/.pi/agent/modes.json`
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
