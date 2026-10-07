# Public specialist-agent configurations

## Finding

Public repositories define Fable subagents for implementation, advice, review, and bounded background tasks. Two inspected definitions explicitly select `model: fable` and `effort: low`.

These files prove that the configurations exist. They do not prove that Fable low is the fastest or cheapest implementer. No controlled comparison for the proposed Astra/Fable/Luna team was found in this research.

## Direct Fable examples

### Fable low for bounded code changes

[Sartonio/ai-first-starter: fable-low.md](https://github.com/Sartonio/ai-first-starter/blob/315ba8666967539eebc0a0ad88b21a300e20b309/.claude/agents/fable-low.md) defines a general-purpose worker with `model: fable` and `effort: low`.

Its description names non-trivial code changes with a clear specification, summaries of large material, and bounded fixes. The worker must stay within scope and report decisions that the specification does not resolve. Its final report includes changes, touched files, and follow-up requirements. This closely matches the proposed Fable-low implementer.

The description also claims strong low-effort performance. That is the author's claim, not a benchmark supplied by this file.

### Fable low as a background execution option

[patinaproject/skills: pstack-fable-low.md](https://github.com/patinaproject/skills/blob/6e10867075e07c15066db4192ccf3d49c8b3a19e/.claude/agents/pstack-fable-low.md) sets `model: fable`, `effort: low`, and `background: true`. It disallows `Agent` and `Task`.

The parent assigns the task and path scope. The worker reads supplied artifacts, does not select another model, and does not delegate. It returns the requested artifact or verdict with a concise rationale. This is a configurable execution option, not proof that every pstack role uses Fable low.

### Fable for difficult implementation: historical configuration

[DannyMac180/fable-advisor v4: fable-implementer.md](https://github.com/DannyMac180/fable-advisor/blob/ad2bdc3/agents/fable-implementer.md) defines a Fable implementation specialist. Its tasks include concurrency, algorithms, hard debugging, and broad refactors. It requires an objective, files, interfaces, constraints, and a verification command. Its report includes actual verification evidence and unresolved gaps. The agent definition does not pin effort.

This example is historical. The [inspected v5 README](https://github.com/DannyMac180/fable-advisor/blob/4d6cc62164619a279b076439e1af5439892b958a/README.md) replaces that implementation role with GPT-5.6 Sol. It uses Fable 5.1 for the architect and a separate fresh-context advisor. Search-engine excerpts still described v4, so those excerpts are not evidence for the current setup.

The current [advisor definition](https://github.com/DannyMac180/fable-advisor/blob/4d6cc62164619a279b076439e1af5439892b958a/agents/fable-advisor.md) permits only Read, Grep, and Glob. It advises on architecture, migrations, unresolved problems, and final reviews. It returns a short verdict and never implements. Its benefit is separate context even when the architect uses the same model.

### Fable as a frontier worker and judge

[KimSehyun9797/darth-harness: MODELS.yaml](https://github.com/KimSehyun9797/darth-harness/blob/8e663f218dc4f106b4edf4786b3a98c33cfda985/MODELS.yaml) defines economy, standard, frontier, and judge roles. Luna low is the first economy candidate. Sol high is the first frontier candidate, with Fable high as the second. Fable high is the first judge candidate.

This is evidence for tiered model selection and a Fable worker option. It is not evidence that the Fable candidate executes every frontier task.

### Fable background-operation tooling

[rellyholdem/fable-runner](https://github.com/rellyholdem/fable-runner/blob/480a3c7fa03c31aebaa6f743ca7a0817f3a1bf2e/README.md) describes real Fable background runs and provides a transcript model checker. Useful operational concerns include slow-but-live workers, partial progress, bounded tasks, and model identity.

Its fallback observations concern Claude Code. They do not establish the same behavior in Pi. This research does not recommend its classifier-avoidance instructions or install its tooling.

## Other useful specialist roles

[subinium/subinium-agentic-workflow-config](https://github.com/subinium/subinium-agentic-workflow-config#agents--specialized-workers) publishes a broader role catalogue. Its README declares Opus defaults with Sonnet/Haiku overrides where speed or cost matters. The reviewed section does not map every role to a model.

| Role | Distinct purpose |
|---|---|
| Test runner | Runs lint, type checks, and tests without filling the parent context with logs. |
| Flake hunter | Repeats failures and investigates timing, order, network, and environment correlations. |
| Migration reviewer | Checks data loss, database locks, indexes, and rollback safety. |
| Performance researcher | Investigates queries, bundles, rendering, and algorithmic cost. |
| Documentation researcher | Reads version-specific documentation and migration guides. |

The [GoCluster fresh verifier](https://github.com/N2WQ/GoCluster/blob/0143c9ae9cb8f7709635c3812c6f4e0e574397b5/.claude/agents/fable-fresh-verifier.md) independently compares a change with its plan and evidence. It also checks whether completion claims are supported. Despite its name, it uses `model: inherit`, not an explicit Fable pin. It prohibits broad validation suites, so it is not simply a test runner.

These examples support role boundaries. They do not justify a large permanent roster or prove productivity gains.

## Official guidance and implications

[Anthropic's Fable 5 prompting guide](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5) recommends medium or low effort for routine work. It recommends asynchronous delegation and context retention across related subtasks. It also states that separate fresh-context verifier agents tend to outperform self-critique.

That guidance supports a trial, not a universal performance claim. Most examples use the `fable` alias or describe Fable 5. They do not provide a comparison for the exact `claude-fable-5-1` model configured locally.

The proposed team remains Astra for orchestration and code review, Fable low for implementation, and Luna medium for scouting. Additional roles can start as task-specific assignments. The most useful initial additions are a researcher and a test/evidence runner. Specialized performance, migration, or flake investigation is appropriate only when the task needs it.

A future pilot can measure accepted changes, correction rounds, elapsed time, and token use on representative tasks. No pilot, installation, or migration occurred during this research.

## Method

GitHub search located candidate files. GitHub API reads and pinned repository files supplied the evidence. Librarian cached the main Fable repositories. A background researcher supplied broader role examples, and the parent verified the cited specialist catalogue. Search snippets served only as discovery leads. The parent rejected a stale snippet after inspecting current source.
