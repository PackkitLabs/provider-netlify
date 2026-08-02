import type { ApplyResult, NetlifyClient, NetlifyPlan } from './types.js';
import { supports } from './supports.js';
import { prepare } from './prepare.js';
import { plan } from './plan.js';
import { apply as applyOperation } from './apply.js';
import { NetlifyProviderError } from './errors.js';

export { supports, prepare, plan, NetlifyProviderError };
export type * from './types.js';

export interface NetlifyProvider {
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
		supports,
		prepare,
		plan,
		apply: (builtPlan: NetlifyPlan) => applyOperation(builtPlan, { client }),
	};
}
