# Pi Bellwether fit for a cross-project manager

Research date: 2026-09-29.
Repository: [joelhooks/pi-bellwether](https://github.com/joelhooks/pi-bellwether).
Source inspected: `cf9cdb6363fc2fc10f253f5e256c5ebfbab5560d`.
Package version: `@joelhooks/pi-bellwether` 1.5.0. License: MIT.
Status: source and documentation inspection only. No installation, dependency installation, live runtime test, or configuration change.

## Conclusion

Bellwether is a close match for the control layer in the original Pi-plus-Herdr proposal.
It exposes native Pi tools for Herdr workspaces, panes, coding agents, and asynchronous watches.
It does not impose Herdsman's Chief-to-Lead hierarchy.
It does not supply a complete durable task manager.

The README says Bellwether replaces the author's `pi-herdr` fork after a separate configuration cutover.
That is not a claim that it replaces `pi-herdsman`. These are different projects.

The repository explicitly places product workflow policy downstream.
It names `herdr-workflow` as the owner of durable leases, generations, claims, and receipts.
This inspection does not establish what that separate system currently implements.

## Direct control from Pi

The package registers four primary tools:

| Tool | Responsibility |
| --- | --- |
| `herdr_layout` | Inspect and create workspaces, tabs, and panes. |
| `herdr_pane` | Run terminal commands, read output, send input, and close panes. |
| `herdr_agent` | Discover, start, prompt, inspect, focus, and rename recognized coding agents. |
| `herdr_watch` | Observe agent state or pane output without waiting for completion inside the tool call. |

A fifth tool, `herdr_ping_wait`, is an explicitly degraded subprocess fallback.
The ordinary runtime controls use Herdr's local JSON socket directly.

The manager runs in Pi, but workers are not limited to Pi.
The agent-kind schema includes Pi, Claude, Codex, OMP, OpenCode, and other harnesses.
A supported kind in the schema is not proof of equal capabilities or live compatibility across those harnesses.

The package also includes a manual-only skill with `disable-model-invocation: true`.
Its instructions explain the controls and explicitly distinguish runtime observation from durable workflow truth.
It does not define the user's desired cross-project manager policy.

Sources: [package manifest](https://github.com/joelhooks/pi-bellwether/blob/cf9cdb6363fc2fc10f253f5e256c5ebfbab5560d/package.json), [tool schemas](https://github.com/joelhooks/pi-bellwether/blob/cf9cdb6363fc2fc10f253f5e256c5ebfbab5560d/extensions/pi-bellwether.ts#L122-L262), and [bundled skill](https://github.com/joelhooks/pi-bellwether/blob/cf9cdb6363fc2fc10f253f5e256c5ebfbab5560d/skills/pi-bellwether/SKILL.md).

## Cross-project work and Git worktrees

`workspace_create`, `tab_create`, and `pane_split` accept a `cwd`.
Their implementations pass that directory to Herdr's workspace or pane creation operation.
A Pi manager can therefore place terminals in different existing repository directories, then start agents in those panes.
`herdr_agent start` requires an existing pane.

A Herdr workspace is not a Git worktree.
Bellwether's public action schemas and client method registry contain no Git worktree creation operation.
Creating an isolated checkout needs a separate Git command or another workspace-management component.

This is less restrictive than Herdsman's fresh delegation contract, where workers inherit their controller's working directory.
It is less complete than Orca's integrated worker-start path, which can create a Git worktree for a task.

Sources: [workspace and pane creation](https://github.com/joelhooks/pi-bellwether/blob/cf9cdb6363fc2fc10f253f5e256c5ebfbab5560d/extensions/pi-bellwether.ts#L1515-L1688), [agent startup](https://github.com/joelhooks/pi-bellwether/blob/cf9cdb6363fc2fc10f253f5e256c5ebfbab5560d/extensions/pi-bellwether.ts#L1850-L1921), and [client method registry](https://github.com/joelhooks/pi-bellwether/blob/cf9cdb6363fc2fc10f253f5e256c5ebfbab5560d/src/herdr-client.ts#L201-L232).

## Prompt delivery and intervention

`herdr_agent prompt` resolves the target to a pane identity, submits once, and seeks Herdr-observed working state.
It uses a bounded delivery check, not a task-completion wait.
When the target already works, its existing working state can satisfy this check.
Success therefore does not establish that the new requirement was processed or that the task succeeded.

The public prompt schema has no Pi steering-versus-follow-up delivery selector.
It delegates prompt delivery to Herdr rather than exposing Herdsman's dedicated `agent_steer` and `agent_interrupt` operations.
Low-level key input and pane close are available, but these are not equivalent task-aware controls.

`herdr_pane close` requires `confirm: true` and refuses the manager's own pane.
The human `/herdr-stop` command opens a confirmation dialog, then closes the target pane.
It does not implement a resumable task pause.

Sources: [prompt implementation](https://github.com/joelhooks/pi-bellwether/blob/cf9cdb6363fc2fc10f253f5e256c5ebfbab5560d/extensions/pi-bellwether.ts#L721-L815), [pane close guard](https://github.com/joelhooks/pi-bellwether/blob/cf9cdb6363fc2fc10f253f5e256c5ebfbab5560d/extensions/pi-bellwether.ts#L1797-L1817), and [stop command](https://github.com/joelhooks/pi-bellwether/blob/cf9cdb6363fc2fc10f253f5e256c5ebfbab5560d/extensions/pi-bellwether.ts#L2350-L2379).

## Waiting, messages, and recovery

The README documents nonblocking watches for agent state and pane-output matches.
Each watch chooses an agent follow-up, UI notification, or silent receipt.
A prompt gate prevents a watch started alongside a prompt from immediately matching the preceding task's idle state.
A watch receipt remains lifecycle evidence, not task-acceptance evidence.

The inspected wake router batches manager follow-ups and can cooperate with the optional `pi-until` follow-up arbiter.
The extension tracks busy state through `agent_start` and `agent_end`, not `agent_settled`.
Its direct delivery explicitly uses Pi follow-up mode.
This concerns messages that wake the manager, not a delivery-policy gate for prompts sent to busy workers.
The optional `pi-intercom` integration supplies session identity and reachability information.
Bellwether reads that directory but does not itself publish worker messages through intercom.
Neither companion is a required runtime dependency in the package manifest.

The README distinguishes reload recovery from process-restart recovery.
Active watches restore automatically after `/reload`, without extending their absolute deadlines.
After `/quit` and restart with the same session file, `/herdr-resume` explicitly restores eligible suspended waits.
This is watch recovery, not unattended manager restart or durable task scheduling.

Sources: [README contracts](https://github.com/joelhooks/pi-bellwether/blob/cf9cdb6363fc2fc10f253f5e256c5ebfbab5560d/README.md), [wake router](https://github.com/joelhooks/pi-bellwether/blob/cf9cdb6363fc2fc10f253f5e256c5ebfbab5560d/src/wake.ts), and [extension lifecycle hooks](https://github.com/joelhooks/pi-bellwether/blob/cf9cdb6363fc2fc10f253f5e256c5ebfbab5560d/extensions/pi-bellwether.ts#L2177-L2184).
The [separate wake inspection](pi-bellwether-wake-semantics.md) records implementation details and limits.

## Fit against the user's requirements

| Requirement | Finding |
| --- | --- |
| One Pi conversation controls projects | Direct workspace/pane controls provide a plausible foundation. |
| Manager chooses parallel or sequential work | The tools permit it. Planning policy and dependency state are separate. |
| New requirements do not immediately reach workers | The manager can retain intent before calling prompt. Bellwether does not implement that inbox policy. |
| Durable backlog and task outcomes | Not provided by the inspected public contract. The project assigns durable workflow responsibility elsewhere. |
| Direct worker access without competing automation | Herdr provides live terminals. Bellwether's inspected mutation paths do not add a human-control lease. |

Bellwether also differs from Herdsman's owned-worker registry.
Its agent list exposes Herdr agents, and its direct controls target runtime identities rather than a durable task-owner relationship.
Ownership of watch sockets does not establish ownership of the observed worker.
The manager still needs a record of which workers it is authorized to control.

## Comparison and next evaluation

- Pi Herdsman supplies Pi-specific delegation, owned assignments, results, and a Chief/Lead hierarchy.
- Pi Bellwether supplies direct Herdr controls and asynchronous observation without that hierarchy.
- Orca supplies an application with task dependencies, dispatch records, and integrated Git-worktree placement.

Bellwether is a strong lean alternative if the user wants to retain Pi and Herdr.
It reduces runtime-control work but does not eliminate the missing planning, backlog, authorization, or takeover behavior.
The next research target is the separate `herdr-workflow` component named by Bellwether, not an assumption that another custom runtime is required.
