import type {
	NetlifyPlan,
	ProjectLike,
	RepositoryInput,
	StaticDeploymentContract,
} from './types.js';
import { prepare } from './prepare.js';
import { assertSupported } from './supports.js';
import { NetlifyProviderError } from './errors.js';

// Pure: produce a deterministic provisioning plan from a supported project and a
// repository descriptor. It describes *what* apply() will do without doing any of
// it — no network, no client. The generated netlify.toml is included so the host
// can commit it alongside the code. Same inputs → identical plan.
export function plan({
	project,
	repository,
	site,
}: {
	project: ProjectLike;
	repository: RepositoryInput;
	site?: { name?: string };
}): NetlifyPlan {
	const contract = project.deploymentContract;
	assertSupported(contract);
	if (!repository || !repository.owner || !repository.name) {
		throw new NetlifyProviderError(
			'INVALID_REPOSITORY',
			'A repository { owner, name } is required to plan a Netlify deploy.',
		);
	}
	const staticContract = contract as StaticDeploymentContract;

	const repo = {
		provider: repository.provider ?? 'github',
		owner: repository.owner,
		name: repository.name,
		branch: repository.branch ?? 'main',
	};
	const siteName = site?.name ?? repo.name;
	const build = {
		command: staticContract.buildCommand,
		publishDirectory: staticContract.outputDirectory,
	};
	const { files } = prepare({ project });

	return {
		provider: 'netlify',
		site: { name: siteName },
		repository: repo,
		build,
		files,
		operations: [{ type: 'create-site', site: { name: siteName }, repository: repo, build }],
	};
}
