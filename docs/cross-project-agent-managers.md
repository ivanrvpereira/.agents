# Cross-project conversational agent managers

Research date: 2026-09-29.
Status: primary-source comparison, not installation or runtime validation.

This expands the earlier [Pi attention manager exploration](pi-attention-manager-exploration.md).
The independent design preceded all competitor research.
The earlier comparison was mostly Pi-focused. This pass covers broader systems.

## Selection criteria

The target is one conversational manager across projects, not merely a fleet dashboard.
The manager owns goals and priorities, chooses parallel or sequential execution, and receives new instructions while workers continue.
It can create, redirect, wait for, and stop workers.
The user can also directly interact with workers.

A mailbox alone does not establish intelligent delivery timing.
A terminal attachment alone does not establish exclusive human control.
A declared agent adapter does not establish identical capabilities across all harnesses.

## Agent Orchestrator: strong task-to-PR product, project-scoped manager

Canonical repository: [Untrivial-ai/agent-orchestrator](https://github.com/Untrivial-ai/agent-orchestrator).
The older ComposioHQ URL now redirects there.
Source inspected: `04db5a1819c07d42d1d2698063321ab7909333f0`.
License: Apache-2.0.

Its current README describes a persistent project orchestrator that plans, spawns or redirects workers, and coordinates follow-up work.
Each Git-backed worker has an isolated branch and worktree.
The user can open a worker's structured conversation or native terminal.
The product tracks PRs, CI, reviews, and merge conflicts alongside the worker.
These capabilities closely match the user's PR example.

The implementation prompt makes the orchestrator a coordinator rather than an implementer.
It exposes CLI operations for inspecting state, spawning workers, sending instructions, claiming existing PRs, and terminating sessions.
The prompt also requires explicit permission before merge.
This confirms a real conversational coordination role, not just a board with manual task launch.

The main limitation is scope.
Both the README and implementation describe an orchestrator for one project.
The durable Chat narrative is project-scoped, and worker permission inheritance requires a same-project orchestrator.
That is not proof that cross-project CLI calls are impossible.
It does mean this inspection did not establish the requested single global manager across independent projects.

The inspected status document also distinguishes Pi capabilities.
Pi is a supported harness, but Pi Chat requires an independently installed adapter and an explicit bypass-permissions choice.
The documented native Chat-to-terminal handoff applies to compatible Claude Code and Codex sessions, not every supported harness.
No blanket claim of Pi feature parity is justified.

Sources:

- [README](https://github.com/Untrivial-ai/agent-orchestrator/blob/04db5a1819c07d42d1d2698063321ab7909333f0/README.md).
- [Current implementation status](https://github.com/Untrivial-ai/agent-orchestrator/blob/04db5a1819c07d42d1d2698063321ab7909333f0/docs/STATUS.md).
- [Orchestrator role and commands](https://github.com/Untrivial-ai/agent-orchestrator/blob/04db5a1819c07d42d1d2698063321ab7909333f0/backend/internal/session_manager/prompt.go#L191-L247).
- [Same-project permission inheritance](https://github.com/Untrivial-ai/agent-orchestrator/blob/04db5a1819c07d42d1d2698063321ab7909333f0/backend/internal/session_manager/manager.go#L1458-L1484).

## Overstory: close architecture, archived project

Repository: [jayminwest/overstory](https://github.com/jayminwest/overstory).
Source inspected: `ff38f3f76f084abcc34f519bcaa69580f6e53cf1`.
License: MIT.
GitHub marks the repository archived, and its README says it is no longer maintained.

Overstory has an explicit multi-repository orchestrator above per-repository coordinators.
Its role instructions assign the global orchestrator responsibility for repository allocation, dispatch, recovery, and reporting.
Project coordinators own worker creation and integration.
Its CLI implements the orchestrator as a persistent-agent role.

The documented execution mechanisms include isolated worktrees, SQLite mail, task groups, a merge queue, and runtime adapters.
A tmux mode supports direct terminal attachment. Headless execution is a different mode.
The README labels the Pi adapter experimental and says that Pi does not support its headless spawn mode.

This is a useful architectural reference but not the default recommendation for a new installation.
Its maintenance status is an important difference that search snippets did not initially show.

Sources:

- [README and archival notice](https://github.com/jayminwest/overstory/blob/ff38f3f76f084abcc34f519bcaa69580f6e53cf1/README.md).
- [Multi-repository orchestrator role](https://github.com/jayminwest/overstory/blob/ff38f3f76f084abcc34f519bcaa69580f6e53cf1/agents/orchestrator.md).
- [Orchestrator command implementation](https://github.com/jayminwest/overstory/blob/ff38f3f76f084abcc34f519bcaa69580f6e53cf1/src/commands/orchestrator.ts).

## Warren: active successor, different product focus

Repository: [jayminwest/warren](https://github.com/jayminwest/warren).
Source inspected: `8a439fe8e10f733865d8be0c7985d2b384eb76fd`.
License: MIT.
This inspection covered its current README and roadmap, not its runtime implementation.

Warren is Overstory's active successor.
It focuses on isolated coding workloads, lifecycle control, spend limits, recovery, and Git delivery.
Its current distribution includes Pi and Claude Code adapters.
It offers local, Docker, and Kubernetes runtime providers.

It is not a drop-in replacement for Overstory's conversational hierarchy.
The current roadmap records removal of Conversations and cross-repository plan-run routing.
That makes Warren a runtime/control reference rather than the closest complete user experience for this request.

Sources:

- [Current README](https://github.com/jayminwest/warren/blob/8a439fe8e10f733865d8be0c7985d2b384eb76fd/README.md).
- [Roadmap and removed features](https://github.com/jayminwest/warren/blob/8a439fe8e10f733865d8be0c7985d2b384eb76fd/ROADMAP.md#L167-L180).

## Paperclip: goal delegation and governance, not terminal-first interaction

This inspection covered the official [Key Concepts documentation](https://docs.paperclip.ing/guides/welcome/key-concepts/), retrieved on 2026-09-29.
It did not inspect the implementation or validate budget enforcement.

Paperclip models a company, a CEO agent, reporting agents, goals, tasks, budgets, and approvals.
The CEO can create tasks and request additional agents.
Agents claim tasks and wake on scheduled heartbeats or events such as assignments and mentions.
Its documented adapter list includes Claude Code, Codex, and Pi.

This is relevant to delegation, persistent intent, and explicit authority.
Its documented operator model uses task threads, an inbox, an organization hierarchy, and an approval queue.
That differs from one native-terminal conversation that supervises directly attachable coding sessions.
Neither live terminal handoff nor exact non-interrupting delivery semantics was established in this documentation pass.

## Gas Town and Gas City

The [dedicated comparison](gastown-gascity-comparison.md) covers this pair with pinned sources.
Gas Town's Mayor is an explicit conversational coordinator across projects, making it the closest conceptual match.
Gas City turns the orchestration mechanisms into configurable infrastructure and has both a built-in Pi profile and a Herdr runtime provider.

Gas City changed the initial recommendation: evaluate existing orchestration mechanisms before implementing another manager runtime.
The subsequent Orca inspection adds a closer local product candidate, without removing Gas City from the shortlist.
It can use file-backed work storage, so a Dolt deployment is not required for every trial.
Its Herdr integration has documented version sensitivity and inconsistent configuration guidance between the README and detailed reference.
The exact non-interrupting message behavior and human takeover contract still need a live evaluation.

## Updated shortlist

This order includes the subsequent Conductor and Orca inspection.
It is an evaluation order, not a claim of runtime reliability.
The later [Pi Bellwether inspection](pi-bellwether-comparison.md) adds a lean Pi/Herdr control alternative, not another complete task manager.

1. Orca: first local product candidate. Source supports Pi launchers, selected-repository worker placement, and durable coordination objects.
2. Gas City: reusable orchestration infrastructure with Pi and Herdr integration.
3. Conductor: strong external-manager API if cloud workers are acceptable. Pi worker support is not established.
4. Gas Town: strongest reference for one conversational manager across projects.
5. Agent Orchestrator: strong task-to-PR product, with the inspected manager scoped to a project.

Paperclip contributes useful goal, task, and approval concepts.
Overstory is an architectural reference only because it is archived.
Warren is active, but its current workload-control focus does not replace the removed conversational features.

## Orca: an agent-driven coordinator with durable runtime state

The [dedicated Orca comparison](orca-manager-comparison.md) records source evidence and verification limits.
Source inspected: `31012aeb09283dc901a2c7417747e5a081f33cbf`.
The user supplied Orca after the initial broader comparison.

Orca's experimental orchestration layer provides Runs, Tasks with dependencies, Dispatches, messages, and decision gates.
A Run stores a namespace and coordinator inbox. It does not schedule workers.
An ordinary reasoning agent chooses placements and lifecycle actions through the CLI.
That division matches the requested manager model rather than imposing a fixed execution sequence.

The source explicitly includes Pi as a supported launcher.
Worker-start validation accepts configured agent types, including Pi.
Local worker creation accepts a repository selector separately from the Task's Run.
This supplies a source path for cross-repository coordination, not just multiple independent project dashboards.
Per-worker model and effort overrides have narrower documented support that does not include Pi.

Terminal mail notifications have idle and settlement checks, but delayed submission can accept a working target.
Neither a blanket non-interruption guarantee nor exclusive human takeover was established.
The manager must still retain incoming intent until it chooses to deliver it.
The product provides direct worker terminals and lifecycle commands, but recovery and Pi-specific message behavior require a pilot.

This is now the first candidate for a local proof of concept.
It can reduce custom runtime work without proving that no manager policy or integration work remains.

Sources: [official orchestration guide](https://www.onorca.dev/docs/cli/orchestration), [skills guide](https://www.onorca.dev/docs/cli/skills), and pinned source links in the dedicated comparison.

## Pi Bellwether: direct Pi-to-Herdr control without a Chief hierarchy

Repository: [joelhooks/pi-bellwether](https://github.com/joelhooks/pi-bellwether).
Source inspected: `cf9cdb6363fc2fc10f253f5e256c5ebfbab5560d`, package version 1.5.0, MIT.
The [dedicated comparison](pi-bellwether-comparison.md) records the source paths and remaining gaps.

Bellwether exposes native Pi tools for workspace/pane layout, terminal input, agent control, and nonblocking watches.
A manager can create terminals with explicit working directories and start agents in them.
It does not impose Herdsman's Chief-to-project-Leads hierarchy or Chief's restricted tool set.
The README's replacement claim concerns the author's `pi-herdr` fork, not `pi-herdsman`.

Its scope is deliberately narrower than a complete orchestrator.
The public contract contains no durable task backlog, dependency graph, or Git-worktree creation action.
Herdr workspace creation selects a working directory but does not create an isolated Git checkout.
The repository assigns durable workflow responsibility to a separate `herdr-workflow` component, which this pass did not inspect.

Watch receipts and prompt working-state checks are not proof of task completion.
Its prompt tool exposes no Pi steering-versus-follow-up selector, and human takeover remains unverified.
Agent discovery and direct controls also do not replace Herdsman's owned-assignment model.

This is a strong candidate for the control layer if the user prefers to retain Pi and Herdr.
It is closer to the original small-controller proposal than to Orca's integrated task/workspace product.
The next research step is to examine the separate durable workflow component before deciding what custom manager state remains necessary.

## Conductor: an explicit external-manager interface for cloud workers

The user supplied [Conductor's documentation](https://www.conductor.build/docs) after the initial broader comparison.
This assessment uses official documentation and the public OpenAPI schema retrieved on 2026-09-29.
It does not inspect private implementation code or call authenticated workspace operations.

Conductor's documented API is not merely a dashboard interface.
Its cookbook explicitly describes an external agent planning a multi-PR task across repositories, starting parallel workspaces, supervising workers, and reviewing their results.
Its hosted MCP server exposes the same broad control model.
A Pi manager can in principle call the REST interface through tools while Conductor owns the worker workspaces.
Pi does not need to be a supported worker harness for it to act as an external manager.

The interfaces cover project discovery, workspace creation, additional sessions, message submission, transcript cursors, status, cancellation, sleep, archive, and restore.
The MCP server has an organization-scoped OAuth flow or API-key authentication.
The API and MCP interface are explicitly in beta.

Important limits:

- The documented API and MCP interface manage cloud workspaces. This inspection did not establish equivalent control of local Mac workspaces.
- The cookbook says messages sent while a worker runs steer its current turn. The inspected message schema has no delivery-mode selector.
- This is not inherently incompatible with the user's request. The manager can retain intent and delay the API call until it chooses to intervene.
- Status can remain idle before a submitted prompt starts. The documentation requires observing execution or finding its reply in the transcript.
- Cancellation is asynchronous and drops queued messages. Human-versus-manager input arbitration was not established.

The message schema accepts `message`, optional `messageId`, and optional source metadata, with other fields rejected.
The workspace schema lists agent kinds `claude`, `codex`, `cursor`, and `acp`; it does not name Pi.
The `acp` value is not evidence that arbitrary Pi workers are supported.
The desktop documentation lists Claude Code, Codex, Cursor, and OpenCode. That product list must not be conflated with every cloud API capability.

This is a strong candidate if cloud execution is acceptable.
The manager still needs durable intent, permission scope, and task/result interpretation.
It does not need to invent the worker-hosting interface from scratch.

Sources:

- [API and multi-PR cookbook](https://www.conductor.build/docs/api).
- [Hosted MCP server and tools](https://www.conductor.build/docs/api/mcp).
- [Public OpenAPI schema](https://api.conductor.build/v0/openapi.json), reported API version `0.0.1`.
- [Parallel workspace model](https://www.conductor.build/docs/concepts/parallel-agents).
- [Local and cloud environment distinctions](https://www.conductor.build/docs/reference/environment-variables).

## Verification limits

No candidate was installed or run.
The comparison does not establish production reliability, automatic human takeover, or approval enforcement across every harness.
The scope is a focused shortlist, not an exhaustive survey of agent frameworks.
