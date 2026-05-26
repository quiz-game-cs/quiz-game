export const SCORES = {
  CORRECT: 100,
  SPEED_BONUS: 50,
  WRONG: -50,
  TIMEOUT: 0,
} as const;

export interface RoundResult {
  isCorrect: boolean;
  playerBuzzCharIndex: number | null;
  fastestCorrectGhostBuzzCharIndex: number | null;
}

export function calculateRoundScore(result: RoundResult): number {
  if (!result.isCorrect) {
    return result.playerBuzzCharIndex !== null ? SCORES.WRONG : SCORES.TIMEOUT;
  }

  let score = SCORES.CORRECT;

  if (
    result.fastestCorrectGhostBuzzCharIndex !== null &&
    result.playerBuzzCharIndex !== null &&
    result.playerBuzzCharIndex <= result.fastestCorrectGhostBuzzCharIndex
  ) {
    score += SCORES.SPEED_BONUS;
  }

  return score;
}
