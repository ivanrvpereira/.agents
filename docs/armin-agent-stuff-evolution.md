# Armin Ronacher’s agent-stuff: evolution and vendored baseline

## Executive summary

**The repository did not abandon Pi extensions.** It retained the six extensions vendored here, added delegation and image tools, and continued fixes through September 27, 2026. The current source contains **19 extensions, 18 skills, one prompt command, and three themes**. Since the July 13 baseline, extensions increased from 17 to 19 and skills decreased from 19 to 18. [Current source][tree] · [July baseline][july-tree] · [latest commit][head]

**The important local change is `frontend-design`: upstream explicitly deleted it on September 5.** The four other vendored skills remain byte-identical to their registered upstream subtree snapshots. `prompt-editor.ts` also remains upstream, with substantive August and September changes. Its local removal was not an upstream removal. [Frontend deletion][frontend-delete] · [mode restoration][mode-restore] · [rendering changes][rendering]

**Several older files disappeared through consolidation or replacement, not blanket abandonment.** `reveal`/`diff` became `files`, `issues` became `todos`, `loop` gave way to `goal`, and `multi-edit` gave way to `unified-edit`. Only `qna` and `cwd-history` have explicit deprecation evidence in the reviewed history. [Files consolidation][files-merge] · [todo rename][todos-rename] · [goal replacement][goal-replace] · [edit replacement][edit-replace] · [Q&A deprecation][qna-delete] · [cwd deprecation][prompt-add]

**No reviewed primary source proves that these removals migrated into Pi core.** The verified ownership/package change concerns Earendil and Mario, not Armin joining Pi in September. The repository’s May 7 namespace migration matches that announcement. Chronology does not prove that ownership caused later feature deletions. [Ownership announcement][earendil] · [Armin’s account][armin-post] · [Pi namespace announcement][pi-home] · [namespace migration][namespace]

## Scope and method

Research date: **2026-10-02 UTC**. Default-branch HEAD: **`0865c849befd2021490679f96a8dee58c84ac857`**, committed **2026-09-27T21:10:38Z**. GitHub reports `pushedAt: 2026-09-27T21:10:45Z` and `isArchived: false`. This note covers all **256 commits reachable from this HEAD**, from the November 2, 2025 initial commit. It does not treat unmerged pull requests or commits on other branches as current features. Calendar dates below use the commit author’s recorded date. [Initial commit][initial] · [HEAD][head]

The cached checkout at `/Users/ivanpereira/.cache/checkouts/github.com/mitsuhiko/agent-stuff` was refreshed with `/Users/ivanpereira/.agents/skills/auto/librarian/checkout.sh --force-update`. Investigation used local git history, rename-aware diffs, current source, README, CHANGELOG, and `gh repo view` / `gh api`. GitHub was not scraped. No upstream files, local configurations, or vendored copies were changed. Extension behavior is source-established, not runtime-tested.

The current README is incomplete: it still lists the deleted `frontend-design` skill and omits `audio-transcription` and `view-image.ts`. Inventory counts therefore use the actual HEAD tree and manifest, not README bullets. The manifest exports `extensions/*.ts`, `skills`, `themes`, and `commands`. Its version remains `1.6.0`; this note does not verify what npm currently distributes. [README][readme] · [manifest][manifest] · [actual tree][tree]

## What changed relative to our vendored files?

### Extensions

The parent investigation verified that the six local copies match their registered pinned contents. The comparisons below are upstream file comparisons, not assumptions based on the date of a local sync.

| Local extension | Registered upstream snapshot | Upstream status at HEAD |
|---|---|---|
| `answer.ts` | `4bce45560fa5`, July 13, 2026 | Still present. No file-content change since this snapshot. |
| `btw.ts` | `4bce45560fa5` | Still present. No file-content change since this snapshot. |
| `review.ts` | `4bce45560fa5` | Still present. No file-content change since this snapshot. |
| `todos.ts` | `4bce45560fa5` | Still present. No file-content change since this snapshot. |
| `files.ts` | `13bc8f87970b`, August 10, 2026 | Still present. No subsequent file-content change. This snapshot already removed Ctrl+Shift+F. |
| `session-breakdown.ts` | `13bc8f87970b` | Still present. September 27 corrects model/session attribution. |

Evidence: [July-to-HEAD comparison][july-compare], [August-to-HEAD comparison][august-compare], [August shortcut removal][files-shortcut], and [September attribution fix][head]. Unchanged source does not establish compatibility with every newer Pi release or prove abandonment.

The September attribution fix stops model-selection events from counting as actual model use. A model counts only after a qualifying message, and sessions without model responses are excluded. This prevents unused default models from inflating session counts and model shares. [Diff][head]

Relative to the older July baseline, `session-breakdown` also gained a cost-per-session column, provider grouping, a `p` toggle to split providers, and taller model/cwd tables on July 25. These changes already exist in the registered August snapshot. [July usage change][usage-grouping]

**Local `prompt-editor` removal is separate from upstream history.** The parent reports local commit `455a882` on July 29, after vendoring it at the July snapshot. Upstream kept the extension. On August 30, explicit successful mode selections became persistent across fresh sessions. On September 4, its custom editor adopted embedded working status and preserved spinner/scroll content with width-aware mode labels. No reviewed source establishes a migration of the whole extension into core. [Mode persistence diff][mode-restore] · [Rendering diff][rendering] · [current source][prompt-source]

### Skills: the five registered upstream snapshots

**These five abbreviated identifiers are Git tree objects, not commit IDs.** They identify skill-directory contents. A failed `git show <pin>:skills/<name>/SKILL.md` does not prove a mismatch or a historic path migration. The correct comparison is `<pin>` against `HEAD:skills/<name>`. Object types and subtree hashes were verified directly in the refreshed checkout.

| Vendored skill | Registered subtree snapshot | Verified upstream evolution |
|---|---|---|
| `frontend-design` | `f27c7ee2304a` | Added January 29. Its directory remained identical to this subtree until deletion on September 5. The deletion commit’s title explicitly rejects the skill, but supplies no detailed rationale. The local auto-invocation customization is separate. [Addition][frontend-add] · [deletion][frontend-delete] |
| `librarian` | `d9c9e4f484d7` | Added March 1. Current subtree equals the pin exactly. Cached partial clones, throttled refresh, and safe fast-forward behavior remain. [Addition][librarian-add] · [source][librarian-source] |
| `sentry` | `e6c86e31bd30` | Current subtree equals the pin exactly. December additions expanded issue/event/log workflows and slug-to-ID resolution. Its last subtree change is December 28, 2025, not evidence of deprecation. [Expansion][sentry-expand] · [slug resolution][sentry-slugs] · [source][sentry-source] |
| `summarize` | `fe35bfe1f650` | Current subtree equals the pin exactly. Added February 6, improved temporary-file handling February 7, and corrected PDF handling March 9. The pin already includes these changes. [Addition][summarize-add] · [temporary files][summarize-temp] · [PDF fix][summarize-pdf] · [source][summarize-source] |
| `tmux` | `e13c178bf88c` | Current subtree equals the pin exactly. Added November 21, 2025. December 22 renamed helper directories from `tools` to `scripts` and adjusted instructions. Low activity is not a removal or deprecation. [Addition][tmux-add] · [directory rename][scripts-rename] · [source][tmux-source] |

There are **five**, not six, skills in this comparison. Four remain exact upstream subtree matches. The fifth is an explicitly removed upstream skill.

## Dated milestones: origin to current HEAD

| Period | Grounded milestone |
|---|---|
| November–December 2025 | The initial repository held prompt workflows for handoff, pickup, release, and changelog work. Web browsing, tmux, Sentry, GitHub, Ghidra, and Pi themes followed. This was broader agent material before the current Pi-package layout. [Initial source][initial] · [browser addition][browser-add] · [tmux addition][tmux-add] · [Sentry addition][sentry-add] · [Ghidra addition][ghidra-add] |
| January 2026 | `qna` and `/ask` started as hooks. `/ask` became `/answer` on January 3. Hooks moved to `pi-extensions` on January 5. Review, file reveal, loops, todo management, and opt-in session control followed. January 25 introduced the npm package manifest. [Answer rename][answer-rename] · [extension migration][hooks-migrate] · [packaging][package-add] · [control addition][control-add] |
| Late January–February | File browsing consolidated into `files`. Commit/changelog guidance moved from prompt stubs to skills. Q&A and cwd-history removals carried explicit deprecation evidence. Prompt modes, session usage views, folder reviews, loop-fixing reviews, Google Workspace, Apple Mail, summarize, and native web search expanded the package. [Consolidation][files-merge] · [skill conversion][commit-skills] · [prompt modes][prompt-add] · [release history][changelog] |
| March–April | Batched editing acquired patch/preflight support and ordering fixes. BTW gained full main-context seeding, Markdown, tool visibility, and lazy session creation. Ghostty split-fork arrived. The April 14 restructuring moved all 16 existing extensions from `pi-extensions/` to `extensions/` without content changes. April 29 removed `context.ts`. [Edit preflight][edit-preflight] · [BTW change][btw-change] · [lazy creation][btw-lazy] · [split-fork][split-add] · [path move][restructure] · [context removal][context-delete] |
| May–June | May 7 updated Pi imports to `@earendil-works`. Goals arrived May 9. June added macOS sleep prevention and owner-based GitHub trust. Distribution packages and `go-to-bed` disappeared June 14. June 20 replaced loops with session-log-backed goals. June 21 added `/discuss` and removed Mermaid/release plumbing. [Namespace change][namespace] · [goal addition][goal-add] · [no-sleep][sleep-add] · [trust][trust-add] · [distribution removal][distribution-delete] · [goal replacement][goal-replace] · [June cleanup][june-cleanup] |
| July–September | July 3 replaced `multi-edit` with `unified-edit` and added audio transcription. July 13 added idle-only continuation. July 26 added serial tmux-backed subagents. September 4 added `view_image` and improved prompt rendering. September 5 removed frontend design. Browser lifecycle safety improved September 6. September 27 corrected usage attribution. [Unified edit/audio][edit-replace] · [continue][july-pin] · [subagent][subagent-add] · [image/rendering][rendering] · [frontend deletion][frontend-delete] · [browser lifecycle][browser-stop] · [latest fix][head] |

## Removals, renames, and replacements

### Extension status, with intent separated from observation

| Old file or name | Date | Classification and evidence |
|---|---|---|
| `pi-hooks/ask.ts` | January 3 | Renamed to `answer.ts`, not abandoned. [Rename][answer-rename] |
| `pi-hooks/*`, later `pi-extensions/*` | January 5 / April 14 | API/layout migrations. The April move preserves all 16 extension files exactly. [Hooks migration][hooks-migrate] · [layout move][restructure] |
| `issues.ts` | January 25 | Renamed/reworked as `todos.ts`. [Rename][todos-rename] |
| `codex-tuning.ts` | January 25 | Explicit non-use: commit says “Remove codex-tuning I no longer use.” Not a documented core migration. [Removal][codex-delete] |
| `commit.ts` | January 25 | Deleted. Commit guidance later reappeared as a prompt and then a skill, not the same approval tool. No explicit deprecation label. [Deletion][commit-delete] · [skill addition][commit-skills] |
| `reveal.ts`, `diff.ts` | January 30 | Consolidated into `files.ts`. [Merge][files-merge] |
| `qna.ts` | January 30 | Explicitly deprecated and deleted. `answer` remained as the interactive Q&A implementation. [Deletion and changelog][qna-delete] |
| `cwd-history.ts` | February 8 | Explicitly deprecated and deleted in the same commit that introduced prompt-editor with prompt history. [Commit body and diff][prompt-add] |
| `context.ts` | April 29 | Deleted, with its README/changelog entry removed. The commit gives no explicit deprecation rationale or linked core replacement. [Deletion][context-delete] |
| `go-to-bed.ts` | June 14 | Deleted alongside distribution packages. `no-sleep` remains, but it prevents OS sleep rather than enforcing a late-night work policy. These are different functions, not a proven replacement. [Deletion][distribution-delete] · [sleep-prevention source][sleep-source] |
| `loop.ts` | June 20 | Explicitly replaced by session-backed goals. Goal state replays from custom session entries and supports automatic continuation, status controls, and token budgets. [Replacement][goal-replace] · [source][goal-source] |
| `multi-edit.ts` | July 3 | Replaced by `unified-edit.ts`, with a changed `edit` interface: a single text payload for marked row edits or Codex-style patches. Not merely a filename rename. [Replacement diff][edit-replace] · [current source][edit-source] |

### Removed skills and commands

Four skill directories were removed across the reviewed main history: `google-meet` on January 24, `improve-skill` on January 30, `mermaid` on June 21, and `frontend-design` on September 5. None of these deletion commits supplies evidence of migration into Pi core. Google Workspace arrived later, but the history does not explicitly identify it as the replacement for the short-lived Meet skill. [Meet removal][meet-delete] · [improve-skill removal][improve-delete] · [Mermaid removal][june-cleanup] · [frontend removal][frontend-delete] · [Workspace addition][workspace-add]

Handoff and pickup commands disappeared January 29. Commit and changelog prompt stubs disappeared January 30 after equivalent guidance moved into skills. Release plumbing disappeared June 21, when `/discuss` arrived. These changes shift reusable guidance toward skills and retain one planning prompt. [Handoff/pickup removal][handoff-delete] · [skills addition][commit-skills] · [stub removal][stubs-delete] · [planning prompt/cleanup][june-cleanup]

## Complete current inventory

The following groups account for every extension and skill in the HEAD tree. Grouping is for readability, not an upstream category system. Source directories and the manifest establish availability. [Extensions][extensions-tree] · [skills][skills-tree] · [manifest][manifest]

### Extensions: 19

| Group | Files and purpose |
|---|---|
| Conversation and editor (5) | `answer.ts`: interactive Q&A extraction. `btw.ts`: side chat with main-context seeding and optional summary injection. `continue.ts`: idle-only Shift+Alt+Enter continuation. `prompt-editor.ts`: `/mode`, model/thinking presets, persistence, history, and editor labels. `whimsical.ts`: randomized working messages. |
| Review, files, and images (4) | `review.ts`: uncommitted/branch/commit/PR/folder reviews and return flow. `files.ts`: git/session file browser, reveal actions, and Quick Look. `unified-edit.ts`: replacement `edit` tool with preflight validation. `view-image.ts`: `view_image` tool that reuses Pi’s read-tool definition and inline-image renderer. |
| Task execution and session coordination (5) | `todos.ts`: file-backed `todo` tool and `/todos` TUI. `goal.ts`: session-backed objectives and continuation. `control.ts`: opt-in session sockets, control CLI flags, `send_to_session`, and `list_sessions`. `subagent.ts`: observable serial delegation through tmux. `split-fork.ts`: a new Pi process in a Ghostty right split. |
| Usage and desktop behavior (3) | `session-breakdown.ts`: interactive session/message/token/cost views. `notify.ts`: terminal desktop notifications when the agent finishes. `no-sleep.ts`: macOS `caffeinate` control. |
| Environment policy (2) | `uv.ts`: replacement bash tool plus Python/package-manager shims and non-uv workflow blocking. `trust-github-repos.ts`: remembered project trust for origin remotes owned by `earendil-works` or `mitsuhiko`. |

The **two extensions added after the July snapshot** are `subagent.ts` and `view-image.ts`. Subagents are deliberately serialized: only one child works at a time. They inherit provider/model/thinking unless overridden, expose live tmux output and an attach command, and preserve full child sessions. This is not a parallel-agent orchestrator. `view_image` is a new wrapper around an existing Pi capability, not evidence that an old extension moved into core. [Subagent addition/source][subagent-add] · [image addition/source][rendering]

### Skills: 18

| Group | Complete skill names |
|---|---|
| Development and workflow (6) | `commit`, `update-changelog`, `github`, `librarian`, `tmux`, `uv` |
| Web, documents, and transcripts (5) | `web-browser`, `native-web-search`, `summarize`, `pi-share`, `audio-transcription` |
| Applications and diagnostics (3) | `apple-mail`, `google-workspace`, `sentry` |
| Specialized local tools and transport (4) | `ghidra`, `openscad`, `anachb`, `oebb-scotty` |

The newer skill direction is concrete, tool-backed personal workflows, not wholesale removal of skills. Examples include cached repository checkouts, authenticated Workspace scripts, document conversion, and local MLX Whisper transcription. The audio skill has machine-specific paths and Apple Voice Memos handling, so it requires adaptation outside Armin’s environment. This interpretation follows the source inventory, not a stated general roadmap. [Skills tree][skills-tree] · [audio source][audio-source] · [README scope warning][readme]

Browser automation continued substantial development: mobile emulation/profile isolation in April, statement evaluation in May, optional headless Chrome in July, disabled Chrome extensions in headless mode in August, and shared-profile protection plus an explicit stop command in September. These are browser-skill changes, not removals of Pi extensions. [Mobile/profile changes][browser-mobile] · [evaluation fix][browser-eval] · [headless mode][browser-headless] · [headless safety][browser-headless-safety] · [stop/profile protection][browser-stop]

Other exported resources are `/discuss` and `dayowl.json`, `modern-dark.json`, and `nightowl.json`. Supporting resources include Python shims and the edit-invocation analyzer. [Current tree][tree] · [manifest][manifest]

## Pi ownership, core migration, and evidence limits

The April 8 first-party announcements describe **Earendil acquiring Pi and Mario joining Earendil**. Armin’s own post describes Pi joining his company. This is not evidence that Armin newly joined Pi core in September. The May 7 Pi announcement describes repository/npm relocation, principally a naming/ownership change with the same development direction. [Earendil announcement][earendil] · [Armin’s post][armin-post] · [Pi announcement][pi-home]

The matching agent-stuff commit on May 7 updates imports, peer dependencies, and native-web-search package references to `@earendil-works`. That is demonstrable adaptation to Pi’s new package namespace. The April restructuring and later deletions are chronologically nearby or subsequent, but their commits do not establish ownership as the cause. [Namespace diff][namespace] · [restructuring][restructure]

In particular, **`context.ts` being absent does not prove that its feature migrated to Pi core**. The same applies to `qna`, cwd-history, and go-to-bed. Their deletion evidence supports only the classifications above. Prompt-editor’s September use of `CustomEditor` working status and view-image’s reuse of read renderers show integration with core APIs, not retirement of those extensions. [Context deletion][context-delete] · [Q&A deletion][qna-delete] · [cwd deletion][prompt-add] · [September source diff][rendering]

The reviewed agent-stuff commit messages do not link a core migration PR for these removals. This note therefore does not claim a destination in core. It also does not claim that unchanged extensions are fault-free: presence, maintenance intent, and runtime compatibility are separate questions.

## Reproducible comparisons

```sh
repo=/Users/ivanpereira/.cache/checkouts/github.com/mitsuhiko/agent-stuff
git -C "$repo" rev-parse HEAD origin/main
git -C "$repo" rev-list --count HEAD
git -C "$repo" log --reverse --format='%H %aI %s' HEAD
git -C "$repo" log --name-status --find-renames HEAD
git -C "$repo" diff 4bce45560fa5 HEAD -- extensions/answer.ts extensions/btw.ts extensions/review.ts extensions/todos.ts
git -C "$repo" diff 13bc8f87970b HEAD -- extensions/files.ts extensions/session-breakdown.ts
git -C "$repo" diff d9c9e4f484d7 HEAD:skills/librarian
git -C "$repo" diff e6c86e31bd30 HEAD:skills/sentry
git -C "$repo" diff fe35bfe1f650 HEAD:skills/summarize
git -C "$repo" diff e13c178bf88c HEAD:skills/tmux
git -C "$repo" rev-parse a571b86^:skills/frontend-design
gh repo view mitsuhiko/agent-stuff --json pushedAt,isArchived,defaultBranchRef
```

The four subtree diffs and the four July-pinned extension diffs produce no changes. The pre-deletion frontend subtree resolves to `f27c7ee2304a7a15f20654f533d6d878acdf488a`.

[tree]: https://github.com/mitsuhiko/agent-stuff/tree/0865c849befd2021490679f96a8dee58c84ac857
[head]: https://github.com/mitsuhiko/agent-stuff/commit/0865c849befd2021490679f96a8dee58c84ac857
[readme]: https://github.com/mitsuhiko/agent-stuff/blob/0865c849befd2021490679f96a8dee58c84ac857/README.md
[manifest]: https://github.com/mitsuhiko/agent-stuff/blob/0865c849befd2021490679f96a8dee58c84ac857/package.json
[changelog]: https://github.com/mitsuhiko/agent-stuff/blob/0865c849befd2021490679f96a8dee58c84ac857/CHANGELOG.md
[extensions-tree]: https://github.com/mitsuhiko/agent-stuff/tree/0865c849befd2021490679f96a8dee58c84ac857/extensions
[skills-tree]: https://github.com/mitsuhiko/agent-stuff/tree/0865c849befd2021490679f96a8dee58c84ac857/skills
[july-tree]: https://github.com/mitsuhiko/agent-stuff/tree/4bce45560fa55ace2f5dc8634a63a2af464ddc8b
[july-pin]: https://github.com/mitsuhiko/agent-stuff/commit/4bce45560fa55ace2f5dc8634a63a2af464ddc8b
[july-compare]: https://github.com/mitsuhiko/agent-stuff/compare/4bce45560fa55ace2f5dc8634a63a2af464ddc8b...0865c849befd2021490679f96a8dee58c84ac857
[august-compare]: https://github.com/mitsuhiko/agent-stuff/compare/13bc8f87970bec8830aab0f1c0487d35aa7c0917...0865c849befd2021490679f96a8dee58c84ac857
[initial]: https://github.com/mitsuhiko/agent-stuff/commit/88dd83642421942cc0f6237bc9f4016d278be2e0
[frontend-delete]: https://github.com/mitsuhiko/agent-stuff/commit/a571b86f70fed288fb9419fe5f6171f48b66a402
[mode-restore]: https://github.com/mitsuhiko/agent-stuff/commit/3c891a9640f80c271ccc666ab7a39f9811bc3fb6
[rendering]: https://github.com/mitsuhiko/agent-stuff/commit/4fb0c7d68c87c3612af6289f72b5d90a11a726b8
[files-shortcut]: https://github.com/mitsuhiko/agent-stuff/commit/13bc8f87970bec8830aab0f1c0487d35aa7c0917
[usage-grouping]: https://github.com/mitsuhiko/agent-stuff/commit/ab1e7f3414e4c8aa54a3eda0a3c634c32d3794f0
[subagent-add]: https://github.com/mitsuhiko/agent-stuff/commit/d265b8ef32f896d3ef3bc6a45bd7b8e0d02150e0
[files-merge]: https://github.com/mitsuhiko/agent-stuff/commit/7125b423366dac08f2885a231020107f128a0663
[todos-rename]: https://github.com/mitsuhiko/agent-stuff/commit/08be42e39e46dc0da9d8aa10f51584e69c39f1b0
[goal-replace]: https://github.com/mitsuhiko/agent-stuff/commit/ac79012425c315ce545a8b2564f866c803d619c8
[edit-replace]: https://github.com/mitsuhiko/agent-stuff/commit/274fe04b8a3b73e7df7e6825b1332da8ee38d776
[qna-delete]: https://github.com/mitsuhiko/agent-stuff/commit/9de2e32af99ca2ab52a51d970f84d0464be15570
[prompt-add]: https://github.com/mitsuhiko/agent-stuff/commit/1ece63ba590eec9aec4df7c69d66384b181b9b14
[prompt-source]: https://github.com/mitsuhiko/agent-stuff/blob/0865c849befd2021490679f96a8dee58c84ac857/extensions/prompt-editor.ts
[librarian-source]: https://github.com/mitsuhiko/agent-stuff/tree/0865c849befd2021490679f96a8dee58c84ac857/skills/librarian
[sentry-source]: https://github.com/mitsuhiko/agent-stuff/tree/0865c849befd2021490679f96a8dee58c84ac857/skills/sentry
[summarize-source]: https://github.com/mitsuhiko/agent-stuff/tree/0865c849befd2021490679f96a8dee58c84ac857/skills/summarize
[tmux-source]: https://github.com/mitsuhiko/agent-stuff/tree/0865c849befd2021490679f96a8dee58c84ac857/skills/tmux
[audio-source]: https://github.com/mitsuhiko/agent-stuff/blob/0865c849befd2021490679f96a8dee58c84ac857/skills/audio-transcription/SKILL.md
[frontend-add]: https://github.com/mitsuhiko/agent-stuff/commit/ebbb8ac40a1344fb1ac6a77457d8c691a4018d8e
[librarian-add]: https://github.com/mitsuhiko/agent-stuff/commit/0ad04e3302f30198bf31d4c8b4ba7b5d1d5f6714
[sentry-expand]: https://github.com/mitsuhiko/agent-stuff/commit/3b5056c712b4aef9128dc26d910495b2dce25ccd
[sentry-slugs]: https://github.com/mitsuhiko/agent-stuff/commit/d14cc180e4597110219be127a3a18ff23a5098f1
[summarize-add]: https://github.com/mitsuhiko/agent-stuff/commit/1b8d6f825c641eff7367aa169a04eddc1c76b2fe
[summarize-temp]: https://github.com/mitsuhiko/agent-stuff/commit/e774fe575a87abddc5991ea3f5550570e5cd8642
[summarize-pdf]: https://github.com/mitsuhiko/agent-stuff/commit/d8deae52e60f7bc03a08cc4c9b35dba7b96b8697
[tmux-add]: https://github.com/mitsuhiko/agent-stuff/commit/365ccbdee8515d8c9bfca8f1e7c49bb13e288cbf
[scripts-rename]: https://github.com/mitsuhiko/agent-stuff/commit/7b9f32efa00c4d90b5dc1480f3d472f38769bcdd
[browser-add]: https://github.com/mitsuhiko/agent-stuff/commit/a1227497a989944180aa77a48f78667384e2b852
[sentry-add]: https://github.com/mitsuhiko/agent-stuff/commit/79bb3b7e55a1091c9cd9e358ce48a0ba1fb1d0c0
[ghidra-add]: https://github.com/mitsuhiko/agent-stuff/commit/a124e5da3b4d0bcdf0e423d09f829551893be4ad
[answer-rename]: https://github.com/mitsuhiko/agent-stuff/commit/e12fe1c1533915bed3e90e79bec7f6d19243ec22
[hooks-migrate]: https://github.com/mitsuhiko/agent-stuff/commit/dbf9bdaa3635853d523e5aba21fdcfdd81000509
[package-add]: https://github.com/mitsuhiko/agent-stuff/commit/1457954f0d9046c3954f82a5e84d05e72a52b84e
[control-add]: https://github.com/mitsuhiko/agent-stuff/commit/139d41313247b31ab479d396095a0c717f5acf7c
[commit-skills]: https://github.com/mitsuhiko/agent-stuff/commit/2cd6af9af8265c0571febbb417ba520717f6196f
[edit-preflight]: https://github.com/mitsuhiko/agent-stuff/commit/eaef3463668b24c19d3ad37f483bf5d8fe658788
[btw-change]: https://github.com/mitsuhiko/agent-stuff/commit/933717baf69bb9e5ad4b87a568eb68288018094e
[btw-lazy]: https://github.com/mitsuhiko/agent-stuff/commit/6ef442a22838d9e173613dd10c711a2b47933d00
[split-add]: https://github.com/mitsuhiko/agent-stuff/commit/7ca2deb75f4a1853bad7d93416c72838080c5e55
[restructure]: https://github.com/mitsuhiko/agent-stuff/commit/2b70e8d53647c1e0277bd54dbbb2519cb5bea92b
[context-delete]: https://github.com/mitsuhiko/agent-stuff/commit/b861028c706edf3e3f983cde09dd8cc8549ec948
[namespace]: https://github.com/mitsuhiko/agent-stuff/commit/a3f8ab1108a48fec9e175f6cd5d9aaa4694ce29d
[goal-add]: https://github.com/mitsuhiko/agent-stuff/commit/ab79f98104bcd3c6a7c5491e609f6d6700a7414d
[sleep-add]: https://github.com/mitsuhiko/agent-stuff/commit/e31251dc0ff257e50ab74d31e6fa812913e0f579
[trust-add]: https://github.com/mitsuhiko/agent-stuff/commit/c68c84c31dc9db46238888db7b5cd44afd971d7a
[distribution-delete]: https://github.com/mitsuhiko/agent-stuff/commit/19abb5afc61269d1ddbec39047a9e93faa70bd0d
[june-cleanup]: https://github.com/mitsuhiko/agent-stuff/commit/f1c881db21a9ec53977ff8379b74e64e290fef93
[codex-delete]: https://github.com/mitsuhiko/agent-stuff/commit/e9f6d98c3ae8e86dbd38a2ddfb43429a83f18033
[commit-delete]: https://github.com/mitsuhiko/agent-stuff/commit/a5cfb5a31c4d839ad7284a44a634f439bf9a805d
[meet-delete]: https://github.com/mitsuhiko/agent-stuff/commit/5cfc85e6201c36fd6f376b72d0bf894531f36c75
[improve-delete]: https://github.com/mitsuhiko/agent-stuff/commit/3cc092d5446713f03658ef20acf75ddeaad93841
[workspace-add]: https://github.com/mitsuhiko/agent-stuff/commit/429b3cf28d4596768850d78e18d0d258702bab51
[handoff-delete]: https://github.com/mitsuhiko/agent-stuff/commit/3b82ab73ee9ff1f1ef57293c4aa587bfcbd7a8c5
[stubs-delete]: https://github.com/mitsuhiko/agent-stuff/commit/a4ce9e24570c8c0333757fb5b7820fb664bf0b75
[sleep-source]: https://github.com/mitsuhiko/agent-stuff/blob/0865c849befd2021490679f96a8dee58c84ac857/extensions/no-sleep.ts
[goal-source]: https://github.com/mitsuhiko/agent-stuff/blob/0865c849befd2021490679f96a8dee58c84ac857/extensions/goal.ts
[edit-source]: https://github.com/mitsuhiko/agent-stuff/blob/0865c849befd2021490679f96a8dee58c84ac857/extensions/unified-edit.ts
[browser-mobile]: https://github.com/mitsuhiko/agent-stuff/commit/29bcb2db8afb4ab68850e169471a6912c14d9df6
[browser-eval]: https://github.com/mitsuhiko/agent-stuff/commit/39e6911d27f0733687560e971a7455ce2ef07cc1
[browser-headless]: https://github.com/mitsuhiko/agent-stuff/commit/cc4b711dc6a2bee2aefb89820600e38291500543
[browser-headless-safety]: https://github.com/mitsuhiko/agent-stuff/commit/07e6aa51290c2647933c89e809968ec65885b056
[browser-stop]: https://github.com/mitsuhiko/agent-stuff/commit/122e2994adddb113c04764c5697217dae120fcc6
[earendil]: https://earendil.com/posts/announcing-pi-and-lefos/
[armin-post]: https://lucumr.pocoo.org/2026/4/8/mario-and-earendil/
[pi-home]: https://pi.dev/news/2026/5/7/pi-has-a-new-home
