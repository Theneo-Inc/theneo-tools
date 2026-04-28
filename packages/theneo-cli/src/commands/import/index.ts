import { Command } from 'commander';
import { getProfile } from '../../context/auth';
import { createTheneo } from '../../core/theneo';
import {
  getProject,
  getProjectVersion,
  getShouldPublish,
} from '../../core/cli/project/project';
import { getInputDirectoryLocation } from '../../core/cli/project';
import { ImportOption } from '@theneo/sdk';
import { createSpinner, Spinner } from 'nanospinner';
import { isInteractiveFlow } from '../../utils';
import { tryCatch } from '../../utils/exception';
import { createNewProjectVersion } from '../../core/cli/version/create';
import chalk from 'chalk';

function handleTabImportError(
  spinner: Spinner,
  coreMsg: string,
  tabSlug: string
): void {
  if (coreMsg.includes('no tabs') || coreMsg.includes('no tabs configured')) {
    spinner.error({
      text: chalk.red('✖ Project has no tabs configured'),
    });
    console.log(
      chalk.dim('\nTip:'),
      chalk.yellow('Import the full project first without --tab flag')
    );
    return;
  }
  const availableTabsMatch = coreMsg.match(/Available tabs:\s*([^\n"}\]]+)/);
  const availableTabs = availableTabsMatch?.[1]?.trim();
  const tabLabel = `'${tabSlug}'`;
  spinner.error({
    text: chalk.red(`✖ Tab ${chalk.yellow(tabLabel)} not found in project`),
  });
  if (availableTabs && availableTabs.length > 0) {
    console.log(chalk.dim('\nAvailable tabs:'), chalk.cyan(availableTabs));
  } else {
    console.log(
      chalk.dim('\nTip:'),
      chalk.yellow(
        'Import the full project first without --tab flag to create tabs'
      )
    );
  }
}

function handleImportError(
  spinner: Spinner,
  errorMsg: string,
  tabSlug?: string
): void {
  // Strip stack trace lines (everything after the first newline) and common prefixes
  const coreMsg = (errorMsg.split('\n')[0] ?? errorMsg)
    .replace(/^"?(Error while importing markdown files:\s*)/i, '')
    .replace(/^Error:\s*/i, '')
    .replace(/^"|"$/g, '')
    .trim();

  if (
    tabSlug &&
    (coreMsg.includes('not found') || coreMsg.includes('no tabs'))
  ) {
    handleTabImportError(spinner, coreMsg, tabSlug);
  } else if (
    coreMsg.toLowerCase().includes('unauthorized') ||
    coreMsg.includes('401')
  ) {
    spinner.error({
      text: chalk.red('✖ Unauthorized: invalid or expired API key'),
    });
    console.log(
      chalk.dim('\nRun:'),
      chalk.cyan('theneo login'),
      chalk.dim('to re-authenticate')
    );
  } else if (
    coreMsg.toLowerCase().includes('not found') ||
    coreMsg.includes('404')
  ) {
    spinner.error({ text: chalk.red(`✖ Resource not found: ${coreMsg}`) });
  } else if (
    coreMsg.toLowerCase().includes('permission') ||
    coreMsg.includes('403')
  ) {
    spinner.error({ text: chalk.red(`✖ ${coreMsg}`) });
  } else {
    spinner.error({ text: chalk.red(`✖ Import failed: ${coreMsg}`) });
  }
}

function handleImportSuccess(
  spinner: Spinner,
  publishData: any,
  editorLink: string,
  tabSlug?: string
): void {
  if (publishData?.publishedPageUrl) {
    spinner.success({
      text: chalk.green('✔ Project published successfully!'),
    });
    console.log(
      chalk.dim('Published page:'),
      chalk.cyan(publishData.publishedPageUrl)
    );
  } else {
    const successMsg = tabSlug
      ? `✔ Tab ${chalk.cyan(tabSlug)} updated successfully!`
      : '✔ Project updated successfully!';

    spinner.success({
      text: chalk.green(successMsg),
    });
    console.log(chalk.dim('Editor link:'), chalk.cyan(editorLink));
  }
}

function getDirectory(
  dir: string | undefined,
  isInteractive: boolean
): Promise<string> | string {
  if (dir) {
    return dir;
  }
  if (isInteractive) {
    return getInputDirectoryLocation();
  }
  throw new Error('Directory is required');
}

export function initImportCommand(program: Command): Command {
  return program
    .command('import', { hidden: true })
    .description('Update theneo project from generated markdown directory')
    .option('--key <project-slug>', 'project key - deprecated')
    .option('--project <project-slug>', 'project slug')
    .option(
      '--workspace <workspace-slug>',
      'Enter workspace slug where the project should be created in, if not present uses default workspace'
    )
    .option('--dir <directory>', 'Generated theneo project directory')
    .option('--publish', 'Automatically publish the project', false)
    .option('--versionSlug <version>', 'Project version slug - deprecated')
    .option('--projectVersion <version-slug>', 'Version slug')
    .option(
      '--profile <string>',
      'Use a specific profile from your config file.'
    )
    .option('--tab <tab-slug>', 'Import into specific tab only (optional)')
    .action(
      tryCatch(
        async (options: {
          key: string | undefined;
          project: string | undefined;
          workspace: string | undefined;
          versionSlug: string | undefined;
          projectVersion: string | undefined;
          // importType: ImportOption | undefined;
          dir: string | undefined;
          publish: boolean;
          profile: string | undefined;
          tab: string | undefined;
        }) => {
          const isInteractive = isInteractiveFlow(options);
          const profile = getProfile(options.profile);
          const theneo = createTheneo(profile);
          const project = await getProject(theneo, {
            projectKey: options.key || options.project,
            workspaceKey: options.workspace,
          });
          const projectVersion = options.versionSlug || options.projectVersion;
          const version = await getProjectVersion(
            theneo,
            project,
            projectVersion,
            isInteractive
          );
          const projectVersionId = await createNewProjectVersion(
            theneo,
            project.id,
            version,
            projectVersion
          );

          const directory = await getDirectory(options.dir, isInteractive);
          // const importOption: ImportOption = await getImportOption(
          //   options,
          //   isInteractive
          // );
          const shouldPublish = await getShouldPublish(options, isInteractive);

          // Enhanced spinner with context
          const spinnerText = options.tab
            ? `Importing to tab ${chalk.cyan(options.tab)}...`
            : 'Importing documentation...';
          const spinner = createSpinner(spinnerText).start();

          const res = await theneo.importProjectDocument({
            projectId: project.id,
            versionId: projectVersionId,
            publish: shouldPublish,
            data: {
              directory,
            },
            importOption: ImportOption.OVERWRITE,
            tabSlug: options.tab,
          });

          if (res.err) {
            handleImportError(spinner, res.error.message, options.tab);
            process.exit(1);
          }

          const editorLink = `${profile.appUrl}/editor/${project.id}`;
          handleImportSuccess(
            spinner,
            res.value.publishData,
            editorLink,
            options.tab
          );
        }
      )
    );
}
