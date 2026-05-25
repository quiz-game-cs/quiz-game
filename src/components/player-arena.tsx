"use client";

import { PlayerCard } from "./player-card";
import type { GhostState } from "@/lib/types";

interface PlayerArenaProps {
  ghosts: GhostState[];
  playerBuzzTimeMs: number | null;
  playerStatus: GhostState["status"] | "idle";
  playerScoreChange?: number | null;
  isPlayerWinner?: boolean;
}

export function PlayerArena({
  ghosts,
  playerBuzzTimeMs,
  playerStatus,
  playerScoreChange,
  isPlayerWinner,
}: PlayerArenaProps) {
  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="grid grid-cols-4 gap-2 md:gap-3">
        <PlayerCard
          name="나"
          type="player"
          colorIndex={0}
          status={playerStatus}
          buzzTimeMs={playerBuzzTimeMs}
          scoreChange={playerScoreChange}
          isWinner={isPlayerWinner}
        />
        {ghosts.map((ghost, i) => (
          <PlayerCard
            key={i}
            name={ghost.userName}
            type="ghost"
            colorIndex={i + 1}
            status={ghost.status}
            buzzTimeMs={ghost.status !== "waiting" ? ghost.buzzTimeMs : null}
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
    </div>
  );
}
