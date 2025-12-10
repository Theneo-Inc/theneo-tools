import { Command } from 'commander';
import { getProfile } from '../../context/auth';
import { createTheneo } from '../../core/theneo';
import { getProject, getProjectVersion } from '../../core/cli/project/project';
import { isInteractiveFlow } from '../../utils';
import { tryCatch } from '../../utils/exception';
import { confirm } from '@inquirer/prompts';
import { isDirectoryEmpty } from '../../utils/file';
import { ProjectVersion } from '@theneo/sdk';
import { saveOpenapiSpec } from '../../core/cli/export/openAPISpecConvertor';
import { createSpinner, Spinner } from 'nanospinner';
import chalk from 'chalk';

function handleExportError(
  spinner: Spinner,
  errorMsg: string,
  tabSlug?: string
): void {
  if (errorMsg.includes('not found') && errorMsg.includes('Available tabs:')) {
    const availableTabsMatch = errorMsg.match(/Available tabs:\s*([^"}\]]+)/);
    const availableTabs = availableTabsMatch?.[1]?.trim() || 'none';

    spinner.error({
      text: chalk.red(`✖ Tab '${chalk.yellow(tabSlug)}' not found!`),
    });
    console.log(
      chalk.dim('\nAvailable tabs:'),
      availableTabs === '' || availableTabs === 'none'
        ? chalk.yellow('No tabs available')
        : chalk.cyan(availableTabs)
    );
  } else {
    spinner.error({ text: chalk.red(`✖ ${errorMsg}`) });
  }
}

export function initExportCommand(program: Command): Command {
  return program
    .command('export')
    .option('--key <project-slug>', 'project slug - deprecated')
    .option('--project <project-slug>', 'project slug')
    .option(
      '--versionSlug <version-slug>',
      'version slug to get the exported data for - deprecated'
    )
    .option('--projectVersion <version-slug>', 'Version slug')
    .option(
      '--workspace <workspace-slug>',
      'Enter workspace slug where the project should be created in, if not present uses default workspace'
    )
    .option(
      '--profile <string>',
      'Use a specific profile from your config file.'
    )
    .option(
      '--dir <directory>',
      'directory location where the project will be exported',
      'docs'
    )
    .option(
      '--publishedView',
      'By default it will export data from editor, pass this flag to get published project data',
      false
    )
    .option('--force', 'Overwrite existing files without prompting', false)
    .option('--openapi', 'Export as OpenAPI spec')
    .option(
      '--format <format>',
      'exported OpenAPI spec format (yaml or json)',
      'yaml'
    )
    .option('--tab <tab-slug>', 'Export specific tab only (optional)')
    .action(
      tryCatch(
        async (options: {
          key: string | undefined;
          project: string | undefined;
          workspace: string | undefined;
          profile: string | undefined;
          dir: string;
          versionSlug: string | undefined;
          projectVersion: string | undefined;
          publishedView: boolean | undefined;
          force: boolean | undefined;
          openapi: boolean | undefined;
          format: 'yaml' | 'json';
          tab: string | undefined;
        }) => {
          const profile = getProfile(options.profile);
          const theneo = createTheneo(profile);
          const isInteractive = isInteractiveFlow(options);
          const project = await getProject(theneo, {
            projectKey: options.key || options.project,
            workspaceKey: options.workspace,
          });

          const version: ProjectVersion | null = await getProjectVersion(
            theneo,
            project,
            options.versionSlug || options.projectVersion,
            isInteractive
          );

          if (!isDirectoryEmpty(options.dir) && !options.force) {
            if (process.env.CI) {
              console.error(
                chalk.red(
                  `✖ The directory ${chalk.yellow(options.dir)} is not empty. Please provide an empty directory`
                )
              );
              process.exit(1);
            }
            const shouldContinue = await confirm({
              message: `The directory ${options.dir} is not empty. Export will overwrite existing files. Continue?`,
            });
            if (!shouldContinue) {
              console.log(chalk.dim('Export cancelled'));
              return;
            }
          }

          // Enhanced spinner with context
          const exportType = options.openapi ? 'OpenAPI spec' : 'documentation';
          const spinnerText = options.tab
            ? `Exporting tab ${chalk.cyan(options.tab)} as ${exportType}...`
            : `Exporting ${exportType}...`;
          const spinner = createSpinner(spinnerText).start();

          const res = await theneo.exportProject({
            projectId: project.id,
            dir: options.dir,
            versionId: version?.id,
            shouldGetPublicViewData: options.publishedView,
            openapi: options.openapi,
            tabSlug: options.tab,
          });

          if (res.err) {
            handleExportError(spinner, res.error.message, options.tab);
            process.exit(1);
          }

          if (options.openapi) {
            const openapiResponse = res.unwrap();
            saveOpenapiSpec(openapiResponse, options.dir, options.format);
          }

          const successMsg = options.tab
            ? `✔ Tab ${chalk.cyan(options.tab)} exported successfully!`
            : '✔ Project exported successfully!';

          spinner.success({
            text: chalk.green(successMsg),
          });

          console.log(chalk.dim('Export location:'), chalk.cyan(options.dir));
          if (options.openapi) {
            console.log(
              chalk.dim('Format:'),
              chalk.cyan(options.format.toUpperCase())
            );
          }
        }
      )
    );
}
