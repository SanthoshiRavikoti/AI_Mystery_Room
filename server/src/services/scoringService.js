export const difficultyPoints = { easy: 100, medium: 150, hard: 200 }

export function calculateScore(gameCase, correct) {
  const basePoints = correct ? difficultyPoints[gameCase.difficulty] : 0
  const cluePoints = gameCase.discoveredClueIds.length * 5
  const hintPenalty = gameCase.usedHintCount * 10
  return { basePoints, cluePoints, hintPenalty, finalScore: Math.max(0, basePoints + cluePoints - hintPenalty) }
}
