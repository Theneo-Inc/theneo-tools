import fs from 'fs';
import path from 'path';
import { ProjectModel, TheneoJsonState } from './model';

export function loadProject(dir: string): ProjectModel {
  const root = path.resolve(dir);
  const dirExists = isDirectory(root);
  return {
    root,
    dirExists,
    theneoJson: dirExists ? readTheneoJson(root) : { status: 'missing' },
    sections: [],
  };
}

function isDirectory(target: string): boolean {
  try {
    return fs.statSync(target).isDirectory();
  } catch {
    return false;
  }
}

function readTheneoJson(root: string): TheneoJsonState {
  const filePath = path.join(root, 'theneo.json');
  if (!fs.existsSync(filePath)) {
    return { status: 'missing' };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return { status: 'invalid' };
  }

  if (!isJsonObject(parsed)) {
    return { status: 'not-object' };
  }
  return { status: 'ok', value: parsed };
}

function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
