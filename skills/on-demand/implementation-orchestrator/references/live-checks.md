# Live checks and external systems

Identify the required live checks and the authorized test targets before any live access. Run required live checks yourself, against the intended environment.

- Write only to explicitly authorized test targets, and verify the side effects.
- Clean up only artifacts you created, when that is safe and authorized. Do not repeat a destructive action just to demonstrate it.
- Bound network and hostile-input checks with the project's timeout, or 60 seconds when it sets none.
- Stop and report blocked authentication, hangs, or repeated rate limits instead of retrying.
