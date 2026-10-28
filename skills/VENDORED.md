# Vendored Skills

Skills copied from upstream repos (not managed by `npx skills`). We **own** these
copies so they can be customized freely and bucketed into `auto/` or `on-demand/`.

## Update workflow

For each row: fetch the source repo, diff its upstream path against `Pinned ref`.
- If `Customized = no`: copy the upstream version over the local one.
- If `Customized = yes`: show the diff and merge by hand, preserving local changes.

Then bump `Pinned ref` to the commit you synced from. Ask an AI agent to run this.

Keep the `Bucket` column in sync with the skill's actual folder and its
`disable-model-invocation` flag (`on-demand` ⇒ flag present, `auto` ⇒ absent).

## Registry

Matt Pocock imports omit harness-specific `agents/openai.yaml` metadata.

| Skill | Bucket | Source | Upstream path | Pinned ref | Customized | Notes |
|-------|--------|--------|---------------|-----------|-----------|-------|
| architecture-scan | on-demand | dmmulroy/.dotfiles | home/.agents/skills/improve-codebase-architecture | 287382ed4914 | yes | renamed from `improve-codebase-architecture` (name clash with Matt's); orphaned commit (upstream rewrote history, then swapped in Matt's copy and deleted it on 2026-08-05), so this copy is frozen; `GLOSSARY.md` added beside `CONTEXT.md`; needs `coding-standards` and `tech-spec` in the same bucket (relative links) |
| bro | on-demand | dmmulroy/.dotfiles | home/.agents/skills/bro | 287382ed4914 | no | |
| caveman | on-demand | JuliusBrussee/caveman | skills/caveman | b4531dfc05a3 | yes | flag added for on-demand; SKILL.md only; its `/caveman ultra` and `/caveman wenyan` aliases point to the `ultracave` and `megacave` skills, which are not vendored |
| codebase-design | auto | mattpocock/skills | skills/engineering/codebase-design | 5beb35b040e3de97e54fa9e386d7e42d15c295c2 | no | incl. DEEPENING.md, DESIGN-IT-TWICE.md |
| coding-standards | on-demand | dmmulroy/.dotfiles | home/.agents/skills/coding-standards | 287382ed4914 | yes | flag added for on-demand; 94-line TypeScript version that `architecture-scan` and `tech-spec` were written against; upstream later grew it into a TypeScript + Effect version (deleted 2026-10-12, last at 4a783032e8f1), so this copy is frozen |
| diagnosing-bugs | auto | mattpocock/skills | skills/engineering/diagnosing-bugs | 5beb35b040e3de97e54fa9e386d7e42d15c295c2 | yes | incl. scripts/hitl-loop.template.sh; broader find-bugs trigger |
| diagram-design | on-demand | cathrynlavery/diagram-design | skills/diagram-design | 7a12007b5a42 | yes | manual-only flag; root LICENSE and THIRD_PARTY_LICENSES.md included; onboarding uses dev-browser; no plugin or repository-level tooling |
| domain-modeling | auto | mattpocock/skills | skills/engineering/domain-modeling | 5beb35b040e3de97e54fa9e386d7e42d15c295c2 | yes | incl. ADR-FORMAT.md, GLOSSARY-FORMAT.md; ADR trigger dropped from the description so `adr-writing` owns ADR edits (keep on update) |
| dev-browser | auto | SawyerHood/dev-browser | skills/dev-browser | e5d746f1fc17 | yes | also a plugin (`dev-browser`); pinned Puppeteer RC installation and runtime trust warning; local "Reuse browser instances" section appended (keep on update); description shortened to one trigger per case |
| grill-me | on-demand | mattpocock/skills | skills/productivity/grill-me | 5beb35b040e3de97e54fa9e386d7e42d15c295c2 | no | |
| grill-for-unknowns | on-demand | nicobailon/grill-for-unknowns | plugins/grill-for-unknowns | d8d5f4b422b8be1301dd4a515d96589eaddc5f3c | yes | flag added so it does not compete with `grilling`; `CONTEXT.md`/`CONTEXT-MAP.md` renamed to `GLOSSARY.md`/`GLOSSARY-MAP.md` (incl. templates/GLOSSARY.md) to match `domain-modeling` (keep on update); root NOTICE.md copied with its link fixed; plugin metadata not vendored |
| grill-with-docs | on-demand | mattpocock/skills | skills/engineering/grill-with-docs | 59db609eb1e18aaf59b63284d0e52255aff0c63c | no | loads grilling + domain-modeling |
| grilling | auto | mattpocock/skills | skills/productivity/grilling | 5beb35b040e3de97e54fa9e386d7e42d15c295c2 | yes | follows upstream graduation from batch-grill-me; batch-oriented description and decision-tree terminology preserved |
| handoff | on-demand | mattpocock/skills | skills/productivity/handoff | 5beb35b040e3de97e54fa9e386d7e42d15c295c2 | no | replaced the previous local handoff |
| humanizer | on-demand | blader/humanizer | SKILL.md (repo root) | 8c307f367c91 | yes | flag added for on-demand (after the multi-line description); root LICENSE included; README, CHANGELOG, agents/, scripts/ not vendored; original author, replaced the stale softaworks copy (2.1.1 → 3.1.0) |
| i-have-adhd | on-demand | ayghri/i-have-adhd | skills/i-have-adhd | 1ecea1993b7f | no | upstream now ships the manual-only flag; agents/ harness metadata not vendored |
| implement | auto | mattpocock/skills | skills/engineering/implement | 5beb35b040e3de97e54fa9e386d7e42d15c295c2 | yes | end of wayfinder → to-spec → to-tickets → implement chain; required TDD reference before test changes; flag removed so subagents can load it; delegated-worker rule used by implementation-orchestrator (keep on update) |
| improve-codebase-architecture | on-demand | mattpocock/skills | skills/engineering/improve-codebase-architecture | 59db609eb1e18aaf59b63284d0e52255aff0c63c | yes | incl. HTML-REPORT.md; upstream ships the flag; HTML report goes to repo `.scratch/` instead of the OS temp dir (keep on update); loads codebase-design, grilling, domain-modeling |
| librarian | auto | mitsuhiko/agent-stuff | skills/librarian | 0865c849befd | no | |
| liteparse | auto | run-llama/llamaparse-agent-skills | skills/liteparse | 2dcef7c62417 | yes | had a dup vendor `effective-liteparse` (removed); dieted: description shortened, trace stories cut, `search.py` called via `uv run --script <skill-dir>/scripts/search.py` (upstream path points at the old `effective-liteparse` folder) |
| pr | auto | mattpocock/skills | skills/engineering/pr | 5beb35b040e3de97e54fa9e386d7e42d15c295c2 | yes | incl. CREDITS.md (Summary visuals come from humanlayer show-me); added diff inventory, shared-path and trust-boundary visuals, Data model changes section (keep on update) |
| pretty-mermaid | on-demand | imxv/Pretty-mermaid-skills | . (repo root) | e234ab73c299 | yes | flag added for on-demand; SKILL.md, LICENSE, package.json, package-lock.json, references/, scripts/, assets/example_diagrams/, assets/theme_gallery/, docs/THEME_GALLERY.md only; repo-maintenance scripts `validate-docs.mjs` and `generate-theme-gallery.mjs` (and their npm scripts) dropped, SKILL.md now says run `npm test` only; needs Node, `node_modules/` is git-ignored (run `npm install` in the skill folder after sync); renderer is beautiful-mermaid, not Mermaid itself: no frontmatter `title:`, no `<b>` in labels, sequence `autonumber` ignored |
| prototype | auto | mattpocock/skills | skills/engineering/prototype | 5beb35b040e3de97e54fa9e386d7e42d15c295c2 | no | incl. LOGIC.md, UI.md |
| reducing-entropy | on-demand | joshuadavidthomas/agent-skills | reducing-entropy | 516dee7a422b | yes | flag added for on-demand; incl. references/, adding-reference-mindsets.md; original author, replaced the softaworks copy (same text, upstream description kept) |
| research | auto | mattpocock/skills | skills/engineering/research | 5beb35b040e3de97e54fa9e386d7e42d15c295c2 | yes | reports stay local under globally ignored `.scratch/`, never in commits |
| retro | on-demand | mattpocock/skills | skills/engineering/retro | 59db609eb1e18aaf59b63284d0e52255aff0c63c | no | loads writing-for-agents |
| rpi | on-demand | humanlayer/skills | plugins/rpi/skills/rpi | 653b6411c1f70c275a18e37673b042ff99f67ceb | yes | flag added for on-demand; root LICENSE included; artifacts in `.scratch/rpi/` instead of `.agents/artifacts/`; Pi invocation `/skill:rpi` added; plugin `agents/` not vendored (the skill ships the same prompts under references/subagents/ and passes them to generic subagents) |
| sentry | on-demand | mitsuhiko/agent-stuff | skills/sentry | 0865c849befd | yes | flag added for on-demand |
| setup-matt-pocock-skills | on-demand | mattpocock/skills | skills/engineering/setup-matt-pocock-skills | 5beb35b040e3de97e54fa9e386d7e42d15c295c2 | no | one-time per-repo tracker/domain-docs setup; triage skill not vendored so Section B skips |
| setup-ts-deep-modules | on-demand | mattpocock/skills | skills/in-progress/setup-ts-deep-modules | 59db609eb1e18aaf59b63284d0e52255aff0c63c | yes | upstream marks it in-progress; incl. dependency-cruiser.config.cjs; TypeScript only; example context pointer written as a plain path so the link checker passes |
| show-me | on-demand | humanlayer/skills | plugins/show-me/skills/show-me | ca7c8088db69e315a8b2deea43820270457f8f3c | no | incl. root LICENSE; plugin metadata not vendored |
| skill-diet | auto | nicobailon/skill-diet | . (repo root) | 5f41df1220eb5759c413390206f1b9e6c63be754 | no | SKILL.md, LICENSE, references/, scripts/ only; plugin metadata, package.json, tools/, README, CHANGELOG and AGENTS.md (release notes) not vendored; scripts need Node |
| simple-english | auto | AminBlg/SimpleEnglish | skills/simple-english | a6fcb4fde098 | yes | replaced TheAngryByrd/simplified-technical-english-skill; upstream 2.x defaults to Plain mode with Strict STE on request; description shortened; evals/, output-styles/, prompts/ not vendored; description unwrapped onto one line |
| suggest-skills | on-demand | mattpocock/skills | skills/engineering/ask-matt | 59db609eb1e18aaf59b63284d0e52255aff0c63c | yes | renamed from `ask-matt`; rewritten as a recommendation-only map of the skills installed here (local overlaps, `implementation-orchestrator`, `rpi`), skill names instead of cross-bucket links, PHASE-BOUNDARIES.md folded into a short "Between phases" list with no fixed token threshold; on update, take only new routing ideas, not the upstream text |
| tdd | auto | mattpocock/skills | skills/engineering/tdd | 5beb35b040e3de97e54fa9e386d7e42d15c295c2 | yes | incl. tests.md, mocking.md; broader test-change and test-quality review triggers |
| teach | on-demand | mattpocock/skills | skills/productivity/teach | 5beb35b040e3de97e54fa9e386d7e42d15c295c2 | no | |
| tech-spec | on-demand | dmmulroy/.dotfiles | home/.agents/skills/tech-spec | 287382ed4914 | yes | `../tdd/` links replaced with the `tdd` skill by name (tdd lives in auto/); same frozen orphaned commit as `architecture-scan`; upstream deleted it on 2026-08-05 |
| to-questionnaire | on-demand | mattpocock/skills | skills/productivity/to-questionnaire | 59db609eb1e18aaf59b63284d0e52255aff0c63c | yes | writes to repo `.scratch/` instead of the current directory (keep on update) |
| to-spec | on-demand | mattpocock/skills | skills/engineering/to-spec | 5beb35b040e3de97e54fa9e386d7e42d15c295c2 | no | replaced to-prd (upstream unification) |
| to-tickets | on-demand | mattpocock/skills | skills/engineering/to-tickets | 5beb35b040e3de97e54fa9e386d7e42d15c295c2 | no | replaced to-issues (upstream unification) |
| vercel-composition-patterns | on-demand | vercel-labs/agent-skills | skills/composition-patterns | 063bee94c3f4 | yes | renamed; flag added for on-demand; README.md, metadata.json and rules/_*.md build files not vendored; upstream only hard-wrapped the text since |
| wait-what | on-demand | mattpocock/skills | skills/productivity/wait-what | 59db609eb1e18aaf59b63284d0e52255aff0c63c | no | on trial; overlaps the local `bro` |
| wayfinder | on-demand | mattpocock/skills | skills/engineering/wayfinder | 5beb35b040e3de97e54fa9e386d7e42d15c295c2 | yes | needs tracker config from setup-matt-pocock-skills; uses vendored research; local `.scratch/` reports replace pushed research branches |
| web-design-guidelines | on-demand | vercel-labs/agent-skills | skills/web-design-guidelines | 063bee94c3f4 | yes | flag added for on-demand |
| wizard | auto | mattpocock/skills | skills/engineering/wizard | 59db609eb1e18aaf59b63284d0e52255aff0c63c | no | incl. template.sh; model-invoked like upstream |
| writing-for-agents | auto | mattpocock/skills | skills/productivity/writing-for-agents | 5beb35b040e3de97e54fa9e386d7e42d15c295c2 | no | upstream rename of writing-great-skills; model-invoked like upstream; incl. SKILL-MECHANICS.md |
| brandkit | on-demand | Leonxlnx/imagegen-skills | skills/brandkit | beb16b0d0f4d | yes | flag added for on-demand; moved from leonxlnx/taste-skill |
| design-taste-frontend | on-demand | leonxlnx/taste-skill | skills/taste-skill | 6010f91a9935 | yes | flag added for on-demand; tasteskill v2 (scripts need Node and Chrome); README.md, evals/ and agents/ not vendored |
| high-end-visual-design | on-demand | Leonxlnx/taste-skill-classics | skills/soft-skill | 5e08c9383dc4 | no | moved from leonxlnx/taste-skill; upstream ships the flag; agents/ not vendored |
| image-to-code | on-demand | Leonxlnx/imagegen-skills | skills/image-to-code | beb16b0d0f4d | yes | flag added for on-demand; moved from leonxlnx/taste-skill |
| imagegen-frontend-mobile | on-demand | Leonxlnx/imagegen-skills | skills/imagegen-frontend-mobile | beb16b0d0f4d | yes | flag added for on-demand; moved from leonxlnx/taste-skill |
| imagegen-frontend-web | on-demand | Leonxlnx/imagegen-skills | skills/imagegen-frontend-web | beb16b0d0f4d | yes | flag added for on-demand; moved from leonxlnx/taste-skill |
| minimalist-ui | on-demand | Leonxlnx/taste-skill-classics | skills/minimalist-skill | 5e08c9383dc4 | no | moved from leonxlnx/taste-skill; upstream ships the flag; agents/ not vendored |
| redesign-existing-projects | on-demand | leonxlnx/taste-skill | skills/redesign-skill | b17742737e79 | yes | flag added for on-demand; retired upstream in 2.1.1 (merged into design-taste-frontend), so this copy is no longer maintained |

_Local (non-vendored) skills are not listed here: adr-writing, code-review, crwl, git-commit, fable-safe-prompt, implementation-orchestrator, marp, oss-repo-review, supervisor._
