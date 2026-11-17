import fs from 'fs';
import path from 'path';

export const SKILL_NAME = 'docs-to-theneo';
export const SKILL_FILE = 'SKILL.md';

export type InstallStatus =
  | 'installed'
  | 'unchanged'
  | 'conflict'
  | 'overwritten';

export interface InstallResult {
  status: InstallStatus;
  /** Folder the skill lives in after install. */
  skillDir: string;
}

/**
 * The skill shipped inside the npm package. `skills/` sits at the package root,
 * three levels above both `src/core/migrate` and `dist/core/migrate`.
 */
export function bundledSkillDir(): string {
  return path.join(__dirname, '..', '..', '..', 'skills', SKILL_NAME);
}

function listFiles(directory: string, prefix = ''): string[] {
  const files: string[] = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const relative = path.join(prefix, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFiles(path.join(directory, entry.name), relative));
    } else if (entry.isFile() && entry.name !== '.DS_Store') {
      files.push(relative);
    }
  }
  return files.sort();
}

type FileState = 'missing' | 'same' | 'different';

function compareFile(source: string, target: string): FileState {
  if (!fs.existsSync(target)) {
    return 'missing';
  }
  return fs.readFileSync(source).equals(fs.readFileSync(target))
    ? 'same'
    : 'different';
}

/**
 * Copy the skill in `sourceDir` to `<skillsDir>/docs-to-theneo`.
 *
 * Nothing is written when an installed file differs from the bundled one and
 * `force` is not set: the caller decides whether to overwrite. Files in the
 * target that the bundled skill does not have are left alone.
 */
export function installSkill(
  sourceDir: string,
  skillsDir: string,
  options: { force: boolean }
): InstallResult {
  const skillDir = path.join(skillsDir, SKILL_NAME);
  const files = listFiles(sourceDir);
  if (!files.includes(SKILL_FILE)) {
    throw new Error(`The bundled skill is missing ${SKILL_FILE}: ${sourceDir}`);
  }

  const states = files.map(file =>
    compareFile(path.join(sourceDir, file), path.join(skillDir, file))
  );
  const hasDifferent = states.includes('different');

  if (states.every(state => state === 'same')) {
    return { status: 'unchanged', skillDir };
  }
  if (hasDifferent && !options.force) {
    return { status: 'conflict', skillDir };
  }

  for (const file of files) {
    const target = path.join(skillDir, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(sourceDir, file), target);
  }
  return { status: hasDifferent ? 'overwritten' : 'installed', skillDir };
}
