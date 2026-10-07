# Gas Town and Gas City comparison

Research date: 2026-09-29.
Status: documentation and source inspection only. Neither project was installed or run.

The target is one conversational manager across projects, with autonomous scheduling, non-disruptive instruction intake, and direct human worker access.

## Sources and versions

- [Gas Town](https://github.com/gastownhall/gastown), commit `649b832b7672bc7a2dbef26f5983aba6198b819b`.
- [Gas City](https://github.com/gastownhall/gascity), commit `573c85464b01ceaa59fa4829a744fd8d1fb83821`.

The earlier `steveyegge/gastown` URL redirects to `gastownhall/gastown`.
GitHub reports that neither repository is archived.

## Gas Town: closest conceptual match

Gas Town explicitly presents the Mayor as the user's primary AI coordinator across projects and agents.
Projects are rigs. Workers receive bounded tasks, and the runtime retains work state through Beads, hooks, and convoys.
This is not merely a fleet dashboard. A single conversational coordinator is central to its documented interaction model.

The implementation model also includes project-level worker monitoring and merge processing.
The documented worktree architecture separates worker checkouts.
A capacity scheduler controls immediate or deferred dispatch through `scheduler.max_polecats`.
Capacity control is not the same as deciding semantic task dependencies. The planning layer still needs that judgment.

Mail provides asynchronous communication, while `gt nudge` provides a separate real-time messaging path.
That distinction is useful, but it does not establish safe delivery timing for every harness.
This inspection did not verify whether a particular mid-run message changes the active turn or waits for a later one.

Terminal sessions and documented multi-attach behavior permit human access to workers.
No automatic human-versus-manager control lease was established in the inspected material.

The main tradeoff is its substantial operating model: Mayor, Witness, Refinery, Deacon, worker roles, work tracking, and associated configuration.
This can exceed the needs of a small local proof of concept.
It is nevertheless a close existing answer to the user's interaction goal and merits evaluation before a new implementation.

Sources:

- [README and Mayor interaction](https://github.com/gastownhall/gastown/blob/649b832b7672bc7a2dbef26f5983aba6198b819b/README.md#the-mayor-).
- [Architecture overview](https://github.com/gastownhall/gastown/blob/649b832b7672bc7a2dbef26f5983aba6198b819b/docs/overview.md).
- [Scheduler](https://github.com/gastownhall/gastown/blob/649b832b7672bc7a2dbef26f5983aba6198b819b/docs/design/scheduler.md).
- [Mail protocol](https://github.com/gastownhall/gastown/blob/649b832b7672bc7a2dbef26f5983aba6198b819b/docs/design/mail-protocol.md).
- [Terminal multi-attach reference](https://github.com/gastownhall/gastown/blob/649b832b7672bc7a2dbef26f5983aba6198b819b/docs/design/tmux-keybindings.md).

## Gas City: strongest new Pi and Herdr candidate

Gas City extracts reusable orchestration mechanisms from Gas Town.
Its documented model makes roles configurable rather than hardcoded.
A Mayor-like conversational entry point can remain, without requiring the entire Gas Town role hierarchy.
The platform documents dependency graphs, parallel dispatch of ready work, waits, retries, health reconciliation, and multi-project configuration.

Pi support is present in source, not merely a roadmap item.
The built-in `pi` profile launches Pi with `gc-hooks.js`, uses `AGENTS.md`, and resumes with `--session`.
The Herdr launch implementation explicitly recognizes `pi` as a supported agent kind.
These facts do not establish compatibility with every current Pi or Herdr release.

Herdr is an opt-in runtime provider, with a shared server for the city, workspaces for projects, and tabs for agents.
The detailed provider reference says selection is city-wide or process-wide, not per-agent.
The README advertises per-agent and per-project selection, so the current documentation is inconsistent.
The detailed reference explains the distinction between transport and backend selection, but a pilot must verify the chosen configuration.

The detailed reference warns that Herdr CLI changes have broken adapter behavior across minor versions.
It records an old live-validation version, recommends explicit version pinning, and says real-Herdr tests are opt-in.
It also states that controller reconciliation does not yet consume the Herdr session-event stream directly.
Those are concrete reasons not to claim a verified plug-and-play pairing with Herdr 0.9.1.

Gas City has a file-backed work store option.
Dolt and the `bd` executable are therefore not mandatory for every deployment.
The README still lists tmux as a required fallback even when Herdr is selected.
Operational complexity remains a consideration, but "must adopt the whole Gas Town stack" is not supported by these sources.

Sources:

- [README and optional file-backed storage](https://github.com/gastownhall/gascity/blob/573c85464b01ceaa59fa4829a744fd8d1fb83821/README.md).
- [Gas Town to Gas City concepts](https://github.com/gastownhall/gascity/blob/573c85464b01ceaa59fa4829a744fd8d1fb83821/docs/getting-started/coming-from-gastown.md).
- [Herdr provider limits](https://github.com/gastownhall/gascity/blob/573c85464b01ceaa59fa4829a744fd8d1fb83821/docs/reference/herdr-provider.md).
- [Built-in Pi profile](https://github.com/gastownhall/gascity/blob/573c85464b01ceaa59fa4829a744fd8d1fb83821/internal/worker/builtin/profiles.go#L786-L807).
- [Herdr launch support](https://github.com/gastownhall/gascity/blob/573c85464b01ceaa59fa4829a744fd8d1fb83821/internal/runtime/herdr/launchspec.go#L28-L38).

## Recommendation

Gas Town is the closest conceptual comparison for the requested single-manager experience.
Gas City is the strongest new candidate for reusing orchestration with Pi and Herdr.
The earlier custom-manager proposal remains a possible fallback, not the default before evaluating this existing stack.

The next useful evaluation is a small Gas City configuration with one coordinator, two projects, and bounded workers.
It must demonstrate deferred instruction intake, dependency-aware parallel work, and human handoff without competing manager commands.
Source inspection alone does not establish those end-to-end guarantees.
