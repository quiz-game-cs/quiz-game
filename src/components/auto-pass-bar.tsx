"use client";

const SEGMENTS = [
  { color: "bg-green-500", glow: "shadow-green-500/50", threshold: 0 },
  { color: "bg-green-500", glow: "shadow-green-500/50", threshold: 1 },
  { color: "bg-yellow-400", glow: "shadow-yellow-400/50", threshold: 2 },
  { color: "bg-yellow-400", glow: "shadow-yellow-400/50", threshold: 3 },
  { color: "bg-red-500", glow: "shadow-red-500/50", threshold: 4 },
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
        const visible = leftSec > seg.threshold;
        return (
          <div
            key={i}
            className={`flex-1 h-2.5 rounded-full transition-all duration-300 ease-out origin-right
              ${seg.color}
              ${visible ? `opacity-100 scale-x-100 shadow-md ${seg.glow}` : "opacity-0 scale-x-0"}`}
          />
        );
      })}
    </div>
  );
}
