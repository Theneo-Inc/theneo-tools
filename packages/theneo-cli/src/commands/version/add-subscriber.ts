import { Command } from 'commander';
import { tryCatch } from '../../utils/exception';
import { getProfile } from '../../context/auth';
import { createTheneo } from '../../core/theneo';
import { getProject, getProjectVersion } from '../../core/cli/project/project';
import { input } from '@inquirer/prompts';

async function getEmail(
  options: {
    email: string | undefined;
  },
  isInteractive: boolean
): Promise<string> {
  if (options.email) {
    return options.email;
  }

  if (!isInteractive) {
    console.error('Email is required');
    process.exit(1);
  }

  const email = await input({
    message: 'Enter the email of the subscriber',
  });
  if (!email) {
    console.error('Email is required');
    process.exit(1);
  }
  return email;
}

export function initAddSubscriberCreateCommand(): Command {
  return (
    new Command('add-subscriber')
      .description('Add a subscriber for project changelog')
      .option('--project <project-slug>', 'Project slug')
      .option('--workspace <workspace-slug>', 'Workspace slug')
      .option(
        '--projectVersion <previous-version-slug>',
        'Project version slug'
      )
      .option('--email <email>', 'Email of the new subscriber to change log')
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
            projectVersion: string | undefined;
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

            const projectVersionSlug = options.projectVersion;
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

            const email = await getEmail(options, isInteractive);

            const result = await theneo.addSubscriberToProjectVersion({
              projectVersionId: projectVersion.id,
              email: email,
            });

            if (result.err) {
              console.error(result.error.message);
              process.exit(1);
            }
            console.log(
              `Subscriber - ${email} was added successfully to ${projectVersionSlug}`
            );
          }
        )
      )
  );
}
