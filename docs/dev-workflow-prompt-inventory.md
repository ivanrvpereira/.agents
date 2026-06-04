# Development Workflow Prompt Inventory

Purpose: collect reusable prompt/workflow sources from Pi packages, installed skills, local config repos, and a few related repos already discussed. This is a source map for creating your own prompts; it is not an instruction file.

## Scope checked

Active Pi packages/settings from `pi/settings.json`, installed global skills from `.skill-lock.json`, this config repo, and nearby/known repos from recent Pi work:

- `~/.agents` / this repo
- `mitsuhiko/agent-stuff`
- `Michaelliv/pi-dynamic-workflows`
- `edmundmiller/dotfiles`
- `HazAT/pi-config`
- `badlogic/pi-diff-review`
- `mksglu/context-mode`
- `championswimmer/pi-context-{prune,usage,cache-graph}`
- `nicobailon/visual-explainer`
- aware/inactive: `HazAT/pi-interactive-subagents`, `nicobailon/pi-subagents`
- installed skill sources represented locally under `skills/`, including `goncalossilva/.agents`, `vercel-labs/*`, `SawyerHood/dev-browser`, etc.

Npm/local Pi packages checked but with no high-signal generic dev-workflow prompts found: `pi-screenshots-picker`, `pi-boomerang`, `@plannotator/pi-extension`, `pi-librarian`, `@gotgenes/pi-anthropic-auth`, `pi-mcp-adapter`, `pi-perplexity`, `glimpse`, `MasuRii/pi-rtk-optimizer`.

## High-value prompt sources by workflow

### Code review / PR review

| Source | Path | What to steal |
|---|---|---|
| local config | `skills/requesting-code-review/code-reviewer.md` | Strong standalone reviewer template: implemented work, requirements, git range, checklist, severity buckets, final merge verdict. |
| local config | `skills/requesting-code-review/SKILL.md` | Meta-workflow: review early/often, pass context not session history, act on Critical/Important/Minor. |
| local config | `skills/receiving-code-review/SKILL.md` | Excellent reviewer-feedback handling: verify before implementing, push back technically, clarify unclear multi-item feedback before edits. |
| `mitsuhiko/agent-stuff` | `extensions/review.ts` | Codex-style review command. Key rubric: only introduced actionable issues, priority tags `[P0]..[P3]`, diff-overlapping locations, fail-fast error handling, untrusted-input checks, human non-blocking callouts for migrations/deps/auth/API/destructive ops. |
| `edmundmiller/dotfiles` | `config/claude/plugins/github/commands/pr-review.md` | Structured 6-step GitHub PR review: find PRs, checkout/diff/comments, analyze, focus areas, suggested comments, prepare gh commands without submitting. |
| `edmundmiller/dotfiles` | `config/claude/plugins/github/commands/pr-review-improve.md` | Self-improvement prompt for evolving the PR review prompt after review friction. |
| `edmundmiller/dotfiles` | `skills/catalog/pr-review/SKILL.md` | More polished PR review variant: dependency check, impact assessment, line comments ordered by file/line, pending-review handling. |
| `edmundmiller/dotfiles` | `config/agents/modes/sem-review.md` | Semantic-review mode using `sem diff --format json`, `sem graph`, `sem impact`, entity-first review. |
| `edmundmiller/dotfiles` | `config/pi/agents/crew-reviewer.md` | Compact reviewer subagent with verdicts `SHIP | NEEDS_WORK | MAJOR_RETHINK`. |
| `edmundmiller/dotfiles` | `config/pi/extensions/review.ts` | Pi-native diff cockpit command UI (`/diff-review`, `/review-staged`), useful as a non-agent review surface. |
| `badlogic/pi-diff-review` | `src/prompt.ts` | Tiny “address feedback” prompt composer that formats overall + inline comments into numbered remediation tasks. |
| `mksglu/context-mode` | `.claude/skills/context-mode-ops/review-pr.md` | Opinionated maintainer PR workflow: gather intelligence batch, spawn specialist review agents, validate external claims, merge-first/fix-on-top philosophy. Use selectively. |
| `nicobailon/pi-subagents` | `prompts/parallel-review.md` | Fresh-context parallel reviewers with dynamic angles, synthesis, optional autofix gate. |
| `nicobailon/pi-subagents` | `prompts/review-loop.md` | Parent-controlled implementation/review/fix loop; max 3 rounds, one writer, fresh-context reviewers, stop rules. |
| `nicobailon/pi-subagents` | `agents/reviewer.md` | Generic disciplined review agent for code diffs, plans, proposed solutions, repo health, PR/issue validation. |
| `HazAT/pi-interactive-subagents` | `agents/reviewer.md` | Strong pragmatic rubric: high bar for findings, P0/P1/P2/P3, state-sync/broadcast data exposure checks, fail-fast bias. |
| `nicobailon/visual-explainer` | `plugins/visual-explainer/commands/diff-review.md` | Visual HTML diff review with fact sheet, KPI dashboard, before/after architecture, Good/Bad/Ugly, decision log, future-you re-entry context. |

### Planning / design / spec / PRD

| Source | Path | What to steal |
|---|---|---|
| local config | `skills/brainstorming/SKILL.md` | Strongest end-to-end spec/design workflow: project context, visual companion option, one question at a time, 2-3 approaches, design approval, write spec, spec self-review, user review gate, then planning. |
| local config | `skills/brainstorming/spec-document-reviewer-prompt.md` | Spec review subagent prompt: completeness, consistency, clarity, scope, YAGNI; approve unless serious planning blockers. |
| local config | `skills/prd/SKILL.md` | PRD generator: 3-5 lettered clarifying questions, goals, user stories, acceptance criteria, FRs, non-goals, success metrics, open questions. |
| `HazAT/pi-config` | `prompts/plan.md` | Slash prompt that routes into the Solo planning skill and auto-executes after planner returns. |
| `HazAT/pi-config` | `skills/plan/SKILL.md` | Solo-native planning workflow: quick assessment, scout, interactive planner through approach checkpoint, create todos, auto-start workers, progress notifications, review. |
| `HazAT/pi-config` | `agents/planner.md` | Planner agent phases: context, confirm intent, clarify requirements, effort/ISC, approach selection, autonomous validation, premortem, scratchpad plan, self-contained todos. |
| `HazAT/pi-interactive-subagents` | `pi-extension/subagents/plan-skill.md` | Earlier pane-based planning workflow: scout → interactive planner → plan/todos → sequential workers → reviewer. |
| `HazAT/pi-interactive-subagents` | `agents/planner.md` | Full interactive planner prompt with strict one-phase-per-message behavior, lightweight requirements engineering, phase gates, delegation to scout/researcher. |
| `edmundmiller/dotfiles` | `config/pi/agents/crew-planner.md` | Comprehensive planner that replaces many scouts: codebase exploration, docs, optional external research, gap analysis, task DAG, markdown + `tasks-json` output. |
| `edmundmiller/dotfiles` | `config/pi/agents/scout-planner.chain.md` | Minimal two-step chain: scout context, then coder implementation. Useful as a tiny template. |
| `edmundmiller/dotfiles` | `config/todo/docs/structured-plan.md` | Structured-plan document pattern for task systems. |
| `championswimmer/pi-context-usage` | `.agents/skills/planning/SKILL.md` | Simple durable plan-file format in `.agents/plans/`: numbered files, YAML front matter, phased checklist mirrored in body. |
| `nicobailon/pi-subagents` | `agents/planner.md` | Concrete implementation plan agent: Goal, Tasks, Files to Modify, New Files, Dependencies, Risks. |
| `nicobailon/pi-subagents` | `prompts/gather-context-and-clarify.md` | Scout/research before planning, then ask remaining clarification questions through interview. |
| `nicobailon/visual-explainer` | `plugins/visual-explainer/commands/plan-review.md` | Visual plan review: current vs planned architecture, blast radius, plan/code cross-check, risk assessment, Good/Bad/Ugly, rationale gaps. |
| `nicobailon/visual-explainer` | `plugins/visual-explainer/commands/generate-visual-plan.md` | Visual implementation spec: problem, state machine, state variables, modified functions, APIs, edge cases, tests, file references. |

### Implementation handoff / execution / worker prompts

| Source | Path | What to steal |
|---|---|---|
| `HazAT/pi-config` | `skills/write-todos/SKILL.md` | Best todo body template: plan/scout refs, what/constraints/files/references/expected shape/acceptance criteria. Explicit anti-patterns and objective checks. |
| `HazAT/pi-config` | `skills/plan/SKILL.md` | Sequential one-worker-at-a-time execution, parent progress notifications, post-worker scratchpad check, review/triage loop. |
| `edmundmiller/dotfiles` | `config/pi/prompts/implement-with-notes.md` | “Implement spec + maintain implementation notes” wrapper. |
| `edmundmiller/dotfiles` | `skills/catalog/implementation-notes/SKILL.md` | Excellent implementation-notes artifact: decisions, deviations, tradeoffs, open questions in reviewable HTML. |
| `edmundmiller/dotfiles` | `config/pi/agents/coder.md` | Focused coder subagent prompt: one task, stay in scope, report files/decisions/follow-ups. |
| `nicobailon/pi-subagents` | `agents/worker.md` | Single-purpose implementation worker with output artifacts and supervisor coordination. |
| `nicobailon/pi-subagents` | `prompts/parallel-cleanup.md` | Two-reviewer cleanup pass for deslop/verbosity after implementation. |
| `nicobailon/pi-subagents` | `skills/pi-subagents/SKILL.md` | Staged fix orchestration: parallel read-only planners → one writer worker → parallel validators. Strong pattern for broad diffs. |
| `Michaelliv/pi-dynamic-workflows` | `src/workflow-tool.ts` | Workflow tool prompt guidelines: deterministic JS, `agent()`, `parallel()`, `pipeline()`, labeled phases, final synthesis, schema outputs. Best for ad-hoc fanout/fanin prompts. |

### PR iteration / CI / feedback loops

| Source | Path | What to steal |
|---|---|---|
| `HazAT/pi-config` | `skills/iterate-pr/SKILL.md` | CI/review loop: fetch PR checks and feedback, categorize priorities, fix high/medium automatically, ask on low, reply to threads, poll CI. |
| `mksglu/context-mode` | `.claude/skills/context-mode-ops/review-pr.md` | Maintainer “merge then fix” flow, validation engineer for hallucinated platform claims, TDD follow-up fixes. |
| local config | `skills/receiving-code-review/SKILL.md` | Skeptical feedback triage and external-review pushback rules. |
| `nicobailon/pi-subagents` | `prompts/review-loop.md` | More general “review/fix until clean” orchestration loop. |

### Research / context building / onboarding

| Source | Path | What to steal |
|---|---|---|
| `HazAT/pi-config` | `skills/learn-codebase/SKILL.md` | Scan agent instruction files, summarize project conventions, list commands/skills, register external skills, security/smell sweep. |
| `HazAT/pi-config` | `agents/scout.md` | Codebase scout role for patterns, files, gotchas, tests. |
| `HazAT/pi-config` | `agents/researcher.md` | External research role. |
| `HazAT/pi-config` | `agents/autoresearch.md` | Auto research-oriented agent. |
| `nicobailon/pi-subagents` | `prompts/parallel-research.md` | Combine external researcher + local scout for evidence and local implications. |
| `nicobailon/pi-subagents` | `prompts/parallel-context-build.md` | Parallel context builders that produce planning handoff files and meta-prompts. |
| `nicobailon/pi-subagents` | `prompts/parallel-handoff-plan.md` | External-reference + local-context handoff plan ending in an implementation-ready meta-prompt. |
| local config | `skills/oracle/SKILL.md` | Bundle prompt + curated files for second-opinion debugging/design/review. |
| local config | `skills/deep-research/SKILL.md` | Multi-source research with citation/claim tracking. |

### Handoff / session continuity

| Source | Path | What to steal |
|---|---|---|
| `HazAT/pi-config` | `prompts/handoff.md` | Slash prompt wrapper for starting a fresh session with a handoff. |
| `HazAT/pi-config` | `skills/handoff/SKILL.md` | Handoff workflow. |
| `HazAT/pi-config` | `agents/handoff.md` | Handoff agent prompt. |
| local config | `skills/handoff/SKILL.md` | Local handoff skill variant. |
| `nicobailon/pi-subagents` | `prompts/parallel-handoff-plan.md` | Best for handoff plus implementation meta-prompt. |

### Commit / changelog / release

| Source | Path | What to steal |
|---|---|---|
| local config | `skills/git-commit/SKILL.md` | Commit hygiene: focused changes, conventional commits, rationale. |
| `mitsuhiko/agent-stuff` | `skills/commit/SKILL.md` | Simple conventional commit workflow. |
| `edmundmiller/dotfiles` | `config/pi/extensions/lib/commit-review-logic.ts` | Exact prompt builder for drafting one conventional commit from staged stat/diff. |
| `mitsuhiko/agent-stuff` | `skills/update-changelog/SKILL.md` | Changelog update rules: baseline tag, Unreleased section, notable user-facing changes, examples. |
| `championswimmer/pi-context-usage` | `.agents/skills/release/SKILL.md` | Release workflow skill with preflight checks, npm version/publish/tag fallback. Same skill exists in related `pi-context-*` repos. |

### UI / visual planning / frontend quality

| Source | Path | What to steal |
|---|---|---|
| local config | `skills/frontend-design/SKILL.md` | Frontend design process. |
| local config | `skills/dev-browser/SKILL.md` | Browser verification workflow to include in acceptance criteria. |
| local config | `skills/vercel-react-best-practices/SKILL.md` | React/Next performance review/refactor rules. |
| local config | `skills/vercel-composition-patterns/SKILL.md` | React composition/refactor patterns. |
| `nicobailon/visual-explainer` | `plugins/visual-explainer/commands/generate-web-diagram.md` | Web/diagram generation prompt. |
| `nicobailon/visual-explainer` | `plugins/visual-explainer/commands/generate-slides.md` | Slide generation prompt. |
| `nicobailon/visual-explainer` | `plugins/visual-explainer/commands/fact-check.md` | Verify generated docs/HTML against code and correct inaccuracies in place. |


### Subagent / agent definitions

These are worth reading as prompts too, not just configuration. I copied them into `docs/dev-workflow-prompt-sources/09-subagent-definitions/`. Highlights:

| Source | What to inspect | Why |
|---|---|---|
| active Pi agents | `active-pi-agents/agents/*.md` | Your current customized planner/reviewer/scout/worker/visual-tester definitions. |
| `HazAT/pi-config` | `agents/*.md` | Strong planner, scout, researcher, autoresearch, handoff, reviewer, worker role prompts. |
| inactive `HazAT/pi-interactive-subagents` | `agents/*.md` | Older pane-oriented subagent prompts including `claude-code`. |
| `nicobailon/pi-subagents` | `agents/*.md` | Workflow-oriented roles: context-builder, delegate, oracle, planner, researcher, reviewer, scout, worker. |
| `edmundmiller/dotfiles` | `config/pi/agents/*.md` and `config/agents/modes/*.md` | Crew-style planner/reviewer/worker, semantic reviewer, coder/cursor modes. |

Useful prompt patterns in these definitions:

- Frontmatter as policy: model, tools, thinking level, context inheritance, output shape.
- Role clarity: one agent owns planning, one owns writing, reviewers stay read-only.
- Explicit output contracts: verdicts, task DAGs, artifacts, `tasks-json`, files changed, risks.
- Delegation boundaries: when an agent can spawn children and when it must not.
- Review calibration embedded in role prompts instead of only command prompts.

## Requested community repo follow-up

Checked the requested repos and related author repos, then copied high-signal prompt sources into `docs/dev-workflow-prompt-sources/10-community-repo-finds/`.

| Requested repo | Result |
|---|---|
| `tmustier/pi-extensions` | Has specs/examples more than reusable prompts: `import-cc-codex/spec.md`, `arcade/mario-not/spec.md`. Author also has stronger prompt material in `tmustier/claude-to-pi` and `tmustier/pi-agent-teams`. |
| `tmdgusya/roach-pi` | Very rich. Copied `extensions/agentic-harness/agents/*.md` and `extensions/agentic-harness/skills/*/SKILL.md`. Author also has `tmdgusya/engineering-discipline`, `tmdgusya/questline`, and `tmdgusya/hermes-coding-harness`. |
| `MasuRii/pi-tool-display` | No high-signal generic development workflow prompts found; mainly tool-display implementation/tests. A scan of MasuRii public Pi extension repos did not surface obvious plan/review/spec prompt packs. |
| `w-winter/dot314` | Rich prompt/config repo. Copied RepoPrompt planning/review prompts, handover/compaction prompts, and agent definitions. |
| `MattDevy/pi-extensions` | Rich. Copied code review, blueprint planning, red/green/refactor TDD prompts, simplify prompt, continuous-learning prompts, PRDs, and repo guidance. |

Highlights worth reading first:

- `10-community-repo-finds/MattDevy__pi-extensions/packages/pi-blueprint/src/prompts/blueprint-generate.ts`
- `10-community-repo-finds/MattDevy__pi-extensions/packages/pi-code-review/src/review-prompt.ts`
- `10-community-repo-finds/MattDevy__pi-extensions/packages/pi-red-green/src/prompts/red-phase.ts`
- `10-community-repo-finds/w-winter__dot314/prompts/rp-plan.md`
- `10-community-repo-finds/w-winter__dot314/prompts/rp-review-chat.md`
- `10-community-repo-finds/w-winter__dot314/extensions/handover/prompt.md.example`
- `10-community-repo-finds/tmdgusya__engineering-discipline/skills/plan-crafting/SKILL.md`
- `10-community-repo-finds/tmdgusya__engineering-discipline/skills/review-work/SKILL.md`
- `10-community-repo-finds/tmdgusya__questline/skills/setgoal/SKILL.md`
- `10-community-repo-finds/tmustier__claude-to-pi/agents/pr-reviewer.md`
- `10-community-repo-finds/tmustier__claude-to-pi/prompts/auto-pr.md`
- `10-community-repo-finds/tmustier__pi-agent-teams/skills/agent-teams/SKILL.md`

## Design patterns worth copying into your own prompt set

1. **Always separate fresh review context from implementation history.** The best reviewers read the diff/files and requirements directly, not the parent chat.
2. **Use phase gates for planning.** Strong planners stop for user input through approach selection, then proceed autonomously to validation/premortem/todos.
3. **Ask one question at a time, with lettered options when possible.** This pattern appears in PRD/brainstorming/planner prompts.
4. **Make outputs executable by another agent.** Good plans name files, constraints, references, anti-patterns, acceptance criteria, validation commands, and dependencies.
5. **One writer, many readers.** For broad diffs: parallel read-only planners/reviewers, one writer worker, parallel validators.
6. **Calibrate severity.** Good review prompts define P0/P1/P2/P3 or Critical/Important/Minor and explicitly reject speculative/nit findings.
7. **Demand evidence.** File:line refs, command outputs, fact sheets before visual docs, and “do not invent issues” appear repeatedly.
8. **Keep a human-facing decision log.** Implementation notes, visual decision logs, and future-you re-entry sections preserve rationale without private reasoning.
9. **Do not blindly obey review feedback.** Verify, clarify, push back technically, then fix.
10. **Use structured final verdicts.** `Ready to merge`, `SHIP/NEEDS_WORK/MAJOR_RETHINK`, or `correct/needs attention` make review output actionable.

## Suggested personal prompt set to create

A compact set that covers most development sessions:

1. `plan.md` — Scout/research if needed → confirm intent → clarify → 2-3 approaches → chosen approach → plan/todos.
2. `prd.md` or `spec.md` — Lightweight requirements doc with user stories, FRs, non-goals, success metrics, open questions.
3. `review.md` — Codex-style diff review rubric with calibrated severity and non-blocking human callouts.
4. `parallel-review.md` — Fresh-context multi-angle review, synthesize before fixing.
5. `review-loop.md` — Worker → reviewers → one fix worker → repeat up to cap.
6. `implement-with-notes.md` — Implement from a spec while keeping user-facing decision/deviation notes.
7. `write-todos.md` — Self-contained todo template for worker handoff.
8. `iterate-pr.md` — CI + review feedback loop.
9. `commit.md` — Conventional commit draft from staged diff.
10. `handoff.md` — Fresh-session continuation prompt with facts, state, next steps, blockers.
