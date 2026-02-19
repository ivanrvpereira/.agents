# AGENTS.md Best Practices

Synthesized from analysis of 2,500+ repositories, community guides, and the agents.md specification.

## Table of Contents

- Instruction Budget
- The Six Essential Sections
- Three-Tier Boundary System
- Progressive Disclosure
- Content Quality
- Anti-Patterns
- Maintenance

## Instruction Budget

Frontier models follow ~150-200 instructions with reasonable consistency. The agent's system prompt consumes ~50, leaving ~100-150 for AGENTS.md plus user messages. Performance degrades linearly as instruction count increases — adding instructions weakens adherence to ALL instructions, not just new ones.

**Root file:** 30-60 lines ideal, 300 lines maximum.
**Every line must justify its inclusion.** Bloat directly reduces compliance.

## The Six Essential Sections

Top-performing repositories include all six:

1. **Commands & tools** — Full runnable syntax with flags. Place early.
   ```
   pnpm test -- path/to/file.test.ts
   pnpm typecheck
   pnpm lint --fix
   ```

2. **Testing & validation** — How to verify work: test commands, type-checking, compilation.

3. **Project structure & file locations** — Directory purposes, read-only vs. writable areas, monorepo layout.
   ```
   src/       — Application source (READ/WRITE)
   docs/      — Documentation (WRITE for docs tasks)
   vendor/    — Third-party packages (NEVER MODIFY)
   ```

4. **Code style with real examples** — Show "good" and "bad" side-by-side. One snippet beats three paragraphs.
   ```
   DO:   src/components/Button.tsx (functional component with hooks)
   DON'T: src/legacy/OldButton.tsx (class component)
   ```

5. **Git workflow & version control** — Commit conventions, branching strategy, PR process.

6. **Clear boundaries** — The three-tier system (see below).

## Three-Tier Boundary System

The most effective constraint pattern:

- **Always do:** Mandatory in every session (e.g., "Always run tests before committing")
- **Ask first:** Requires human approval (e.g., "Ask before modifying database schema")
- **Never do:** Absolute prohibitions (e.g., "Never commit secrets", "Never force push to main")

"Never commit secrets" is the single most commonly adopted constraint.

## Progressive Disclosure

Instead of one monolithic file, use a hierarchy:

```
AGENTS.md                    # Thin root: 30-60 lines
backend/AGENTS.md            # Scoped to backend
frontend/AGENTS.md           # Scoped to frontend
packages/ui/AGENTS.md        # Scoped to UI package
```

Root lists pointers; agent reads detail on demand. Nearest-wins — the closest AGENTS.md to the file being edited takes precedence.

**Pointer strategy:** Use `file:line` references instead of embedding code snippets that go stale.

## Content Quality

### Be Specific
```
Bad:  "React project"
Good: "React 18 with TypeScript 5.3, Vite 5, and Tailwind CSS 3.4"
```

### Show, Don't Tell
```
Bad:  "Use camelCase for functions"
Good: "Functions: getUserData(), calculateTotal()
       Classes: UserService, DataController
       Constants: API_KEY, MAX_RETRIES"
```

### Universal Applicability
Every line must be relevant across all potential sessions. Task-specific content belongs in scoped files, not the root.

### Delegate Formatting to Tools
Use hooks/linters (Biome, Prettier, ESLint) instead of LLM instructions for code style. Deterministic tools are cheaper and more reliable.

## Anti-Patterns

1. **Vague personas** — "You are a helpful assistant" provides zero guidance
2. **Missing executable commands** — "Use the linter" vs. `npm run lint --fix`
3. **No boundaries** — Missing "never do" constraints enables destructive actions
4. **Generic stack descriptions** — Omitting versions and dependencies
5. **No code examples** — Prose descriptions instead of concrete samples
6. **Using LLMs as linters** — Expensive, slow, bloats context
7. **Auto-generating without review** — Always manually curate
8. **Embedding code snippets** — They go stale; point to files instead
9. **Over-length files** — Every added instruction degrades all instructions
10. **Incomplete scope definition** — Not specifying read-only vs. writable areas

## Maintenance

- **Iterate on failure** — Add detail when agents make mistakes, remove rules that aren't earning their keep
- **Start small** — Begin with one specific task, expand based on observed failures
- **Idempotent updates** — Structure so the file can be refreshed without losing manual edits
- **Auto-extract commands** — Pull from Makefile, package.json, go.mod to reduce drift
