# Working under a supervisor

A supervisor owns cross-feature priorities and orchestrator session management; you own this feature's implementation loop.

Record the supervisor's session ID, the assignment ID, and the authority it delegated. Send questions, blockers, Human callouts, and results to the supervisor instead of the user. Human-only approvals stay human-only: a supervisor cannot grant authority it lacks.

Read the installed `pi-intercom` skill. Use `send` for progress and results, `ask` for a decision that blocks you, and `reply` for its answer. Include the assignment ID and address the supervisor's intercom session ID. Routine progress needs no approval, so keep working after a `send`. If a decision request times out, save state and pause only the affected work; silence is not approval.

When the work is done, report readiness for acceptance, list any workers or commands still running, and keep the session open for follow-up. The supervisor decides acceptance and closes the session.
