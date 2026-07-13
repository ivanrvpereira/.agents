---
name: code-review
description: "Review a diff, branch, PR, commit, or work-in-progress change along two separate axes: Standards (repo conventions, maintainability, safety) and Spec (does the change implement the originating issue/PRD/request?). Runs focused sub-agents in parallel and reports prioritized, actionable findings side by side. Use when the user wants to review a branch, PR, WIP changes, or asks to \"review since X\"."
---

Local/custom review skill. Do not treat this as a vendored upstream skill.

Review changes through two independent axes:

- **Standards** — does the changed code follow this repo's documented standards and avoid introduced maintainability, reliability, security, or operational risks?
- **Spec** — does the changed code faithfully implement the originating issue / PRD / request, without omissions or scope creep?

The axes run as **parallel sub-agents** so conventions and product intent do not pollute each other. Aggregate them separately; do not merge them into one ranked list.

## Review discipline

Apply these rules to every finding on both axes:

- **Only changed behavior.** Flag issues introduced or exposed by this change, not pre-existing problems.
- **Actionable and provable.** Only report issues the author would likely fix after seeing the evidence. Avoid speculative, preference-only, or purely stylistic comments unless a documented standard requires them.
- **Diff-overlapping location.** Each finding must point to a changed line/hunk, or the smallest changed function/block when exact line numbers are unavailable.
- **Evidence first.** Cite the changed code, the violated standard, and/or the spec line. If the evidence is weak, omit the finding.
- **Short comments.** Keep each finding concise: title, location, why it matters, and the minimal fix direction.
- **No tool-enforced noise.** Skip formatting/lint/type issues that project tooling already enforces unless the current diff clearly bypasses that tooling.

Use these priorities inside each axis:

- **[P0]** Release blocker: data loss, active exploit, total outage, irreversible destructive operation, or failed core requirement.
- **[P1]** High impact: security/privacy issue, broken major workflow, incorrect persistence/API contract, migration risk, or missing required behavior.
- **[P2]** Normal bug or maintainability problem: likely user-facing breakage, confusing design, fragile error handling, or significant code smell.
- **[P3]** Minor: low-risk edge case, small cleanup, or optional improvement worth tracking.

## Mandatory risk checks

Run these checks even when the repo has no review guidelines:

### Untrusted input and boundary checks

Treat data from users, HTTP, files, env vars, databases, webhooks, subprocesses, LLM/tool output, CLI args, and third-party APIs as untrusted. Flag changed code that feeds untrusted data into:

- authz/authn decisions, permission checks, tenant/account boundaries;
- SQL/NoSQL queries, shell commands, filesystem paths, templates/HTML/Markdown, redirects, or deserializers;
- money, billing, quotas, rate limits, feature flags, migrations, or destructive operations;
- logging/telemetry where secrets or personal data could leak.

### Fail-fast error handling

Scrutinize changed code that silently falls back, catches broadly, drops errors, retries indefinitely, or proceeds after partial failure. Prefer surfacing the failure for:

- writes, migrations, billing, notifications, queue/cron jobs, and cache invalidation;
- security, permissions, configuration, and dependency initialization;
- API boundary changes where callers need deterministic failure semantics.

### Human callouts, not automatic blockers

List these separately as **Human callouts** unless you found a concrete bug:

- migrations/schema/data backfills;
- dependency upgrades, lockfile churn, build tooling, or runtime version changes;
- auth/permission, public API, SDK, CLI, or wire-format changes;
- destructive operations, filesystem/network access, background jobs, cron, billing, or external integrations;
- performance-sensitive paths, caching semantics, observability, or rollback concerns.

## Process

### 1. Pin the review target

Prefer a fixed point the user supplies: commit SHA, branch name, tag, `main`, `HEAD~5`, etc. Use a three-dot range for branch-style reviews:

```bash
git diff <fixed-point>...HEAD
git log <fixed-point>..HEAD --oneline
```

Confirm the ref resolves (`git rev-parse <fixed-point>`) and the diff is non-empty before spawning sub-agents.

If the user explicitly asks for another target, use the matching command instead:

- **Uncommitted/WIP:** `git diff --cached` and `git diff`.
- **Single commit:** `git show --format=fuller --stat --patch <commit>`.
- **PR:** fetch/view the PR with the repo's GitHub/GitLab workflow, then review its merge-base diff.
- **Folder snapshot:** only use when the user explicitly asks for a folder review; state that findings are not limited to a git diff.

If the user did not identify a target and intent is ambiguous, ask one clarifying question.

### 2. Identify the spec source

Look for the originating request, in this order:

1. Issue/PR references in branch names and commit messages (`#123`, `Closes #45`, GitLab `!67`, Linear IDs, etc.). Use the repo's documented issue-tracker workflow; for GitHub, prefer `gh`.
2. A path, issue, PR, ticket, or prompt the user passed as an argument.
3. A PRD/spec file under `docs/`, `specs/`, `.scratch/`, or project-specific planning directories matching the branch or feature.
4. If nothing is found, ask the user where the spec is. If they say there is no spec, skip the Spec sub-agent and report `No spec available`.

### 3. Identify standards sources

Collect repo guidance that documents how code should be written or reviewed, for example:

- `AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING.md`, `CODING_STANDARDS.md`, `REVIEW_GUIDELINES.md`;
- framework/package-specific docs in the touched directories;
- test, lint, typing, migration, API, security, or release guidance.

On top of repo documentation, the Standards axis always carries the **smell baseline** below. The repo overrides the baseline: if a documented local convention endorses something the baseline would flag, suppress the smell. Baseline smells are always judgement calls, not hard violations.

### Smell baseline

- **Mysterious Name** — a function, variable, or type whose name does not reveal what it does or holds. → rename it; if no honest name comes, the design is murky.
- **Duplicated Code** — the same logic shape appears in more than one hunk or file in the change. → extract the shared shape, call it from both.
- **Feature Envy** — a method reaches into another object's data more than its own. → move the method onto the data it envies.
- **Data Clumps** — the same fields or params keep travelling together. → bundle them into one type and pass that.
- **Primitive Obsession** — a primitive/string stands in for a domain concept. → give the concept its own small type.
- **Repeated Switches** — the same `switch`/`if` cascade on the same type recurs. → replace with polymorphism or one shared map.
- **Shotgun Surgery** — one logical change forces scattered edits across many files. → gather what changes together into one module.
- **Divergent Change** — one module is edited for unrelated reasons. → split so each module changes for one reason.
- **Speculative Generality** — abstractions, parameters, hooks, or options added for needs the spec does not have. → delete or inline until a real need appears.
- **Message Chains** — long `a.b().c().d()` navigation the caller should not depend on. → hide the walk behind one method on the first object.
- **Middle Man** — a class/function mostly delegates onward. → cut it and call the real target directly.
- **Refused Bequest** — a subclass/implementer ignores or overrides most inherited behavior. → drop inheritance and use composition.

### 4. Spawn both sub-agents in parallel

Send one message with two `Agent` tool calls. Use `general-purpose` unless a repo-specific reviewer agent is clearly better.

Paste the review target commands, commit list, touched files, relevant instructions, and the full **Review discipline**, **Mandatory risk checks**, and **priority definitions** into both prompts. Sub-agents do not inherit this skill file.

**Standards sub-agent prompt** — include:

- The diff/review commands and commit list.
- The standards-source files and relevant excerpts.
- The full smell baseline.
- Brief:
  > Review only the changed lines/behavior. Report prioritized findings where the diff violates documented standards, introduces concrete safety/reliability/security/operational risk, or contains a meaningful baseline smell. Cite the standard or changed hunk for each finding. Distinguish hard standard/risk violations from smell judgement calls. Include separate Human callouts for migrations, dependencies, auth/API changes, destructive operations, external integrations, or rollout concerns. Under 500 words.

**Spec sub-agent prompt** — include:

- The diff/review commands and commit list.
- The path or fetched contents of the spec.
- Brief:
  > Compare the changed behavior to the spec only. Report prioritized findings for required behavior that is missing/partial, behavior that contradicts the spec, scope creep that creates risk, or implementation that looks wrong despite matching the words. Quote the spec line or requirement for each finding. Include Human callouts for ambiguous or high-risk requirements that need reviewer/product confirmation. Under 500 words.

If the spec is missing, skip the Spec sub-agent and note this in the final report.

### 5. Verify and aggregate

Before reporting, spot-check each sub-agent finding against the diff/spec/standards. Drop or qualify anything that is hallucinated, not introduced by the change, not actionable, or missing evidence.

Present the reports under these headings:

```markdown
## Standards
- [P1] `path:line` — concise title
  Evidence: changed code / standard / risk.
  Fix: minimal direction.

Human callouts:
- ...

## Spec
- [P1] `path:line` — concise title
  Evidence: spec line + changed behavior.
  Fix: minimal direction.

Human callouts:
- ...

## Summary
Standards: N findings, worst [PX]. Spec: N findings, worst [PX].
```

Do **not** merge or rerank across axes. If one axis has no findings, say `No findings`.

## Why two axes

A change can pass one axis and fail the other:

- Code that follows every standard but implements the wrong thing → **Standards pass, Spec fail.**
- Code that does exactly what the issue asked but breaks project conventions or adds operational risk → **Spec pass, Standards fail.**

Keeping the axes separate prevents one kind of correctness from masking the other.
