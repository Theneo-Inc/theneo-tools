import path from 'path';
import * as fse from 'fs-extra';
import fs from 'fs';
import { Err, Ok, Result } from 'theneo';
import { FileInfo } from 'theneo/models';
import { isWindows } from 'theneo/utils/index';

export function createFiles(
  baseDirectory: string,
  fileContents: {
    fileName: string;
    content: string;
  }[]
): void {
  for (const sectionContent of fileContents) {
    const filePath = path.join(baseDirectory, sectionContent.fileName);
    fse.outputFileSync(filePath, sectionContent.content);
  }
}

export function convertFilePath(filePath: string, separator: string): string {
  // Convert the path to lowercase
  filePath = filePath.toLowerCase();

  // Replace '/' with '_' and remove leading '.'
  filePath = filePath.replace(/^\./, '').replace(/\//g, separator);
  if (isWindows()) {
    // Replace it for windows
    filePath = filePath.replace(/\\/g, separator);
    // remove c: d: patterns
    filePath = filePath.replace(/^[a-z]:/g, '');
  }

  return filePath;
}

export function getFilePath(filePath: string): Result<string> {
  if (!fs.existsSync(filePath)) {
    return Err(`File does not exist at ${filePath}`);
  }
  return Ok(filePath);
}

export const FILE_SEPARATOR = '__';

export function getAllFilesFromDirectory(
  directory: string,
  originalDirectory: string = directory,
  filesList: FileInfo[] = []
): FileInfo[] {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);
    const relativeFilePath = path.relative(originalDirectory, filePath);
    if (stat.isDirectory()) {
      getAllFilesFromDirectory(filePath, originalDirectory, filesList);
    } else {
      const convertedFilename = convertFilePath(
        relativeFilePath,
        FILE_SEPARATOR
      );
      filesList.push({
        fileName: file,
        directory,
        convertedFilename: convertedFilename,
        filePath: filePath,
      });
    }
  }

  return filesList;
}
