import fs from 'fs';
import path from 'path';

export type AgentId =
  | 'claude-code'
  | 'cursor'
  | 'codex'
  | 'gemini'
  | 'copilot'
  | 'windsurf'
  | 'other';

export interface AgentDefinition {
  id: AgentId;
  label: string;
  /** Project-level folder the agent discovers skills in, relative to the docs folder. */
  skillsDir: string;
  /** Terminal binary that can be started with a first prompt. Absent for editor-only agents. */
  binary?: string;
  /** Arguments that open an interactive session with the prompt already sent. */
  launchArgs?: (prompt: string) => string[];
  /** Shown when the agent is not started by the CLI. */
  howToStart: string;
}

const promptOnly = (prompt: string): string[] => [prompt];

// Skill folders and launch arguments follow each vendor's own documentation.
// The kickoff prompt also names the installed SKILL.md path, so the conversion
// still works if an agent stops scanning the folder listed here.
export const AGENTS: readonly AgentDefinition[] = [
  {
    id: 'claude-code',
    label: 'Claude Code',
    skillsDir: path.join('.claude', 'skills'),
    binary: 'claude',
    launchArgs: promptOnly,
    howToStart: 'Run `claude` in this folder and paste the prompt.',
  },
  {
    id: 'cursor',
    label: 'Cursor',
    skillsDir: path.join('.cursor', 'skills'),
    binary: 'cursor-agent',
    launchArgs: promptOnly,
    howToStart:
      'Open this folder in Cursor, start a new Agent chat and paste the prompt.',
  },
  {
    id: 'codex',
    label: 'Codex',
    skillsDir: path.join('.agents', 'skills'),
    binary: 'codex',
    launchArgs: promptOnly,
    howToStart: 'Run `codex` in this folder and paste the prompt.',
  },
  {
    id: 'gemini',
    label: 'Gemini CLI',
    skillsDir: path.join('.gemini', 'skills'),
    binary: 'gemini',
    launchArgs: (prompt: string): string[] => ['-i', prompt],
    howToStart: 'Run `gemini` in this folder and paste the prompt.',
  },
  {
    id: 'copilot',
    label: 'GitHub Copilot',
    skillsDir: path.join('.github', 'skills'),
    howToStart:
      'Open this folder in VS Code, switch Copilot Chat to Agent mode and paste the prompt.',
  },
  {
    id: 'windsurf',
    label: 'Windsurf',
    skillsDir: path.join('.windsurf', 'skills'),
    howToStart:
      'Open this folder in Windsurf and paste the prompt into Cascade.',
  },
  {
    id: 'other',
    label: 'Other agent',
    skillsDir: path.join('.agents', 'skills'),
    howToStart: 'Open your coding agent in this folder and paste the prompt.',
  },
];

export const AGENT_IDS: readonly AgentId[] = AGENTS.map(agent => agent.id);

export function getAgent(id: string): AgentDefinition | undefined {
  return AGENTS.find(agent => agent.id === id);
}

function isFile(target: string): boolean {
  try {
    return fs.statSync(target).isFile();
  } catch {
    return false;
  }
}

function executableNames(binary: string, env: NodeJS.ProcessEnv): string[] {
  if (process.platform !== 'win32') {
    return [binary];
  }
  const extensions = (env.PATHEXT ?? '.EXE;.CMD;.BAT').split(';');
  return [binary, ...extensions.map(extension => binary + extension)];
}

/** Absolute path of `binary` on the PATH in `env`, or undefined when it is not installed. */
export function findOnPath(
  binary: string,
  env: NodeJS.ProcessEnv = process.env
): string | undefined {
  const directories = (env.PATH ?? env.Path ?? '')
    .split(path.delimiter)
    .filter(directory => directory.length > 0);
  const names = executableNames(binary, env);

  for (const directory of directories) {
    for (const name of names) {
      const candidate = path.join(directory, name);
      if (isFile(candidate)) {
        return candidate;
      }
    }
  }
  return undefined;
}

/** Agents whose terminal binary is installed, in registry order. */
export function detectInstalledAgents(
  env: NodeJS.ProcessEnv = process.env
): AgentId[] {
  return AGENTS.filter(
    agent => agent.binary !== undefined && findOnPath(agent.binary, env)
  ).map(agent => agent.id);
}
