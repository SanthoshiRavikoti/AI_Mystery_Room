import mongoose from 'mongoose'
import { Case } from '../models/Case.js'
import { createCaseSchema, accusationSchema } from '../validators/caseSchemas.js'
import { generateMystery } from '../services/geminiService.js'
import { calculateScore } from '../services/scoringService.js'

const fail = (status, code, message) => Object.assign(new Error(message), { status, code })
const safeCase = (doc) => ({
  id: doc._id.toString(), title: doc.title, premise: doc.premise, story: doc.story, difficulty: doc.difficulty,
  suspects: doc.suspects, clues: doc.clues.map(({ id, title, description }) => ({ id, title, description, discovered: doc.discoveredClueIds.includes(id) })),
  discoveredClueIds: doc.discoveredClueIds, usedHintCount: doc.usedHintCount, usedHints: doc.hints.slice(0, doc.usedHintCount), hintsAvailable: doc.hints.length - doc.usedHintCount,
  timeline: doc.timeline, status: doc.status, scoreSoFar: Math.max(0, doc.discoveredClueIds.length * 5 - doc.usedHintCount * 10),
})
const findCase = async (id) => {
  if (!mongoose.isValidObjectId(id)) throw fail(404, 'NOT_FOUND', 'Mystery not found.')
  const doc = await Case.findById(id)
  if (!doc) throw fail(404, 'NOT_FOUND', 'Mystery not found.')
  return doc
}
const activeCase = async (id) => {
  const doc = await findCase(id)
  if (doc.status !== 'active') throw fail(409, 'CASE_COMPLETED', 'This case has already been completed.')
  return doc
}

export async function createCase(req, res, next) {
  try {
    const input = createCaseSchema.parse(req.body)
    let mystery
    try { mystery = await generateMystery(input.premise, input.difficulty) }
    catch (error) {
      const missingKey = error.message === 'MISSING_GEMINI_KEY'
      throw fail(missingKey ? 503 : 502, missingKey ? 'GENERATION_UNAVAILABLE' : 'GENERATION_FAILED', missingKey ? 'Mystery generation is not configured yet. Add the Gemini API key on the server.' : 'We could not create a valid mystery right now. Please try again.')
    }
    const doc = await Case.create({ ...mystery, premise: input.premise, difficulty: input.difficulty })
    res.status(201).json({ case: safeCase(doc) })
  } catch (error) { next(error) }
}

export async function getCase(req, res, next) {
  try { const doc = await findCase(req.params.id); res.json({ case: safeCase(doc) }) } catch (error) { next(error) }
}

export async function discoverClue(req, res, next) {
  try {
    const doc = await activeCase(req.params.id)
    const clue = doc.clues.find((item) => item.id === req.params.clueId)
    if (!clue) throw fail(404, 'CLUE_NOT_FOUND', 'That clue does not belong to this case.')
    const update = await Case.updateOne({ _id: doc._id, status: 'active' }, { $addToSet: { discoveredClueIds: clue.id } })
    if (update.matchedCount === 0) throw fail(409, 'CASE_COMPLETED', 'This case has already been completed.')
    const updated = await Case.findById(doc._id)
    res.json({ clue: { ...clue.toObject(), discovered: true }, case: safeCase(updated), alreadyDiscovered: update.modifiedCount === 0 })
  } catch (error) { next(error) }
}

export async function requestHint(req, res, next) {
  try {
    const doc = await activeCase(req.params.id)
    const updated = await Case.findOneAndUpdate({ _id: doc._id, status: 'active', usedHintCount: { $lt: doc.hints.length } }, { $inc: { usedHintCount: 1 } }, { new: true })
    if (!updated) {
      const latest = await Case.findById(doc._id).select('status')
      if (latest?.status !== 'active') throw fail(409, 'CASE_COMPLETED', 'This case has already been completed.')
      throw fail(409, 'NO_HINTS_LEFT', 'You have used all available hints.')
    }
    const hint = updated.hints[updated.usedHintCount - 1]
    res.json({ hint, usedHintCount: updated.usedHintCount, hintsAvailable: updated.hints.length - updated.usedHintCount, case: safeCase(updated) })
  } catch (error) { next(error) }
}

export async function accuse(req, res, next) {
  try {
    const { suspectId } = accusationSchema.parse(req.body)
    const doc = await activeCase(req.params.id)
    if (!doc.suspects.some((suspect) => suspect.id === suspectId)) throw fail(400, 'INVALID_SUSPECT', 'Choose a suspect from this case.')
    const updated = await Case.findOneAndUpdate({ _id: doc._id, status: 'active' }, [{ $set: {
      status: 'completed',
      accusation: { suspectId: { $literal: suspectId }, submittedAt: { $literal: new Date() } },
      score: { $max: [0, { $add: [
        { $cond: [
          { $eq: ['$solution.culpritId', { $literal: suspectId }] },
          { $switch: { branches: [{ case: { $eq: ['$difficulty', 'easy'] }, then: 100 }, { case: { $eq: ['$difficulty', 'medium'] }, then: 150 }, { case: { $eq: ['$difficulty', 'hard'] }, then: 200 }], default: 0 } },
          0,
        ] },
        { $multiply: [{ $size: '$discoveredClueIds' }, 5] },
        { $multiply: ['$usedHintCount', -10] },
      ] }] },
    } }], { new: true })
    if (!updated) throw fail(409, 'CASE_COMPLETED', 'This case has already been completed.')
    const correct = suspectId === updated.solution.culpritId
    const scoreBreakdown = calculateScore(updated, correct)
    res.json({ verdict: correct ? 'correct' : 'incorrect', culprit: updated.suspects.find((suspect) => suspect.id === updated.solution.culpritId), explanation: updated.solution.explanation, clueRationale: updated.solution.clueRationale, scoreBreakdown, difficulty: updated.difficulty })
  } catch (error) { next(error) }
}

export async function getResult(req, res, next) {
  try {
    const doc = await findCase(req.params.id)
    if (doc.status !== 'completed') throw fail(409, 'CASE_ACTIVE', 'Submit your accusation to see the case result.')
    res.json({ verdict: doc.accusation.suspectId === doc.solution.culpritId ? 'correct' : 'incorrect', culprit: doc.suspects.find((suspect) => suspect.id === doc.solution.culpritId), explanation: doc.solution.explanation, clueRationale: doc.solution.clueRationale, scoreBreakdown: calculateScore(doc, doc.accusation.suspectId === doc.solution.culpritId), difficulty: doc.difficulty })
  } catch (error) { next(error) }
}
