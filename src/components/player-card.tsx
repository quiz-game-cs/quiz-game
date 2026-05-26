"use client";

import type { GhostState } from "@/lib/types";
import { getRankEmoji } from "@/lib/ranking";

export type PlayerType = "player" | "ghost";

export interface PlayerCardProps {
  name: string;
  type: PlayerType;
  colorIndex: number;
  status: GhostState["status"] | "idle";
  buzzCharIndex?: number | null;
  scoreChange?: number | null;
  rank?: number | null;
}

const COLORS = [
  { bg: "from-blue-600/20 to-blue-900/30", border: "border-blue-500/50", ring: "ring-blue-400", avatar: "bg-blue-500", text: "text-blue-400" },
  { bg: "from-red-600/20 to-red-900/30", border: "border-red-500/50", ring: "ring-red-400", avatar: "bg-red-500", text: "text-red-400" },
  { bg: "from-emerald-600/20 to-emerald-900/30", border: "border-emerald-500/50", ring: "ring-emerald-400", avatar: "bg-emerald-500", text: "text-emerald-400" },
  { bg: "from-purple-600/20 to-purple-900/30", border: "border-purple-500/50", ring: "ring-purple-400", avatar: "bg-purple-500", text: "text-purple-400" },
];

const STATUS_CONFIG = {
  idle: { label: "대기", icon: "⏳" },
  waiting: { label: "대기", icon: "⏳" },
  buzzed: { label: "버저!", icon: "🔔" },
  correct: { label: "정답!", icon: "✅" },
  wrong: { label: "오답", icon: "❌" },
};

export function PlayerCard({
  name,
  type,
  colorIndex,
  status,
  buzzCharIndex,
  scoreChange,
  rank,
}: PlayerCardProps) {
  const color = COLORS[colorIndex % COLORS.length];
  const statusCfg = STATUS_CONFIG[status];
  const isActive = status === "buzzed" || status === "correct";
  const isDimmed = status === "wrong";

  return (
    <div
      className={`
        relative rounded-xl border-2 p-3 transition-all duration-300
        bg-gradient-to-b ${color.bg} ${color.border}
        ${isActive ? "brightness-110 scale-[1.02]" : ""}
        ${isDimmed ? "opacity-60" : ""}
        ${status === "buzzed" ? "animate-shake" : ""}
        ${status === "correct" ? "animate-glow-green" : ""}
        ${status === "wrong" ? "animate-glow-red" : ""}
        ${rank === 1 ? "animate-glow-gold" : ""}
      `}
    >
      {/* Rank badge */}
      {rank != null && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-lg">
          {getRankEmoji(rank)}
        </div>
      )}

      {/* Score float */}
      {scoreChange != null && scoreChange !== 0 && (
        <div
          className={`absolute -top-2 right-1 text-sm font-black animate-float-up
            ${scoreChange > 0 ? "text-green-400" : "text-red-400"}`}
        >
          {scoreChange > 0 ? "+" : ""}{scoreChange}
        </div>
      )}

      <div className="flex flex-col items-center gap-1.5">
        {/* Avatar */}
        <div className={`w-10 h-10 rounded-full ${color.avatar} flex items-center justify-center text-white font-black text-sm shadow-lg`}>
          {type === "player" ? "나" : name.charAt(name.length - 1)}
        </div>

        {/* Name */}
        <div className={`text-xs font-bold truncate max-w-full ${color.text}`}>
          {name}
        </div>

        {/* Status */}
        <div className={`text-lg leading-none ${status === "waiting" || status === "idle" ? "opacity-40" : ""}`}>
          {statusCfg.icon}
        </div>
        <div className={`text-[10px] font-bold uppercase tracking-wider
          ${status === "correct" ? "text-green-400" : status === "wrong" ? "text-red-400" : status === "buzzed" ? "text-yellow-300" : "text-gray-500"}`}
        >
          {statusCfg.label}
        </div>

        {/* Buzz char index */}
        {buzzCharIndex != null && status !== "waiting" && status !== "idle" && (
          <div className="text-[10px] text-gray-400 font-mono">
            {buzzCharIndex}글자
          </div>
        )}
      </div>
    </div>
  );
}
