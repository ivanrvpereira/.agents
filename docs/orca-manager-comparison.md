# Orca fit check for a Pi-based conversational manager

Research date: 2026-09-29.
Status: documentation and source inspection, not runtime validation.
Source: [stablyai/orca](https://github.com/stablyai/orca), commit `31012aeb09283dc901a2c7417747e5a081f33cbf`.

## Conclusion

Orca is a strong candidate for the first local proof of concept.
An ordinary agent coordinates work through a CLI, while Orca stores tasks, dependencies, dispatches, and messages.
Its source explicitly supports Pi launchers and worker placement in a selected repository.
The user can open worker terminals directly.

This matches the proposed division between a reasoning manager and a deterministic runtime.
It does not establish reliable autonomous operation, non-interrupting delivery in every case, or exclusive human control.
Orchestration is experimental and requires a running Orca runtime.

## Coordinator and task model

The [official orchestration guide](https://www.onorca.dev/docs/cli/orchestration) defines these objects:

- A Run is a durable namespace and coordinator inbox, not a scheduler.
- A Task has a specification, dependencies, and lifecycle status.
- A Dispatch is one attempt to perform a Task, with completion and heartbeat authority.
- Messages carry results, questions, status, and other coordination information.
- A decision gate blocks a Task until the coordinator records a decision.

The absence of a scheduler inside the Run object is not a mismatch.
The user's requested manager is the reasoning agent that chooses what to dispatch and when.
Orca supplies the control operations and durable records.
The [skills guide](https://www.onorca.dev/docs/cli/skills) explicitly provides an orchestration skill for that role.

Source inspection confirms terminal-based coordinator identities.
`run-coordinator-mail-routing.ts` registers terminal handles for Runs and routes coordinator mail to the appropriate Run mailbox.
The routing rules preserve mail ownership for active worker dispatches.
These rules concern mailbox ownership, not exclusive human control of a terminal.

A Pi manager inside an Orca-managed terminal is therefore a plausible configuration.
The complete coordinator loop and its restart behavior still need a live test.
A retained backlog also requires the manager to record incoming requirements rather than merely leave them in conversation history.

The old `run`, `run-stop`, `coordinator-start`, and `coordinator-stop` commands are retired no-ops.
The documented path uses `run-create`, Tasks, and `worker-start`.

## Pi support

The source explicitly includes Pi:

- `src/shared/tui-agent.ts` includes the `pi` agent type.
- `src/shared/tui-agent-config.ts` defines its launcher, prompt injection mode, and `ORCA_PI_PREFILL` integration.
- `src/shared/agent-node-entrypoint-identities.ts` recognizes both current and former Pi npm package paths.
- `worker-start-validation.ts` accepts configured agent types through `isTuiAgent`, then validates launcher availability.
- `orca-runtime-get-terminal-interactive-wait.ts` rejects disabled or unavailable launchers, not Pi as a category.

This is source support for Pi workers, not a completed end-to-end test.
An earlier research draft incorrectly claimed that Pi was absent and could not be a supervised worker.
That claim came from an invalid negative search and is withdrawn.

The public orchestration guide restricts per-worker `--model` and `--effort` overrides to a named subset of agents that does not include Pi.
Pi launcher support must not be confused with support for every launch override or session mode.

## Pi extensions and global filesystem changes

A follow-up inspection confirmed that Orca does more than host an unchanged Pi terminal.
With `agentStatusHooksEnabled` enabled, the local launch path installs three Orca-managed files into the effective Pi agent directory:

- `extensions/orca-agent-status.ts` reports lifecycle events, prompt and tool information, and assistant previews to Orca's local hook endpoint.
- `extensions/orca-titlebar-spinner.ts` adds working and input-needed indicators to the terminal title.
- `extensions/orca-prefill.ts` puts an `ORCA_PI_PREFILL` draft into the editor without submitting it.

The default destination is `~/.pi/agent/extensions/`, not an isolated per-worker extension directory.
The launch path respects the selected Pi agent directory and does not replace its settings, authentication, or session files.
The installer updates files with its managed marker and skips readable same-name files without that marker.
Closing a terminal leaves these files installed.

The hook setting defaults to enabled, and the UI exposes an “Agent status hooks” switch.
The inspected launch path stops installation when that setting is disabled.
Pi is absent from the managed-hook removal registry used by the settings toggle.
The toggle is therefore not established as a cleanup mechanism for these installed Pi extension files.
Title and prefill behavior require Orca pane environment variables.
Status posting requires Orca endpoint coordinates and a pane identity, although the installed extension can still load in ordinary Pi sessions.

This matters for an evaluation with an existing Pi configuration: installation is not confined to ephemeral worker worktrees.
No Orca extensions were installed during this research.
Instructions and skill integration are separate mechanisms from these extensions.
The [follow-up instruction and skill inspection](orca-pi-instructions.md) confirms worker preambles delivered as terminal prompts and an explicit skill-installation flow.
Onboarding selects skills by default but presents the installation command for review, rather than silently installing them on each Pi launch.

Sources: [extension installer](https://github.com/stablyai/orca/blob/31012aeb09283dc901a2c7417747e5a081f33cbf/src/main/pi/titlebar-extension-service.ts), [launch environment](https://github.com/stablyai/orca/blob/31012aeb09283dc901a2c7417747e5a081f33cbf/src/main/ipc/pty/host-env/assembly.ts), [status handlers](https://github.com/stablyai/orca/blob/31012aeb09283dc901a2c7417747e5a081f33cbf/src/main/pi/agent-status-handler-source.ts), [installer tests](https://github.com/stablyai/orca/blob/31012aeb09283dc901a2c7417747e5a081f33cbf/src/main/pi/titlebar-extension-service.test.ts), and [hook removal registry](https://github.com/stablyai/orca/blob/31012aeb09283dc901a2c7417747e5a081f33cbf/src/main/agent-hooks/managed-agent-hook-registry.ts).

## Cross-project placement

The local worker path is stronger evidence than cross-Run mailbox routing alone:

1. `WorkerStartParams` accepts an optional `repo` selector.
2. `startLocalWorker` records the Task under the selected Run through `taskRunId: run.id`.
3. The same function resolves placement independently and passes creation parameters to `createWorkerWorktree`.
4. `createWorkerWorktree` passes `params.repo ?? coordinatorWorktree.repoId` to `createManagedWorktree`.

This shows a source path for a Run's coordinator to create a worker in a selected repository.
The existing-worktree path also resolves the requested workspace separately from the Task's Run.
It is incorrect to infer that each Run must represent exactly one project.

Cross-Run mail routing exists, but it does not itself prove cross-repository task execution.
Federated placement also appears in the public guide through `worker-start --on ... --repo ...`.

A pilot must still verify repository discovery, actual placement, and dependencies between tasks assigned to different repositories.
This inspection did not trace every repository permission or worktree-lineage restriction.

## Busy-worker messages

The public guide documents durable FIFO Deliveries and explicit acknowledgement.
The coordinator processes a Delivery, then acknowledges it with `check --ack`.
`--peek` and `--all` do not consume mail.

The terminal notification path has idle and settlement checks:

- `mailbox-pointer-delivery.ts` requires live idle status in `deliverForHandle`.
- Its central `deliver` method also calls `isAgentSettledForDelivery` before it stages a mailbox pointer.
- `orchestration-mailbox-cold-park-idle.test.ts` covers deferred Enter after a staged pointer and a subsequent idle transition.
- `mailbox-pointer-submit.ts` permits delayed submission when the exact target is either idle or working, which the code calls queue-safe.

The last detail limits the conclusion.
The source does not justify a blanket claim that Orca never submits input while an agent works.
The cold-park test begins with an idle worker, not initial injection into a busy worker.
Its tests do not establish identical behavior across all agent harnesses.
These tests were inspected, not run.

The manager can still satisfy the user's requirement by retaining new intent until it chooses to send it.
A transport mailbox is not a substitute for that decision.
A pilot must distinguish manager intake, mailbox notification, terminal input, and the worker's interpretation of that input.

## Human access and recovery

The public guide links Task identifiers to their worker terminals, including remote terminals.
It also provides `worker-show`, `worker-read`, `worker-stop`, `worker-retain`, and `worker-release`.
Direct worker access is part of the product model, not a separate transcript-only interface.

Exclusive human takeover remains unverified.
The inspected coordinator-versus-worker mailbox rules do not prove that human input blocks manager commands.

Source inspection shows database-backed Run and mailbox records.
It also shows dispatch-authority restoration code and explicit handling of uncertain mailbox submission.
This inspection does not establish complete crash recovery or exactly-once external actions.

## Proposed evaluation

With user approval, a bounded pilot can answer the remaining questions:

1. Use one Pi coordinator with two repositories and directly accessible worker terminals.
2. Dispatch two independent Tasks and one Task with a dependency across repositories.
3. Add a requirement while workers run. Require the manager to retain it before choosing delivery.
4. Enter a worker terminal directly. Observe whether automation competes with human input.
5. Restart the runtime. Inspect retained Tasks, dispatch identities, and pending messages before any retry.

No installation, configuration change, runtime test, commit, or autonomous worker execution was performed for this comparison.

## Primary sources

Official documentation:

- [Orchestration model and commands](https://www.onorca.dev/docs/cli/orchestration).
- [Skills registry and coordinator skill](https://www.onorca.dev/docs/cli/skills).

Pinned agent and placement source:

- [Agent type registry](https://github.com/stablyai/orca/blob/31012aeb09283dc901a2c7417747e5a081f33cbf/src/shared/tui-agent.ts) and [launcher configuration](https://github.com/stablyai/orca/blob/31012aeb09283dc901a2c7417747e5a081f33cbf/src/shared/tui-agent-config.ts).
- [Worker-start validation](https://github.com/stablyai/orca/blob/31012aeb09283dc901a2c7417747e5a081f33cbf/src/main/runtime/rpc/methods/orchestration/worker/worker-start-validation.ts).
- [Local worker start](https://github.com/stablyai/orca/blob/31012aeb09283dc901a2c7417747e5a081f33cbf/src/main/runtime/rpc/methods/orchestration/worker/local-worker-start.ts).
- [Worker worktree creation](https://github.com/stablyai/orca/blob/31012aeb09283dc901a2c7417747e5a081f33cbf/src/main/runtime/rpc/methods/orchestration/worker/worker-worktree-creation.ts).

Pinned messaging source:

- [Coordinator mailbox routing](https://github.com/stablyai/orca/blob/31012aeb09283dc901a2c7417747e5a081f33cbf/src/main/runtime/orchestration/db/runs/run-coordinator-mail-routing.ts).
- [Mailbox pointer delivery](https://github.com/stablyai/orca/blob/31012aeb09283dc901a2c7417747e5a081f33cbf/src/main/runtime/orchestration/mailbox-pointer-delivery.ts).
- [Delayed pointer submission](https://github.com/stablyai/orca/blob/31012aeb09283dc901a2c7417747e5a081f33cbf/src/main/runtime/orchestration/mailbox-pointer-submit.ts).
- [Cold-park idle tests](https://github.com/stablyai/orca/blob/31012aeb09283dc901a2c7417747e5a081f33cbf/src/main/runtime/orchestration-mailbox-cold-park-idle.test.ts).
