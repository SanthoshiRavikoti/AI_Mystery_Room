import { GoogleGenAI } from '@google/genai'
import { validateGeneratedCase } from '../validators/caseSchemas.js'

const counts = { easy: '3 suspects, 5 clues, and 2 hints', medium: '4 suspects, 7 clues, and 3 hints', hard: '5 suspects, 9 clues, and 3 hints' }

export async function generateMystery(premise, difficulty) {
  if (!process.env.GEMINI_API_KEY) throw new Error('MISSING_GEMINI_KEY')
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  const prompt = `Create a coherent, fair fictional detective mystery based on this premise: ${premise}\nDifficulty: ${difficulty}. Include a difficulty field set to "${difficulty}" and exactly ${counts[difficulty]}. Return ONLY JSON with keys title, premise, story, difficulty, suspects, clues, hints, timeline, solution. Each suspect: id, name, profile, motive, opportunity, alibi. Each clue: id, title, description, content, relatedSuspectIds. Make timeline an array of plain text strings. Solution: culpritId, explanation, clueRationale (an array of plain text strings, one item per clue explaining its evidentiary role). Hints go from subtle to direct but never name the culprit. The solution must be supported by evidence and the timeline/alibis must not contradict. Keep all evidence fictional. Do not include the culprit in the public story or clue descriptions.`
  let lastError
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || 'gemini-3.8-flash', contents: prompt,
        config: { responseMimeType: 'application/json', httpOptions: { timeout: 120000 } },
      })
      const text = response.text?.trim()
      if (!text) throw new Error('Empty generation response')
      return validateGeneratedCase(JSON.parse(text), difficulty)
    } catch (error) {
      lastError = error
      if (attempt < 2) {
        const backoffMs = 1000 * (2 ** attempt) + Math.random() * 250
        await new Promise((resolve) => setTimeout(resolve, backoffMs))
      }
    }
  }
  console.error('Mystery generation failed validation or provider request.', lastError?.message)
  throw new Error('GENERATION_FAILED')
}
