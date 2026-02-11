import { z } from 'zod';

// Dialogue line — spoken by NPC or player choice
const dialogueLineSchema = z.object({
  speaker: z.string().optional(),
  arabic: z.string().optional(),
  english: z.string().optional(),
  transliteration: z.string().optional(),
  teachWord: z.string().optional(),
  action: z.string().optional(),
  choices: z.array(z.object({
    arabic: z.string(),
    english: z.string(),
    next: z.string().nullable().optional(),
  }).passthrough()).optional(),
}).passthrough();

// Dialogue tree — a conversation branch
const dialogueTreeSchema = z.object({
  id: z.string(),
  trigger: z.string().optional(),
  lines: z.array(dialogueLineSchema).min(1),
}).passthrough();

// Greeting object
const greetingSchema = z.object({
  arabic: z.string(),
  english: z.string(),
  transliteration: z.string().optional(),
}).passthrough();

// NPC entry
const npcSchema = z.object({
  id: z.string(),
  name: z.string(),
  greeting: greetingSchema,
  dialogueTrees: z.array(dialogueTreeSchema).min(1),
}).passthrough();

/** Full NPC data schema — array of NPC entries */
export const dialogueSchema = z.array(npcSchema);

/**
 * Validate NPC dialogue data against the schema.
 * @param {unknown} data - The parsed NPC JSON data
 * @returns {{ success: boolean, errors: string[] }}
 */
export function validateDialogueData(data) {
  const result = dialogueSchema.safeParse(data);
  if (result.success) {
    return { success: true, errors: [] };
  }
  const errors = result.error.issues.map(
    (issue) => `[${issue.path.join('.')}] ${issue.message}`
  );
  return { success: false, errors };
}
