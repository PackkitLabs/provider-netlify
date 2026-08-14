import type { DeploymentType } from '@packkit/core';
import type { DeploymentContractLike, SupportResult } from './types.js';
import { NetlifyProviderError } from './errors.js';

// Support detection reads only the provider-neutral `@packkit/core` deployment
// contract a generator derives — never raw config, frameworks, or the language.
// That keeps the provider decoupled from how (or in what language) a project was
// generated: any generator's static contract is supported the same way.
//
// 0.1.0 supports a single static site only. A `fullstack` contract carries a
// static `frontend`, but deploying half of a fullstack app is a deliberate
// 0.2+ decision, so we report it unsupported rather than guessing.
// The supported subset of `@packkit/core`'s DeploymentType (validated against the
// core union at construction), kept as a string set so any host-provided type can
// be tested for membership.
const SUPPORTED_TYPES: ReadonlySet<string> = new Set<DeploymentType>(['static']);

export function supports(contract: DeploymentContractLike | undefined): SupportResult {
	if (!contract || typeof contract.type !== 'string') {
		return unsupported('MISSING_DEPLOYMENT_CONTRACT', 'No deployment contract was provided.');
	}
	if (!SUPPORTED_TYPES.has(contract.type)) {
		return unsupported(
			'UNSUPPORTED_DEPLOYMENT_TYPE',
			`The Netlify provider (0.1.0) supports only 'static' deployments; got '${contract.type}'.`,
		);
	}
	if (!contract.buildCommand || !contract.outputDirectory) {
		return unsupported(
			'INCOMPLETE_STATIC_CONTRACT',
			'The static contract is missing buildCommand or outputDirectory.',
		);
	}
	return { supported: true, reasons: [] };
}

/** Throw a typed error unless the contract is a supported static site. */
export function assertSupported(contract: DeploymentContractLike | undefined): void {
	const check = supports(contract);
	if (!check.supported) {
		const reason = check.reasons[0];
		throw new NetlifyProviderError(
			reason?.code ?? 'UNSUPPORTED_PROJECT',
			reason?.message ?? 'The project is not supported.',
		);
	}
}

const unsupported = (code: string, message: string): SupportResult => ({
	supported: false,
	reasons: [{ code, message }],
});
