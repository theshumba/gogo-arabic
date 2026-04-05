import { z } from 'zod';

const VALID_FACTIONS = ['scholars', 'merchants', 'artisans', 'travelers', 'guardians', 'artists'];

export const updateReputationSchema = z.object({
  factionId: z.enum(VALID_FACTIONS, {
    errorMap: () => ({ message: `factionId must be one of: ${VALID_FACTIONS.join(', ')}` }),
  }),
  amount: z.number().int().min(-100).max(100),
});

export const factionIdParamSchema = z.object({
  factionId: z.enum(VALID_FACTIONS, {
    errorMap: () => ({ message: `factionId must be one of: ${VALID_FACTIONS.join(', ')}` }),
  }),
});
