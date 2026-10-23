# Skill simplification audit

## Scope and counts

This is a read-only audit, except for this new report. No settings, skills, symlinks, or sync state changed. Paths below are relative to `/Users/ivanpereira/.agents`.

- `skills/auto/`: **19** public skills.
- `skills/on-demand/`: **35** public skills. All 35 have `disable-model-invocation: true`; all 19 auto skills omit it.
- `pi/skills/`: **0** skills, only `.gitkeep`.
- `.pi/skills/`: **1** distinct, project-local skill, `pi-model-config`. It is not a duplicate symlink.
- `skills/private` resolves to the private companion repository: **4** skill files counted, with no contents read or reported.
- `skills/VENDORED.md` records **44** shared skills: 14 auto and 30 manual. Ten shared skills are unregistered, not necessarily all custom. `code-review` explicitly identifies itself as custom.

Pi excludes manual-only skills from automatic prompt advertising, as independently verified by the parent researcher. Their bodies also stay unloaded until requested. The reported current session advertises 24 skills, including private/package sources. Therefore, 35 manual library entries are not 35 active instructions. Prioritize workflow complexity, not directory size.

I read all 19 public auto bodies, the project-local body, the core engineering planning/execution chain, and selected overlapping manual families. I read the linked TDD, domain, design, prototype, and prose references relevant to these findings. I did not exhaustively audit niche manual skills, external frontend documentation, or the deep-research pipeline’s long references. No online model research was performed.

## Highest-value reductions

1. **Retire auto `ponytail`; preserve only useful policy.** `skills/auto/ponytail/SKILL.md:3,16–18` applies before all coding and persists across responses. Its reuse/style rules are useful but mostly ordinary guidance. Its minimum-check prescription rejects frameworks and fixtures (`98–103`), conflicting with project testing practice and the TDD seam contract. “Never stall” (`53`) competes with required approvals. Mandatory branded comments (`55`) add noise. Preserve style matching, reuse, scope control, and proportionate verification in existing policy; do not weaken tests.

2. **Remove `implement` and `code-simplifier` as separate engineering entry points.** `skills/on-demand/implement/SKILL.md:7–15` mainly says implement, test, review, commit. Its unconditional commit instruction needs explicit authorization. `skills/on-demand/code-simplifier/SKILL.md:24–30` presents particular JavaScript/React preferences as project standards. Those are not universal. Its useful behavior-preservation and simplicity checks already fit review or orchestration. Keep **one optional** executor: `skills/on-demand/implementation-orchestrator/SKILL.md:19–35` adds actual worker separation, regression evidence, and independent native-surface verification. Those mechanisms justify it for large approved plans, not routine edits. Remove its compulsory Caveman dependency (`11`) from any future revision; fragments conflict with the standing full-sentence policy.

3. **Make planning a menu, not a required chain.** `skills/on-demand/wayfinder/SKILL.md:21–25,105–116` creates tracker maps, child decisions, research branches, and a one-ticket-per-session limit. Useful for genuinely multi-session uncertainty, excessive for ordinary features. `skills/on-demand/to-spec/SKILL.md:33–41` demands an extremely extensive story list: replace that future requirement with proportionate acceptance criteria. Preserve its seam approval (`13–17`). `skills/on-demand/to-tickets/SKILL.md:28–63` contributes real dependency edges, user approval, and expand–contract handling; use only when work needs separate tickets. `grill-me` is merely an alias (`skills/on-demand/grill-me/SKILL.md:7`), an easy removal. Wayfinder’s “one question” (`79`) also conflicts with batch `grilling` (`skills/auto/grilling/SKILL.md:8–12`).

4. **Merge domain and ADR guidance into one optional document-design skill.** Preserve glossary artifacts and ADR history, not two overlapping triggers. `skills/auto/adr-writing/SKILL.md:33` specifies sections, while its linked `skills/auto/domain-modeling/ADR-FORMAT.md:15–19` permits a paragraph and optional sections. Resolve the template conflict. Preserve amendment rules (`adr-writing/SKILL.md:44–49`) and lazy document creation.

5. **Demote thin/broad guidance before deleting specialist libraries.** `skills/auto/research/SKILL.md:6–12` mandates a background agent for essentially all research. Keep primary-source citations and a saved artifact, but delegate only when useful. Make it optional, alongside deep-research’s distinct evidence pipeline. Move `simple-english` to manual use: its 53-rule catalog, modal bans, and mandatory checks (`skills/auto/simple-english/SKILL.md:55,105,300–309`) exceed ordinary clarity needs.

## Small default and optional library

A practical public auto default is **eight**: `tdd`, `code-review`, `diagnosing-bugs`, `git-commit`, `dev-browser`, `librarian`, `liteparse`, and `tmux`. Keep project-local `pi-model-config`. Keep approval at agreed test seams and independent assertions (`skills/auto/tdd/SKILL.md:22–36`). Review adds independent axes and evidence validation (`skills/auto/code-review/SKILL.md:13,148–155`); diagnosis adds an executed, symptom-specific reproduction loop (`skills/auto/diagnosing-bugs/SKILL.md:46–60`). Narrow diagnosis to hard bugs so trivial failures do not require every phase.

Keep design, prototype, planning, prose, and research opt-in. Preserve tool-specific knowledge where used; ordinary `gh` examples and alternative crawling need not be auto skills when tools and policy already cover them.

Frontend presets overlap but represent different tastes, not universally interchangeable instructions. `high-end-visual-design` requires pill buttons (`skills/on-demand/high-end-visual-design/SKILL.md:48`); `minimalist-ui` bans them (`skills/on-demand/minimalist-ui/SKILL.md:20`). Keep one preferred preset or mutually exclusive references. Do not load both. Moving broad `frontend-design` to manual use is more valuable than deleting dormant image/brand libraries.

Stronger models reduce the value of generic recipes, not local policies, tool conventions, approval boundaries, or demonstrably effective tests. These are recommendations only; removals and merges require separate approval.
