---
name: handoff
description: Write or update HANDOFF.md so a fresh agent can continue the work.
argument-hint: [optional focus or instructions]
disable-model-invocation: true
---

# Handoff

Write or update a handoff document for this project so the next agent with fresh context can continue. If the invocation includes extra instructions, treat them as the focus.

Steps:
1. Find the project root (prefer the git root; otherwise use the current working directory).
2. Check whether `HANDOFF.md` already exists at the project root. If it exists, read it before editing.
3. Inspect the current state needed for an accurate handoff: relevant files, `git status`, current diffs, commands/tests run, and known failures.
4. Create or update `HANDOFF.md` with these sections:
   - **Goal**: What we are trying to accomplish.
   - **Current Progress**: What has been done so far.
   - **Key Context**: Important decisions, constraints, paths, or assumptions.
   - **What Worked**: Approaches or commands that succeeded.
   - **What Didn't Work**: Failed approaches, errors, or dead ends to avoid repeating.
   - **Next Steps**: Clear, ordered action items for continuing.
   - **Verification**: Tests/checks already run and their results; include unchecked items if any.
5. Keep the handoff concise and actionable. Do not include secrets.
6. Save it as `HANDOFF.md` at the project root and tell the user the file path.
