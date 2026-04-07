# Testing Anti-Patterns

Reference when writing tests, adding mocks, or reviewing test code.

## Core Rule

Test what the code does, not what the mocks do.

## Anti-Pattern 1: Testing Mock Behavior

```typescript
// ❌ Asserting on mock existence
test('renders sidebar', () => {
  render(<Page />);
  expect(screen.getByTestId('sidebar-mock')).toBeInTheDocument();
});

// ✅ Test real behavior
test('renders sidebar', () => {
  render(<Page />);
  expect(screen.getByRole('navigation')).toBeInTheDocument();
});
```

**Gate:** "Am I asserting on real behavior or mock existence?" If mock → unmock or delete assertion.

## Anti-Pattern 2: Test-Only Methods in Production

```typescript
// ❌ destroy() only called in tests
class Session {
  async destroy() { /* cleanup */ }
}

// ✅ Test utilities handle cleanup
// test-utils/
export async function cleanupSession(session: Session) { /* cleanup */ }
```

**Gate:** "Is this method only used by tests?" If yes → move to test utilities.

## Anti-Pattern 3: Mocking Without Understanding

```typescript
// ❌ Mock breaks side effect the test depends on
vi.mock('ToolCatalog', () => ({
  discoverAndCacheTools: vi.fn().mockResolvedValue(undefined)
}));
// Test depends on config write that discoverAndCacheTools triggers!

// ✅ Mock at the right level — preserve needed side effects
vi.mock('MCPServerManager'); // Mock the slow part only
```

**Gate before mocking:**
1. What side effects does the real method have?
2. Does this test depend on any of them?
3. Mock at the lowest level that removes the slow/external part

## Anti-Pattern 4: Incomplete Mocks

```typescript
// ❌ Only fields you think you need
const mockResponse = { status: 'success', data: { userId: '123' } };
// Breaks when code accesses response.metadata.requestId

// ✅ Mirror real API structure completely
const mockResponse = {
  status: 'success',
  data: { userId: '123', name: 'Alice' },
  metadata: { requestId: 'req-789', timestamp: 1234567890 }
};
```

**Gate:** Check actual API response structure. Include all fields downstream code might consume.

## Anti-Pattern 5: Implementation-Coupled Tests

```typescript
// ❌ Tests internal call sequence
expect(mockRepo.save).toHaveBeenCalledBefore(mockCache.invalidate);
expect(mockLogger.info).toHaveBeenCalledWith('user created');

// ✅ Tests observable outcome
const user = await createUser({ email: 'a@b.com' });
expect(user.id).toBeDefined();
expect(await getUser(user.id)).toEqual(user);
```

**Gate:** "Would this test break if I refactored internals without changing the API?" If yes → rewrite.

## Red Flags

- Assertion checks for `*-mock` test IDs
- Methods only called in test files
- Mock setup > 50% of test code
- `toHaveBeenCalledTimes` / `toHaveBeenCalledWith` as primary assertions
- Can't explain why a mock is needed
- Mocking "just to be safe"

## Decision

| Situation | Action |
|-----------|--------|
| Assert on mock elements | Test real component or unmock |
| Test-only production methods | Move to test utilities |
| Complex mock setup | Consider integration test instead |
| Uncertain what to mock | Run with real implementation first, then mock minimally |
