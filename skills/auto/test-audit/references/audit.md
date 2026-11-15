# Audit workflow

- Use this after the [authoring gate](../SKILL.md#authoring-gate).
- A whole-subsystem campaign also requires [CAMPAIGN.md](../CAMPAIGN.md).

## Junk patterns

Reject a new match unless the [retention bar](#retention-bar) identifies an independent contract. When auditing existing matches, reject:

- Assertion-free probes, self-comparisons, identity copiers, and subject-generated expected values.
- Copied inventories, manifests, and export lists. Exact source, import, or string greps.
- Private-predicate or call-shape tests that duplicate boundary proof. Repeated invocations, or provider-local replays, of a shared helper.
- Test-only exports, globals, and wrappers. Production paths that only tests call.
- Mocks that implement the asserted behavior, or that pretend distinct APIs match.
- Fixtures that supply receipts, admission, or callback ordering the owner should produce. Persistence asserted against a store path the code never writes.
- Capability flags asserted instead of the promised delivery or acknowledgement.
- Negative controls that pass on an unrelated guard, or on an unreachable rejection.
- Names that promise behavior the inputs and assertions never exercise.

## Retention bar

- Keep an independent public API, SDK, protocol, config, migration, storage, security, platform, default, prompt-byte, generated cross-language, package, release, or architecture contract. Keep observable ordering and credible regressions.
- Source inspection is valid when it is the cheapest independent guard of a user-facing key, byte, or path, and it survives an identifier-only refactor.
- Static or slow is not a deletion reason. A baseline failure may be a product bug: reproduce it and repair the owner. Never delete the test for that.

## Candidate evidence

Before editing, read the full test, the production owner, the entry point, callers, callees, siblings, overlapping proof, CI routing, and history. For a claim about a dependency, inspect that dependency's source or types. Read root and scoped instructions.

Record each candidate's:

- Exact name and location, and the failure that would detect a break.
- Non-test callers of the production or support seam the test covers.
- The stronger owner proof that remains, or why none is needed.
- The history and reason it exists, and the deletion it unlocks.
- The risk, and the focused validation command.

Missing evidence means no deletion. Discovery is read-only. Report before edits. Prefer a few high-confidence candidates. Parallel discovery may split independent owners.

Delete obsolete seams and dead paths. Move a retained regression to its owner. Consolidate generic package and dependency contracts.

Prefer a net reduction in production lines. Never add a replacement implementation test, and never turn uncertainty into cleanup.

## Proof

Prove the changed contract. Run the owner tests and their siblings with the project's test runner, plus targeted typecheck, lint, and format when the project has them. Leave the broad suite to CI unless a named risk is still unresolved. Do not rerun or re-push only to chase a green check. Fix real failures. Broaden or repeat proof only when inputs changed, a check failed, or a named risk is unresolved. Report every check you did not run.

Prove user-visible behavior through the real flow when that is feasible. A contract with an external service needs live proof, or an explicit note that live proof is still pending. A docs-only change needs the docs checks and `git diff --check`, not a runtime suite.

Do not edit the checkout while a test run is in progress. Isolate test state, and do not run tests against real operator data unless the task says so. If two test commands would share a mutable cache or a port, give each its own, or run them one at a time.

## Validation and handoff

- When a removal deletes a source grep or a plan assertion, exercise the owning executable or its dry-run.
- Run the project's targeted format check and `git diff --check`. Classify which project checks cover the changed paths, and run those.
- Before landing a removal batch, run the project's unused-dependency, unused-file, and unused-export checks. Removed tests orphan support files and exports that ordinary test CI misses.
- Inspect `git diff --numstat`. Review the full diff.
- Report causes, removed categories and seams, retained false positives, proof and its cost, production versus test and support lines, PR state, and follow-ups.
- Commit, push, or land only when the task authorizes it.
- Refresh from main and rediscover before another audit batch.
