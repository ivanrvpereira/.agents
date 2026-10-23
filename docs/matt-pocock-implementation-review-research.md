# Matt Pocock: implementation versus review

## Verdict

The current repository strongly supports separating implementation from standards enforcement and refactoring review. It does **not** support a blanket rule that implementers ignore quality or never load architecture skills. The precise rule is: keep implementers focused on building and verifying agreed work, put judgement-call standards in review, and implement the resulting fixes afterward.

Sources: the refreshed, clean local checkout at commit `b0618bc436ad893b3c5e84e55fba86586d34a404` and the transcript of the video the user later identified.

## Video confirmation

The transcript of [Fixing the PR Bottleneck — Matt Pocock, AIHero](https://www.youtube.com/watch?v=LlgiOCmFG_w) directly confirms the recollection:

- “My first piece of advice is don't put coding standards in your implementer agent.”
- “Implement, you make it work, and then code review, you actually make it good. You impose your coding standards.”
- “We use one context window to make it okay, do the red-green, and then we do another context window to refactor it.”

He explains that implementation combines exploration, code changes, and debugging, whereas a reviewer receives a diff and has more room for standards. He puts standards in `CODING_STANDARDS.md`, not global `AGENTS.md`, so the reviewer reads them. The discussion explicitly follows his explanation of deep modules and good tests. He also advocates reviewers making fixes rather than leaving only comments. These are his workflow recommendations, not measured performance results.

The qualification remains: the repository explicitly permits implementation-time consultation of `codebase-design` when the interface or test seam is unresolved. The split assigns standards enforcement and refactoring to review, not every architectural decision exclusively to review.

## Strongest support

- **Explicit role split:** “This means that the review agent should be responsible for imposing coding standards, not the implementation agent.” The reason is context pressure: implementers explore, write code, and debug; reviewers receive a diff. [retro/SKILL.md, lines 29–35](https://github.com/mattpocock/skills/blob/b0618bc436ad893b3c5e84e55fba86586d34a404/skills/engineering/retro/SKILL.md#L29-L35).
- **Explicit role-dependent loading:** “`CODING_STANDARDS.md`: this file is read during review, not implementation.” This assigns a standards document to a role, not every design skill exclusively to reviewers. [retro/SKILL.md, lines 37–44](https://github.com/mattpocock/skills/blob/b0618bc436ad893b3c5e84e55fba86586d34a404/skills/engineering/retro/SKILL.md#L37-L44).
- **Explicit refactoring split:** “**Refactoring is not part of the loop.** It belongs to the review stage (see the `code-review` skill), not the red → green implementation cycle.” [tdd/SKILL.md, lines 34–38](https://github.com/mattpocock/skills/blob/b0618bc436ad893b3c5e84e55fba86586d34a404/skills/engineering/tdd/SKILL.md#L34-L38).
- **Review identifies structural changes:** its smell baseline recommends “gather what changes together into one module” and “split so each module changes for one reason.” These are judgement calls, subordinate to repository standards. [code-review/SKILL.md, lines 38–56](https://github.com/mattpocock/skills/blob/b0618bc436ad893b3c5e84e55fba86586d34a404/skills/engineering/code-review/SKILL.md#L38-L56).

## Counterevidence and limits

- Implementers still use TDD, regular typechecks, test files, and a final full suite. Quality is not deferred wholesale. [implement/SKILL.md, lines 11–15](https://github.com/mattpocock/skills/blob/b0618bc436ad893b3c5e84e55fba86586d34a404/skills/engineering/implement/SKILL.md#L11-L15).
- TDD explicitly calls `codebase-design` when module depth, seam placement, or interface shape is in question. Architecture loading is therefore conditional during implementation, not prohibited. [tdd/SKILL.md, lines 18–26](https://github.com/mattpocock/skills/blob/b0618bc436ad893b3c5e84e55fba86586d34a404/skills/engineering/tdd/SKILL.md#L18-L26).
- The design skill says: “Use this language and these principles wherever code is being designed or restructured.” [codebase-design/SKILL.md, lines 6–8](https://github.com/mattpocock/skills/blob/b0618bc436ad893b3c5e84e55fba86586d34a404/skills/engineering/codebase-design/SKILL.md#L6-L8).
- Architecture is also upstream: specs record modules, interfaces, and architectural decisions; ticket planning says “Any prefactoring should be done first.” [to-spec/SKILL.md, lines 43–54](https://github.com/mattpocock/skills/blob/b0618bc436ad893b3c5e84e55fba86586d34a404/skills/engineering/to-spec/SKILL.md#L43-L54), [to-tickets/SKILL.md, lines 19–34](https://github.com/mattpocock/skills/blob/b0618bc436ad893b3c5e84e55fba86586d34a404/skills/engineering/to-tickets/SKILL.md#L19-L34).
- Identifying changes and making them are separate jobs. `implement-spec` says: “Fix all issues raised by the code review in a single **implementer subagent**.” [lines 27–36](https://github.com/mattpocock/skills/blob/b0618bc436ad893b3c5e84e55fba86586d34a404/skills/engineering/implement-spec/SKILL.md#L27-L36). The architecture survey likewise sends chosen refactors through the normal implementation flow. [architecture docs, lines 54–56](https://github.com/mattpocock/skills/blob/b0618bc436ad893b3c5e84e55fba86586d34a404/docs/engineering/improve-codebase-architecture.md#L54-L56).

## Documentation caveat

The README still promotes red-green-refactor, contrary to the current TDD body. The TDD documentation explicitly acknowledges that stale description and the deliberate refactoring removal. [README, lines 179–181](https://github.com/mattpocock/skills/blob/b0618bc436ad893b3c5e84e55fba86586d34a404/README.md#L179-L181), [tdd docs, lines 49–51](https://github.com/mattpocock/skills/blob/b0618bc436ad893b3c5e84e55fba86586d34a404/docs/engineering/tdd.md#L49-L51).

Read in full: implementation and spec orchestration skills, review, retro and its role instructions, architecture survey and HTML guide, codebase design and both linked deepening/design guides, TDD and both testing guides, spec/ticket planning, the in-progress TypeScript deep-module setup, relevant explanatory docs, and README. After the user supplied the video, its transcript was retrieved and read. No source-checkout edits or code changes.
