import { Workspace } from '@theneo/sdk';
import { select } from '@inquirer/prompts';

export function getWorkspace(
  workspaces: Workspace[],
  workspace: string | undefined,
  isInteractive: boolean
): Promise<Workspace> {
  if (workspaces.length === 0) {
    console.error('No workspaces found.');
    process.exit(1);
  }
  if (workspace) {
    const workspaceFound = workspaces.find(ws => ws.slug === workspace);
    if (workspaceFound) {
      return Promise.resolve(workspaceFound);
    }
    console.error(`Workspace ${workspace} not found.`);
    process.exit(1);
  }

  if (workspaces.length === 1) {
    const workspace = workspaces[0]!;
    console.info(`Using default workspace: ${workspace.name}`);
    return Promise.resolve(workspace);
  }
  if (!isInteractive) {
    const defaultWorkspace = workspaces.find(ws => ws.isDefault);
    if (defaultWorkspace) {
      return Promise.resolve(defaultWorkspace);
    }
    const firstWorkspace = workspaces[0];
    if (firstWorkspace === undefined) {
      console.error('No workspaces found.');
      process.exit(1);
    }
    console.warn(
      `no default workspace found, using first workspace: ${firstWorkspace.name}`
    );
    return Promise.resolve(firstWorkspace);
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
