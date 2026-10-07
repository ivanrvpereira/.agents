# Herdr capability assessment for a Pi manager

## Scope and result

**Herdr supports manager API calls and direct human access to the same live Pi terminal. It does not arbitrate ownership between them.**

This assessment covers only `herdrdev/herdr` source and repository documentation. No competitors, Pi internals, or other extensions were inspected. No runtime tests or implementation changes were made. **Implemented** means verified in source. **Documented** means a repository documentation claim. **Inference** means a design conclusion. **Unknown** requires further verification.

GitHub `master` and the clean cached checkout resolved to commit [`9dc3a1df2b563df0637264fc0dffcd607c324ac5`](https://github.com/herdrdev/herdr/commit/9dc3a1df2b563df0637264fc0dffcd607c324ac5), dated `2026-09-29T00:47:12Z`. The package declares version `0.9.1` and Apache-2.0 ([Cargo.toml:1–10](https://github.com/herdrdev/herdr/blob/9dc3a1df2b563df0637264fc0dffcd607c324ac5/Cargo.toml#L1-L10)). This evaluates that source commit, not the exact stable-release feature set. `docs/next` is draft documentation.

## Same runtime and human ownership

**Implemented:** `herdr agent attach <target>` resolves the worker's `terminal_id` and attaches a terminal client. It does not start another Pi process or reopen its conversation in a separate process ([cli/agent.rs:486–503](https://github.com/herdrdev/herdr/blob/9dc3a1df2b563df0637264fc0dffcd607c324ac5/src/cli/agent.rs#L486-L503)). The manager's `agent.prompt` resolves the live agent and writes to its terminal runtime ([app/api/agents.rs:112–216](https://github.com/herdrdev/herdr/blob/9dc3a1df2b563df0637264fc0dffcd607c324ac5/src/app/api/agents.rs#L112-L216)).

**Implemented:** One direct attachment owns a terminal at a time. A second direct client needs `--takeover`, which disconnects the earlier client. Attachment also controls terminal resize ([headless.rs:1689–1791](https://github.com/herdrdev/herdr/blob/9dc3a1df2b563df0637264fc0dffcd607c324ac5/src/server/headless.rs#L1689-L1791)).

**Critical limit:** This attachment ownership is not an automation-input lock. The server dispatches `agent.prompt` without checking the attachment owner ([headless.rs:2948–2965](https://github.com/herdrdev/herdr/blob/9dc3a1df2b563df0637264fc0dffcd607c324ac5/src/server/headless.rs#L2948-L2965)). The prompt handler checks lifecycle and foreground-process identity, then submits input. Raw pane input also bypasses attachment ownership ([panes.rs:1904–1947](https://github.com/herdrdev/herdr/blob/9dc3a1df2b563df0637264fc0dffcd607c324ac5/src/app/api/panes.rs#L1904-L1947)).

**Inference:** A human can interact with the same worker while the manager observes it. Human attachment alone does not suspend manager writes. Existing attachment takeover must not be presented as a manager-versus-human lease.

## Process lifecycle and registry

| Capability | Verified behavior and limit |
| --- | --- |
| Spawn across projects | **Implemented.** `workspace.create` accepts cwd, environment, label, and focus. `agent.start` requires an existing available shell pane and types the selected executable plus arguments into it ([workspaces.rs:39–83](https://github.com/herdrdev/herdr/blob/9dc3a1df2b563df0637264fc0dffcd607c324ac5/src/app/api/workspaces.rs#L39-L83), [agents.rs:146–232](https://github.com/herdrdev/herdr/blob/9dc3a1df2b563df0637264fc0dffcd607c324ac5/src/app/agents.rs#L146-L232)). |
| Startup readiness | **Implemented distinction.** Raw `agent.start` returns a launch result. The CLI adds a readiness loop for the same terminal, name, and agent kind. Raw API callers need equivalent handling ([CLI:403–434,562–638](https://github.com/herdrdev/herdr/blob/9dc3a1df2b563df0637264fc0dffcd607c324ac5/src/cli/agent.rs#L403-L638)). |
| Registry facts | **Implemented.** Agent records expose terminal/pane/workspace IDs, optional name, native session reference, cwd, status, readiness, and transition counters. They do not represent manager intent or task ownership ([schema/agents.rs:186–230](https://github.com/herdrdev/herdr/blob/9dc3a1df2b563df0637264fc0dffcd607c324ac5/src/api/schema/agents.rs#L186-L230)). |
| Terminate | **Implemented.** `pane.close` removes the pane and shuts down its runtime. Runtime shutdown invokes process cleanup. `pane.release_agent` is a lifecycle report, not a kill operation ([panes.rs:1883–1902,1949–2019](https://github.com/herdrdev/herdr/blob/9dc3a1df2b563df0637264fc0dffcd607c324ac5/src/app/api/panes.rs#L1883-L2019), [pane.rs:2089–2102](https://github.com/herdrdev/herdr/blob/9dc3a1df2b563df0637264fc0dffcd607c324ac5/src/pane.rs#L2089-L2102)). |

**Implemented:** Herdr controls Pi through its interactive PTY, not an embedded Pi SDK provider or Pi RPC subprocess adapter. Its bundled Pi extension explicitly excludes RPC, JSON, and print modes ([Pi extension:229–260](https://github.com/herdrdev/herdr/blob/9dc3a1df2b563df0637264fc0dffcd607c324ac5/src/integration/assets/pi/herdr-agent-state.ts#L229-L260)).

**Implemented:** Persistent snapshots include cwd, agent name, native session reference, and optional resume argv ([snapshot.rs:99–129](https://github.com/herdrdev/herdr/blob/9dc3a1df2b563df0637264fc0dffcd607c324ac5/src/persist/snapshot.rs#L99-L129)). Pi resume uses `pi --session <path-or-id>`, which starts a new process after a cold restart ([agent_resume.rs:199–239](https://github.com/herdrdev/herdr/blob/9dc3a1df2b563df0637264fc0dffcd607c324ac5/src/agent_resume.rs#L199-L239)).

**Documented:** Detach preserves running processes. Cold restart restores layout and eligible native sessions, not original processes. Native resume defaults on, and the documented restore flow waits for client geometry/theme ([session-state.mdx:6–126](https://github.com/herdrdev/herdr/blob/9dc3a1df2b563df0637264fc0dffcd607c324ac5/docs/next/website/src/content/docs/session-state.mdx#L6-L126)). **Unknown:** Fully unattended cold resume without any client needs a runtime test.

## Interfaces, authentication, and events

**Implemented:** `herdr server` starts a headless runtime and JSON API ([bootstrap.rs:3–94](https://github.com/herdrdev/herdr/blob/9dc3a1df2b563df0637264fc0dffcd607c324ac5/src/server/headless/bootstrap.rs#L3-L94)). Public automation uses newline-delimited JSON over Unix-domain sockets or Windows named pipes. No REST or WebSocket server surface was found. Relevant methods are `session.snapshot`, `workspace.create`, `agent.list/get/start/prompt/wait/send_keys`, `pane.close`, and `events.subscribe` ([schema.rs:35–253](https://github.com/herdrdev/herdr/blob/9dc3a1df2b563df0637264fc0dffcd607c324ac5/src/api/schema.rs#L35-L253)).

**Implemented:** Unix API sockets use `0600`. The request envelope has no authentication token, and dispatch has no per-caller authorization. This is local-account access control, not manager-only authority ([server.rs:28–91,296–352](https://github.com/herdrdev/herdr/blob/9dc3a1df2b563df0637264fc0dffcd607c324ac5/src/api/server.rs#L28-L352)). **Unknown:** Windows public API isolation needs platform verification. The public listener does not use the separate explicit private-pipe DACL ([ipc.rs:54–161](https://github.com/herdrdev/herdr/blob/9dc3a1df2b563df0637264fc0dffcd607c324ac5/src/ipc.rs#L54-L161)).

**Implemented:** Event subscriptions stream Herdr lifecycle/status events, not Pi token/tool/turn events. The hub retains only 512 events in memory. Overrun produces `events_lost` and closes the subscription ([event_hub.rs:1–75](https://github.com/herdrdev/herdr/blob/9dc3a1df2b563df0637264fc0dffcd607c324ac5/src/api/event_hub.rs#L1-L75), [server.rs:875–955](https://github.com/herdrdev/herdr/blob/9dc3a1df2b563df0637264fc0dffcd607c324ac5/src/api/server.rs#L875-L955)). **Documented:** Snapshot/event reconciliation has no shared sequence boundary, so events are invalidation signals rather than a durable replay log ([socket-api.mdx:771–818](https://github.com/herdrdev/herdr/blob/9dc3a1df2b563df0637264fc0dffcd607c324ac5/docs/next/website/src/content/docs/socket-api.mdx#L771-L818)).

## Non-steering delivery and staged actions

**Implemented:** `agent.prompt` sends text plus Enter, rejects blocked agents, and accepts working agents. Its schema has no steering/follow-up choice ([schema/agents.rs:178–184](https://github.com/herdrdev/herdr/blob/9dc3a1df2b563df0637264fc0dffcd607c324ac5/src/api/schema/agents.rs#L178-L184)). The queue orders PTY bytes, not durable tasks ([actor/unix.rs:143–177](https://github.com/herdrdev/herdr/blob/9dc3a1df2b563df0637264fc0dffcd607c324ac5/src/pty/actor/unix.rs#L143-L177)). Pi's actual interpretation requires separate Pi verification.

**Implemented limit:** Prompt-with-wait observes lifecycle activity, not a correlated task result. If the worker was already working, completion of that existing work can satisfy the wait ([wait.rs:177–322](https://github.com/herdrdev/herdr/blob/9dc3a1df2b563df0637264fc0dffcd607c324ac5/src/api/wait.rs#L177-L322)). Idle therefore cannot prove “validated against source X” or authorize a commit.

### Minimum changes, as design inferences only

1. **Intent intake needs no Herdr change.** The manager stores requirements separately and calls no worker-input API merely because intent changed.
2. **Cooperative human ownership needs manager state.** An explicit claim/release action can suspend manager writes while allowing observation. This requires cooperation, not a Herdr fork.
3. **Automatic or enforced ownership needs more support.** Reliable human-interaction/attachment notifications and a shared input gate need integration work. Existing direct-attach ownership does not protect API input. A security boundary also needs caller authorization.
4. **Exact Pi steering/follow-up needs a semantic adapter.** Terminal text submission alone does not establish those semantics. The implementation location remains undecided.
5. **Staged actions need durable manager state and evidence.** Validation source, result, commit permission, and next-stage transition belong outside Herdr's terminal queues. Autonomy remains undecided.
