import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';


function loadJson(filePath: string): any {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function loadMarkdown(filePath: string): string {
  return fs.readFileSync(filePath, 'utf-8');
}

// Process section groups (directories) and populate OpenAPI spec
function processSectionGroup(
  directory: string,
  sectionGroupName: string,
  sectionNameOrder: Record<string, string>,
  openapiSpec: any,
  sectionChildren: any[],
  parentTags: string[] = [],
  xTheneoMetadata: any[] = []
): any {
  const groupIndexPath = path.join(directory, 'index.md');
  const groupDescription = fs.existsSync(groupIndexPath) ? loadMarkdown(groupIndexPath) : "";

  const currentTags = [...parentTags, sectionGroupName];
  const tagName = currentTags.join('/');

  const currentSection: any = {
    name: sectionGroupName,
    description: groupDescription,
    subSections: []
  };

  let hasContent = false;

  sectionChildren.forEach((child: any) => {
    const slug = child.slug;
    const itemPath = path.join(directory, slug);

    if (fs.lstatSync(itemPath).isDirectory()) {
      const sectionJsonPath = path.join(itemPath, "section.json");
      const indexMdPath = path.join(itemPath, "index.md");

      if (fs.existsSync(sectionJsonPath)) {
        const sectionJson = loadJson(sectionJsonPath);
        const description = fs.existsSync(indexMdPath) ? loadMarkdown(indexMdPath) : "";
        const summary = sectionNameOrder[slug] || "No Summary Found";

        let operationId = `${tagName.replace(/\//g, '_')}_${slug}`;

        if (sectionJson.endpoints?.path) {
          addToOpenapi(tagName, summary, sectionJson, openapiSpec, description, groupDescription, operationId);
          hasContent = true;
          currentSection.subSections.push({
            name: child.name,
            operationId: operationId,
            description: description
          });
        }
      }

      if (child.children && child.children.length > 0) {
        const childSection = processSectionGroup(itemPath, child.name, sectionNameOrder, openapiSpec, child.children, currentTags, xTheneoMetadata);
        if (childSection && (childSection.subSections.length > 0 || childSection.description)) {
          currentSection.subSections.push(childSection);
          hasContent = true;
        }
      }
    }
  });

  if (hasContent || currentSection.description) {
    if (parentTags.length === 0) {
      xTheneoMetadata.push(currentSection);
    }
    return currentSection;
  }

  return null;
}

// Add sections with API paths to the OpenAPI spec
function addToOpenapi(
  sectionGroup: string,
  summary: string,
  apiData: any,
  openapiSpec: any,
  description: string,
  groupDescription: string,
  operationId: string
) {
  const method = apiData.endpoints.method?.toLowerCase() || 'get';
  const pathValue = apiData.endpoints.path || "";

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

  if (['post', 'put', 'patch'].includes(method)) {
    const requestBody = apiData.request?.body || null;
    if (requestBody) {
      openapiSpec.paths[pathValue][method]['requestBody'] = convertRequestBody(apiData.request);
    }
  }
}

// Convert parameters (path, query, header) into OpenAPI format
function convertParameters(pathParams: any[], queryParams: any[], headerParams: any[]) {
  const convertedParams: any[] = [];
  [[pathParams, 'path'], [queryParams, 'query'], [headerParams, 'header']].forEach(([paramList, paramType]) => {
    if (Array.isArray(paramList)) {
      paramList.forEach((param: any) => {
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
        if (param.options?.enumValue) paramSchema.enum = param.options.enumValue.map((e: any) => e.value);

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
function convertResponses(responses: any[]) {
  const convertedResponses: any = {};
  responses.forEach((response: any) => {
    const statusCode = String(response.statusCode || 200);
    const contentType = response.contentType || 'application/json';
    const responseBodySchema = convertBodySchema(response.body || [], true);

    convertedResponses[statusCode] = {
      description: response.description || '',
      content: {
        [contentType]: { 
          schema: responseBodySchema
        },
      },
    };
  });
  return convertedResponses;
}

// Convert body schema for request and response
function convertBodySchema(bodyItems: any[], processRequired: boolean = false): any {
  if (!Array.isArray(bodyItems)) {
    return { type: 'object', properties: {} };
  }

  const schema: any = { type: 'object', properties: {} };
  const requiredFields: string[] = [];

  bodyItems.forEach((item: any) => {
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

function convertSchemaItem(item: any): any {
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
    if (item.items && item.items.length > 0) {
      // Handle the case where array items are objects (like in the users array)
      if (item.items[0].valueType === 'object' || item.items[0].valueType === 'array') {
        schema.items = {
          type: 'object',
          properties: {}
        };
        item.items.forEach((subItem: any) => {
          if (subItem.items && subItem.items.length > 0) {
            subItem.items.forEach((property: any) => {
              schema.items.properties[property.name] = convertSchemaItem(property);
            });
          }
        });
      } else {
        schema.items = convertSchemaItem(item.items[0]);
      }
    } else {
      schema.items = {};
    }
  } else if (item.valueType === 'object') {
    schema.properties = {};
    if (item.items && item.items.length > 0) {
      item.items.forEach((property: any) => {
        schema.properties[property.name] = convertSchemaItem(property);
      });
    }
  }

  return schema;
}

function convertItemValue(item: any): any {
  switch (item.valueType) {
    case 'array':
      return item.items ? item.items.map((subItem: any) => convertItemValue(subItem)) : [];
    case 'object':
      return item.items
        ? item.items.reduce((acc: any, subItem: any) => {
            acc[subItem.name] = convertItemValue(subItem);
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

function convertRequestBody(requestData: any) {
  const contentType = requestData.contentType || 'application/json';
  const bodySchema = convertBodySchema(requestData.body || [], true);

  return {
    description: "Request body",
    required: true,
    content: {
      [contentType]: { schema: bodySchema },
    },
  };
}

type OpenAPISpec = {
  openapi: string;
  info: { title: any; version: string };
  paths: {};
  components: {};
  tags: any;
  'x-theneo-metadata'?: any;
};

function createOpenapiSpec(theneoJson: any): OpenAPISpec {
  return {
    openapi: "3.0.2",
    info: {
      title: theneoJson.name || "Generated API Documentation",
      version: "1.0.0",
    },
    paths: {},
    components: {},
    tags: theneoJson.sections.map((section: any) => ({
      name: section.name,
      description: section.description || '',
    })),
  };
}

function saveOpenapiSpec(openapiSpec: any, outputFile: string) {
  const yamlData = yaml.dump(openapiSpec, { sortKeys: false });
  fs.writeFileSync(outputFile, yamlData);
  console.log(`OpenAPI spec saved to ${outputFile}`);
}

export function processExportedDocs(exportDir: string) {
  console.log('Running OpenAPI export...');

  const theneoJsonPath = path.join(exportDir, 'theneo.json');
  if (!fs.existsSync(theneoJsonPath)) {
    throw new Error(`theneo.json not found in ${exportDir}`);
  }

  const theneoJson = loadJson(theneoJsonPath);
  const openapiSpec = createOpenapiSpec(theneoJson);
  const sectionNameOrder: Record<string, string> = {};
  const xTheneoMetadata: any[] = [];

  theneoJson.sections.forEach((section: any) => {
    section.children.forEach((child: any) => {
      sectionNameOrder[child.slug] = child.name;
    });
  });

  theneoJson.sections.forEach((section: any) => {
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

  const outputFile = path.join(exportDir, 'openapi_spec.yaml');

  try {
    saveOpenapiSpec(openapiSpec, outputFile);
    console.log('OpenAPI spec generated successfully.');
  } catch (error) {
    if (error instanceof Error) {
      console.error('Failed to save OpenAPI spec:', error.message);
    } else {
      console.error('An unknown error occurred while saving OpenAPI spec.');
    }
  }

  if (!fs.existsSync(outputFile)) {
    throw new Error(`OpenAPI spec file not found: ${outputFile}`);
  }

  console.log(`OpenAPI spec generated successfully at: ${outputFile}`);
}
