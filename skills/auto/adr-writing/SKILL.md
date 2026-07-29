---
name: adr-writing
description: Write and maintain high-signal, low-noise ADRs. Use when writing or revising an ADR, amending or superseding old ADRs after a decision changes, recording a rejected alternative, or deciding where a decision, prohibition, or rule should live (ADR vs spec vs AGENTS.md).
---

# ADR Writing

ADRs record decisions and their reasoning. Everything else is noise that misleads future readers — especially agents, which pattern-match documented names as things to implement and stale claims as current truth.

For *when* a decision deserves an ADR and the minimal template, see `../domain-modeling/ADR-FORMAT.md` (hard to reverse + surprising + real trade-off). This skill is about what goes in, what stays out, and how ADRs age.

## Two document types — never mixed

- **ADRs are history.** Append-only. They may discuss the past, rejected options, and superseded claims.
- **Specs, AGENTS.md, README are current truth.** Present tense only. What exists, what the rules are. No "we used to", no "we considered", no removed features. If a current-truth doc needs history, that history belongs in an ADR and the doc gets a link at most.

After any decision changes, grep all docs for names of the removed/changed thing. A dead feature mentioned in a spec is a bug.

## Two kinds of hard lines — always distinguish

1. **Invariants** — rules that *are* the product (security guarantees, data-safety, "never send", "never log content"). Keep them hard. State them with the rationale inline, enforce them in CI or tests, and list them in AGENTS.md `Never`/`Ask First`. A rule without a stated *why* reads as arbitrary and gets "fixed".
2. **Process fencing** — "rejected forever", "must get its own ADR first", "revisit only with data". Calibrate to the project: in an early-stage project with one present decider, soften to open doors ("not built now; nothing forecloses it") — re-proposing is how steering works there. In a mature or multi-team project, fencing earns its keep.

Before writing any "never", ask which kind it is.

## Writing the ADR

- **Lead with the forcing constraint.** The fact that makes the decision shaped the way it is (a platform limitation, a cost profile, a threat model). Every downstream choice should visibly flow from it.
- **Stratify guarantees by enforcement layer.** "Impossible" enforced by a platform/credential is not the same claim as "impossible" enforced by your own code + CI. Conflating them is the most dangerous kind of noise. Say which layer enforces each guarantee.
- **State what the decision breaks.** If it invalidates an earlier ADR's headline claim, name the claim and write its honest, weaker replacement. Accepting a loss explicitly beats papering over it.
- **State residual risks plainly.** "Accepted residual risks:" with the mitigation for each. An ADR that lists no downsides wasn't thought through — or is hiding them.
- **No implementation mechanics.** HTTP snippets, SQL DDL, config examples, test matrices, delivery order, effort estimates — those live in build briefs and specs. The ADR records decisions, forcing facts, trade-offs.
- Sections: Status/Date/Kind header → Context (forcing facts) → Decision (numbered) → Alternatives considered → Consequences.

## Rejected alternatives

- One–two sentences each: what it was, why it lost. Give the *strongest* competitor honest treatment, including what it did better.
- **Never include API signatures, schemas, or design detail of dead things.** An agent grepping later finds `undo_operation(id)` in a doc and reads it as a spec. Name the idea, not its interface.
- Record a rejection only when someone would plausibly re-propose it without the context. Otherwise skip it.

Before: *"6. `undo_mail_operation(operation_id)` — considered and dropped. A faithful undo needs retention windows, consumer-scoped eligibility, external-move conflict detection… Revisit with usage data."*
After: *"6. Undo. Not built now: a second mutation path to secure, repairing a failure a human fixes in one drag. Nothing forecloses it later."*

## When decisions change

- **Never rewrite an ADR's body.** Add a header note: `**Superseded in part by [ADR-NNNN](…)** (date):` stating *what survives* and *what no longer holds*. ADR bodies are the historical record; the header is where current validity lives.
- **Any ADR whose headline claim is now false must get a note.** A reader who opens it cold must not walk away believing the stale claim.
- Update the ADR index (statuses, titles).
- When an ADR accumulates so many amendment breadcrumbs that current truth requires diffing prose, write one fresh superseding ADR and mark the old chain superseded.

## Final pass

Delete every sentence that doesn't change what a reader would do or believe. If the ADR is longer than the decision warrants, the extra length is where future confusion will live.
