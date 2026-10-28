---
name: suggest-skills
description: Suggest which installed skill fits the current step of your work.
disable-model-invocation: true
---

# Suggest Skills

Suggest the skill for the user's next step, then stop. Read anything you need; run nothing else. A suggestion is not permission: delegating, committing, or publishing still needs the user's own request.

1. Work out the goal and where the session stands from the conversation. If one missing fact would change the answer, ask one question.
2. Pick candidates from the maps below. If nothing fits, look wider: the harness's skill list, `rg -H '^description:' ~/.agents/skills/{auto,on-demand}/*/SKILL.md ~/.agents/skills/private/*/*/SKILL.md`, and the project's `.claude/skills/` or `.pi/skills/`. Manual-only skills are missing from the harness's list.
3. Read the chosen skill's `SKILL.md` to confirm it fits. The installed skill wins over these maps.
4. Reply with the skill, one sentence on why, what comes after it when that helps, and how to invoke it (`/name` in Claude Code, `/skill:name` in Pi, `$name` in Codex). If a close alternative exists, give the deciding difference in one sentence.

## Build a feature

Work down the steps; skip the ones the situation does not need.

| Step | Skill | When |
| --- | --- | --- |
| Shape the idea | `grill-with-docs` | Working in a repo; it records `GLOSSARY.md` and ADRs. Use `grill-me` outside a repo, or `grill-for-unknowns` when the risk is unknown unknowns in a complex build. |
| Settle a design question | `prototype` | Talk cannot settle how logic should behave or a UI should look. Bring the answer back to the plan. |
| Plan | `to-spec`, then `to-tickets` | A build too big for one session. Use `tech-spec` instead for a typed call-stack design document rather than a tracker spec. |
| Build | `implement` | One ticket, or a small task whose scope and test seams are agreed. It runs `tdd` and `code-review` itself. Start each ticket in a fresh session. |
| Build with subagents | `implementation-orchestrator` | The user wants a whole approved plan executed by subagents. |
| Ship | `pr` | Writing the pull request body. |
| Look back | `retro` | After a build, before the session is cleared. |

Keep one session from shaping the idea through `to-tickets`. `to-spec`, `to-tickets`, and `wayfinder` need a configured tracker: if `docs/agents/issue-tracker.md` is missing, suggest `setup-matt-pocock-skills` first.

`rpi` is a separate end-to-end flow (research, design, implement) with its own documents. Suggest it only when the user prefers it over the chain above.

## Other situations

| Situation | Skill | Then |
| --- | --- | --- |
| Hard bug, flaky test, or slowdown | `diagnosing-bugs` (`sentry` first for a Sentry error) | `retro` |
| Effort too large and foggy to plan in one session | `wayfinder` | `to-spec` once the decisions settle |
| Facts needed from docs or sources | `research` | `grill-with-docs` |
| The answer is in someone else's head | `to-questionnaire` | `grill-with-docs` or `to-spec` |
| Find refactor candidates | `improve-codebase-architecture` (visual report, then grill one), or `architecture-scan` (ranked TypeScript shortlist, no design) | `grill-with-docs` on the chosen one |
| Design one module's interface or seam | `codebase-design` | `tdd` |
| Shrink a design or codebase | `reducing-entropy` | |
| Build a behavior test-first | `tdd` | |
| Review a change | `code-review` | `pr` |
| Fuzzy project terms | `domain-modeling` | |
| Record an architecture decision | `adr-writing` | |
| Steps only a human can do | `wizard` | |
| A message did not land | `wait-what` (re-pitch with the missing context) or `bro` (plain restatement) | |
| Understand something visually | `show-me` | |
| Learn a concept over several sessions | `teach` | |
| Write or trim skills and `AGENTS.md` | `writing-for-agents`, or `skill-diet` to trim | |
| Coordinate several independent workstreams | `supervisor`, only when the user asks for that role | |

## Between phases

When the user asks whether to continue, start fresh, hand off, delegate, or compact, take the first yes:

1. **Continue** if the next phase needs this session's reasoning (grilling into planning is the usual case) and it fits.
2. **Start fresh** if nothing here matters to what comes next.
3. **`handoff`** if the work moves to another harness, directory, or person.
4. **Subagent** if the task is tightly scoped and needs no steering.
5. **Compact** otherwise, saying what the next phase needs kept.

Decide at the end of a phase, not in the middle. Every option except continue replaces the full session with a lossy summary.
