"use client";

import type { GhostState, Question } from "@/lib/types";
import { calculateRanking, getRankEmoji } from "@/lib/ranking";

interface ResultPanelProps {
  isCorrect: boolean | null;
  question: Question;
  buzzCharIndex: number | null;
  ghosts: GhostState[];
  roundScore: number;
  totalScore: number;
  currentRound: number;
  totalRounds: number;
  onNext: () => void;
  isGameOver: boolean;
}

const RANK_LABELS: Record<number, { text: string; color: string; bg: string }> = {
  1: { text: "1등!", color: "text-yellow-300", bg: "from-yellow-900/30 to-yellow-950/40" },
  2: { text: "2등", color: "text-gray-300", bg: "from-gray-600/30 to-gray-800/40" },
  3: { text: "3등", color: "text-amber-600", bg: "from-amber-900/20 to-amber-950/30" },
  4: { text: "4등", color: "text-gray-500", bg: "from-gray-700/30 to-gray-900/40" },
};

export function ResultPanel({
  isCorrect,
  question,
  buzzCharIndex,
  ghosts,
  roundScore,
  totalScore,
  currentRound,
  totalRounds,
  onNext,
  isGameOver,
}: ResultPanelProps) {
  const ranking = calculateRanking(isCorrect, buzzCharIndex, ghosts);
  const rank = ranking.playerRank;
  const rankCfg = RANK_LABELS[rank] ?? RANK_LABELS[4];

  const statusText =
    isCorrect === null
      ? { text: "미응답", color: "text-gray-400", bg: "from-gray-700/40 to-gray-800/60" }
      : isCorrect
        ? { text: `${getRankEmoji(rank)} ${rankCfg.text}`, color: rankCfg.color, bg: rankCfg.bg }
        : { text: "오답", color: "text-red-400", bg: "from-red-900/30 to-red-950/40" };

  const ghostBuzzPoints = ghosts.map((g, i) => ({
    charIndex: g.buzzCharIndex,
    colorClass: ["text-red-400", "text-emerald-400", "text-purple-400"][i] ?? "text-gray-400",
    name: g.userName,
  }));

  return (
    <div className={`w-full max-w-md mx-auto rounded-2xl border border-gray-700/50 bg-gradient-to-b ${statusText.bg} p-5 space-y-4`}>
      {/* Rank header */}
      <div className="text-center">
        <div className={`text-4xl font-black ${statusText.color} ${rank === 1 && isCorrect ? "animate-glow-gold inline-block px-4 py-1 rounded-xl" : ""}`}>
          {statusText.text}
        </div>
      </div>

      {/* Full question with buzz markers */}
      <div className="bg-black/30 rounded-xl p-3">
        <div className="text-[10px] text-gray-600 mb-1.5 font-bold uppercase tracking-wider">전체 문제</div>
        <p className="text-sm leading-relaxed">
          {question.text.split("").map((char, i) => {
            const isPlayerBuzz = buzzCharIndex != null && i === buzzCharIndex;
            const ghostAtPoint = ghostBuzzPoints.find((g) => g.charIndex === i);
            return (
              <span key={i} className="relative">
                {isPlayerBuzz && (
                  <span className="absolute -top-3 left-0 text-[8px] text-blue-400 font-bold whitespace-nowrap">▼나</span>
                )}
                {ghostAtPoint && !isPlayerBuzz && (
                  <span className={`absolute -top-3 left-0 text-[8px] ${ghostAtPoint.colorClass} font-bold whitespace-nowrap`}>
                    ▼{ghostAtPoint.name.slice(-1)}
                  </span>
                )}
                <span className={
                  buzzCharIndex != null && i < buzzCharIndex
                    ? "text-white"
                    : buzzCharIndex != null && i === buzzCharIndex
                      ? "text-blue-400 font-bold"
                      : "text-gray-500"
                }>
                  {char}
                </span>
              </span>
            );
          })}
        </p>
      </div>

      {/* Answer */}
      <div className="text-center text-sm">
        <span className="text-gray-500">정답 </span>
        <span className="text-white font-bold text-base">{question.answers[0]}</span>
      </div>

      {/* Stats */}
      <div className="bg-black/30 rounded-xl p-3 space-y-2 text-xs">
        {buzzCharIndex !== null && (
          <div className="flex justify-between">
            <span className="text-gray-500">내 버저</span>
            <span className="text-white font-mono font-bold">{buzzCharIndex}글자째</span>
          </div>
        )}
        {ranking.entries
          .filter((e) => e.name !== "나" && e.isCorrect)
          .slice(0, 1)
          .map((e) => (
            <div key={e.name} className="flex justify-between">
              <span className="text-gray-500">최고 고스트</span>
              <span className="text-gray-300 font-mono">{e.buzzCharIndex}글자째 · {e.name}</span>
            </div>
          ))}
        <div className="border-t border-gray-700/50 pt-2 mt-2 flex justify-between">
          <span className="text-gray-500">이번 점수</span>
          <span className={`font-black text-base ${roundScore > 0 ? "text-green-400" : roundScore < 0 ? "text-red-400" : "text-gray-400"}`}>
            {roundScore > 0 ? "+" : ""}{roundScore}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">누적</span>
          <span className="text-white font-bold text-base">{totalScore}</span>
        </div>
      </div>

      {/* Next button */}
      <button
        onClick={onNext}
        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl
          transition-colors text-sm tracking-wider cursor-pointer"
      >
        {isGameOver
          ? totalRounds > 1
            ? "최종 결과 보기"
            : "다음 문제 →"
          : `다음 문제 (${currentRound}/${totalRounds})`}
      </button>
    </div>
  );
}
