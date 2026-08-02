// Minimal, deterministic serializer for the netlify.toml we emit. It is scoped
// to exactly the keys Packkit's static contract provides — we deliberately do
// NOT pull in a general TOML library, so the output stays byte-stable and the
// package stays dependency-free.

export interface NetlifyTomlInput {
	command?: string;
	publishDirectory?: string;
	baseDirectory?: string;
}

export function netlifyToml({
	command,
	publishDirectory,
	baseDirectory,
}: NetlifyTomlInput = {}): string {
	const lines = ['[build]'];
	if (baseDirectory) lines.push(`  base = ${quote(baseDirectory)}`);
	if (command) lines.push(`  command = ${quote(command)}`);
	if (publishDirectory) lines.push(`  publish = ${quote(publishDirectory)}`);
	return `${lines.join('\n')}\n`;
}

const quote = (value: string): string => `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
