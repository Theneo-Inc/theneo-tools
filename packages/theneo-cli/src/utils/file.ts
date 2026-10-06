import fs, { existsSync, mkdirSync } from 'fs';
import { lintFile } from 'yaml-lint';
import path from 'path';
import { Err, Ok, Result } from '@theneo/sdk';

export function createDirectorySync(path: string): void {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }
}

export function getAbsoluteFilePath(filePath: string): string {
  return path.join(filePath);
}

export async function checkDocumentationFile(
  path: string
): Promise<Result<boolean, Error>> {
  // check if file exists
  if (!existsSync(path)) {
    return Err(new Error('File does not exist'));
  }

  if (path.includes('.')) {
    const extension = path.split('.').pop();
    if (extension === 'yaml' || extension === 'yml') {
      try {
        await lintFile(path);
      } catch (err) {
        if (err instanceof Error) {
          return Err(err);
        }
        return Err(new Error('Unknown error'));
      }
    }
    // TODO ADD checks for other type of files
  }
  return Ok(true);
}

export function isDirectoryEmpty(dir: string): boolean {
  return !fs.existsSync(dir) || fs.readdirSync(dir).length === 0;
}

const EXPORT_OWNED_FILES = new Set(['index.md', 'section.json', 'theneo.json']);

function collectExportOwnedFiles(
  directory: string,
  found: string[] = []
): string[] {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      collectExportOwnedFiles(entryPath, found);
    } else if (EXPORT_OWNED_FILES.has(entry.name)) {
      found.push(entryPath);
    }
  }
  return found;
}

function removeEmptyDirectories(directory: string, root: string): void {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      removeEmptyDirectories(path.join(directory, entry.name), root);
    }
  }
  if (directory !== root && fs.readdirSync(directory).length === 0) {
    fs.rmdirSync(directory);
  }
}

export function pruneStaleExportFiles(
  directory: string,
  exportedFileNames: string[]
): string[] {
  if (!fs.existsSync(directory)) {
    return [];
  }

  const keep = new Set(
    exportedFileNames.map(fileName => path.resolve(directory, fileName))
  );
  const removed = collectExportOwnedFiles(directory).filter(
    filePath => !keep.has(path.resolve(filePath))
  );

  removed.forEach(filePath => fs.rmSync(filePath));
  removeEmptyDirectories(directory, directory);

  return removed.map(filePath => path.relative(directory, filePath));
}
