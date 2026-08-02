# @packkit/provider-netlify

> Netlify deployment provider for [Packkit](https://www.npmjs.com/package/create-packkit)-generated projects.

[![npm](https://img.shields.io/npm/v/%40packkit%2Fprovider-netlify.svg)](https://www.npmjs.com/package/@packkit/provider-netlify) [![CI](https://github.com/PackkitJS/provider-netlify/actions/workflows/ci.yml/badge.svg)](https://github.com/PackkitJS/provider-netlify/actions/workflows/ci.yml) [![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Packkit generates a project and describes how to deploy it in a provider-neutral
**deployment contract**. This package turns that contract into a Netlify site —
it plans the deploy deterministically and applies it through a client you inject.

It depends only on Packkit's public embedded API and deployment contract. It
never imports Packkit internals, and Packkit never depends on it.

```text
create-packkit  ──►  GeneratedProject.deploymentContract  ──►  @packkit/provider-netlify
```

## Requirements

Node.js >= 24.0.0 (`.nvmrc` pins 24.18.0; run `nvm use`). Enforced via `engine-strict`, so installs fail fast on an unsupported version.

## Install

```sh
npm install @packkit/provider-netlify
```

`create-packkit` is a peer dependency (`^3.3.0`) — the host app already has it.

## Usage

```ts
import { createProject } from 'create-packkit/embedded';
import { createNetlifyProvider } from '@packkit/provider-netlify';

const project = createProject({ preset: 'react-app', name: 'my-app' });

const provider = createNetlifyProvider({ client: myNetlifyClient });

// 1. Check support (pure) — reads only the deployment contract.
const support = provider.supports(project.deploymentContract);
if (!support.supported) throw new Error(support.reasons[0].message);

// 2. Prepare provider files (pure) — netlify.toml, for the host to commit.
const { files } = provider.prepare({ project });

// 3. Plan the deploy (pure, deterministic) — no network.
const plan = provider.plan({
	project,
	repository: { provider: 'github', owner: 'DanMat', name: 'my-app', branch: 'main' },
});

// 4. Apply (the only method that touches the network) — via your client.
const result = await provider.apply(plan);
```

## Design

- **`supports` / `prepare` / `plan` are pure.** No filesystem, no network, no
  client — same inputs produce the same output, so they're trivially testable
  and safe to run anywhere. `plan()` returns `netlify.toml` as _data_; the host
  writes it (ideally through `create-packkit/writer`).
- **`apply` is the only method that performs I/O.** It executes the plan's
  operations through the **client you inject**. The provider never constructs a
  client and never reads credentials from the environment — auth and the
  decision to deploy stay entirely on the host side.
- **Contract-driven.** Support and planning read the deployment contract, never
  raw config or framework names, so the provider is decoupled from how Packkit
  decided a project is static.

### The client interface

You supply an object the provider calls:

```ts
interface NetlifyClient {
	createSite(input: {
		name: string;
		repository: { provider: string; owner: string; name: string; branch: string };
		build: { command: string; publishDirectory: string };
	}): Promise<{ id?: string; name?: string; url?: string }>;
}
```

## Scope

**0.1.0** — static sites only: support detection, contract validation,
deterministic `netlify.toml`, a create-site plan, and `apply` against a client
(exercised with a mock). No DNS, functions, custom domains, monorepo, or
fullstack support; unsupported project types are reported, not guessed.

Planned:

- **0.2.0** — real Netlify site creation, repository linking, first deploy status.
- **0.3.0** — inspect and resume, idempotency, structured partial failures.

## License

MIT © DanMat
