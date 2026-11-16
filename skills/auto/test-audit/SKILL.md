---
name: test-audit
description: "Writing, changing, reviewing, or sweeping tests: reject duplicate or implementation-coupled proof; remove test-only production seams."
---

# Test Audit

- The authoring gate applies to every new or changed test.
- Audits remove low-value proof in coherent owner batches. Never chase deletion counts.
- For a whole-subsystem campaign, read [CAMPAIGN.md](CAMPAIGN.md) first.

## Authoring gate

Before adding a test, answer:

1. Does it protect an observable behavior, an invariant, or an independent contract?
2. What credible regression makes it fail?
3. Why does existing proof miss it? Each contract has one primary owner, at the strongest boundary. Another layer needs a distinct transport or lifecycle risk. Extend tables and shared fixtures, and consolidate repeated setup.
4. Would this need an export, flag, wrapper, or injection hook with no production caller? Move the proof to a real boundary instead.

- Prove the contract at its owning boundary. See [Boundary and cost](#boundary-and-cost).
- A regression must fail before the fix, for the intended reason, and pass after the repair. Report when a pre-fix baseline is unavailable.
- One owner regression covers a bug. Never replay that same contract at every layer it crosses.
- A behavior-preserving refactor should not break the test.

## Boundary and cost

Prove a caller-visible contract through its production owner, with fixed external I/O and expected values that do not come from the subject. Prefer that boundary over a mocked internal decision or a whole-product boot. Name the regression the test catches and what it cannot prove.

Work in vertical slices: failing behavior, a coherent repair, then passing proof. A regression must fail on the original defect, not on fixture setup. Refactor under green tests, and preserve distinct contracts when consolidating coverage. Use synthetic content, and keep credentials out of captures.

A slow test must prove a contract no cheaper layer can. When the project measures test time or test-line growth, report those figures with the change. Inject clocks instead of sleeping, polling, or real timers. Isolate each file's state, and reuse a suite-level fixture instead of booting one per test. Import the narrow API under test, not a broad barrel.

## Junk patterns

Reject self-comparisons, copied inventories, source greps, implementation or call-shape assertions, duplicate contracts, test-only seams, subject-generated expected values, and mocks that supply the asserted behavior.

Fixtures must not fabricate the receipts or ordering the owner should produce, or claim a persistence path the code never writes.

A negative control must fail at the intended guard. The test name must match the behavior the test exercises.

When auditing candidates, use the [full checklist](references/audit.md#junk-patterns).

## Retention bar

Keep independent API, SDK, protocol, config, migration, storage, security, platform, default, prompt-byte, generated-language, package, release, architecture, and observable-ordering contracts. A test being static or slow is not a reason to delete it.

Source inspection must survive an identifier-only refactor and must guard an independent user-facing contract.

A baseline failure may be a bug to repair, not a test to delete.

## Audit and validation

Before an audit edit, read [candidate evidence and workflow](references/audit.md#candidate-evidence). Inspect the full owners, callers, and history. Record the proof that remains before any deletion.

Delete obsolete production seams along with the tests that needed them. Never optimize for deletion counts.

Follow the [proof rules](references/audit.md#proof). Do not edit the checkout while a test run is in progress. Run the owner and sibling proof, plus the checks the change requires, then review the diff.

Report causes, retained contracts, proof and cost, production versus test lines of code, and follow-ups. Commit, push, or land only when the task authorizes it.

## Attribution

Adapted from the MIT-licensed [`test-audit`](https://github.com/openclaw/openclaw/blob/918847e58888d0341ce3154f713304e00b94f7a1/.agents/skills/test-audit/SKILL.md) skill, Copyright (c) 2026 OpenClaw Foundation. The permission notice is in [LICENSE](LICENSE).
