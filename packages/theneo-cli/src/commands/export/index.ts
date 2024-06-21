import { Command } from 'commander';
import { getProfile } from '../../context/auth';
import { createTheneo } from '../../core/theneo';
import { getProject, getProjectVersion } from '../../core/cli/project/project';
import { isInteractiveFlow } from '../../utils';

export function initExportCommand(program: Command): Command {
  return program
    .command('export', { hidden: true })
    .option('--key <project-slug>', 'project slug - deprecated')
    .option('--project <project-slug>', 'project slug')
    .option(
      '--versionSlug <version-slug>',
      'version slug to get the exported data for'
    )
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

    .action(
      async (options: {
        key: string | undefined;
        project: string | undefined;
        workspace: string | undefined;
        profile: string | undefined;
        dir: string;
        versionSlug: string | undefined;
        publishedView: boolean | undefined;
      }) => {
        const profile = getProfile(options.profile);
        const theneo = createTheneo(profile);
        const isInteractive = isInteractiveFlow(options);
        const project = await getProject(theneo, {
          projectKey: options.key || options.project,
          workspaceKey: options.workspace,
        });

        const version = await getProjectVersion(
          theneo,
          project,
          options.versionSlug,
          isInteractive
        );
        const res = await theneo.exportProject({
          projectId: project.id,
          dir: options.dir,
          versionId: version?.id,
          shouldGetPublicViewData: options.publishedView,
        });

        if (res.err) {
          console.error(res.error.message);
          process.exit(1);
        }
      }
    );
}
