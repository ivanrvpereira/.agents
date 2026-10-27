---
name: adr-writing
description: Use when the user asks for an ADR, or wants to record, revise, or replace an architecture decision.
---

# ADR Writing

Read [ADR-FORMAT.md](../domain-modeling/ADR-FORMAT.md) first. It holds the bar, the template, and the numbering.

## 1. Decide

Test the decision against the three conditions in ADR-FORMAT.md: hard to reverse, surprising without context, the result of a real trade-off. Even when the user asked for an ADR, if any test fails, name the failed test and recommend no ADR. Write one only when all three pass or the user insists.

## 2. Write

Start from the template: one to three sentences of context, choice, and reason. Add an optional section only when it carries something a future reader needs.

Name a rejected alternative by its idea and why it lost, never by its interface. An agent that later finds a signature like `undo_operation(id)` in an ADR reads it as something to build.

## 3. Amend or supersede

Leave the old ADR's body as written. Set its `Status` to `superseded by ADR-NNNN`, and when only part of it changed, add one line under the title that says what still holds. Then search the other docs (specs, `AGENTS.md`, README) for the replaced names and update them.

When new work contradicts an existing ADR, say so explicitly ("Contradicts ADR-0007, but worth reopening because…") rather than silently overriding it.
