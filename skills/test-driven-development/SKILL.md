---
name: test-driven-development
description: Use when implementing any feature or bugfix, before writing implementation code
---

# Test-Driven Development

## The Cycle

1. **RED** — Write one failing test describing desired behavior
2. **Verify RED** — Run it. Confirm it fails because the feature is missing (not typos/errors)
3. **GREEN** — Write minimal code to pass
4. **Verify GREEN** — Run it. Confirm all tests pass, output clean
5. **REFACTOR** — Clean up. Keep tests green. Don't add behavior.
6. **Repeat**

Never skip verification steps. If you didn't watch it fail, you don't know it tests anything.

## Test Behavior, Not Implementation

This is the most important rule. Tests must survive refactors — if only internals change, no test should break.

**Test through the public API.** Assert on:
- Return values
- Observable state changes (what callers/users can see)
- Side effects (DB writes, API calls, events emitted)

**Never assert on:**
- Internal method calls or call order
- Private state
- How the code achieves the result

**Smell test:** "Would this test break if I rewrote the internals but kept the same API?" If yes, rewrite the test.

<Good>
```typescript
test('retries until success, up to 3 attempts', async () => {
  let attempts = 0;
  const operation = () => {
    attempts++;
    if (attempts < 3) throw new Error('fail');
    return 'success';
  };

  const result = await retryOperation(operation);

  expect(result).toBe('success');
  expect(attempts).toBe(3);
});
```
Tests observable outcome with real code.
</Good>

<Bad>
```typescript
test('retry works', async () => {
  const mock = jest.fn()
    .mockRejectedValueOnce(new Error())
    .mockRejectedValueOnce(new Error())
    .mockResolvedValueOnce('success');
  await retryOperation(mock);
  expect(mock).toHaveBeenCalledTimes(3);
});
```
Tests mock interactions. Vague name. Breaks if retry internals change.
</Bad>

### Black-Box Framing

Write each test as if you don't know the implementation. You are a caller specifying a contract:
- What inputs do I provide?
- What output or effect do I expect?
- What should happen on invalid input?

If you find yourself looking at implementation to decide what to assert — stop. You're coupling.

### Property-Based Tests

When the domain has invariants, prefer property-based tests over concrete examples. They're harder to overfit to and catch edge cases you wouldn't think of.

```typescript
// Instead of: expect(sort([3,1,2])).toEqual([1,2,3])
// Property: output is always non-decreasing, same length, same elements
test.prop([fc.array(fc.integer())])('sort produces non-decreasing output', (arr) => {
  const sorted = sort(arr);
  expect(sorted).toHaveLength(arr.length);
  for (let i = 1; i < sorted.length; i++) {
    expect(sorted[i]).toBeGreaterThanOrEqual(sorted[i - 1]);
  }
});
```

Use property-based tests for: algorithms, data transformations, serialization roundtrips, parsers, pure functions.

## Mocking Rules

1. **Mock at boundaries** — network, filesystem, time, randomness
2. **Never mock the thing you're testing**
3. **Never assert on mock call counts or order** as the primary assertion — assert on outcomes
4. **Prefer fakes/stubs over deep mocks** — a fake in-memory DB over mocking 12 repository methods
5. **If mock setup > test logic** — you're testing the wrong way. Use integration tests.

Read `testing-anti-patterns.md` before adding mocks.

## Adapting for AI Workflows

When working with AI agents, these additional rules apply:

**Context separation:** If writing both tests and implementation, write tests first in a separate step. Don't let implementation knowledge contaminate test design.

**Combined red+green is acceptable** when the agent generates tests and code together — but only if:
- Tests are reviewed for behavioral correctness before moving on
- Each test is verified to fail without the implementation (run tests against the pre-change code)
- Tests assert on behavior, not implementation details

**Exploratory phases:** When intent is unclear, explore first, then write tests to lock down discovered behavior. Don't freeze half-baked assumptions into tests prematurely.

**Watch for agent cheating:**
- Weakening assertions to make tests pass
- Deleting or modifying existing tests
- Writing tautological tests that restate the implementation
- Testing that mocks exist instead of testing behavior

## When to Apply

**Always:** Features, bug fixes, behavior changes, refactoring

**Exceptions (ask the user):** Throwaway prototypes, config files, exploratory spikes (but write tests after exploring)

**Bug fixes:** Always write a failing test reproducing the bug first. The test proves the fix and prevents regression.

## Test Quality Checklist

- [ ] One behavior per test. "and" in the name? Split it.
- [ ] Name describes the behavior, not the implementation
- [ ] Asserts on observable outcomes, not internal mechanics
- [ ] Would survive an internal refactor without changes
- [ ] Uses real code (mocks only at boundaries)
- [ ] Edge cases and error paths covered

## Completion Gate

Before claiming work is done:

- [ ] Every new behavior has a test
- [ ] Each test was verified to fail before implementation
- [ ] All tests pass, output clean (no warnings)
- [ ] Tests are behavioral (pass the refactor smell test)

## When Stuck

| Problem | Action |
|---------|--------|
| Don't know what to test | Write the assertion first. What output do you want? |
| Test too complicated | Design too complicated. Simplify the interface. |
| Must mock everything | Code too coupled. Use dependency injection. |
| Hard to test = hard to use | Listen to the test. Redesign. |
