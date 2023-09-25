import path from 'path';
import fs from 'fs';
import * as yamlParser from 'js-yaml';
import { parse as tomlParser } from 'toml';
import { createDirectorySync } from '../utils/file';
import { Err, Ok, Result } from 'ts-results';
import { ProfileConfig, TheneoConfig } from '../config';

export const Json = 'json';
export const Yaml = 'yaml';
export const Toml = 'toml';

export const ErrorInvalidFilePath = new Error('invalid file path or file name');
export const ErrorNoFileType = new Error('invalid file type');
export const ErrorUnrecognisedFormat = new Error(
  'this type of configuration format is not supported at the moment'
);
export const ErrorInvalidProfile = new Error('profile does not exists');

export const ErrorConfigIsEmpty = new Error(
  'need to authorize first, please run `theneo login` command'
);

export const FileTypeMapping = (): Map<string, string> => {
  const FileType: Map<string, string> = new Map();
  FileType.set('json', Json);
  FileType.set('yaml', Yaml);
  FileType.set('toml', Toml);
  return FileType;
};

export class ConfigManager {
  private config: TheneoConfig | null = null;
  private readonly configFilePath: string;
  private fileType: string | undefined;

  constructor(fileName: string, configDir: string, fileType?: string) {
    createDirectorySync(configDir);
    this.configFilePath = path.join(configDir, fileName);
    if (fileType) {
      this.fileType = fileType;
    } else {
      const [, fileExtension] = fileName.split('.');
      this.fileType = fileExtension;
    }
  }

  public getProfile(profileName: string): Result<ProfileConfig, Error> {
    if (!this.config) {
      return Err(ErrorConfigIsEmpty);
    }
    const profile = this.config.profiles[String(profileName)];
    if (!profile) {
      return Err(ErrorInvalidProfile);
    }
    return Ok(profile);
  }

  public setProfile(profileName: string, profile: ProfileConfig): void {
    if (!this.config) {
      this.config = {
        profiles: {
          [profileName]: profile,
        },
      };
    }
    this.config.profiles[String(profileName)] = profile;
  }

  public readInConfig(): Result<null, Error> {
    if (!this.fileType) {
      return Err(ErrorNoFileType);
    }
    if (fs.existsSync(this.configFilePath)) {
      this.fileType = FileTypeMapping().get(this.fileType);
      switch (this.fileType) {
        case Json:
          this.config = require(this.configFilePath) as TheneoConfig;
          break;
        case Toml:
          this.config = tomlParser(
            fs.readFileSync(this.configFilePath).toString()
          ) as TheneoConfig;
          break;
        case Yaml:
          this.config = yamlParser.load(
            fs.readFileSync(this.configFilePath).toString()
          ) as TheneoConfig;
          break;
        default:
          return Err(ErrorUnrecognisedFormat);
      }
    }

    return Ok(null);
  }

  public save(): Result<null, Error> {
    if (!this.fileType) {
      return Err(ErrorNoFileType);
    }
    this.fileType = FileTypeMapping().get(this.fileType);
    // move everything from the kvCache to the config object
    if (!this.config) {
      return Err(ErrorConfigIsEmpty);
    }

    switch (this.fileType) {
      case Json:
        fs.writeFileSync(
          this.configFilePath,
          JSON.stringify(this.config, null, 2)
        );
        break;
      case Yaml:
        fs.writeFileSync(this.configFilePath, yamlParser.dump(this.config));
        break;
      default:
        return Err(ErrorUnrecognisedFormat);
    }

    return Ok(null);
  }
}
