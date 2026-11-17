import { Command, Option } from 'commander';
import { confirm, select } from '@inquirer/prompts';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import {
  AGENTS,
  AGENT_IDS,
  AgentDefinition,
  AgentId,
  detectInstalledAgents,
  findOnPath,
  getAgent,
} from '../../core/migrate/agents';
import { canLaunchOnPlatform, launchAgent } from '../../core/migrate/launch';
import {
  buildKickoffPrompt,
  cliInvocation,
  DEFAULT_OUTPUT_DIR,
  WORK_DIR,
} from '../../core/migrate/prompt';
import {
  bundledSkillDir,
  InstallResult,
  installSkill,
  SKILL_FILE,
} from '../../core/migrate/skill';
import {
  formatMarkdownCount,
  inspectSource,
  SourceSummary,
} from '../../core/migrate/source';
import { tryCatch } from '../../utils/exception';
import { isDirectoryEmpty } from '../../utils/file';
import { CLI_VERSION } from '../../utils/version';

interface MigrateOptions {
  dir: string;
  out: string;
  agent?: string;
  /** False with --no-launch. */
  launch: boolean;
  force?: boolean;
}

function isInteractiveTerminal(): boolean {
  return (
    Boolean(process.stdin.isTTY && process.stdout.isTTY) && !process.env.CI
  );
}

function fail(message: string): never {
  throw new Error(chalk.red(`✖ ${message}`));
}

/** A path the user and the agent can type from the docs folder, with forward slashes. */
function displayPath(from: string, to: string): string {
  const relative = path.relative(from, to).split(path.sep).join('/');
  if (relative === '') {
    return '.';
  }
  return relative.startsWith('..') || path.isAbsolute(relative)
    ? relative
    : `./${relative}`;
}

function resolveSourceDir(dir: string): string {
  const sourceDir = path.resolve(dir);
  if (!fs.existsSync(sourceDir) || !fs.statSync(sourceDir).isDirectory()) {
    fail(`The directory ${chalk.yellow(dir)} does not exist`);
  }
  return sourceDir;
}

function checkOutputDir(outDir: string, force: boolean): void {
  const isEarlierConversion = fs.existsSync(path.join(outDir, 'theneo.json'));
  if (!isDirectoryEmpty(outDir) && !isEarlierConversion && !force) {
    fail(
      `The directory ${chalk.yellow(outDir)} is not empty and is not a Theneo project. ` +
        'Choose another folder with --out, or pass --force to let the agent write into it'
    );
  }
}

async function chooseAgent(
  requested: string | undefined,
  isInteractive: boolean
): Promise<AgentDefinition> {
  const id = requested ?? (isInteractive ? await promptForAgent() : undefined);
  const agent = id === undefined ? undefined : getAgent(id);
  if (!agent) {
    fail(
      `Choose your coding agent with --agent <${AGENT_IDS.join('|')}> when running without a terminal`
    );
  }
  return agent;
}

/** Agents found on the PATH are listed first. */
function promptForAgent(): Promise<AgentId> {
  const installed = new Set(detectInstalledAgents());
  const choices = [...AGENTS]
    .sort(
      (first, second) =>
        Number(installed.has(second.id)) - Number(installed.has(first.id))
    )
    .map(agent => ({
      name: installed.has(agent.id) ? `${agent.label} (detected)` : agent.label,
      value: agent.id,
    }));
  return select({ message: 'Which coding agent do you use?', choices });
}

async function installSkillFor(
  agent: AgentDefinition,
  sourceDir: string,
  force: boolean,
  isInteractive: boolean
): Promise<InstallResult> {
  const skillsDir = path.join(sourceDir, agent.skillsDir);
  const result = installSkill(bundledSkillDir(), skillsDir, { force });
  if (result.status !== 'conflict') {
    return result;
  }

  const installedPath = displayPath(sourceDir, result.skillDir);
  if (!isInteractive) {
    fail(
      `${chalk.yellow(installedPath)} differs from the skill in this CLI version. Pass --force to replace it`
    );
  }
  const shouldReplace = await confirm({
    message: `${installedPath} differs from the skill in this CLI version. Replace it?`,
  });
  if (!shouldReplace) {
    console.log(chalk.dim('Keeping the installed skill as it is'));
    return result;
  }
  return installSkill(bundledSkillDir(), skillsDir, { force: true });
}

function describeInstall(
  result: InstallResult,
  agent: AgentDefinition
): string {
  switch (result.status) {
    case 'unchanged':
      return `Skill already installed for ${agent.label}`;
    case 'overwritten':
      return `Skill updated for ${agent.label}`;
    case 'conflict':
      return `Using the skill already installed for ${agent.label}`;
    default:
      return `Skill installed for ${agent.label}`;
  }
}

function printSource(source: SourceSummary, sourceDir: string): void {
  if (source.markdownFiles === 0) {
    console.log(
      chalk.yellow(
        `! No Markdown files found in ${sourceDir}. The agent will look for other formats (HTML or Confluence exports).`
      )
    );
    return;
  }
  console.log(
    chalk.green('✔ Source:'),
    `${source.label}, ${formatMarkdownCount(source.markdownFiles)}`
  );
}

function printPrompt(prompt: string): void {
  console.log();
  console.log(chalk.dim('Prompt for your agent:'));
  console.log(chalk.cyan(prompt));
  console.log();
}

function printNextSteps(cli: string, outDir: string): void {
  const commands = [
    `${cli} audit --dir ${outDir}`,
    `${cli} preview --project <project-slug> --dir ${outDir}`,
  ];
  console.log(
    chalk.dim(
      'When the conversion passes, the agent asks which Theneo project to preview it in. To check it yourself:'
    )
  );
  commands.forEach(command => console.log(' ', chalk.cyan(command)));
  console.log(
    chalk.dim('Tip:'),
    `the converter script and a report are written to ./${WORK_DIR}, outside the folder you import`
  );
}

interface Launch {
  binaryPath: string;
  args: string[];
}

/** How to start the agent, or undefined when the prompt should only be printed. */
function planLaunch(
  agent: AgentDefinition,
  prompt: string,
  isAllowed: boolean
): Launch | undefined {
  if (!isAllowed || !agent.binary || !agent.launchArgs) {
    return undefined;
  }
  const binaryPath = findOnPath(agent.binary);
  return binaryPath
    ? { binaryPath, args: agent.launchArgs(prompt) }
    : undefined;
}

async function handOff(
  agent: AgentDefinition,
  launch: Launch | undefined,
  sourceDir: string
): Promise<void> {
  const message = `Start ${agent.label} now with this prompt?`;
  if (!launch || !(await confirm({ message }))) {
    console.log(chalk.dim('Next:'), agent.howToStart);
    console.log();
    return;
  }

  const exitCode = await launchAgent(launch.binaryPath, launch.args, sourceDir);
  console.log();
  if (exitCode !== 0) {
    console.log(chalk.yellow(`! ${agent.label} exited with code ${exitCode}`));
  }
}

async function migrate(options: MigrateOptions): Promise<void> {
  const isInteractive = isInteractiveTerminal();
  const force = Boolean(options.force);
  const sourceDir = resolveSourceDir(options.dir);
  const outDir = path.resolve(sourceDir, options.out);
  checkOutputDir(outDir, force);

  const source = inspectSource(sourceDir, [outDir, WORK_DIR]);
  printSource(source, sourceDir);

  const agent = await chooseAgent(options.agent, isInteractive);
  const install = await installSkillFor(agent, sourceDir, force, isInteractive);
  const skillFile = displayPath(
    sourceDir,
    path.join(install.skillDir, SKILL_FILE)
  );
  console.log(
    chalk.green(`✔ ${describeInstall(install, agent)}:`),
    chalk.cyan(skillFile)
  );

  const cli = cliInvocation(findOnPath('theneo') !== undefined, CLI_VERSION);
  const outDirForAgent = displayPath(sourceDir, outDir);
  const prompt = buildKickoffPrompt({
    skillFile,
    outDir: outDirForAgent,
    source,
    cli,
  });
  printPrompt(prompt);

  const canLaunch = options.launch && isInteractive && canLaunchOnPlatform();
  await handOff(agent, planLaunch(agent, prompt, canLaunch), sourceDir);
  printNextSteps(cli, outDirForAgent);
}

export function initMigrateCommand(program: Command): Command {
  return program
    .command('migrate')
    .description(
      'Convert existing docs (GitBook, Mintlify, Docusaurus, MkDocs, Markdown) into a Theneo project with your AI coding agent'
    )
    .option(
      '--dir <directory>',
      'Folder that holds your current docs',
      process.cwd()
    )
    .option(
      '--out <directory>',
      'Folder the agent writes the Theneo project to',
      DEFAULT_OUTPUT_DIR
    )
    .addOption(
      new Option('--agent <agent>', 'Coding agent to set up').choices([
        ...AGENT_IDS,
      ])
    )
    .option('--no-launch', 'Install the skill and print the prompt only')
    .option(
      '--force',
      'Replace an installed skill that differs, and allow a non-empty output folder'
    )
    .action(tryCatch(migrate));
}
