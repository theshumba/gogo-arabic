import { z } from 'zod';
import { AppError } from '../utils/AppError.js';

/**
 * Validation middleware factory
 * Creates a middleware that validates request data against a Zod schema
 * @param {z.ZodSchema} schema - Zod validation schema
 * @param {string} source - Where to validate from: 'body', 'query', 'params'
 */
export function validate(schema, source = 'body') {
  return (req, res, next) => {
    try {
      const data = req[source];
      const validated = schema.parse(data);
      // Replace with validated data (strips unknown fields, applies transforms)
      req[source] = validated;
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const messages = err.errors.map(e => `${e.path.join('.')}: ${e.message}`);
        next(AppError.badRequest(`Validation failed: ${messages.join(', ')}`));
      } else {
        next(err);
      }
    }
  };
}
