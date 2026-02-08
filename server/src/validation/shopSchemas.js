import { z } from 'zod';

/**
 * Validation schemas for shop endpoints
 */

export const buyItemSchema = z.object({
  itemId: z.string()
    .min(1, 'itemId is required')
    .max(100, 'itemId too long'),
});
