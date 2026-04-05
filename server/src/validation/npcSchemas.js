import { z } from 'zod';

export const saveNpcStateSchema = z.object({
  relationship: z.number().int().min(0).max(100).optional(),
  dialogueChoices: z.array(z.string().min(1)).max(500).optional(),
  questsGiven: z.array(z.string().min(1)).max(100).optional(),
  lastInteraction: z.string().datetime().or(z.string().transform(str => new Date(str).toISOString())).optional().nullable(),
});

export const npcIdParamSchema = z.object({
  npcId: z.string().min(1, 'npcId is required'),
});
