# ADR 003: Fail-Fast Architecture with Runtime Recovery

## Status
Accepted

## Date
2025-11-20 (Implemented), 2025-12-20 (Documented)

## Context
The system needed clear distinction between:
- **Configuration errors** - Missing setup, invalid config (should fail immediately)
- **Runtime errors** - Transient issues, API timeouts (should retry)
- **Quality gates** - Content validation (should reject and regenerate)

Previous behavior mixed these concerns, leading to:
- Silent failures with fallback values
- Mock data in production
- Unclear error boundaries
- Degraded operation instead of clear failures

## Decision
Implement fail-fast architecture with explicit recovery strategies:

### Configuration/Setup Issues → FAIL FAST
- Missing API keys → `ConfigurationError`
- Invalid YAML structure → Parse error
- Missing required files → `FileNotFoundError`
- Hardcoded fallback values → REMOVED

### Runtime/Transient Issues → RETRY
- API timeouts → Retry with exponential backoff
- Network errors → Retry up to 3 attempts
- Rate limiting → Backoff and retry

### Quality Issues → ITERATE
- Grok score < threshold → Adjust parameters and retry
- Realism score < threshold → Adjust parameters and retry
- Readability failures → Adjust and retry
- Max attempts reached → Fail with clear message

## Consequences

### Positive
- **Clear Failures**: Problems surface immediately during setup
- **No Silent Degradation**: System doesn't continue with bad config
- **Explicit Recovery**: Retry logic only where appropriate
- **Better Debugging**: Stack traces point to actual problems
- **Data Integrity**: No mock/fallback data in production

### Negative
- **Strict Setup**: All configuration must be correct before starting
- **No Graceful Degradation**: Missing features fail loudly
- **More Setup Validation**: Comprehensive checks required

### Neutral
- Tests use mocks (appropriate for testing)
- Production never uses mocks (appropriate for reliability)

## Alternatives Considered

1. **Graceful Degradation**
   - Pros: System continues operating
   - Cons: Silent failures, wrong behavior, data corruption

2. **Always Retry Everything**
   - Pros: More resilient
   - Cons: Retrying configuration errors wastes time

3. **Fail-Fast Everything (No Retries)**
   - Pros: Simple, predictable
   - Cons: Brittle, can't handle transient issues

## Implementation Notes

### Fail-Fast Examples:
```typescript
// ❌ OLD: Silent failure
const temp = config.get('temperature', 0.7);

// ✅ NEW: Fail fast
const temp = config.get('temperature');
if (!temp) throw new ConfigurationError('temperature not configured');
```

### Runtime Recovery Examples:
```typescript
// ✅ CORRECT: Retry transient errors
try {
  await api.generate(prompt);
} catch (error) {
  if (isTransientError(error) && attempt < maxAttempts) {
    await sleep(backoff);
    return retry();
  }
  throw error;
}
```

### Quality Iteration Examples:
```typescript
// ✅ CORRECT: Adjust parameters on quality failure
if (winstonScore < threshold) {
  params.temperature = adjustTemperature(params.temperature);
  params.frequencyPenalty = adjustPenalty(params.frequencyPenalty);
  return retry();
}
```

## Related Decisions
- ADR 001: YAML Schema Validation
- ADR 002: Configuration Consolidation

## References
- [AI Assistant Guide](../../../z-beam-generator/docs/08-development/AI_ASSISTANT_GUIDE.md#workflow-orchestration) (Core Principles section)
- `docs/ARCHITECTURAL_IMPROVEMENTS_SUMMARY.md`
- Violation fixes documented in `VIOLATION_FIXES_NOV20_2025.md`
