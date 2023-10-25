export interface SectionFile {
  fileName: string;
  content: string;
}

export interface ExportedProject {
  sectionContents: SectionFile[];
  config: any;
}

//
// export interface ExportedProject1 {
//   project: Project;
//   documentMenu: DocumentMenu;
//   transformedSection: Section[];
// }
//
// export interface Project {
//   name: string;
//   key: string;
//
//   isPublic: boolean;
//   analyticsEnabled: boolean;
//   isDarkModeEnabled: boolean;
//   isApiExplorerEnabled: boolean;
//   isGptSearchEnabled: boolean;
//   isAdvancedAccessEnabled: boolean;
//   isChangelogEnabled: boolean;
//
//   defaultDocument: DefaultDocument;
// }
//
// export interface DefaultDocument {
//   baseUrl: string;
//   seoImage: string;
//   seoNoIndex: boolean;
//   pageTitle: string;
//   pageDescription: string;
// }
//
// export interface DocumentMenu {
//   deleted: boolean;
//   items: Item[];
//   title: string;
// }
//
// export interface Item {
//   name: string;
//   description: string;
//   slug: string;
//   subItems: Item[];
// }
//
// export interface Section {
//   name: string;
//   slug: string;
//   description: string;
//   responses: Response[];
//   isWebhook: boolean;
//   request: Request;
//   endpoints: Endpoints;
//   showBaseUrl: boolean;
//   showLanguageBox: boolean;
//   seoTitle: string;
//   seoDescription: string;
//   seoKeyWords: string;
//   dataExample?: DataExample[];
//   descriptionTextEditor: any[];
//   endpointSummary: any[];
//   showRequestDescription: boolean;
//   showResponseDescription: boolean;
//   isPrivate: boolean;
//   hasChild?: boolean;
//   subSections?: Section[];
// }
//
// interface DataExample {
//   title: string;
//   body: Parameter[];
//   contentType: string;
//   raw: string;
// }
// export interface Request {
//   query?: Parameter[];
//   body?: Parameter[];
//   header?: Parameter[];
//   path?: Parameter[];
//   contentType?: string;
//   graphqlQuery?: string;
// }
//
// export interface Endpoints {
//   method: string;
//   path: string;
// }
//
// type ParameterType =
//   | 'string'
//   | 'number'
//   | 'array'
//   | 'object'
//   | 'boolean'
//   | 'integer'
//   | 'binary'
//   | 'file';
// export interface Parameter {
//   name: string;
//   value: string;
//   description: string;
//   isRequired: boolean;
//   valueType: ParameterType;
//   objectType?: string; // if valueType === 'object' or 'array'
//   items: Parameter[];
//   options?: ParameterOptions;
// }
//
// export interface Response {
//   name: string;
//   statusCode: number;
//   status: string;
//   body: Parameter[];
//   description?: string;
//   contentType: string;
// }
//
// export interface ParameterOptions {
//   minimum?: number;
//   maximum?: number;
//   minLength?: number;
//   maxLength?: number;
//   exclusiveMinimum?: boolean;
//   exclusiveMaximum?: boolean;
//   multipleOf?: number;
//   pattern?: string;
//   nullable?: boolean;
//   minItems?: number;
//   allowReserved?: boolean;
//   format?: string;
//   defaultValue?: string;
//   enumValue?: string[];
//   example?: string;
//   allowEmptyValue?: boolean;
//   isDeprecated?: boolean;
// }
