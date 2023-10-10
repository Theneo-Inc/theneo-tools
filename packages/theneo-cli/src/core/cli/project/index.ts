import { DescriptionGenerationType } from '@theneo/sdk';

export interface CreateCommandOptions {
  name: string | undefined;
  workspace: string | undefined;
  file: string | undefined;
  link: string | undefined;
  sample: boolean;
  publish: boolean;
  public: boolean;
  generateDescription: DescriptionGenerationType;
  profile: string | undefined;
}
