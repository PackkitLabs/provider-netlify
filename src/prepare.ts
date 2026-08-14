import type { PrepareResult, ProjectLike, StaticDeploymentContract } from './types.js';
import { netlifyToml } from './netlify-toml.js';
import { assertSupported } from './supports.js';

// Pure: derive the provider-owned files (just netlify.toml today) from the
// project's deployment contract. No filesystem and no network — the host writes
// these into the repo, ideally through @packkit/core/node's writer so they inherit its
// path-safety. Throws if the project isn't a supported static site.
export function prepare({ project }: { project: ProjectLike }): PrepareResult {
	const contract = project.deploymentContract;
	assertSupported(contract);
	// assertSupported guarantees a complete static contract at runtime.
	const staticContract = contract as StaticDeploymentContract;

	return {
		files: {
			'netlify.toml': netlifyToml({
				command: staticContract.buildCommand,
				publishDirectory: staticContract.outputDirectory,
			}),
		},
	};
}
