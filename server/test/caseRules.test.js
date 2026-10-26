import test from 'node:test'
import assert from 'node:assert/strict'
import { validateGeneratedCase } from '../src/validators/caseSchemas.js'
import { calculateScore } from '../src/services/scoringService.js'

const countByDifficulty = { easy: [3, 5, 2], medium: [4, 7, 3], hard: [5, 9, 3] }

function mysteryFor(difficulty) {
  const [suspectCount, clueCount, hintCount] = countByDifficulty[difficulty]
  const suspects = Array.from({ length: suspectCount }, (_, index) => ({ id: `s${index}`, name: `Suspect ${index}`, profile: 'A fictional person connected with the incident.', motive: 'A reason to want the object.', opportunity: 'They had access to the room.', alibi: 'They describe where they were.' }))
  const clues = Array.from({ length: clueCount }, (_, index) => ({ id: `c${index}`, title: `Clue ${index}`, description: 'A detail worth examining closely.', content: 'The fictional evidence gives the investigator a useful detail.', relatedSuspectIds: ['s0'] }))
  return { title: 'The Quiet Gallery', premise: 'A sculpture vanishes during a private viewing.', story: 'During a private viewing at a small gallery, a sculpture disappears. The doors remain locked, and each guest offers a different account of the final hour.', difficulty, suspects, clues, hints: Array.from({ length: hintCount }, (_, index) => `Consider the order of events in clue ${index}.`), timeline: [], solution: { culpritId: 's0', explanation: 'The account and evidence establish a coherent chain of events for this fictional case.', clueRationale: clues.map((_, index) => `Clue ${index} helps establish the sequence and test the accounts.`) } }
}

test('validates exact suspect, clue, and hint counts at every difficulty', () => {
  for (const difficulty of Object.keys(countByDifficulty)) {
    const parsed = validateGeneratedCase(mysteryFor(difficulty), difficulty)
    assert.equal(parsed.suspects.length, countByDifficulty[difficulty][0])
    assert.equal(parsed.clues.length, countByDifficulty[difficulty][1])
    assert.equal(parsed.hints.length, countByDifficulty[difficulty][2])
  }
})

test('rejects duplicate IDs, unknown references, and a mismatched difficulty', () => {
  const duplicate = mysteryFor('easy'); duplicate.suspects[1].id = duplicate.suspects[0].id
  assert.throws(() => validateGeneratedCase(duplicate, 'easy'), /duplicate identifiers/)
  const unknown = mysteryFor('easy'); unknown.clues[0].relatedSuspectIds = ['not-a-suspect']
  assert.throws(() => validateGeneratedCase(unknown, 'easy'), /unknown suspect reference/)
  assert.throws(() => validateGeneratedCase(mysteryFor('hard'), 'easy'), /difficulty|counts/i)
})

test('scores correct and incorrect accusations from saved progress and never goes below zero', () => {
  for (const [difficulty, basePoints] of Object.entries({ easy: 100, medium: 150, hard: 200 })) {
    const gameCase = { difficulty, discoveredClueIds: ['c1', 'c2'], usedHintCount: 1 }
    assert.deepEqual(calculateScore(gameCase, true), { basePoints, cluePoints: 10, hintPenalty: 10, finalScore: basePoints })
    assert.deepEqual(calculateScore({ ...gameCase, usedHintCount: 50 }, false), { basePoints: 0, cluePoints: 10, hintPenalty: 500, finalScore: 0 })
  }
})
