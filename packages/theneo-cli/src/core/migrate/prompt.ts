import { formatMarkdownCount, SourceSummary } from './source';

export const DEFAULT_OUTPUT_DIR = 'converted_for_theneo';
/** Sibling folder for the converter script and report, kept out of the folder that gets imported. */
export const WORK_DIR = 'theneo_migration';
const CLI_PACKAGE = '@theneo/cli';

/**
 * How the agent should call the CLI. Someone who ran `npx @theneo/cli migrate`
 * has no `theneo` binary, so the agent gets a pinned npx command instead.
 */
export function cliInvocation(
  isTheneoOnPath: boolean,
  version: string
): string {
  return isTheneoOnPath ? 'theneo' : `npx -y ${CLI_PACKAGE}@${version}`;
}

function describeSource(source: SourceSummary): string {
  if (source.platform === 'unknown') {
    return 'The source format was not recognised, so identify it first.';
  }
  const pages = formatMarkdownCount(source.markdownFiles);
  return `The source looks like ${source.label} (${pages}).`;
}

export interface KickoffPromptInput {
  /** Path to the installed SKILL.md, relative to the docs folder, with forward slashes. */
  skillFile: string;
  /** Output folder as the agent should type it, e.g. `./converted_for_theneo`. */
  outDir: string;
  source: SourceSummary;
  /** Result of `cliInvocation`. */
  cli: string;
}

/** The first message handed to the coding agent. */
export function buildKickoffPrompt(input: KickoffPromptInput): string {
  return [
    `Use the docs-to-theneo skill (${input.skillFile}) to convert the documentation in this folder into a Theneo project in ${input.outDir}.`,
    describeSource(input.source),
    'Read the skill file first and follow its workflow.',
    `Do not change or delete any existing file: write only inside ${input.outDir} and ./${WORK_DIR}.`,
    `Validate with \`${input.cli} audit --dir ${input.outDir}\` until it reports 0 errors.`,
    `Then ask me which Theneo project the docs should go into and try \`${input.cli} preview\` for that project first.`,
    'If preview is not available for it, ask me before importing into the project instead.',
    'Never publish unless I ask.',
  ].join(' ');
}
