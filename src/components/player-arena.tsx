"use client";

import { PlayerCard } from "./player-card";
import type { GhostState } from "@/lib/types";
import type { RankingResult } from "@/lib/ranking";

interface PlayerArenaProps {
  ghosts: GhostState[];
  playerBuzzCharIndex: number | null;
  playerStatus: GhostState["status"] | "idle";
  playerScoreChange?: number | null;
  ranking?: RankingResult | null;
  activeGhostIdx?: number | null;
}

export function PlayerArena({
  ghosts,
  playerBuzzCharIndex,
  playerStatus,
  playerScoreChange,
  ranking,
  activeGhostIdx,
}: PlayerArenaProps) {
  const playerRank = ranking?.playerRank ?? null;

  const getGhostRank = (ghostName: string): number | null => {
    if (!ranking) return null;
    const entry = ranking.entries.find((e) => e.name === ghostName);
    return entry?.rank ?? null;
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="grid grid-cols-4 gap-2 md:gap-3">
        <PlayerCard
          name="나"
          type="player"
          colorIndex={0}
          status={playerStatus}
          buzzCharIndex={playerBuzzCharIndex}
          scoreChange={playerScoreChange}
          rank={playerRank}
        />
        {ghosts.map((ghost, i) => (
          <PlayerCard
            key={i}
            name={ghost.userName}
            type="ghost"
            colorIndex={i + 1}
            status={ghost.status}
            buzzCharIndex={ghost.status !== "waiting" ? ghost.buzzCharIndex : null}
            rank={getGhostRank(ghost.userName)}
          />
        ))}
        {Array.from({ length: Math.max(0, 3 - ghosts.length) }).map((_, i) => (
          <PlayerCard
            key={`empty-${i}`}
            name={`고스트${String.fromCharCode(65 + ghosts.length + i)}`}
            type="ghost"
            colorIndex={ghosts.length + i + 1}
            status="idle"
          />
        ))}
      </div>

      {/* Ghost buzzing overlay text */}
      {activeGhostIdx != null && ghosts[activeGhostIdx] && (
        <div className="mt-3 text-center animate-pulse">
          <span className="text-yellow-300 font-black text-sm">
            🔔 {ghosts[activeGhostIdx].userName} 버저!
          </span>
        </div>
      )}
    </div>
  );
}
