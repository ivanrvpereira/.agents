# Pi session splitting into terminal panes

## Implementation update: Rex

The user chose Rex after the initial Herdr assessment below.
`pi/extensions/tmux-fork.ts` now uses `rex split`, with the original filename retained for existing symlinks.
It clones the selected branch through a separate Pi session manager before starting the child with `--session`.
The command preserves the original session, working directory, and focus.

Validation used synthetic conversation data in a disposable Rex session.
Two splits opened independent Pi sessions with the selected answer and without the abandoned branch.
A `/split h` submitted through one real Pi terminal created another pane successfully.
Checks also covered preserved parent state and focus, direction mapping, multiline prompts, literal `-` / `@` prefixes, and recoverable Rex errors.
The TypeScript check and extension loader check passed.
No model requests were made, and the disposable Rex session was removed.
The runnable local validation script remains at `/tmp/pi-rex-split-check.Aivv02/check.mjs`.

The installed extension symlink already points to the changed source file.
The sync preview included unrelated skill changes, so no global sync was applied.

## Original assessment: Herdr

Pi supplies native session cloning, but it does not supply the complete “clone into a new Herdr pane” workflow.
The existing `/split` extension still has a purpose: connect native Pi session storage to Herdr pane creation.
For human-driven research experiments, each clone can use the original working directory without a Git worktree.

No extension code changed during this assessment.

## Versions checked

- Checked on 2026-10-23.
- Installed Pi: `1.4.0`, from `pi --version`.
- Latest published Pi: `1.4.0`, from npm and the [latest GitHub release](https://github.com/earendil-works/pi/releases/tag/v1.4.0), published 2026-10-21.
- Release source: `4a080252f06caf63a525d7873c5d94d3c23887e0` (`v1.4.0`).
- Upstream main inspected: `906e1302f94829ec7e228059199681c11faec0b0`.
- Installed Herdr: `0.9.5`. Its `--skill`, `pane`, and `agent` help describe the commands below.
- Local extension: `pi/extensions/tmux-fork.ts`, introduced by commit `6a0eaa3` on 2026-07-16.

The installed package is `@earendil-works/pi-coding-agent`, whose repository is `earendil-works/pi`.
The check used the current package and repository, not an older package name or repository location.

## What Pi supplies natively

| Feature | Behavior | Fit for this workflow |
| --- | --- | --- |
| `/clone` | Copies the active branch through its current position, then replaces the current Pi session with the clone. | Correct conversation boundary, but no additional pane. |
| `/fork` | Selects an earlier user message, creates another session, and restores that user prompt for editing. | Useful for revising an earlier question, not continuing after the latest answer. |
| `/tree` | Changes the active position within one session tree. | Useful for navigation, not independent simultaneous sessions. |
| `pi --fork <path-or-id>` | Copies the saved source session into a new session before Pi starts. | Valid CLI, but does not identify the current in-memory tree position. |
| `pi --session <path-or-id>` | Opens an existing session. | Appropriate for starting a child after the extension creates its independent session file. |

Sources: [session documentation][sessions], [CLI documentation][cli], [built-in command registry][commands], and [`/clone` implementation][clone].
The `/clone` implementation calls the runtime fork operation with the current leaf and `{ position: "at" }`.
There is no native `/split` command in the checked command registry and no documented Pi CLI option for opening a Herdr pane.

The release history confirms that these are not new 1.4.0 session primitives:

- CLI `--fork` arrived in 0.60.0 on 2026-03-18.
- `/clone` and `ctx.fork(..., { position })` arrived in 0.68.0 on 2026-04-20.

Both features predate the local extension's July creation date.
Thus, native `/clone` did not recently replace this extension's pane-opening role.
Sources: [0.60.0 changelog][history-fork] and [0.68.0 changelog][history-clone].

## What remains accurate in the old extension

The current extension uses `pi.registerCommand()`, `pi.exec()`, `ctx.cwd`, and `ctx.sessionManager.getSessionFile()`.
These APIs still exist in Pi 1.4.0.
The CLI still accepts `--fork <session-file>`.
Therefore, the extension is not obsolete because of an incompatible Pi API change.

Its main functional limitation is unchanged: it only creates tmux panes.
Herdr needs its own pane and agent commands.

Sources: [extension context and command types][extension-types], [CLI documentation][cli], and local `pi/extensions/tmux-fork.ts`.

## Why a live session path is not enough

The saved session contains a tree, not only the active conversation path.
`SessionManager.forkFrom()`, which powers CLI `--fork`, copies every non-header entry from the source file.
On loading that copy, the manager selects the last serialized entry as its leaf.
Tree navigation can select an earlier leaf without appending another entry.
As a result, CLI `--fork` can select a later abandoned branch instead of the current position.

Sources: [`forkFrom()`][fork-from], [index reconstruction][build-index], and [session format][format].

A local probe against the installed 1.4.0 package reproduced this behavior without any model request:

1. A synthetic session received a question and an answer named `Selected answer`.
2. The session received another question and `Later answer on abandoned branch`.
3. The manager navigated back to `Selected answer`.
4. `SessionManager.forkFrom()` produced a child ending at the later abandoned answer.
5. A separate manager using `createBranchedSession(selectedLeafId)` produced a child ending at `Selected answer`.
6. The original manager retained its selected leaf, and the original file remained byte-identical.

The probe used an owned temporary directory and removed it afterward.
For a linear session at its latest saved answer, the existing `--fork` approach still copies the expected conversation.
It also reads the live file during child startup, rather than capturing a fixed branch before pane creation.

## Recommended extension design

The recommendation is a small Herdr adapter around Pi session APIs, not a new session format or orchestration system.

1. Wait for Pi to become idle, then capture the session file, active leaf, working directory, and session directory.
2. Open the saved source through a separate `SessionManager` instance.
3. Call `createBranchedSession(capturedLeafId)` on that separate manager.
4. Create a sibling Herdr pane in the original working directory without changing focus.
5. Start Pi in that pane with `--session <new-session-file>`.
6. Optionally submit the experiment prompt after startup.

`ctx.sessionManager` is read-only by contract.
Calling `ctx.fork()` instead replaces the original session runtime, so it is not the right operation for preserving the parent pane.
The separate manager avoids both problems.
Pi handles branch extraction, labels, compaction links, a new session identity, and the parent-session reference through its existing API.

Sources: [extension types][extension-types], [runtime fork implementation][runtime-fork], and [`createBranchedSession()`][branch-clone].

The installed Herdr CLI supports these building blocks:

```text
herdr pane split --current --direction right --cwd <cwd> --no-focus
herdr agent start <unique-name> --kind pi --pane <returned-pane-id> -- --session <new-session-file>
```

The pane ID comes from the split response, not a predicted identifier.
`down` is also supported.
The extension can retain its current `/split` and `/split <prompt>` interaction.
Repeating the command from an unchanged parent creates independent experiments from the same conversation point.
No worktree, supervisor, intercom protocol, or subagent framework is required for this user-driven workflow.

These Herdr commands were checked against installed help, but no pane was created for this assessment.
End-to-end pane startup remains an implementation validation step.

## Prompt parsing change

The old source comment says that Pi has no `--` option separator.
That statement is no longer accurate: Pi 1.4.0 accepts `--`, which protects prompts beginning with `-`.
However, arguments beginning with `@` still become file attachments after `--`.
The existing leading-space protection for literal `@` prompts still serves a purpose when prompts travel through CLI arguments.
Submitting an initial prompt after startup avoids this particular CLI parsing issue.

Source: [argument parser][args].
A local parser probe confirmed that `['--', '-compare']` produces a message, while `['--', '@literal']` produces an attachment.

## Limits

The assessment verified published docs, source, installed CLI interfaces, and session-manager behavior.
It did not modify the extension, reload Pi, create a Herdr pane, or make a model request.
Upstream main had no relevant change to CLI arguments, CLI session creation, session storage, or runtime forking relative to v1.4.0.
Its extension-type change added Markdown renderer metadata, which does not affect this design.

[sessions]: https://github.com/earendil-works/pi/blob/v1.4.0/packages/coding-agent/docs/sessions.md
[cli]: https://github.com/earendil-works/pi/blob/v1.4.0/packages/coding-agent/docs/cli.md
[commands]: https://github.com/earendil-works/pi/blob/v1.4.0/packages/coding-agent/src/core/slash-commands.ts#L19-L44
[clone]: https://github.com/earendil-works/pi/blob/v1.4.0/packages/coding-agent/src/modes/interactive/interactive-mode.ts#L5511-L5530
[extension-types]: https://github.com/earendil-works/pi/blob/v1.4.0/packages/coding-agent/src/core/extensions/types.ts#L314-L453
[fork-from]: https://github.com/earendil-works/pi/blob/v1.4.0/packages/coding-agent/src/core/session-manager.ts#L1808-L1873
[build-index]: https://github.com/earendil-works/pi/blob/v1.4.0/packages/coding-agent/src/core/session-manager.ts#L1103-L1122
[format]: https://github.com/earendil-works/pi/blob/v1.4.0/packages/coding-agent/docs/session-format.md
[runtime-fork]: https://github.com/earendil-works/pi/blob/v1.4.0/packages/coding-agent/src/core/agent-session-runtime.ts#L262-L350
[branch-clone]: https://github.com/earendil-works/pi/blob/v1.4.0/packages/coding-agent/src/core/session-manager.ts#L1627-L1747
[args]: https://github.com/earendil-works/pi/blob/v1.4.0/packages/coding-agent/src/cli/args.ts#L80-L92
[history-fork]: https://github.com/earendil-works/pi/blob/v1.4.0/packages/coding-agent/CHANGELOG.md#L3187-L3201
[history-clone]: https://github.com/earendil-works/pi/blob/v1.4.0/packages/coding-agent/CHANGELOG.md#L2570-L2593
