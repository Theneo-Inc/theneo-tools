import { Command } from 'commander';
import { getProfile } from '../../context/auth';
import { createTheneo } from '../../core/theneo';
import { createSpinner } from 'nanospinner';
import { getProject } from '../../core/cli/project/project';
import { tryCatch } from '../../utils/exception';

export function initProjectPreviewCommand(): Command {
  return new Command('preview')
    .description(
      'Preview project, this command is used to validate published page before actually publishing it'
    )
    .option('--key <project-slug>', 'Project slug to preview')
    .option('--workspace <workspace-slug>', 'Workspace slug')
    .option(
      '--profile <string>',
      'Use a specific profile from your config file.'
    )
    .action(
      tryCatch(
        async (options: {
          key: string | undefined;
          workspace: string | undefined;
          profile: string | undefined;
        }) => {
          const profile = getProfile(options.profile);
          const theneo = createTheneo(profile);
          const project = await getProject(theneo, {
            projectKey: options.key,
            workspaceKey: options.workspace,
          });
          const spinner = createSpinner('Creating preview').start();
          const link = theneo.getPreviewProjectLink(project.id);

          spinner.success({
            text: `project preview created successfully! Page: ${link}`,
          });
        }
      )
    );
}
