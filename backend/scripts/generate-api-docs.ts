#!/usr/bin/env bun

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

/**
 * Generate AI-OPTIMIZED Markdown API documentation from Swagger JSON
 * 
 * Features:
 * - Complete request/response schemas with examples
 * - Enum values inline
 * - Nested object expansion
 * - Error response details
 * - Type information for arrays and objects
 */
async function generateAPIDocs() {
  console.log('📚 Generating AI-Optimized API Documentation...\n');

  try {
    // Fetch Swagger JSON
    const response = await fetch('http://localhost:3000/api/docs-json');
    if (!response.ok) {
      throw new Error(`Failed to fetch Swagger JSON: ${response.status}`);
    }

    const swagger = await response.json();

    // Create docs directory
    const docsDir = join(process.cwd(), 'docs');
    mkdirSync(docsDir, { recursive: true });

    // Generate main API documentation
    const markdown = generateMarkdown(swagger);
    const filePath = join(docsDir, 'API.md');
    writeFileSync(filePath, markdown);

    console.log('✅ API Documentation generated successfully!\n');
    console.log(`📄 File: ${filePath}\n`);
    console.log('🤖 Optimized for AI consumption with:');
    console.log('   - Complete request/response schemas');
    console.log('   - Inline enum values');
    console.log('   - Nested object expansion');
    console.log('   - Error response details\n');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

/**
 * Generate Markdown content from Swagger spec
 */
function generateMarkdown(swagger: any): string {
  const { info, paths, components } = swagger;
  
  let md = `# ${info.title}\n\n`;
  md += `> ${info.description || 'API Documentation'}\n\n`;
  md += `**Version:** ${info.version}  \n`;
  md += `**Base URL:** \`http://localhost:3000/api/v1\`\n\n`;
  
  // AI-friendly metadata
  md += `## 🤖 AI Integration Notes\n\n`;
  md += `This documentation is optimized for AI/LLM consumption:\n`;
  md += `- All request bodies include complete JSON examples\n`;
  md += `- All response bodies show expected structure\n`;
  md += `- Enum values are listed inline with types\n`;
  md += `- Nested objects are fully expanded\n`;
  md += `- Error responses include status codes and descriptions\n\n`;
  md += `---\n\n`;

  // Table of Contents
  md += `## 📑 Table of Contents\n\n`;
  const tags = extractTags(paths);
  tags.forEach(tag => {
    md += `- [${tag}](#${tag.toLowerCase().replace(/\s+/g, '-')})\n`;
  });
  md += `- [Schemas](#-schemas)\n`;
  md += `\n---\n\n`;

  // Group endpoints by tag
  const endpointsByTag = groupEndpointsByTag(paths);

  // Generate documentation for each tag
  for (const [tag, endpoints] of Object.entries(endpointsByTag)) {
    md += `## ${tag}\n\n`;
    
    for (const endpoint of endpoints as any[]) {
      md += generateEndpointDoc(endpoint, components);
      md += `\n---\n\n`;
    }
  }

  // Schemas
  if (components?.schemas) {
    md += `## 📦 Schemas\n\n`;
    md += `Complete schema definitions for all DTOs used in the API.\n\n`;
    
    for (const [name, schema] of Object.entries(components.schemas)) {
      md += generateSchemaDoc(name, schema as any, components);
      md += `\n`;
    }
  }

  return md;
}

/**
 * Extract unique tags from paths
 */
function extractTags(paths: any): string[] {
  const tags = new Set<string>();
  for (const path of Object.values(paths)) {
    for (const method of Object.values(path as any)) {
      if ((method as any).tags) {
        (method as any).tags.forEach((tag: string) => tags.add(tag));
      }
    }
  }
  return Array.from(tags);
}

/**
 * Group endpoints by tag
 */
function groupEndpointsByTag(paths: any): Record<string, any[]> {
  const grouped: Record<string, any[]> = {};

  for (const [path, methods] of Object.entries(paths)) {
    for (const [method, details] of Object.entries(methods as any)) {
      const tag = (details as any).tags?.[0] || 'Other';
      if (!grouped[tag]) {
        grouped[tag] = [];
      }
      grouped[tag].push({
        path,
        method: method.toUpperCase(),
        ...(details as object),
      });
    }
  }

  return grouped;
}

/**
 * Generate documentation for a single endpoint
 */
function generateEndpointDoc(endpoint: any, components: any): string {
  let md = `### ${endpoint.method} ${endpoint.path}\n\n`;
  
  // Summary
  if (endpoint.summary) {
    md += `**${endpoint.summary}**\n\n`;
  }

  // Description
  if (endpoint.description) {
    md += `${endpoint.description}\n\n`;
  }

  // Security
  if (endpoint.security && endpoint.security.length > 0) {
    md += `🔒 **Authentication Required:** Bearer Token\n\n`;
  }

  // Parameters
  if (endpoint.parameters && endpoint.parameters.length > 0) {
    md += `**Parameters:**\n\n`;
    md += `| Name | In | Type | Required | Description |\n`;
    md += `|------|-------|------|----------|-------------|\n`;
    endpoint.parameters.forEach((param: any) => {
      const type = param.schema?.type || 'string';
      const enumValues = param.schema?.enum ? ` (${param.schema.enum.join(', ')})` : '';
      md += `| \`${param.name}\` | ${param.in} | ${type}${enumValues} | ${param.required ? '✅' : '❌'} | ${param.description || '-'} |\n`;
    });
    md += `\n`;
  }

  // Request Body
  if (endpoint.requestBody) {
    md += `**Request Body:**\n\n`;
    const content = endpoint.requestBody.content?.['application/json'] || 
                    endpoint.requestBody.content?.['multipart/form-data'];
    
    if (content?.schema) {
      const schemaRef = content.schema.$ref;
      if (schemaRef) {
        const schemaName = schemaRef.split('/').pop();
        md += `Type: [\`${schemaName}\`](#${schemaName.toLowerCase()})\n\n`;
        
        // Show schema inline with full details
        const schema = components?.schemas?.[schemaName];
        if (schema) {
          md += '```json\n';
          md += JSON.stringify(generateExampleDeep(schema, components), null, 2);
          md += '\n```\n\n';
        }
      } else if (content.schema) {
        // Inline schema without $ref
        md += '```json\n';
        md += JSON.stringify(generateExampleDeep(content.schema, components), null, 2);
        md += '\n```\n\n';
      }
    } else {
      md += `_No request body schema available_\n\n`;
    }
  }

  // Responses
  if (endpoint.responses) {
    md += `**Responses:**\n\n`;
    
    // Sort responses by status code
    const sortedResponses = Object.entries(endpoint.responses).sort(([a], [b]) => {
      return parseInt(a) - parseInt(b);
    });
    
    for (const [code, response] of sortedResponses) {
      const resp = response as any;
      const statusEmoji = getStatusEmoji(code);
      md += `${statusEmoji} **${code}** - ${resp.description || 'Success'}\n\n`;
      
      // Show response body structure if available
      const respContent = resp.content?.['application/json'];
      if (respContent?.schema) {
        const respSchemaRef = respContent.schema.$ref;
        if (respSchemaRef) {
          const respSchemaName = respSchemaRef.split('/').pop();
          md += `Response Type: [\`${respSchemaName}\`](#${respSchemaName.toLowerCase()})\n\n`;
          
          // Show inline example
          const respSchema = components?.schemas?.[respSchemaName];
          if (respSchema) {
            md += '```json\n';
            md += JSON.stringify(generateExampleDeep(respSchema, components), null, 2);
            md += '\n```\n\n';
          }
        } else if (respContent.schema.type === 'object' || respContent.schema.properties) {
          md += '```json\n';
          md += JSON.stringify(generateExampleDeep(respContent.schema, components), null, 2);
          md += '\n```\n\n';
        } else if (respContent.schema.type === 'array') {
          md += '```json\n';
          md += JSON.stringify(generateExampleDeep(respContent.schema, components), null, 2);
          md += '\n```\n\n';
        }
      }
    }
  }

  return md;
}

/**
 * Get emoji for status code
 */
function getStatusEmoji(code: string): string {
  const num = parseInt(code);
  if (num >= 200 && num < 300) return '✅';
  if (num >= 300 && num < 400) return '↪️';
  if (num >= 400 && num < 500) return '⚠️';
  if (num >= 500) return '❌';
  return '📝';
}

/**
 * Generate documentation for a schema
 */
function generateSchemaDoc(name: string, schema: any, components: any): string {
  let md = `### ${name}\n\n`;
  
  if (schema.description) {
    md += `> ${schema.description}\n\n`;
  }

  if (schema.properties) {
    md += `**Properties:**\n\n`;
    md += `| Property | Type | Required | Description |\n`;
    md += `|----------|------|----------|-------------|\n`;
    
    for (const [propName, propSchema] of Object.entries(schema.properties)) {
      const prop = propSchema as any;
      const required = schema.required?.includes(propName) ? '✅' : '❌';
      
      // Get detailed type information
      let typeStr = getTypeString(prop, components);
      
      const description = prop.description || '-';
      md += `| \`${propName}\` | ${typeStr} | ${required} | ${description} |\n`;
    }
    md += `\n`;
  }

  // Example with deep resolution
  md += `**Example:**\n\n`;
  md += '```json\n';
  md += JSON.stringify(generateExampleDeep(schema, components), null, 2);
  md += '\n```\n\n';

  return md;
}

/**
 * Get detailed type string for a property
 */
function getTypeString(prop: any, components: any): string {
  // Handle $ref
  if (prop.$ref) {
    const refName = prop.$ref.split('/').pop();
    return `[${refName}](#${refName.toLowerCase()})`;
  }
  
  // Handle arrays
  if (prop.type === 'array' && prop.items) {
    if (prop.items.$ref) {
      const itemType = prop.items.$ref.split('/').pop();
      return `array<[${itemType}](#${itemType.toLowerCase()})>`;
    }
    const itemType = prop.items.type || 'object';
    if (prop.items.enum) {
      return `array<${itemType}> (${prop.items.enum.join(', ')})`;
    }
    return `array<${itemType}>`;
  }
  
  // Handle enums
  if (prop.enum && prop.enum.length > 0) {
    const baseType = prop.type || 'string';
    return `${baseType} (${prop.enum.join(', ')})`;
  }
  
  // Handle objects
  if (prop.type === 'object' || prop.properties) {
    return 'object';
  }
  
  // Default type
  return prop.type || 'any';
}

/**
 * Generate example from schema with deep resolution of $ref and nested objects
 */
function generateExampleDeep(schema: any, components: any, depth: number = 0, visited: Set<string> = new Set()): any {
  // Prevent infinite recursion
  if (depth > 5) return '...';

  // Handle $ref
  if (schema.$ref) {
    const refName = schema.$ref.split('/').pop();
    
    // Prevent circular references
    if (visited.has(refName)) {
      return `<${refName}>`;
    }
    
    const refSchema = components?.schemas?.[refName];
    if (refSchema) {
      const newVisited = new Set(visited);
      newVisited.add(refName);
      return generateExampleDeep(refSchema, components, depth + 1, newVisited);
    }
    return `<${refName}>`;
  }

  // Use explicit example if provided
  if (schema.example !== undefined) return schema.example;

  // Handle arrays
  if (schema.type === 'array') {
    if (schema.items) {
      const itemExample = generateExampleDeep(schema.items, components, depth + 1, visited);
      return [itemExample];
    }
    return [];
  }

  // Handle objects
  if (schema.type === 'object' || schema.properties) {
    const example: any = {};
    
    if (schema.properties) {
      for (const [key, prop] of Object.entries(schema.properties)) {
        const propSchema = prop as any;
        
        // Handle nested $ref
        if (propSchema.$ref) {
          example[key] = generateExampleDeep(propSchema, components, depth + 1, visited);
        }
        // Handle nested objects
        else if (propSchema.type === 'object' && propSchema.properties) {
          example[key] = generateExampleDeep(propSchema, components, depth + 1, visited);
        }
        // Handle arrays
        else if (propSchema.type === 'array') {
          example[key] = generateExampleDeep(propSchema, components, depth + 1, visited);
        }
        // Handle enums
        else if (propSchema.enum && propSchema.enum.length > 0) {
          example[key] = propSchema.enum[0];
        }
        // Use example or default
        else {
          example[key] = propSchema.example !== undefined 
            ? propSchema.example 
            : getDefaultValue(propSchema.type);
        }
      }
    }
    
    return example;
  }

  // Handle enums
  if (schema.enum && schema.enum.length > 0) {
    return schema.enum[0];
  }

  // Default values
  return getDefaultValue(schema.type);
}

/**
 * Get default value for type
 */
function getDefaultValue(type: string): any {
  switch (type) {
    case 'string': return 'string';
    case 'number': return 0;
    case 'integer': return 0;
    case 'boolean': return false;
    case 'array': return [];
    case 'object': return {};
    default: return null;
  }
}

// Run
generateAPIDocs();
