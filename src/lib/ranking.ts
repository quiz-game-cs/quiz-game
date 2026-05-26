import type { GhostState } from "./types";

export interface RankEntry {
  name: string;
  rank: number;
  isCorrect: boolean | null;
  buzzCharIndex: number | null;
}

export interface RankingResult {
  playerRank: number;
  entries: RankEntry[];
}

export function calculateRanking(
  playerIsCorrect: boolean | null,
  playerBuzzCharIndex: number | null,
  ghosts: GhostState[],
): RankingResult {
  const participants: {
    name: string;
    isCorrect: boolean | null;
    buzzCharIndex: number | null;
    isPlayer: boolean;
  }[] = [
    { name: "나", isCorrect: playerIsCorrect, buzzCharIndex: playerBuzzCharIndex, isPlayer: true },
    ...ghosts.map((g) => ({
      name: g.userName,
      isCorrect: g.isCorrect as boolean | null,
      buzzCharIndex: g.buzzCharIndex,
      isPlayer: false,
    })),
  ];

  participants.sort((a, b) => {
    const aCorrect = a.isCorrect === true ? 1 : 0;
    const bCorrect = b.isCorrect === true ? 1 : 0;
    if (aCorrect !== bCorrect) return bCorrect - aCorrect;

    if (aCorrect && bCorrect) {
      const aIdx = a.buzzCharIndex ?? Infinity;
      const bIdx = b.buzzCharIndex ?? Infinity;
      return aIdx - bIdx;
    }

    const aAnswered = a.isCorrect !== null ? 1 : 0;
    const bAnswered = b.isCorrect !== null ? 1 : 0;
    return bAnswered - aAnswered;
  });

  let currentRank = 1;
  const entries: RankEntry[] = participants.map((p, i) => {
    if (i > 0) {
      const prev = participants[i - 1];
      const sameGroup =
        (p.isCorrect === true) === (prev.isCorrect === true) &&
        (p.isCorrect === true ? p.buzzCharIndex === prev.buzzCharIndex : true);
      if (!sameGroup) currentRank = i + 1;
    }
    return {
      name: p.name,
      rank: currentRank,
      isCorrect: p.isCorrect,
      buzzCharIndex: p.buzzCharIndex,
    };
  });

  const playerEntry = entries.find((_, i) => participants[i].isPlayer);
  return { playerRank: playerEntry?.rank ?? entries.length, entries };
}

export function getRankEmoji(rank: number): string {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `${rank}th`;
}
