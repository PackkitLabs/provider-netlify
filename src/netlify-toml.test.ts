import { describe, it, expect } from 'vitest';
import { netlifyToml } from './netlify-toml.js';

describe('netlifyToml', () => {
	it('emits a deterministic [build] block', () => {
		expect(netlifyToml({ command: 'npm run build', publishDirectory: 'dist' })).toBe(
			'[build]\n  command = "npm run build"\n  publish = "dist"\n',
		);
	});

	it('omits absent keys and includes base when given', () => {
		expect(netlifyToml({ publishDirectory: 'dist' })).toBe('[build]\n  publish = "dist"\n');
		expect(
			netlifyToml({
				baseDirectory: 'apps/web',
				command: 'build',
				publishDirectory: 'apps/web/dist',
			}),
		).toBe('[build]\n  base = "apps/web"\n  command = "build"\n  publish = "apps/web/dist"\n');
	});

	it('escapes quotes and backslashes in values', () => {
		expect(netlifyToml({ command: 'echo "hi"\\bye' })).toBe(
			'[build]\n  command = "echo \\"hi\\"\\\\bye"\n',
		);
	});
});
