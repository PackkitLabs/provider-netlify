import type { ProviderCapability } from '@packkit/core';
import type { ApplyResult, NetlifyClient, NetlifyPlan } from './types.js';
import { supports } from './supports.js';
import { prepare } from './prepare.js';
import { plan } from './plan.js';
import { apply as applyOperation } from './apply.js';
import { NetlifyProviderError } from './errors.js';

export { supports, prepare, plan, NetlifyProviderError };
export { PLAN_SCHEMA_VERSION } from './plan.js';
export type * from './types.js';

export interface NetlifyProvider {
	id: 'netlify';
	/** API-driven: it both plans and applies (through an injected client). */
	capabilities: ProviderCapability[];
	supports: typeof supports;
	prepare: typeof prepare;
	plan: typeof plan;
	apply(plan: NetlifyPlan): Promise<ApplyResult>;
}

// Factory: bind an injected client so apply() has no ambient credentials.
// supports/prepare/plan are pure and client-independent, so they're exposed both
// as free functions (above) and as methods here for ergonomic host use.
export function createNetlifyProvider({
	client,
}: { client?: NetlifyClient } = {}): NetlifyProvider {
	return {
		id: 'netlify',
		capabilities: ['plan', 'apply'],
		supports,
		prepare,
		plan,
		apply: (builtPlan: NetlifyPlan) => applyOperation(builtPlan, { client }),
	};
}
