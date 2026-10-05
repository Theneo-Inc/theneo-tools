import {
  CreateOtherTypeOfDocOptions,
  DescriptionGenerationType,
  ImportMetadata,
  ImportOption,
  ImportOptionAdditionalData,
} from '../../schema';

export interface ImportProjectBaseInput {
  publish: boolean;
  importOption?: ImportOption | undefined;
  importOptionAdditionalData?: ImportOptionAdditionalData | undefined;
  importMetadata?: ImportMetadata | undefined;
  tabSlug?: string | undefined;
}

export interface ImportProjectInput extends ImportProjectBaseInput {
  file?: Buffer;
  link?: string;
  text?: string;
  postmanKey?: string;
  postmanCollections?: string[];
  importOption?: ImportOption | undefined;
  importOptionAdditionalData?: ImportOptionAdditionalData | undefined;
  publish: boolean;
  importMetadata?: ImportMetadata | undefined;
  descriptionGenerationType?: DescriptionGenerationType;
}

export interface ImportProjectFromDirectoryInput
  extends ImportProjectBaseInput {
  files: FileInfo[];
  filePathSeparator: string;
  /** Import into this branch instead of the base version; publish is not allowed then */
  branchId?: string | undefined;
  publish: boolean;
  importOption?: ImportOption | undefined;
  importOptionAdditionalData?: ImportOptionAdditionalData | undefined;
  importMetadata?: ImportMetadata | undefined;
  descriptionGenerationType?: DescriptionGenerationType;
}

export type FileInfo = {
  fileName: string;
  directory: string;
  filePath: string;
  convertedFilename: string;
};

export interface CreateProjectBaseInput {
  name: string;
  isPublic: boolean;
  publish: boolean;
  descriptionGenerationType: DescriptionGenerationType;
  workspaceId?: string | undefined;
}

export interface CreateProjectInput extends CreateProjectBaseInput {
  name: string;
  isPublic: boolean;
  publish: boolean;
  descriptionGenerationType: DescriptionGenerationType;
  workspaceId?: string | undefined;
  sampleFile?: boolean;
  otherDocumentType?: CreateOtherTypeOfDocOptions;
  file?: Buffer;
  link?: string;
  text?: string;
  postmanKey?: string;
  postmanCollections?: string[];
}

export interface CreateProjectFromDirectoryInput
  extends CreateProjectBaseInput {
  files: FileInfo[];
  filePathSeparator: string;
}
