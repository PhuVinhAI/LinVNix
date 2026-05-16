import { zodToJsonSchema } from 'zod-to-json-schema';
import type { ZodSchema } from 'zod';
import type { ToolDeclaration } from '../types/ai.js';
import type { ToolContext } from './tool-context.js';

export abstract class BaseTool<TParams, TResult> {
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly parameters: ZodSchema<TParams>;

  abstract execute(params: TParams, ctx: ToolContext): Promise<TResult>;

  toDeclaration(): ToolDeclaration {
    const jsonSchema = zodToJsonSchema(this.parameters as any) as Record<string, any>;
    return {
      name: this.name,
      description: this.description,
      parameters: jsonSchema,
    };
  }
}
