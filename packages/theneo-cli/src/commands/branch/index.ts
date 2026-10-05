import { Command } from 'commander';
import Table from 'cli-table';
import chalk from 'chalk';
import { createSpinner } from 'nanospinner';
import { Branch, BranchKind } from '@theneo/sdk';
import { getProfile } from '../../context/auth';
import { createTheneo } from '../../core/theneo';
import { getProject, getProjectVersion } from '../../core/cli/project/project';
import { getBranchRow, parseExpiresIn } from '../../core/cli/branch';
import { tryCatch } from '../../utils/exception';
import { isInteractiveFlow } from '../../utils';

const profileOption = [
  '--profile <string>',
  'Use a specific profile from your config file.',
] as const;

function initBranchListCommand(): Command {
  return new Command('list')
    .description('List open branches of a project')
    .option('--project <project-slug>', 'Project slug')
    .option('--workspace <workspace-slug>', 'Workspace slug')
    .option('--projectVersion <version-slug>', 'Only branches of this version')
    .option('--json', 'Output as JSON', false)
    .option(...profileOption)
    .action(
      tryCatch(
        async (options: {
          project: string | undefined;
          workspace: string | undefined;
          projectVersion: string | undefined;
          json: boolean;
          profile: string | undefined;
        }) => {
          const profile = getProfile(options.profile);
          const theneo = createTheneo(profile);
          const project = await getProject(theneo, {
            projectKey: options.project,
            workspaceKey: options.workspace,
          });
          const version = options.projectVersion
            ? await getProjectVersion(
                theneo,
                project,
                options.projectVersion,
                false
              )
            : null;
          const result = await theneo.listBranches({
            projectId: project.id,
            versionId: version?.id,
          });
          if (result.err) {
            console.error(
              chalk.red(`✖ Failed to list branches: ${result.error.message}`)
            );
            process.exit(1);
          }
          if (options.json) {
            console.log(JSON.stringify(result.value.branches, null, 2));
            return;
          }
          if (result.value.branches.length === 0) {
            console.warn('No open branches found');
            return;
          }
          const table = new Table({
            head: [
              '#',
              'Name',
              'Kind',
              'Status',
              'Expires',
              'Editor URL',
              'ID',
            ],
            rows: result.value.branches.map((branch: Branch, index: number) =>
              getBranchRow(index, branch, profile.appUrl)
            ),
          });
          console.log(table.toString());
        }
      )
    );
}

function initBranchCreateCommand(): Command {
  return new Command('create')
    .description('Create a branch from a project version')
    .requiredOption('--name <name>', 'Branch name')
    .option('--project <project-slug>', 'Project slug')
    .option('--workspace <workspace-slug>', 'Workspace slug')
    .option(
      '--projectVersion <version-slug>',
      'Version to branch from (default version if omitted)'
    )
    .option('--json', 'Output as JSON', false)
    .option(...profileOption)
    .action(
      tryCatch(
        async (options: {
          name: string;
          project: string | undefined;
          workspace: string | undefined;
          projectVersion: string | undefined;
          json: boolean;
          profile: string | undefined;
        }) => {
          const profile = getProfile(options.profile);
          const theneo = createTheneo(profile);
          const project = await getProject(theneo, {
            projectKey: options.project,
            workspaceKey: options.workspace,
          });
          const version = await getProjectVersion(
            theneo,
            project,
            options.projectVersion,
            isInteractiveFlow({ key: undefined, project: options.project })
          );
          const spinner = createSpinner('Creating branch').start();
          const result = await theneo.createBranch({
            projectId: project.id,
            versionId: version?.id,
            name: options.name,
            kind: BranchKind.STANDARD,
          });
          if (result.err) {
            spinner.error({ text: chalk.red(`✖ ${result.error.message}`) });
            process.exit(1);
          }
          spinner.success({
            text: chalk.green(
              `✔ Branch ${chalk.cyan(result.value.name)} created`
            ),
          });
          if (options.json) {
            console.log(JSON.stringify(result.value, null, 2));
            return;
          }
          console.log(chalk.dim('Branch id:'), result.value.id);
          console.log(
            chalk.dim('Editor link:'),
            chalk.cyan(
              `${profile.appUrl}/editor/${result.value.projectId}/${result.value.versionId}?branch=${result.value.id}`
            )
          );
        }
      )
    );
}

type BranchAction = 'delete' | 'rebase' | 'publish';

function initBranchActionCommand(
  action: BranchAction,
  description: string,
  progress: string,
  done: string
): Command {
  return new Command(action)
    .description(description)
    .requiredOption('--branch <branch-id>', 'Branch id')
    .option(...profileOption)
    .action(
      tryCatch(
        async (options: { branch: string; profile: string | undefined }) => {
          const profile = getProfile(options.profile);
          const theneo = createTheneo(profile);
          const spinner = createSpinner(progress).start();
          const result =
            action === 'delete'
              ? await theneo.deleteBranch(options.branch)
              : action === 'rebase'
                ? await theneo.rebaseBranch(options.branch)
                : await theneo.publishBranch(options.branch);
          if (result.err) {
            spinner.error({ text: chalk.red(`✖ ${result.error.message}`) });
            process.exit(1);
          }
          spinner.success({ text: chalk.green(`✔ ${done}`) });
        }
      )
    );
}

function initBranchLinkCommand(): Command {
  return new Command('link')
    .description('Create a read-only preview link for a branch')
    .requiredOption('--branch <branch-id>', 'Branch id')
    .option(
      '--expiresIn <hours>',
      'Link lifetime in hours (default 24, max 168)'
    )
    .option(...profileOption)
    .action(
      tryCatch(
        async (options: {
          branch: string;
          expiresIn: string | undefined;
          profile: string | undefined;
        }) => {
          const profile = getProfile(options.profile);
          const theneo = createTheneo(profile);
          const expiresInHours = parseExpiresIn(options.expiresIn);
          const spinner = createSpinner('Creating preview link').start();
          const result = await theneo.createBranchPreviewLink(
            options.branch,
            expiresInHours
          );
          if (result.err) {
            spinner.error({ text: chalk.red(`✖ ${result.error.message}`) });
            process.exit(1);
          }
          spinner.success({ text: chalk.green('✔ Preview link created') });
          console.log(
            chalk.dim('Preview page:'),
            chalk.cyan(result.value.previewUrl)
          );
          console.log(chalk.dim('Expires at:'), result.value.expiresAt);
        }
      )
    );
}

export function initBranchCommand(program: Command): Command {
  return program
    .command('branch <action>')
    .description('Documentation branch related commands')
    .addCommand(initBranchListCommand())
    .addCommand(initBranchCreateCommand())
    .addCommand(
      initBranchActionCommand(
        'delete',
        'Abandon a branch and discard its draft content',
        'Abandoning branch',
        'Branch abandoned'
      )
    )
    .addCommand(
      initBranchActionCommand(
        'rebase',
        'Pull the latest base changes into a branch',
        'Rebasing branch',
        'Branch rebased'
      )
    )
    .addCommand(
      initBranchActionCommand(
        'publish',
        'Merge a branch into its base version and publish it (workspace admins only)',
        'Publishing branch',
        'Branch published'
      )
    )
    .addCommand(initBranchLinkCommand());
}
