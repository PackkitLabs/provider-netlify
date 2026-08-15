import { describe, it } from 'vitest';
import { runProviderConformanceSuite } from '@packkit/core/testing';
import type { PackkitProvider } from '@packkit/core';
import { createNetlifyProvider } from './index.js';
import { staticProject } from './test-helpers.js';

// provider-netlify dogfoods @packkit/core's provider conformance suite — the same suite
// provider-aws passes — proving it's a well-behaved provider. Netlify is API-driven, so
// it advertises both `plan` and `apply` (apply runs through an injected client).
describe('provider-netlify conforms to the @packkit/core provider contract', () => {
	runProviderConformanceSuite(
		{
			// netlify's supports/plan take narrower param types than the generic contract;
			// the cast reconciles the variance (runtime behavior is identical).
			provider: createNetlifyProvider() as unknown as PackkitProvider,
			supportedContract: staticProject().deploymentContract,
			unsupportedContract: { type: 'service' },
			planInput: () => ({
				project: staticProject(),
				repository: { owner: 'PackkitLabs', name: 'demo' },
			}),
			// The plan must never embed a Netlify token (auth lives in the injected client).
			secrets: ['nfp_deadbeefdeadbeefdeadbeef'],
		},
		(name, fn) => it(name, fn),
	);
});
