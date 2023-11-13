import {
  CreateOtherTypeOfDocOptions,
  DescriptionGenerationType,
  ImportOption,
} from '../../schema';

export interface ImportProjectInput {
  file?: Buffer;
  link?: string;
  text?: string;
  postmanKey?: string;
  postmanCollections?: string[];
  importOption?: ImportOption;
  publish: boolean;
}

export type FileInfo = {
  fileName: string;
  directory: string;
  filePath: string;
  convertedFilename: string;
};

export interface CreateProjectInput {
  name: string;
  isPublic: boolean;
  publish: boolean;
  descriptionGenerationType: DescriptionGenerationType;
  workspaceId?: string | undefined;
  sampleFile?: boolean;
  otherDocumentType?: CreateOtherTypeOfDocOptions;
  file?: Buffer;
  files?: FileInfo[];
  link?: string;
  text?: string;
  postmanKey?: string;
  postmanCollections?: string[];
}
