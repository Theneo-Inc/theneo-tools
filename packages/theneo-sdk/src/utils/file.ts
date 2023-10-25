import { SectionFile } from 'theneo/schema/export';
import path from 'path';
import * as fse from 'fs-extra';

export function createFiles(
  baseDirectory: string,
  fileContents: {
    fileName: string;
    content: string;
  }[]
) {
  // TODO
  console.log(baseDirectory, fileContents.length);
  for (const sectionContent of fileContents) {
    const filePath = path.join(baseDirectory, sectionContent.fileName);
    fse.outputFileSync(filePath, sectionContent.content);
  }
}
