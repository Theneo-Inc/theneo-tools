import { Workspace } from '@theneo/sdk';
import { select } from '@inquirer/prompts';

export async function getWorkspace(
  workspaces: Workspace[],
  workspace: undefined | string
): Promise<Workspace> {
  if (workspaces.length === 0) {
    console.error('No workspaces found.');
    process.exit(1);
  }
  if (workspace) {
    const workspaceFound = workspaces.find(ws => ws.slug === workspace);
    if (workspaceFound) {
      return workspaceFound;
    }
    console.error(`Workspace ${workspace} not found.`);
    process.exit(1);
  }

  if (workspaces.length === 1) {
    const workspace = workspaces[0]!;
    console.info(`Using default workspace: ${workspace.name}`);
    return workspace;
  }

  return select({
    message: 'Pick a workspace.',
    choices: workspaces.map(ws => {
      if (ws.isDefault) {
        return { value: ws, name: ws.name, description: 'default' };
      }
      return { value: ws, name: ws.name };
    }),
  });
}
