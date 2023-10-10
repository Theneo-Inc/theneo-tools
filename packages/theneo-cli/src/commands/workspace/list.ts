import { Command } from 'commander';
import { getProfile } from '../../context/auth';
import Table from 'cli-table';
import { createTheneo } from '../../core/theneo';
import { Workspace } from '@theneo/sdk';

export function initWorkspaceListCommand() {
  return new Command('list')
    .description('List workspaces')
    .option('--json', 'Output as JSON', false)
    .option(
      '--profile <string>',
      'Use a specific profile from your config file.'
    )
    .action(async (options: { json: boolean; profile: string | undefined }) => {
      const profile = getProfile(options.profile);
      const theneo = createTheneo(profile);
      const workspaces = await theneo.listWorkspaces();

      if (workspaces.err) {
        console.error(workspaces.error.message);
        process.exit(1);
      }
      if (options.json) {
        console.log(JSON.stringify(workspaces.value, null, 2));
      } else {
        const table = new Table({
          head: ['#', 'Name', 'Slug', 'Default', 'Role'],
          rows: workspaces.value.map((workspace: Workspace, index: number) =>
            getWorkspaceRow(index, workspace)
          ),
        });

        console.log(table.toString());
      }
    });
}

function getWorkspaceRow(index: number, workspace: Workspace): string[] {
  return [
    String(index),
    workspace.name,
    workspace.slug,
    workspace.isDefault ? '*' : '',
    workspace.role,
  ];
}
