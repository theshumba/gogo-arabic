import { z } from 'zod';

export const saveWorldStateSchema = z.object({
  flags: z.record(z.string(), z.union([z.boolean(), z.number(), z.string()])).optional(),
  factionControl: z.record(z.string(), z.union([z.boolean(), z.number(), z.string()])).optional(),
  zoneEvents: z.array(z.object({
    eventId: z.string().min(1),
    zone: z.string().min(1),
    type: z.string().min(1),
    timestamp: z.string().optional(),
  }).passthrough()).max(500).optional(),
});
