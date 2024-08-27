import { Command } from 'commander';
import { tryCatch } from '../../utils/exception';
import { getProfile } from '../../context/auth';
import { createTheneo } from '../../core/theneo';
import { getProject, getProjectVersion } from '../../core/cli/project/project';

export function initAddSubscriberCreateCommand(): Command {
  return (
    new Command('add-subscriber')
      .description(
        "Add a subscriber to a project's version in order to receive documentation updates"
      )
      .option('--project <project-slug>', 'Project slug')
      .option(
        '--workspace <workspace-slug>',
        'Workspace slug where the project is created'
      )
      .option(
        '--previousVersion <previous-version-slug>',
        'Project version slug to subscribe to'
      )
      .option('--email <email>', 'email to subscribe the project version')
      .option(
        '--profile <string>',
        'Use a specific profile from your config file.'
      )
      // .option('--default', 'Set as default version')
      .action(
        tryCatch(
          async (options: {
            project: string | undefined;
            workspace: string | undefined;
            previousVersion: string | undefined;
            email: string | undefined;
            profile: string | undefined;
          }) => {
            const profile = getProfile(options.profile);
            const theneo = createTheneo(profile);

            const isInteractive = !options.email;
            const project = await getProject(theneo, {
              projectKey: options.project,
              workspaceKey: options.workspace,
            });

            const projectVersionSlug = options.previousVersion;
            const projectVersion = await getProjectVersion(
              theneo,
              project,
              projectVersionSlug,
              isInteractive
            );
            if (!projectVersion) {
              console.error('please provide a valid project version');
              process.exit(1);
            }

            await theneo.addSubscriberToProjectVersion({
              versionId: projectVersion.id,
              email: options.email,
            });
          }
        )
      )
  );
}
