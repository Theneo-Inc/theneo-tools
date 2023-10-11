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

export interface CreateProjectInput {
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
