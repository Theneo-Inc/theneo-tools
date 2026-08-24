import fs from 'fs';
import path from 'path';
import { ProjectModel } from './model';

export function loadProject(dir: string): ProjectModel {
  const root = path.resolve(dir);
  return {
    root,
    theneoJson: readTheneoJson(root),
    sections: [],
  };
}

function readTheneoJson(root: string): unknown {
  const filePath = path.join(root, 'theneo.json');
  if (!fs.existsSync(filePath)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as unknown;
  } catch {
    return null;
  }
}
