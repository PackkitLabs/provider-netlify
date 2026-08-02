import { describe, it, expect } from 'vitest';
import { createNetlifyProvider } from './index.js';
import { NetlifyProviderError } from './errors.js';
import type { NetlifyPlan } from './types.js';
import { staticProject, mockClient } from './test-helpers.js';

const repository = { owner: 'DanMat', name: 'my-app' };

describe('apply', () => {
	it('dispatches planned operations through the injected client', async () => {
		const client = mockClient();
		const provider = createNetlifyProvider({ client });
		const built = provider.plan({ project: staticProject(), repository });

		const result = await provider.apply(built);

		expect(result.status).toBe('applied');
		expect(result.site?.name).toBe('my-app');
		expect(client.calls).toHaveLength(1);
		expect(client.calls[0]?.method).toBe('createSite');
	});

	it('refuses to run without a client (no ambient credentials)', async () => {
		const provider = createNetlifyProvider();
		const built = provider.plan({ project: staticProject(), repository });
		await expect(provider.apply(built)).rejects.toMatchObject({ code: 'NO_CLIENT' });
	});

	it('validates the plan and client capabilities', async () => {
		const noMethod = createNetlifyProvider({ client: {} as ReturnType<typeof mockClient> });
		const built = noMethod.plan({ project: staticProject(), repository });
		await expect(noMethod.apply(built)).rejects.toMatchObject({ code: 'CLIENT_MISSING_METHOD' });

		const provider = createNetlifyProvider({ client: mockClient() });
		await expect(
			provider.apply({ operations: [{ type: 'unknown' }] } as unknown as NetlifyPlan),
		).rejects.toBeInstanceOf(NetlifyProviderError);
		await expect(provider.apply({} as unknown as NetlifyPlan)).rejects.toMatchObject({
			code: 'INVALID_PLAN',
		});
	});
});
