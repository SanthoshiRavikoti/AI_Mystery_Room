import { z } from 'zod'

export const createCaseSchema = z.object({
  premise: z.string().trim().min(12, 'Give the mystery a little more detail (at least 12 characters).').max(800, 'Keep the premise under 800 characters.'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
}).strict()

const suspectSchema = z.object({ id: z.string().min(1).max(40), name: z.string().min(1).max(80), profile: z.string().min(10).max(1200), motive: z.string().min(3).max(500), opportunity: z.string().max(500).default(''), alibi: z.string().min(3).max(500) }).strict()
const clueSchema = z.object({ id: z.string().min(1).max(40), title: z.string().min(1).max(120), description: z.string().min(8).max(500), content: z.string().min(8).max(1600), relatedSuspectIds: z.array(z.string()).default([]) }).strict()

function textFromModelValue(value, preferredKeys, depth = 0) {
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (depth > 5 || value == null) return ''
  if (Array.isArray(value)) return value.map((part) => textFromModelValue(part, preferredKeys, depth + 1)).filter(Boolean).join('; ')
  if (typeof value !== 'object') return ''

  const selected = preferredKeys.filter((key) => value[key] != null)
  const entries = selected.length ? selected.map((key) => [key, value[key]]) : Object.entries(value)
  return entries.map(([key, part]) => {
    const text = textFromModelValue(part, preferredKeys, depth + 1)
    return text ? `${key.replace(/([A-Z])/g, ' $1')}: ${text}` : ''
  }).filter(Boolean).join(' · ')
}

const timelineEntrySchema = z.preprocess(
  (value) => textFromModelValue(value, ['time', 'timestamp', 'event', 'description', 'detail', 'text']),
  z.string().trim().min(3).max(500),
)
const clueRationaleSchema = z.preprocess(
  (value) => textFromModelValue(value, ['rationale', 'explanation', 'reasoning', 'deduction', 'evidence', 'text', 'description']),
  z.string().trim().min(8).max(800),
)

export const generatedCaseSchema = z.object({
  title: z.string().min(3).max(140), premise: z.string().min(8).max(800), story: z.string().min(80).max(12000),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  suspects: z.array(suspectSchema), clues: z.array(clueSchema), hints: z.array(z.string().min(8).max(500)),
  timeline: z.array(timelineEntrySchema).max(12).default([]),
  solution: z.object({ culpritId: z.string(), explanation: z.string().min(40).max(4000), clueRationale: z.array(clueRationaleSchema) }).strict(),
}).strict()

export const accusationSchema = z.object({ suspectId: z.string().min(1).max(40) }).strict()

export function validateGeneratedCase(data, difficulty) {
  const parsed = generatedCaseSchema.parse(data)
  if (parsed.difficulty !== difficulty) throw new Error('Generated case did not match the selected difficulty.')
  const expected = { easy: [3, 5, 2], medium: [4, 7, 3], hard: [5, 9, 3] }[difficulty]
  if (parsed.suspects.length !== expected[0] || parsed.clues.length !== expected[1] || parsed.hints.length !== expected[2]) throw new Error('Generated case did not match required counts.')
  const unique = (items) => new Set(items.map((item) => item.id)).size === items.length
  if (!unique(parsed.suspects) || !unique(parsed.clues)) throw new Error('Generated case contained duplicate identifiers.')
  const suspectIds = new Set(parsed.suspects.map((suspect) => suspect.id))
  if (!suspectIds.has(parsed.solution.culpritId)) throw new Error('Generated case had no valid culprit.')
  if (parsed.clues.some((clue) => clue.relatedSuspectIds.some((id) => !suspectIds.has(id)))) throw new Error('Generated case contained an unknown suspect reference.')
  if (parsed.solution.clueRationale.length !== parsed.clues.length) throw new Error('Generated case did not provide a rationale for every clue.')
  return parsed
}
