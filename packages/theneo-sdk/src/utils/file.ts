import path from 'path';
import * as fse from 'fs-extra';

export function createFiles(
  baseDirectory: string,
  fileContents: {
    fileName: string;
    content: string;
  }[]
) {
  for (const sectionContent of fileContents) {
    const filePath = path.join(baseDirectory, sectionContent.fileName);
    console.log(filePath);
    fse.outputFileSync(filePath, sectionContent.content);
  }
}

export function convertFilePath(filePath: string, separator = '__'): string {
  // Convert the path to lowercase
  filePath = filePath.toLowerCase();

  // Replace '/' with '_' and remove leading '.'
  filePath = filePath.replace(/^\./, '').replace(/\//g, separator);

  return filePath;
}
