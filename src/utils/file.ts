import { existsSync, mkdirSync } from 'fs';
import { lintFile } from 'yaml-lint';
import path from 'path';
import { Result } from '../results';

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
): Promise<Result<boolean, Error>> {
  // check if file exists
  if (!existsSync(path)) {
    return Result.err(new Error('File does not exist'));
  }

  if (path.includes('.')) {
    const extension = path.split('.').pop();
    if (extension === 'yaml' || extension === 'yml') {
      try {
        await lintFile(path);
      } catch (err) {
        if (err instanceof Error) {
          return Result.err(err);
        }
        return Result.err(new Error('Unknown error'));
      }
    }
    // TODO ADD checks for other type of files
  }
  return Result.ok(true);
}
