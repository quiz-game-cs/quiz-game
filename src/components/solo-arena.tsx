"use client";

import { PlayerCard } from "./player-card";
import type { GhostState } from "@/lib/types";

interface SoloArenaProps {
  playerName: string;
  playerStatus: GhostState["status"] | "idle";
  playerBuzzCharIndex: number | null;
  playerScoreChange?: number | null;
}

export function SoloArena({
  playerName,
  playerStatus,
  playerBuzzCharIndex,
  playerScoreChange,
}: SoloArenaProps) {
  return (
    <div className="w-full max-w-xs mx-auto">
      <PlayerCard
        name={playerName}
        type="player"
        colorIndex={0}
        status={playerStatus}
        buzzCharIndex={playerBuzzCharIndex}
        scoreChange={playerScoreChange}
      />
    </div>
  );
}
