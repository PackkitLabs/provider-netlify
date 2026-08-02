import { describe, it, expect } from 'vitest';
import { plan } from './plan.js';
import { NetlifyProviderError } from './errors.js';
import { staticProject, projectWithContract } from './test-helpers.js';

const repository = { provider: 'github', owner: 'DanMat', name: 'my-app', branch: 'main' };

describe('plan', () => {
	it('builds a deterministic create-site plan from a static project', () => {
		const result = plan({ project: staticProject(), repository });
		expect(result.provider).toBe('netlify');
		expect(result.site).toEqual({ name: 'my-app' });
		expect(result.build).toEqual({ command: 'npm run build', publishDirectory: 'dist' });
		expect(result.files['netlify.toml']).toBe(
			'[build]\n  command = "npm run build"\n  publish = "dist"\n',
		);
		expect(result.operations).toHaveLength(1);
		expect(result.operations[0]?.type).toBe('create-site');
		// Identical inputs produce an identical plan.
		expect(plan({ project: staticProject(), repository })).toEqual(result);
	});

	it('defaults branch to main and provider to github, and honors a site name override', () => {
		const result = plan({
			project: staticProject(),
			repository: { owner: 'DanMat', name: 'repo' },
			site: { name: 'custom' },
		});
		expect(result.repository).toEqual({
			provider: 'github',
			owner: 'DanMat',
			name: 'repo',
			branch: 'main',
		});
		expect(result.site).toEqual({ name: 'custom' });
	});

	it('requires a repository with owner and name', () => {
		try {
			plan({
				project: staticProject(),
				repository: { owner: 'DanMat' } as { owner: string; name: string },
			});
			expect.fail('expected plan to throw');
		} catch (error) {
			expect((error as NetlifyProviderError).code).toBe('INVALID_REPOSITORY');
		}
	});

	it('refuses to plan an unsupported project', () => {
		try {
			plan({ project: projectWithContract({ type: 'fullstack' }), repository });
			expect.fail('expected plan to throw');
		} catch (error) {
			expect((error as NetlifyProviderError).code).toBe('UNSUPPORTED_DEPLOYMENT_TYPE');
		}
	});
});
