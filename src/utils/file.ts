import { existsSync, mkdirSync } from 'fs';
import { Err, Ok, Result } from 'ts-results';
import { lintFile } from 'yaml-lint';
import path from 'path';

export function createDirectorySync(path: string) {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }
}

export function getAbsoluteFilePath(filePath: string): string {
  return path.join(filePath);
}

export async function checkDocumentationFile(
  path: string
): Promise<Result<boolean, string>> {
  // check if file exists
  if (!existsSync(path)) {
    return Err('File does not exist');
  }

  if (path.includes('.')) {
    const extension = path.split('.').pop();
    if (extension === 'yaml' || extension === 'yml') {
      try {
        await lintFile(path);
      } catch (err) {
        return Err((err as Error).message);
      }
    }
    // TODO ADD checks for other type of files
  }
  return Ok(true);
}
