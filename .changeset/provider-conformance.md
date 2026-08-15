---
'@packkit/provider-netlify': minor
---

Conform to the `@packkit/core` provider contract. `createNetlifyProvider()` now
carries a stable `id` (`'netlify'`) and declares its `capabilities`
(`['plan', 'apply']`), and the plan is stamped with `schemaVersion`. Adds a
`conformance.test.ts` that runs `runProviderConformanceSuite` from
`@packkit/core/testing` — the same executable suite provider-aws passes — proving
deterministic support/plan, a serializable schema-versioned plan, no secret leaks,
and correct capability gating. Bumps the `@packkit/core` peer to `^0.6.0`.
