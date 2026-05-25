"use client";

import type { GhostState } from "@/lib/types";

const statusConfig: Record<
  GhostState["status"],
  { label: string; color: string; bg: string }
> = {
  waiting: { label: "대기 중", color: "text-gray-400", bg: "bg-gray-800" },
  buzzed: { label: "버저!", color: "text-yellow-300", bg: "bg-yellow-900/40" },
  correct: { label: "정답!", color: "text-green-400", bg: "bg-green-900/40" },
  wrong: { label: "오답", color: "text-red-400", bg: "bg-red-900/40" },
};

export function GhostPanel({ ghosts }: { ghosts: GhostState[] }) {
  return (
    <div className="flex gap-3">
      {ghosts.map((ghost, i) => {
        const config = statusConfig[ghost.status];
        return (
          <div
            key={i}
            className={`flex-1 rounded-lg px-3 py-2 text-center transition-all duration-300 ${config.bg} border border-gray-700`}
          >
            <div className="text-xs text-gray-400 mb-1 truncate">{ghost.userName}</div>
            <div className={`text-sm font-bold ${config.color}`}>{config.label}</div>
          </div>
        );
      })}
    </div>
  );
}
