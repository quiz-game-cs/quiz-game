export const SCORES = {
  CORRECT: 100,
  SPEED_BONUS: 50,
  WRONG: -50,
  TIMEOUT: 0,
} as const;

export interface RoundResult {
  isCorrect: boolean;
  playerBuzzTimeMs: number | null;
  fastestCorrectGhostBuzzTimeMs: number | null;
}

export function calculateRoundScore(result: RoundResult): number {
  if (!result.isCorrect) {
    return result.playerBuzzTimeMs !== null ? SCORES.WRONG : SCORES.TIMEOUT;
  }

  let score = SCORES.CORRECT;

  if (
    result.fastestCorrectGhostBuzzTimeMs !== null &&
    result.playerBuzzTimeMs !== null &&
    result.playerBuzzTimeMs < result.fastestCorrectGhostBuzzTimeMs
  ) {
    score += SCORES.SPEED_BONUS;
  }

  return score;
}
