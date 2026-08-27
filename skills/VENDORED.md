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

| Skill | Bucket | Source | Upstream path | Pinned ref | Customized | Notes |
|-------|--------|--------|---------------|-----------|-----------|-------|
| bro | on-demand | dmmulroy/.dotfiles | home/.agents/skills/bro | 287382ed4914 | no | |
| caveman | on-demand | JuliusBrussee/caveman | skills/caveman | 25d22f864ad6 | yes | flag added for on-demand |
| codebase-design | auto | mattpocock/skills | skills/engineering/codebase-design | c6b033e | no | incl. DEEPENING.md, DESIGN-IT-TWICE.md |
| code-simplifier | on-demand | HazAT/pi-config | skills/code-simplifier | d8395b7 | yes | flag added for on-demand; upstream `model: opus` pin removed |
| deep-research | on-demand | 199-biotechnologies/claude-deep-research-skill | . | f2f2c0fa4e76 | no | repo root |
| diagnosing-bugs | auto | mattpocock/skills | skills/engineering/diagnosing-bugs | 391a270 | no | incl. scripts/hitl-loop.template.sh |
| domain-modeling | auto | mattpocock/skills | skills/engineering/domain-modeling | c6b033e | no | incl. ADR-FORMAT.md, CONTEXT-FORMAT.md |
| dev-browser | auto | SawyerHood/dev-browser | skills/dev-browser | 71aa88dcc399 | yes | also a plugin (`dev-browser`); flag removed to allow auto-invocation |
| frontend-design | auto | mitsuhiko/agent-stuff | skills/frontend-design | f27c7ee2304a | yes | flag removed to allow auto-invocation |
| grill-me | on-demand | mattpocock/skills | skills/productivity/grill-me | c6b033e | no | |
| grilling | auto | mattpocock/skills | skills/in-progress/batch-grill-me | 9603c1c | yes | renamed to `grilling`; `disable-model-invocation` stripped to keep auto (wayfinder invokes it) |
| handoff | on-demand | mattpocock/skills | skills/productivity/handoff | 391a270 | no | replaced the previous local handoff |
| humanizer | on-demand | softaworks/agent-toolkit | skills/humanizer | 004c1998fffe | no | |
| i-have-adhd | auto | ayghri/i-have-adhd | skills/i-have-adhd | 72c33eee81ea | no | |
| implement | on-demand | mattpocock/skills | skills/engineering/implement | 391a270 | no | end of wayfinder → to-spec → to-tickets → implement chain |
| librarian | auto | mitsuhiko/agent-stuff | skills/librarian | d9c9e4f484d7 | no | |
| liteparse | auto | run-llama/llamaparse-agent-skills | skills/liteparse | c8a6189b121b | no | had a dup vendor `effective-liteparse` (removed) |
| ponytail | auto | DietrichGebert/ponytail | skills/ponytail | 8f32ae0f6eb0 | yes | shortened description for broad coding trigger; added 3 rules from retired `_agents.md` Core Behavior (style mirroring, comments-why, remove unused code) |
| prototype | auto | mattpocock/skills | skills/engineering/prototype | 391a270 | no | incl. LOGIC.md, UI.md |
| research | auto | mattpocock/skills | skills/engineering/research | 2ab9580 | no | vendored for wayfinder's `/research` step; Codex `agents/openai.yaml` intentionally not vendored |
| sentry | on-demand | mitsuhiko/agent-stuff | skills/sentry | e6c86e31bd30 | no | |
| setup-matt-pocock-skills | on-demand | mattpocock/skills | skills/engineering/setup-matt-pocock-skills | 391a270 | no | one-time per-repo tracker/domain-docs setup; triage skill not vendored so Section B skips |
| simple-english | auto | AminBlg/SimpleEnglish | skills/simple-english | 59bf6702197a | yes | replaced TheAngryByrd/simplified-technical-english-skill (2.2k★ upstream, full 53-rule catalog inline); description shortened; evals/, output-styles/, prompts/ not vendored |
| summarize | on-demand | mitsuhiko/agent-stuff | skills/summarize | fe35bfe1f650 | no | |
| tdd | auto | mattpocock/skills | skills/engineering/tdd | 391a270 | no | incl. tests.md, mocking.md |
| tmux | auto | mitsuhiko/agent-stuff | skills/tmux | e13c178bf88c | no | |
| teach | on-demand | mattpocock/skills | skills/productivity/teach | c6b033e | no | |
| to-spec | on-demand | mattpocock/skills | skills/engineering/to-spec | 391a270 | no | replaced to-prd (upstream unification) |
| to-tickets | on-demand | mattpocock/skills | skills/engineering/to-tickets | 2ab9580 | no | replaced to-issues (upstream unification); Codex `agents/openai.yaml` intentionally not vendored |
| vercel-composition-patterns | on-demand | vercel-labs/agent-skills | skills/composition-patterns | bf90d0a4b83e | no | |
| vercel-react-best-practices | on-demand | vercel-labs/agent-skills | skills/react-best-practices | (unpinned) | no | capture ref on next sync |
| wayfinder | on-demand | mattpocock/skills | skills/engineering/wayfinder | 2ab9580 | no | needs tracker config from setup-matt-pocock-skills; references upstream `/research` skill (not vendored); Codex `agents/openai.yaml` intentionally not vendored |
| web-design-guidelines | on-demand | vercel-labs/agent-skills | skills/web-design-guidelines | 3116f3e62dbd | no | |
| writing-great-skills | on-demand | mattpocock/skills | skills/productivity/writing-great-skills | 391a270 | no | replaced local `skill-creator` |
| brandkit | on-demand | leonxlnx/taste-skill | skills/brandkit | b17742737e79 | yes | flag added for on-demand |
| design-taste-frontend | on-demand | leonxlnx/taste-skill | skills/taste-skill | b17742737e79 | yes | flag added for on-demand |
| high-end-visual-design | on-demand | leonxlnx/taste-skill | skills/soft-skill | b17742737e79 | yes | flag added for on-demand |
| image-to-code | on-demand | leonxlnx/taste-skill | skills/image-to-code-skill | b17742737e79 | yes | flag added for on-demand |
| imagegen-frontend-mobile | on-demand | leonxlnx/taste-skill | skills/imagegen-frontend-mobile | b17742737e79 | yes | flag added for on-demand |
| imagegen-frontend-web | on-demand | leonxlnx/taste-skill | skills/imagegen-frontend-web | b17742737e79 | yes | flag added for on-demand |
| minimalist-ui | on-demand | leonxlnx/taste-skill | skills/minimalist-skill | b17742737e79 | yes | flag added for on-demand |
| redesign-existing-projects | on-demand | leonxlnx/taste-skill | skills/redesign-skill | b17742737e79 | yes | flag added for on-demand |

_Local (non-vendored) skills are not listed here: agents-md, code-review,
crwl, git-commit, marp._
