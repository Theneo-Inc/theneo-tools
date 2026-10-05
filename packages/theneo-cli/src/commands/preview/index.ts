import { Command } from 'commander';
import chalk from 'chalk';
import { createSpinner } from 'nanospinner';
import { getProfile } from '../../context/auth';
import { createTheneo } from '../../core/theneo';
import { getProject, getProjectVersion } from '../../core/cli/project/project';
import { getInputDirectoryLocation } from '../../core/cli/project';
import { parseExpiresIn } from '../../core/cli/branch';
import { tryCatch } from '../../utils/exception';
import { isInteractiveFlow } from '../../utils';

export function initPreviewCommand(program: Command): Command {
  return program
    .command('preview')
    .description(
      'Publish a markdown directory to a temporary branch and get a preview link that expires (24h by default)'
    )
    .option('--project <project-slug>', 'Project slug')
    .option('--workspace <workspace-slug>', 'Workspace slug')
    .option(
      '--projectVersion <version-slug>',
      'Version to preview against (default version if omitted)'
    )
    .option('--dir <directory>', 'Generated theneo project directory')
    .option(
      '--expiresIn <hours>',
      'Lifetime of the preview in hours (default 24, max 168)'
    )
    .option('--name <branch-name>', 'Custom name for the preview branch')
    .option('--tab <tab-slug>', 'Import into a specific tab only (optional)')
    .option('--json', 'Output as JSON', false)
    .option(
      '--profile <string>',
      'Use a specific profile from your config file.'
    )
    .action(
      tryCatch(
        async (options: {
          project: string | undefined;
          workspace: string | undefined;
          projectVersion: string | undefined;
          dir: string | undefined;
          expiresIn: string | undefined;
          name: string | undefined;
          tab: string | undefined;
          json: boolean;
          profile: string | undefined;
        }) => {
          const isInteractive = isInteractiveFlow({
            key: undefined,
            project: options.project,
          });
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
            isInteractive
          );
          const directory =
            options.dir ??
            (isInteractive ? await getInputDirectoryLocation() : undefined);
          if (!directory) {
            throw new Error('Directory is required');
          }
          const expiresInHours = parseExpiresIn(options.expiresIn);

          const spinner = createSpinner('Creating preview deployment').start();
          const result = await theneo.createPreviewDeployment({
            projectId: project.id,
            versionId: version?.id,
            directory,
            name: options.name,
            expiresInHours,
            tabSlug: options.tab,
          });
          if (result.err) {
            spinner.error({
              text: chalk.red(`✖ Preview failed: ${result.error.message}`),
            });
            process.exit(1);
          }
          spinner.success({ text: chalk.green('✔ Preview deployment ready') });
          if (options.json) {
            console.log(JSON.stringify(result.value, null, 2));
            return;
          }
          console.log(
            chalk.dim('Preview page:'),
            chalk.cyan(result.value.previewUrl)
          );
          console.log(chalk.dim('Expires at:'), result.value.expiresAt);
          console.log(
            chalk.dim('Preview branch:'),
            `${result.value.branch.name} (${result.value.branch.id})`
          );
          const publishCommand = chalk.cyan(
            `theneo branch publish --branch ${result.value.branch.id}`
          );
          const deleteCommand = chalk.cyan(
            `theneo branch delete --branch ${result.value.branch.id}`
          );
          console.log(
            chalk.dim('Tip:'),
            `run ${publishCommand} to publish it, or ${deleteCommand} to discard it early`
          );
        }
      )
    );
}
