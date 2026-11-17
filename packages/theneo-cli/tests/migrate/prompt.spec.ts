import {
  buildKickoffPrompt,
  cliInvocation,
  DEFAULT_OUTPUT_DIR,
  WORK_DIR,
} from '../../src/core/migrate/prompt';
import { SourceSummary } from '../../src/core/migrate/source';

const GITBOOK: SourceSummary = {
  platform: 'gitbook',
  label: 'GitBook',
  markdownFiles: 86,
};

const SKILL_FILE = './.claude/skills/docs-to-theneo/SKILL.md';
const NPX_CLI = 'npx -y @theneo/cli@0.25.0';

const promptFor = (source: SourceSummary, cli = 'theneo'): string =>
  buildKickoffPrompt({
    skillFile: SKILL_FILE,
    outDir: `./${DEFAULT_OUTPUT_DIR}`,
    source,
    cli,
  });

describe('cliInvocation', () => {
  it('uses the installed binary when there is one', () => {
    expect(cliInvocation(true, '0.25.0')).toBe('theneo');
  });

  it('pins npx to this CLI version when theneo is not on the PATH', () => {
    expect(cliInvocation(false, '0.25.0')).toBe(NPX_CLI);
  });
});

describe('buildKickoffPrompt', () => {
  it('points the agent at the installed skill and the output folder', () => {
    const prompt = promptFor(GITBOOK);

    expect(prompt).toContain(SKILL_FILE);
    expect(prompt).toContain('./converted_for_theneo');
    expect(prompt).toContain('GitBook (86 Markdown files)');
  });

  it('limits writes to the output and work folders', () => {
    const prompt = promptFor(GITBOOK);

    expect(prompt).toContain(
      `write only inside ./${DEFAULT_OUTPUT_DIR} and ./${WORK_DIR}`
    );
  });

  it('has the agent ask for the project, preview first and ask before importing', () => {
    const prompt = promptFor(GITBOOK, NPX_CLI);

    expect(prompt).toContain('ask me which Theneo project');
    expect(prompt).toContain('try `npx -y @theneo/cli@0.25.0 preview`');
    expect(prompt).toContain('ask me before importing');
    expect(prompt).toContain('Never publish unless I ask');
    expect(prompt.indexOf('preview`')).toBeLessThan(
      prompt.indexOf('importing')
    );
  });

  it('tells the agent how to run the audit when theneo is not installed', () => {
    const prompt = promptFor(GITBOOK, NPX_CLI);

    expect(prompt).toContain(
      'npx -y @theneo/cli@0.25.0 audit --dir ./converted_for_theneo'
    );
  });

  it('does not guess a platform it did not detect', () => {
    const prompt = promptFor({
      platform: 'unknown',
      label: 'unknown',
      markdownFiles: 0,
    });

    expect(prompt).toContain('was not recognised');
    expect(prompt).not.toContain('looks like');
  });

  it('counts a single page in the singular', () => {
    const prompt = promptFor({
      platform: 'markdown',
      label: 'plain Markdown',
      markdownFiles: 1,
    });

    expect(prompt).toContain('plain Markdown (1 Markdown file)');
  });

  it('is one line, so it survives being passed as a single argument', () => {
    expect(promptFor(GITBOOK)).not.toContain('\n');
  });
});
