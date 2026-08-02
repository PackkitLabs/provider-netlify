import type { CreateSiteResult, DeploymentContractLike, ProjectLike } from './types.js';

// Hand-built fixtures mirror the shape create-packkit's `deriveDeploymentContract`
// produces, without importing it — so the unit tests stay fast and focused.
export const staticProject = (contract: Partial<DeploymentContractLike> = {}): ProjectLike => ({
	deploymentContract: {
		type: 'static',
		buildCommand: 'npm run build',
		outputDirectory: 'dist',
		...contract,
	},
});

export const projectWithContract = (deploymentContract: DeploymentContractLike): ProjectLike => ({
	deploymentContract,
});

export interface RecordedCall {
	method: string;
	input: { name: string };
}

// A minimal in-memory stand-in for a host's Netlify client. Records calls so
// tests can assert what apply() dispatched.
export function mockClient(): {
	calls: RecordedCall[];
	createSite(input: { name: string }): Promise<CreateSiteResult>;
} {
	const calls: RecordedCall[] = [];
	return {
		calls,
		async createSite(input) {
			calls.push({ method: 'createSite', input });
			return { id: 'site_123', name: input.name, url: `https://${input.name}.netlify.app` };
		},
	};
}
