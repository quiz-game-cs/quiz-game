"use client";

const SEGMENTS = [
  { color: "bg-green-500", glow: "shadow-green-500/50" },
  { color: "bg-green-500", glow: "shadow-green-500/50" },
  { color: "bg-yellow-400", glow: "shadow-yellow-400/50" },
  { color: "bg-yellow-400", glow: "shadow-yellow-400/50" },
  { color: "bg-red-500", glow: "shadow-red-500/50" },
];

interface Props {
  timeLeftMs: number;
  totalMs: number;
}

export function AutoPassBar({ timeLeftMs, totalMs }: Props) {
  const leftSec = timeLeftMs / 1000;
  const totalSec = totalMs / 1000;

  return (
    <div className="w-full max-w-2xl mx-auto flex items-center gap-1 px-2">
      {SEGMENTS.slice(0, totalSec).map((seg, i) => {
        // 왼쪽 칸(i=0, 초록)이 먼저 사라지고 오른쪽 칸(빨강)이 마지막까지 남도록.
        // i 칸은 leftSec > (totalSec - 1 - i) 일 때만 보임.
        const visible = leftSec > totalSec - 1 - i;
        return (
          <div
            key={i}
            className={`flex-1 h-2.5 rounded-full transition-all duration-300 ease-out origin-left
              ${seg.color}
              ${visible ? `opacity-100 scale-x-100 shadow-md ${seg.glow}` : "opacity-0 scale-x-0"}`}
          />
        );
      })}
    </div>
  );
}
