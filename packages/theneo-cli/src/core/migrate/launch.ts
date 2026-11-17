import { spawn } from 'child_process';

/**
 * Whether the CLI can start a terminal agent itself. Windows installs agents
 * as `.cmd` shims, which need a shell to run; passing a prompt through a shell
 * would mean quoting it, so there the prompt is printed instead.
 */
export function canLaunchOnPlatform(
  platform: NodeJS.Platform = process.platform
): boolean {
  return platform !== 'win32';
}

/**
 * Start the agent in `cwd` and hand it this terminal. Arguments are passed as
 * an array with no shell, so the prompt is never interpreted as a command.
 * Resolves with the agent's exit code once the user leaves the session.
 */
export function launchAgent(
  binaryPath: string,
  args: string[],
  cwd: string
): Promise<number> {
  return new Promise((resolve, reject) => {
    const child = spawn(binaryPath, args, { cwd, stdio: 'inherit' });
    child.on('error', reject);
    child.on('close', code => resolve(code ?? 0));
  });
}
