# Pi attention manager: design exploration

Status: research and proposed design, not an implementation plan or an approved autonomy policy.

Follow-up: the [broader comparison](cross-project-agent-managers.md) found Gas Town and Gas City after the first report.
Gas City already includes Pi and Herdr integration. Evaluate it before assuming a new orchestration runtime is necessary.
The initial design and first-pass recommendation remain below to preserve the research sequence.

Research date: 2026-09-29.

## User requirements

The user wants one conversation that coordinates workers across multiple projects.
New instructions must not automatically interrupt workers.
The manager decides whether to wait, steer, stop, resume, or create a worker.
It owns a registry of the workers it controls.
The user can also interact directly with those workers.
The first proof of concept can use whichever interface is simplest without losing these behaviors.
The autonomy policy remains undecided.

The example is: while work continues, request validation against a specific source, then a commit, then work on the next PR.
This example is a conditional sequence, not three unrelated chat messages.

## Research sequence

Phase 1 inspects only Pi and Herdr, the applications named by the user.
An independent design is recorded before any search for competing solutions.
Phase 2 compares that design with other approaches.
Later findings must remain separate from the independent design.

## Phase 1: independent design checkpoint

Recorded after reading Pi's documentation and source, before research into competing solutions.
Herdr capability research is separate and still in progress at this checkpoint.

### Core distinction

A manager inbox is not a worker message queue.

The manager stores the user's intended outcome before it decides when a worker needs new information.
For example, a new validation requirement can remain outside the worker's conversation until its current task ends.
A new requirement that invalidates the current implementation can justify steering instead.
The manager must state which decision it made and why.

A suitable acknowledgment is: "Saved for project A: validate against the reference before commit, then review PR 42. The worker continues its current step."
This acknowledgment exposes the routing and ordering without requiring the user to select delivery mechanics.

### Proposed modules

| Module | Responsibility |
| --- | --- |
| Manager conversation | Understand intent, resolve ambiguous references, propose routing and next actions, explain decisions. |
| Controller | Persist intent and events, serialize actions, enforce policy and ownership, wake the manager. |
| Pi workers | Execute bounded tasks in the correct project, preserve their own session history, report evidence. |

The manager uses an LLM for judgment.
The controller uses ordinary code for correctness.
Neither durable state nor permission checks can depend exclusively on the manager remembering a prompt.

A worker-start operation returns a handle immediately.
The manager must not remain blocked until that worker completes.
Worker completion, blocking questions, user messages, failures, and explicit deadlines are reasons to wake the manager.
Token deltas and routine progress are not reasons to make another manager model call.

### Minimum durable state

The controller stores projects, worker identities, intended outcomes, proposed actions, and an event journal.
Each worker record identifies the project, workspace, Pi session, current task, runtime state, and control owner.
Each intended outcome retains the original user message, its interpretation, dependencies, validation requirements, and a revision number.
Each external action records its identifier, authorization, dispatch status, and observed result.

The worker state and task state are separate.
An idle worker can have an incomplete or blocked task.
A live process is not proof of useful progress.
A settled agent run is not proof that validation succeeded.

SQLite is a reasonable local implementation choice, not an approved dependency.
Pi session files remain the source of worker conversation history.
The controller stores links and concise evidence rather than duplicating every worker transcript in the manager's context.

### Dispatch rules

The controller stores incoming messages even while the manager reasons about an earlier message.
Each manager proposal names the intent revision and worker state that it used.
Before dispatch, the controller rejects proposals based on stale state or a lost control lease.
New user input can temporarily hold undispatched actions for its target until the manager classifies that input.
This prevents a queued commit from racing ahead of a newly received validation requirement.

A worker receives one bounded stage at a time for actions that need a gate.
Giving a worker the entire sequence "validate, commit, next PR" removes the controller's opportunity to enforce those gates.

Retries need reconciliation, not blind replay.
After an uncertain commit result, inspect the repository and recorded evidence before another attempt.
Exactly-once external effects cannot be promised merely because the controller assigns action identifiers.

### The user's example

1. A worker handles PR 41 while another worker handles a different project.
2. The user requests validation against a named source, then a commit, then PR 42.
3. The manager stores the sequence and leaves the current stage alone unless the new source invalidates it.
4. After that stage settles, the manager requests validation and evaluates the evidence.
5. If validation succeeds and commit authorization applies, the controller permits the commit and records its result before PR 42 starts.

Failed validation prevents the commit and the next PR stage.
An unclear reference or unspecified next PR requires one focused question, not a guessed target.
A fresh task session is the default candidate for an unrelated PR.
The same session remains useful for closely related follow-up work.

### Direct worker access

Reading a worker transcript must not suspend the manager.
Sending a direct instruction acquires human control before delivery.
The manager can observe that worker but cannot issue competing instructions until control returns.

Returning control requires reconciliation of the transcript, current workspace, and pending plan.
The manager must not replay instructions that direct interaction already completed or invalidated.

Two clients must not independently write the same Pi session file.
For a hosted session, both clients communicate with the same runtime owner.
For a native-terminal handoff, the controller must first quiesce and release the worker before another Pi process resumes it.
A native terminal session opened against the same JSONL file is not live attachment to an RPC worker.

### Initial implementation candidates

The first candidate is a Pi manager conversation plus a small local controller and Pi workers.
A Pi extension can supply manager tools and status without a new chat interface.
Pi RPC supplies isolated worker processes. The SDK supplies direct in-process control.
Neither transport alone supplies a ready-made multi-client native Pi terminal attachment.

Herdr is a candidate worker host and direct-access interface if its implementation supports the required controls.
It must not replace the manager inbox with automatic steering merely because a message arrives during a run.
The choice between a Pi terminal and Herdr's interface remains open until the Herdr inspection finishes.

### Provisional autonomy posture

This is a proposal for discussion, not permission from the user.
Planning, inspection, bounded worker creation, and waiting can be automatic within an agreed scope and budget.
Commits require an explicit grant tied to the task and applicable validation conditions.
Pushes, merges, deployments, destructive cleanup, and unrelated work remain separate decisions.

A policy enforced only through prompts is a behavioral convention, not a security guarantee.
Unrestricted shell tools can bypass narrow manager tools.
Hard enforcement requires restricted worker capabilities or an operating-system isolation mechanism.
The proof of concept must label its trust model honestly.

### First demonstration

The demonstration uses two projects and one manager conversation.
It must accept a new requirement without a worker prompt event, later dispatch validation, and prevent subsequent stages after failed validation.
It must show the routing decision, allow direct worker control without competing manager writes, and preserve pending intent across a controller restart.
Restarting a model stream is not required to be seamless. Recovered work must be marked interrupted and reconciled.

## Pi evidence

Installed Pi version: `@earendil-works/pi-coding-agent` 0.87.1.
Upstream checkout inspected: `earendil-works/pi` at `4df1574339bfbd1a9750ff485bb618da397ba135`.
The upstream checkout can contain changes newer than the installed package. A prototype must pin and verify its chosen version.

- [SDK reference](https://github.com/earendil-works/pi/blob/4df1574339bfbd1a9750ff485bb618da397ba135/packages/coding-agent/docs/sdk.md): explicit workspace selection, persistent sessions, event subscription, steering, follow-up, abort, and idle waiting.
- [RPC protocol](https://github.com/earendil-works/pi/blob/4df1574339bfbd1a9750ff485bb618da397ba135/packages/coding-agent/docs/rpc.md): long-lived subprocess control, correlated responses, asynchronous events, and shutdown.
- [RPC commands](https://github.com/earendil-works/pi/blob/4df1574339bfbd1a9750ff485bb618da397ba135/packages/coding-agent/docs/rpc-commands.md): prompt, steer, follow-up, abort, queue removal, history, and session inspection.
- [Session implementation](https://github.com/earendil-works/pi/blob/4df1574339bfbd1a9750ff485bb618da397ba135/packages/coding-agent/src/core/agent-session.ts#L2111-L2359): worker queues are direct delivery mechanisms. They are not a manager-owned conditional plan.
- [Session persistence implementation](https://github.com/earendil-works/pi/blob/4df1574339bfbd1a9750ff485bb618da397ba135/packages/coding-agent/src/core/session-manager.ts#L1103-L1197): in-memory branch state and file writes. This does not supply a shared multi-client runtime.
- [JSON events](https://github.com/earendil-works/pi/blob/4df1574339bfbd1a9750ff485bb618da397ba135/packages/coding-agent/docs/json.md): `agent_end` can precede automatic recovery or queued work. `agent_settled` indicates no remaining automatic work for the run.
- [RPC UI limits](https://github.com/earendil-works/pi/blob/4df1574339bfbd1a9750ff485bb618da397ba135/packages/coding-agent/docs/rpc-extension-ui.md): supported dialogs differ from full terminal extension capabilities.
- [Security reference](https://github.com/earendil-works/pi/blob/4df1574339bfbd1a9750ff485bb618da397ba135/packages/coding-agent/docs/security.md): the working directory and project trust do not sandbox tool calls.

## Requirement refinement during research

The user clarified that the validation example does not define a fixed workflow.
The manager must accept a backlog such as PR 1, PR 2, and PR 3.
It decides whether to use parallel workers and worktrees or sequential execution.
It must also revise that execution plan when new instructions arrive.

This makes autonomous planning and scheduling central, not an optional addition to message routing.
The working interpretation is that the listed order expresses priority unless the user specifies a hard dependency.
The exact meaning of "deal with a PR" remains open: review, changes, commit, push, and merge are different outcomes and grants.

The durable task model therefore needs priority, dependencies, desired outcome, acceptance evidence, and permission scope.
A task is not a worker. The manager can use several bounded worker assignments to complete one task.
It can also keep a task pending without allocating a worker.

Parallelism depends on semantic dependencies, write conflicts, shared resources, and budget.
Worktrees isolate checkout files. They do not isolate databases, ports, credentials, shared Git refs, or external side effects.
Overlapping files are evidence of possible conflict, not proof that all work must be sequential.
Independent inspection can proceed before dependent implementation or integration.

The manager must record each task's repository and PR identity, head/base commit, workspace, and current executor.
If a base or head changes, affected acceptance evidence becomes stale.
A controller must not report "done" from a worker's idle status or unsupported completion claim.

## Herdr findings

The separate source assessment is [Pi and Herdr capabilities](pi-herdr-capabilities.md).
Its critical runtime and input claims were independently verified against the cited source.

Herdr supplies the missing live-terminal host: a human can attach to the exact terminal that the manager controls.
It runs interactive Pi inside a PTY, rather than embedding the Pi SDK or exposing Pi RPC.
A headless Herdr server exposes local JSON sockets, not a REST or WebSocket interface.
Its Pi integration reports lifecycle state from Pi events.

The inspected source also has worktree list, create, open, and remove operations.
Create accepts an explicit repository, base, branch, path, and focus flag.
The create implementation tracks pending operations for each checkout path.
These are useful mechanisms for the scheduler, not an implementation of scheduling policy.

Two limitations matter for the proposed manager:

- `agent.prompt` submits terminal text and Enter. It is not an explicit steering/follow-up interface.
- Direct attachment has exclusive-client ownership, but that ownership does not block automation input through `agent.prompt`.

A Pi extension can provide semantic commands and correlated events while the same Pi process retains its native terminal UI.
That is a design proposal, not a feature verified in Herdr itself.
Human handoff also needs explicit manager control state and an input gate.
A cooperative claim/release convention is enough to explore the interaction. It is not a security boundary.

Herdr source inspected: `9dc3a1df2b563df0637264fc0dffcd607c324ac5`, package version 0.9.1, Apache-2.0.
This source snapshot can include changes beyond the released 0.9.1 binary.

Sources:

- [Live agent attach](https://github.com/herdrdev/herdr/blob/9dc3a1df2b563df0637264fc0dffcd607c324ac5/src/cli/agent.rs#L486-L503).
- [Attach ownership](https://github.com/herdrdev/herdr/blob/9dc3a1df2b563df0637264fc0dffcd607c324ac5/src/server/headless.rs#L1689-L1791) and [automation dispatch](https://github.com/herdrdev/herdr/blob/9dc3a1df2b563df0637264fc0dffcd607c324ac5/src/server/headless.rs#L2948-L2965).
- [Prompt implementation](https://github.com/herdrdev/herdr/blob/9dc3a1df2b563df0637264fc0dffcd607c324ac5/src/app/api/agents.rs#L112-L216) and [Pi integration](https://github.com/herdrdev/herdr/blob/9dc3a1df2b563df0637264fc0dffcd607c324ac5/src/integration/assets/pi/herdr-agent-state.ts#L229-L260).
- [Worktree parameters](https://github.com/herdrdev/herdr/blob/9dc3a1df2b563df0637264fc0dffcd607c324ac5/src/api/schema/worktrees.rs) and [deferred worktree implementation](https://github.com/herdrdev/herdr/blob/9dc3a1df2b563df0637264fc0dffcd607c324ac5/src/app/api/worktrees/deferred.rs#L100-L171).

## Phase 2: comparison

External searches began only after the independent design checkpoint was written.
The comparison covered selected close matches, not every orchestration product.
Search results were discovery aids. Conclusions use the primary sources listed here.

### Pi Herdsman: closest existing behavior

[Pi Herdsman](https://github.com/boadij/pi-herdsman) already implements asynchronous managed Pi agents on Herdr.
Its Lead can delegate, continue historical sessions, steer, interrupt, answer questions, inspect evidence, and close owned agents.
Its `/chief` mode coordinates independent Leads across one Herdr socket.
Chief is workspace-neutral, and Leads retain project context and worker ownership.

Durable mailboxes, exact session identities, asynchronous result delivery, and lifecycle reconciliation overlap substantially with the independent design.
This makes Herdsman the first candidate to evaluate before implementing those mechanisms again.

However, Chief has exactly five active tools: `staff_list`, `staff_inspect`, `staff_transcript`, `staff_message`, and `staff_reply`.
It has no direct spawn, interrupt, close, or worktree operation.
Chief messages use Pi follow-up delivery. Chief cannot choose immediate steering through its current tool contract.
An idle project Lead can receive a Chief request and then control its own agents, but that is indirect authority.
A busy Lead can delay that request until its current run finishes.

Fresh `agent_delegate` runs in the calling controller's working directory.
Cross-project operation therefore fits the Chief-to-project-Leads hierarchy, not one ordinary Lead delegating arbitrary fresh workspaces.
Each managed agent generation handles one assignment and is cleaned up after its terminal result.
Its saved Pi session remains available for later continuation.

The inspected managed-agent input hook passes ordinary human text through.
That permits direct interaction, but the hook does not establish the proposed human-versus-manager control lease.
The documented Chief lease instead protects Chief identity. It is not human takeover of a worker.
The inspected contracts also do not supply the proposed durable priority/dependency plan with conditional commit authorization.

A companion extension cannot assume that it can add arbitrary active tools to stock Chief mode.
Chief explicitly replaces the active tool set with the five staff tools.
Adding full scheduler controls requires an upstream change, a maintained customization, or a separate manager role.

Source: `98e5bf8659c37dd60c6ee4b53ea6aadf09dcc58a`, package version 0.18.0, Apache-2.0.
Its declared Pi range is `>=0.87.0 <0.88.0`, which includes the installed Pi 0.87.1.
That range is compatibility metadata, not a successful local integration test.

- [Supervision concept](https://github.com/boadij/pi-herdsman/blob/98e5bf8659c37dd60c6ee4b53ea6aadf09dcc58a/docs/concepts/supervision.md).
- [Chief contract](https://github.com/boadij/pi-herdsman/blob/98e5bf8659c37dd60c6ee4b53ea6aadf09dcc58a/docs/reference/supervision.md).
- [Agent operations and workspace limits](https://github.com/boadij/pi-herdsman/blob/98e5bf8659c37dd60c6ee4b53ea6aadf09dcc58a/docs/reference/agent.md).
- [Lifecycle and recovery](https://github.com/boadij/pi-herdsman/blob/98e5bf8659c37dd60c6ee4b53ea6aadf09dcc58a/docs/concepts/lifecycle.md).
- [Chief tool filtering](https://github.com/boadij/pi-herdsman/blob/98e5bf8659c37dd60c6ee4b53ea6aadf09dcc58a/extension/index.ts#L6772-L6805), [follow-up delivery](https://github.com/boadij/pi-herdsman/blob/98e5bf8659c37dd60c6ee4b53ea6aadf09dcc58a/extension/supervision.ts#L854-L877), and [human input pass-through](https://github.com/boadij/pi-herdsman/blob/98e5bf8659c37dd60c6ee4b53ea6aadf09dcc58a/extension/index.ts#L12777-L12780).

### Other useful comparisons

| Approach | Useful lesson | Limit for this user |
| --- | --- | --- |
| [pi-agent](https://github.com/knucklehead96/pi-agent/blob/65e6b9d59ea550dea9b73000e7c974822f3c039c/README.md) | A daemon owns interactive Pi PTYs. Clients attach without reopening the session. | Primarily a fleet dashboard, not the requested conversational scheduler. Its README reports Linux testing and degraded process-identity fencing on macOS. |
| [Pi Supervisor](https://github.com/ygncode/pi-supervisor/blob/caef4cdc1bbffefc7b14196e2e6f4482612accf8/README.md) | A Pi extension can supervise ordinary terminal sessions with little infrastructure. | Its documented status detection reads terminal output every five seconds. That is weaker evidence than correlated task events for gated actions. |
| [Claude Code agent teams](https://code.claude.com/docs/en/agent-teams) | A lead, task dependencies, mailboxes, and direct teammate interaction can coexist. | Not Pi-based. Official documentation still describes the feature as experimental and says in-process teammates do not resume with the lead. |

The pi-agent implementation also separates attachment leases from automation controls.
Its `steer` and `followUp` methods do not consult the attachment lease.
An exclusive terminal attachment does not by itself prove exclusive orchestration control.
See [supervisor implementation](https://github.com/knucklehead96/pi-agent/blob/65e6b9d59ea550dea9b73000e7c974822f3c039c/packages/agent-supervisor/src/daemon/supervisor.ts#L998-L1101).

## Recommendation after comparison

Keep Pi as the conversational interface and Herdr as the terminal and workspace runtime.
Build or adapt the missing planning and control behavior rather than creating another dashboard.
Direct access to the real Pi terminal favors Herdr-hosted interactive workers over plain RPC workers for this use case.

First evaluate Herdsman's existing Chief and Lead behavior with two projects.
This is a discovery experiment, not a claim that stock Herdsman meets the full request.
If its hierarchy fits the user, reuse it and extend its explicit control contract.
If its hierarchy is unnecessary friction, use a separate Pi manager role with Herdr lifecycle operations and a worker-side Pi control extension.
Do not install both independent lifecycle owners for the same worker.

The minimum complete behavior remains:

1. A durable backlog with priorities, dependencies, acceptance evidence, and authorization.
2. A planner that chooses parallel or sequential work, with worktree and shared-resource constraints.
3. Explicit delivery decisions: retain intent, send at a safe point, steer, interrupt, or start a new assignment.
4. Direct human access with an explicit control handoff and reconciliation before automation resumes.
5. Event-driven continuation and restart reconciliation without duplicate external actions.

The first demonstration can use PR review and local changes without enabling pushes or merges.
A reasonable experiment is two independent PRs plus one dependent PR.
The manager must explain its allocation, accept a mid-run requirement, and revise pending work without blindly forwarding the message.
A later demonstration adds validation-gated commits under an explicit task-scoped grant.

Estimated effort: one half-day to evaluate the existing integration after setup, then approximately 3–5 engineering days for a narrow custom proof of concept.
These are planning estimates, not measurements. Automatic takeover, unattended recovery, and enforced permissions can substantially expand that scope.

## Open questions

Questions 1–5 were answered before research. These are the next proposed questions, not settled requirements.

6. What outcome does "deal with a PR" authorize by default: review, local fixes, commits, pushes, or merge?
7. When the user directly messages a worker, does that pause manager control until an explicit return, or only until that interaction ends?
8. Must the manager keep making decisions after its conversation window closes, or is preserving workers and resuming coordination enough for the proof of concept?

## Verification scope

This is documentation and source-code research only.
No prototype, browser test, live agent run, installation, or integration test was performed.
Critical Pi, Herdr, Herdsman, and pi-agent claims were inspected in source. Other comparison claims are explicitly documentation-based.
Only these two research notes were added. No application code, global configuration, commits, pushes, or symlink changes were made.
