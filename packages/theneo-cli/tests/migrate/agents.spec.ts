import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  AGENTS,
  AGENT_IDS,
  detectInstalledAgents,
  findOnPath,
  getAgent,
} from '../../src/core/migrate/agents';
import { canLaunchOnPlatform } from '../../src/core/migrate/launch';

let binDir: string;
let emptyDir: string;

const addBinary = (name: string): string => {
  const target = path.join(binDir, name);
  fs.writeFileSync(target, '#!/bin/sh\n', { mode: 0o755 });
  return target;
};

beforeEach(() => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'theneo-migrate-agents-'));
  binDir = path.join(root, 'bin');
  emptyDir = path.join(root, 'empty');
  fs.mkdirSync(binDir);
  fs.mkdirSync(emptyDir);
});

afterEach(() => {
  fs.rmSync(path.dirname(binDir), { recursive: true, force: true });
});

describe('agent registry', () => {
  it('gives every agent a project skills folder and a way to start it', () => {
    for (const agent of AGENTS) {
      expect(path.isAbsolute(agent.skillsDir)).toBe(false);
      expect(agent.skillsDir.split(path.sep).pop()).toBe('skills');
      expect(agent.howToStart.length).toBeGreaterThan(0);
    }
  });

  it('pairs a binary with launch arguments that carry the prompt', () => {
    for (const agent of AGENTS) {
      expect(agent.binary === undefined).toBe(agent.launchArgs === undefined);
      if (agent.launchArgs) {
        expect(agent.launchArgs('convert these docs')).toContain(
          'convert these docs'
        );
      }
    }
  });

  it('has unique ids and looks agents up by id', () => {
    expect(new Set(AGENT_IDS).size).toBe(AGENT_IDS.length);
    expect(getAgent('claude-code')?.skillsDir).toBe(
      path.join('.claude', 'skills')
    );
    expect(getAgent('codex')?.skillsDir).toBe(path.join('.agents', 'skills'));
    expect(getAgent('nope')).toBeUndefined();
  });
});

describe('findOnPath', () => {
  it('returns the full path of an installed binary', () => {
    const claude = addBinary('claude');
    const env = { PATH: [emptyDir, binDir].join(path.delimiter) };

    expect(findOnPath('claude', env)).toBe(claude);
  });

  it('returns undefined when the binary is not installed', () => {
    addBinary('claude');

    expect(findOnPath('codex', { PATH: binDir })).toBeUndefined();
    expect(findOnPath('claude', { PATH: emptyDir })).toBeUndefined();
    expect(findOnPath('claude', {})).toBeUndefined();
  });

  it('does not mistake a folder for a binary', () => {
    fs.mkdirSync(path.join(binDir, 'gemini'));

    expect(findOnPath('gemini', { PATH: binDir })).toBeUndefined();
  });
});

describe('detectInstalledAgents', () => {
  it('lists agents whose binary is on the PATH', () => {
    addBinary('codex');
    addBinary('gemini');

    expect(detectInstalledAgents({ PATH: binDir })).toEqual([
      'codex',
      'gemini',
    ]);
  });

  it('never lists editor-only agents', () => {
    expect(detectInstalledAgents({ PATH: emptyDir })).toEqual([]);
  });
});

describe('canLaunchOnPlatform', () => {
  it('prints the prompt on Windows instead of starting the agent', () => {
    expect(canLaunchOnPlatform('win32')).toBe(false);
    expect(canLaunchOnPlatform('darwin')).toBe(true);
    expect(canLaunchOnPlatform('linux')).toBe(true);
  });
});
