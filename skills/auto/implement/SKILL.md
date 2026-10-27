---
name: implement
description: "Implement a piece of work based on a spec or set of tickets."
---

Implement the work described by the user in the spec or tickets.

If a parent agent delegated this work to you, its brief replaces the user's request: take the work from the brief instead of fetching tickets, ask the parent wherever this skill says to ask the user, and skip the final review and commit steps because the parent owns them.

If the user passes a ticket reference, fetch it from the issue tracker and state its title before starting. If the reference is ambiguous, ask.

Before adding or changing tests, read [tdd](../tdd/SKILL.md) and its linked testing and mocking references. Apply its loop at the seams already approved in the spec or project guidance. If the seams are missing or need to change, confirm them with the user before writing tests.

Run typechecking regularly, single test files regularly, and the full test suite once at the end.

Once done, call the Skill tool with "code-review" to review the work.

Commit your work to the current branch.
