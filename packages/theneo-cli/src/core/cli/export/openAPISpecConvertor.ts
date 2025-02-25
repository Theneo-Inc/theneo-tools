import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

function loadJson(filePath: string): any {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function loadMarkdown(filePath: string): string {
  return fs.readFileSync(filePath, 'utf-8');
}

interface XTheneoMetadataSection {
  name: string;
  description?: string;
  subSections?: XTheneoMetadataSection[];
  operationId?: string;
  icon?: string;
  isHeader?: boolean;
  openDefault?: boolean;
}

interface TheneoJsonSection {
  name: string;
  slug: string;
  children: TheneoJsonSection[];
  icon?: string;
  isHeader?: boolean;
  openDefault?: boolean;
}

interface TheneoJson {
  name: string;
  sections: TheneoJsonSection[];
}

// Process section groups (directories) and populate OpenAPI spec
// eslint-disable-next-line sonarjs/cognitive-complexity
function processSectionGroup(
  directory: string,
  sectionGroupName: string,
  sectionNameOrder: Record<string, string>,
  openapiSpec: OpenAPISpec,
  sectionChildren: TheneoJsonSection[],
  parentTags: string[] = [],
  xTheneoMetadata: XTheneoMetadataSection[] = []
): XTheneoMetadataSection | null {
  const groupIndexPath = path.join(directory, 'index.md');
  const groupDescription = fs.existsSync(groupIndexPath)
    ? loadMarkdown(groupIndexPath)
    : '';

  const currentTags = [...parentTags, sectionGroupName];
  const tagName = currentTags.join('/');

  const currentSection: XTheneoMetadataSection = {
    name: sectionGroupName,
    description: groupDescription,
    subSections: [],
  };

  let hasContent = false;

  // Process the main section.json in the current directory
  const mainSectionJsonPath = path.join(directory, 'section.json');
  if (fs.existsSync(mainSectionJsonPath)) {
    const mainSectionJson: TheneoSection = loadJson(mainSectionJsonPath);
    const path = mainSectionJson.endpoints?.path;
    const operationId = `${Date.now()}_${tagName.replace(/[^a-zA-Z0-9]/g, '_')}`;

    if (mainSectionJson.endpoints?.method && path) {
      addToOpenapi(
        tagName,
        sectionNameOrder[sectionGroupName] || 'No Summary Found',
        mainSectionJson,
        openapiSpec,
        groupDescription,
        groupDescription,
        operationId
      );

      hasContent = true;
      currentSection.subSections?.push({
        name: sectionGroupName,
        operationId: operationId,
        description: groupDescription,
      });
    }
  }

  // Process the child sections
  sectionChildren.forEach((child: TheneoJsonSection) => {
    const slug = child.slug;
    const itemPath = path.join(directory, slug);

    if (fs.lstatSync(itemPath).isDirectory()) {
      const sectionJsonPath = path.join(itemPath, 'section.json');
      const indexMdPath = path.join(itemPath, 'index.md');

      if (fs.existsSync(sectionJsonPath)) {
        const sectionJson: TheneoSection = loadJson(sectionJsonPath);
        const description = fs.existsSync(indexMdPath)
          ? loadMarkdown(indexMdPath)
          : '';
        const summary = sectionNameOrder[slug] || 'No Summary Found';

        const operationId = `${tagName.replace(/\//g, '_')}_${slug}`;

        if (sectionJson.endpoints?.path) {
          addToOpenapi(
            tagName,
            summary,
            sectionJson,
            openapiSpec,
            description,
            groupDescription,
            operationId
          );
          hasContent = true;
          currentSection.subSections?.push({
            name: child.name,
            operationId: operationId,
            description: description,
          });
        }
      }

      if (child.children && child.children.length > 0) {
        const childSection = processSectionGroup(
          itemPath,
          child.name,
          sectionNameOrder,
          openapiSpec,
          child.children,
          currentTags,
          xTheneoMetadata
        );
        if (
          childSection &&
          childSection.subSections &&
          (childSection.subSections.length > 0 || childSection.description)
        ) {
          if (!currentSection.subSections) {
            currentSection.subSections = [];
          }
          currentSection.subSections.push(childSection);
          hasContent = true;
        }
      }
    }
  });

  if (hasContent || currentSection.description) {
    // Ensure no duplicate sections by checking the current section name
    const existingSection = xTheneoMetadata.find(
      section => section.name === sectionGroupName
    );

    if (!existingSection) {
      xTheneoMetadata.push(currentSection);
    }
    return currentSection;
  }

  return null;
}

interface TheneoSection {
  name: string;
  description: string;
  endpoints?: {
    method?: string;
    path?: string;
  };

  request?: Request;
  responses?: Response[];
}

type Request = {
  query: Parameter[];
  body: Parameter[];
  header: Parameter[];
  path: Parameter[];
  contentType: string;
  graphqlQuery?: string;
};

type ParameterType =
  | 'string'
  | 'number'
  | 'array'
  | 'object'
  | 'boolean'
  | 'integer'
  | 'binary'
  | 'file';

type Parameter = {
  name: string;
  value: string;
  description: string;
  isRequired: boolean;
  valueType: ParameterType;
  objectType?: string; // if valueType === 'object' or 'array'
  items: Parameter[];
  options?: ParameterOptions;
};

type EnumValue = {
  value: string;
  description?: string;
};

type ParameterOptions = {
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  exclusiveMinimum?: boolean;
  exclusiveMaximum?: boolean;
  multipleOf?: number;
  pattern?: string;
  nullable?: boolean;
  minItems?: number;
  maxItems?: number;
  allowUniqueItems?: boolean;
  allowReserved?: boolean;
  format?: string;
  defaultValue?: string;
  enumValue?: EnumValue[];
  example?: string;
  allowEmptyValue?: boolean;
  isDeprecated?: boolean;
  xml?: XmlOptions;
  //TODO: this option parameter should be changed to a better name and values

  readWriteReadOnly?: string;
  // alias?: string,
  // fragmentType?: string,
  // arguments?: Parameter[],
};

type XmlOptions = {
  name?: string;
  namespace?: string;
  prefix?: string;
  attribute?: boolean;
  wrapped?: boolean;
};

type Response = {
  name: string;
  statusCode: number;
  status: string;
  body: Parameter[];
  description?: string;
  contentType: string;
};
// Add sections with API paths to the OpenAPI spec
function addToOpenapi(
  sectionGroup: string,
  summary: string,
  apiData: TheneoSection,
  openapiSpec: OpenAPISpec,
  description: string,
  groupDescription: string,
  operationId: string
): void {
  const method = apiData.endpoints?.method?.toLowerCase() || 'get';
  const pathValue = apiData.endpoints?.path || '';

  if (!pathValue) return;

  openapiSpec.paths[pathValue] = openapiSpec.paths[pathValue] || {};
  openapiSpec.paths[pathValue][method] = {
    tags: [sectionGroup],
    summary: summary,
    description: description || groupDescription || apiData.description,
    operationId: operationId,
    parameters: convertParameters(
      apiData.request?.path || [],
      apiData.request?.query || [],
      apiData.request?.header || []
    ),
    responses: convertResponses(apiData.responses || []),
  };

  if (
    ['post', 'put', 'patch'].includes(method) &&
    apiData.request &&
    apiData.request?.body
  ) {
    openapiSpec.paths[pathValue][method]['requestBody'] = convertRequestBody(
      apiData.request
    );
  }
}

// Convert parameters (path, query, header) into OpenAPI format
function convertParameters(
  pathParams: Parameter[],
  queryParams: Parameter[],
  headerParams: Parameter[]
): Record<string, any>[] {
  const convertedParams: Record<string, any>[] = [];
  [
    [pathParams, 'path'],
    [queryParams, 'query'],
    [headerParams, 'header'],
    // eslint-disable-next-line sonarjs/cognitive-complexity
  ].forEach(([paramList, paramType]) => {
    if (Array.isArray(paramList)) {
      paramList.forEach((param: Parameter) => {
        const paramSchema: any = {
          type: param.valueType,
          example: param.value || '',
          format: param.options?.format || '',
          description: param.description || '',
          default: param.options?.defaultValue || '',
        };
        if (param.options?.minimum) paramSchema.minimum = param.options.minimum;
        if (param.options?.maximum) paramSchema.maximum = param.options.maximum;
        if (!paramSchema.format) delete paramSchema.format;
        if (param.options?.enumValue)
          paramSchema.enum = param.options.enumValue.map(
            (e: EnumValue) => e.value
          );

        convertedParams.push({
          name: param.name,
          in: paramType,
          required: param.isRequired || false,
          schema: paramSchema,
          description: param.description || '',
        });
      });
    }
  });
  return convertedParams;
}

// Convert responses into OpenAPI format
function convertResponses(responses: Response[]): Record<string, any> {
  const convertedResponses: Record<string, any> = {};
  responses.forEach((response: Response) => {
    const statusCode = String(response.statusCode || 200);
    const contentType = response.contentType || 'application/json';
    const responseBodySchema = convertBodySchema(response?.body || [], true);

    convertedResponses[statusCode] = {
      description: response.description || '',
      content: {
        [contentType]: {
          schema: responseBodySchema,
        },
      },
    };
  });
  return convertedResponses;
}

// Convert body schema for request and response
function convertBodySchema(
  bodyItems: Parameter[],
  processRequired: boolean = false
): any {
  if (!Array.isArray(bodyItems)) {
    return { type: 'object', properties: {} };
  }

  const schema: any = { type: 'object', properties: {} };
  const requiredFields: string[] = [];

  bodyItems.forEach((item: Parameter) => {
    if (item && typeof item === 'object') {
      const paramSchema: any = convertSchemaItem(item);

      if (processRequired && item.isRequired) {
        requiredFields.push(item.name);
      }

      schema.properties[item.name] = paramSchema;
    }
  });

  if (requiredFields.length) {
    schema.required = requiredFields;
  }

  return schema;
}

function convertArraySchemaItem(item: Parameter, schema: any): void {
  if (item.items && item.items.length > 0) {
    // Handle the case where array items are objects (like in the users array)
    if (
      item.items[0]?.valueType === 'object' ||
      item.items[0]?.valueType === 'array'
    ) {
      schema.items = {
        type: 'object',
        properties: {},
      };
      item.items.forEach((subItem: Parameter) => {
        if (subItem.items && subItem.items.length > 0) {
          subItem.items.forEach((property: Parameter) => {
            schema.items.properties[property.name] =
              convertSchemaItem(property);
          });
        }
      });
    } else {
      if (item.items[0]) {
        schema.items = convertSchemaItem(item.items[0]);
      }
    }
  } else {
    schema.items = {};
  }
}

function convertSchemaItem(item: Parameter): any {
  const schema: any = {
    type: item.valueType,
    description: item.description || '',
  };

  if (item.value !== undefined) {
    schema.example = convertItemValue(item);
  }

  if (item.options?.format) {
    schema.format = item.options.format;
  }

  if (item.valueType === 'array') {
    convertArraySchemaItem(item, schema);
  } else if (item.valueType === 'object') {
    schema.properties = {};
    if (item.items && item.items.length > 0) {
      item.items.forEach((property: Parameter) => {
        schema.properties[property.name] = convertSchemaItem(property);
      });
    }
  }

  return schema;
}

function convertItemValue(item: any): any {
  switch (item.valueType) {
    case 'array':
      return item.items
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return
          item.items.map((subItem: any) => convertItemValue(subItem))
        : [];
    case 'object':
      return item.items
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          item.items.reduce((acc: any, subItem: any) => {
            acc[subItem.name] = convertItemValue(subItem);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return acc;
          }, {})
        : {};
    case 'integer':
    case 'number':
      return Number(item.value || 0);
    case 'boolean':
      return item.value === 'true';
    default:
      return item.value || '';
  }
}

function convertRequestBody(requestData: Request): any {
  const contentType = requestData.contentType || 'application/json';
  const bodySchema = convertBodySchema(requestData.body || [], true);

  return {
    description: 'Request body',
    required: true,
    content: {
      [contentType]: { schema: bodySchema },
    },
  };
}

interface OpenAPISpec {
  openapi: string;
  info: { title: string; version: string };
  paths: Record<string, any>;
  components: Record<string, any>;
  tags: any;
  'x-theneo-metadata'?: any;
}

function createOpenapiSpec(theneoJson: TheneoJson): OpenAPISpec {
  return {
    openapi: '3.0.2',
    info: {
      title: theneoJson.name || 'Generated API Documentation',
      version: '1.0.0',
    },
    paths: {},
    components: {},
    tags: theneoJson.sections.map((section: any) => ({
      name: section.name,
      description: section.description || '',
    })),
  };
}

function saveOpenapiSpec(
  openapiSpec: any,
  outputDir: string,
  format: 'yaml' | 'json'
): string {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  if (format === 'json') {
    const outputFile = path.join(outputDir, 'openapi_spec.json');
    const jsonData = JSON.stringify(openapiSpec, null, 2);
    fs.writeFileSync(outputFile, jsonData);
    return outputFile;
  }
  const outputFile = path.join(outputDir, 'openapi_spec.yaml');
  const yamlData = yaml.dump(openapiSpec, { sortKeys: false });
  fs.writeFileSync(outputFile, yamlData);
  return outputFile;
}

function getSummary(
  sections: TheneoJsonSection[],
  sectionNameOrder: Record<string, string>
): void {
  sections.forEach((section: TheneoJsonSection) => {
    sectionNameOrder[section.slug] = section.name;
    if (section.children && section.children.length > 0) {
      getSummary(section.children, sectionNameOrder);
    }
  });
}

export function processExportedDocs(
  exportDir: string,
  finalOutputDir: string,
  format: 'yaml' | 'json'
): void {
  console.log('Running OpenAPI export...');

  const theneoJsonPath = path.join(exportDir, 'theneo.json');
  if (!fs.existsSync(theneoJsonPath)) {
    throw new Error(`theneo.json not found in ${exportDir}`);
  }

  const theneoJson: TheneoJson = loadJson(theneoJsonPath);
  const openapiSpec = createOpenapiSpec(theneoJson);
  const sectionNameOrder: Record<string, string> = {};
  const xTheneoMetadata: XTheneoMetadataSection[] = [];
  getSummary(theneoJson.sections, sectionNameOrder);

  theneoJson.sections.forEach((section: TheneoJsonSection) => {
    processSectionGroup(
      path.join(exportDir, section.slug),
      section.name,
      sectionNameOrder,
      openapiSpec,
      section.children,
      [],
      xTheneoMetadata
    );
  });

  openapiSpec['x-theneo-metadata'] = { menu: xTheneoMetadata };

  try {
    const finalOutputPath = saveOpenapiSpec(
      openapiSpec,
      finalOutputDir,
      format
    );
    if (!fs.existsSync(finalOutputPath)) {
      throw new Error(`OpenAPI spec file not found: ${finalOutputPath}`);
    }
    console.log(`OpenAPI spec generated successfully at: ${finalOutputPath}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Failed to save OpenAPI spec:', error.message);
    } else {
      console.error('An unknown error occurred while saving OpenAPI spec.');
    }
  }
}
