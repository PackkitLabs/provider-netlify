import { describe, it, expect } from 'vitest';
import { supports } from './supports.js';

describe('supports', () => {
	it('supports a complete static contract', () => {
		expect(
			supports({ type: 'static', buildCommand: 'npm run build', outputDirectory: 'dist' }),
		).toEqual({
			supported: true,
			reasons: [],
		});
	});

	it('rejects non-static deployment types with a code', () => {
		for (const type of ['service', 'fullstack', 'cli', 'library']) {
			const result = supports({ type });
			expect(result.supported).toBe(false);
			expect(result.reasons[0]?.code).toBe('UNSUPPORTED_DEPLOYMENT_TYPE');
		}
	});

	it('rejects a missing contract', () => {
		expect(supports(undefined).reasons[0]?.code).toBe('MISSING_DEPLOYMENT_CONTRACT');
	});

	it('rejects an incomplete static contract', () => {
		expect(supports({ type: 'static', buildCommand: 'x' }).reasons[0]?.code).toBe(
			'INCOMPLETE_STATIC_CONTRACT',
		);
		expect(supports({ type: 'static', outputDirectory: 'dist' }).reasons[0]?.code).toBe(
			'INCOMPLETE_STATIC_CONTRACT',
		);
	});
});
