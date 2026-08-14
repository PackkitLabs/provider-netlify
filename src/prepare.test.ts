import { describe, it, expect } from 'vitest';
import { prepare } from './prepare.js';
import { NetlifyProviderError } from './errors.js';
import { staticProject, projectWithContract } from './test-helpers.js';

describe('prepare', () => {
	it('derives netlify.toml from the static contract', () => {
		const { files } = prepare({
			project: staticProject({ buildCommand: 'pnpm build', outputDirectory: 'build' }),
		});
		expect(Object.keys(files)).toEqual(['netlify.toml']);
		expect(files['netlify.toml']).toBe('[build]\n  command = "pnpm build"\n  publish = "build"\n');
	});

	it('is pure — same input, same output', () => {
		const project = staticProject();
		expect(prepare({ project })).toEqual(prepare({ project }));
	});

	it('throws a typed error for an unsupported project', () => {
		try {
			prepare({ project: projectWithContract({ type: 'service' }) });
			expect.fail('expected prepare to throw');
		} catch (error) {
			expect(error).toBeInstanceOf(NetlifyProviderError);
			expect((error as NetlifyProviderError).code).toBe('UNSUPPORTED_DEPLOYMENT_TYPE');
		}
	});
});
