---
'@packkit/provider-netlify': patch
---

Consume `@packkit/core@^0.4.0`, which renames the `node-service` deployment type to the
language-neutral `service`. No behavior change — the provider still supports only
`static` and rejects everything else; the tests just reference the new `service` type
name.
