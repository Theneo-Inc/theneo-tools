import path from 'path';
import * as fse from 'fs-extra';
import fs from 'fs';
import { Err, Ok, Result } from 'theneo';

export function createFiles(
  baseDirectory: string,
  fileContents: {
    fileName: string;
    content: string;
  }[]
): void {
  for (const sectionContent of fileContents) {
    const filePath = path.join(baseDirectory, sectionContent.fileName);
    console.log(filePath);
    fse.outputFileSync(filePath, sectionContent.content);
  }
}

export function convertFilePath(filePath: string, separator: string): string {
  // Convert the path to lowercase
  filePath = filePath.toLowerCase();

  // Replace '/' with '_' and remove leading '.'
  filePath = filePath.replace(/^\./, '').replace(/\//g, separator);

  return filePath;
}

export function getFilePath(filePath: string): Result<string> {
  if (!fs.existsSync(filePath)) {
    return Err(`File does not exist at ${filePath}`);
  }
  return Ok(filePath);
}
