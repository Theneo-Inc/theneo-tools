import { SwaggerUiOptions } from 'swagger-ui-express';

export interface ContactObject {
  name: string;
  url?: string;
  email?: string;
}

export interface LicenseObject {
  name: string;
  url?: string;
  email?: string;
}

export interface InfoObject {
  title: string;
  version: string;
  description?: string;
  termsOfService?: string;
  contact?: ContactObject;
  license?: LicenseObject;
}

export interface SecurityObject {
  type: string;
  scheme?: string;
  in?: string;
  name?: string;
}

export interface Security {
  [key: string]: SecurityObject;
}

export interface Servers {
  url: string;
  description: string;
  variables?: object;
}

export interface JsDocOptions {
  info: InfoObject;
  baseDir: string;
  filesPattern: string | string[];
  security?: Security;
  servers?: string[] | Servers[];
  exposeSwaggerUI?: boolean;
  swaggerUIPath?: string;
  exposeApiDocs?: boolean;
  apiDocsPath?: string;
  swaggerUiOptions?: SwaggerUiOptions;
  notRequiredAsNullable?: boolean;
}
