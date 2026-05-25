import type { Ghost } from "./types";

const CHAR_INTERVAL_MS = 120;

export function generateSeedGhosts(questionText: string, _answers: string[]): Ghost[] {
  const len = questionText.length;

  const fast = Math.max(1, Math.round(len * 0.3));
  const mid = Math.max(2, Math.round(len * 0.6));
  const slow = Math.max(3, Math.round(len * 0.85));

  return [
    {
      userName: "고스트A",
      buzzCharIndex: fast,
      buzzTimeMs: fast * CHAR_INTERVAL_MS,
      isCorrect: true,
    },
    {
      userName: "고스트B",
      buzzCharIndex: mid,
      buzzTimeMs: mid * CHAR_INTERVAL_MS,
      isCorrect: true,
    },
    {
      userName: "고스트C",
      buzzCharIndex: slow,
      buzzTimeMs: slow * CHAR_INTERVAL_MS,
      isCorrect: true,
    },
  ];
}
