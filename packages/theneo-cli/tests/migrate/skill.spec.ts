import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  bundledSkillDir,
  installSkill,
  SKILL_FILE,
  SKILL_NAME,
} from '../../src/core/migrate/skill';

// The risky half of installing is the second run: a skill the user edited must
// never be replaced silently, and an untouched one must not be reported as new.

const VALIDATOR = path.join('scripts', 'validate.mjs');
const USER_EDIT = 'edited by the user';

let workDir: string;
let sourceDir: string;
let skillsDir: string;

const installedFile = (file: string): string =>
  path.join(skillsDir, SKILL_NAME, file);

beforeEach(() => {
  workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'theneo-migrate-skill-'));
  sourceDir = path.join(workDir, 'bundled');
  skillsDir = path.join(workDir, 'project', '.claude', 'skills');
  fs.mkdirSync(path.join(sourceDir, 'scripts'), { recursive: true });
  fs.writeFileSync(path.join(sourceDir, SKILL_FILE), 'skill v2');
  fs.writeFileSync(path.join(sourceDir, VALIDATOR), 'validator v2');
});

afterEach(() => {
  fs.rmSync(workDir, { recursive: true, force: true });
});

describe('installSkill', () => {
  it('copies every bundled file, creating the skills folder', () => {
    const result = installSkill(sourceDir, skillsDir, { force: false });

    expect(result.status).toBe('installed');
    expect(result.skillDir).toBe(path.join(skillsDir, SKILL_NAME));
    expect(fs.readFileSync(installedFile(SKILL_FILE), 'utf8')).toBe('skill v2');
    expect(fs.readFileSync(installedFile(VALIDATOR), 'utf8')).toBe(
      'validator v2'
    );
  });

  it('reports unchanged on a second run', () => {
    installSkill(sourceDir, skillsDir, { force: false });

    const result = installSkill(sourceDir, skillsDir, { force: false });

    expect(result.status).toBe('unchanged');
  });

  it('writes nothing when an installed file differs', () => {
    installSkill(sourceDir, skillsDir, { force: false });
    fs.writeFileSync(installedFile(SKILL_FILE), USER_EDIT);
    fs.rmSync(installedFile(VALIDATOR));

    const result = installSkill(sourceDir, skillsDir, { force: false });

    expect(result.status).toBe('conflict');
    expect(fs.readFileSync(installedFile(SKILL_FILE), 'utf8')).toBe(USER_EDIT);
    expect(fs.existsSync(installedFile(VALIDATOR))).toBe(false);
  });

  it('replaces a differing file with force', () => {
    installSkill(sourceDir, skillsDir, { force: false });
    fs.writeFileSync(installedFile(SKILL_FILE), USER_EDIT);

    const result = installSkill(sourceDir, skillsDir, { force: true });

    expect(result.status).toBe('overwritten');
    expect(fs.readFileSync(installedFile(SKILL_FILE), 'utf8')).toBe('skill v2');
  });

  it('restores a missing file without calling it a conflict', () => {
    installSkill(sourceDir, skillsDir, { force: false });
    fs.rmSync(installedFile(VALIDATOR));

    const result = installSkill(sourceDir, skillsDir, { force: false });

    expect(result.status).toBe('installed');
    expect(fs.existsSync(installedFile(VALIDATOR))).toBe(true);
  });

  it('leaves files the bundled skill does not have', () => {
    installSkill(sourceDir, skillsDir, { force: false });
    fs.writeFileSync(installedFile('notes.md'), 'mine');

    installSkill(sourceDir, skillsDir, { force: true });

    expect(fs.readFileSync(installedFile('notes.md'), 'utf8')).toBe('mine');
  });

  it('refuses a source folder with no SKILL.md', () => {
    fs.rmSync(path.join(sourceDir, SKILL_FILE));

    expect(() => installSkill(sourceDir, skillsDir, { force: false })).toThrow(
      SKILL_FILE
    );
  });
});

describe('the skill bundled with the CLI', () => {
  const skill = fs.readFileSync(
    path.join(bundledSkillDir(), SKILL_FILE),
    'utf8'
  );

  it('declares the name agents look it up by', () => {
    expect(skill.startsWith('---\n')).toBe(true);
    expect(skill).toMatch(/^name: docs-to-theneo$/m);
    expect(skill).toMatch(/^description: .{50,1024}$/m);
  });

  it('writes to the folders the kickoff prompt names', () => {
    expect(skill).toContain('converted_for_theneo/');
    expect(skill).toContain('theneo_migration/');
  });

  it('asks for the project and previews before any import', () => {
    const afterConversion = skill.slice(skill.indexOf('## After conversion'));

    expect(afterConversion).toContain('Ask which project');
    expect(afterConversion.indexOf('Try a preview first')).toBeLessThan(
      afterConversion.indexOf('ask before importing')
    );
  });

  it('ships the validator it tells the agent to run', () => {
    expect(skill).toContain('scripts/validate.mjs');
    expect(fs.existsSync(path.join(bundledSkillDir(), VALIDATOR))).toBe(true);
  });
});
