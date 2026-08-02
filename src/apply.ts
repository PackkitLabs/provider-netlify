import type { ApplyResult, CreateSiteResult, NetlifyClient, NetlifyPlan } from './types.js';
import { NetlifyProviderError } from './errors.js';

// The one method that performs I/O. It executes each planned operation through
// the injected client — the host owns that client, its credentials, and the
// decision to run this. The provider never discovers credentials itself (no env
// scraping, no keychain). 0.1.0 is exercised against a mock client; real Netlify
// API wiring lands in 0.2.0 without changing this control flow.
export async function apply(
	plan: NetlifyPlan,
	{ client }: { client?: NetlifyClient } = {},
): Promise<ApplyResult> {
	if (!client) {
		throw new NetlifyProviderError(
			'NO_CLIENT',
			'apply() requires an injected client; the provider never sources credentials itself.',
		);
	}
	if (!plan || !Array.isArray(plan.operations)) {
		throw new NetlifyProviderError('INVALID_PLAN', 'A plan with an operations array is required.');
	}

	const applied: Array<{ type: 'create-site'; site: CreateSiteResult }> = [];
	let site: CreateSiteResult | undefined;
	for (const op of plan.operations) {
		if (op.type !== 'create-site') {
			throw new NetlifyProviderError(
				'UNKNOWN_OPERATION',
				`Unknown plan operation '${(op as { type: string }).type}'.`,
			);
		}
		if (typeof client.createSite !== 'function') {
			throw new NetlifyProviderError(
				'CLIENT_MISSING_METHOD',
				'The client does not implement createSite().',
			);
		}
		site = await client.createSite({
			name: op.site.name,
			repository: op.repository,
			build: op.build,
		});
		applied.push({ type: 'create-site', site });
	}

	return { provider: 'netlify', status: 'applied', site, applied };
}
