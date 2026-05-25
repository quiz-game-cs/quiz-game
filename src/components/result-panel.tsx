"use client";

import type { GhostState, Question } from "@/lib/types";

interface ResultPanelProps {
  isCorrect: boolean | null;
  question: Question;
  buzzTimeMs: number | null;
  buzzCharIndex: number | null;
  ghosts: GhostState[];
  roundScore: number;
  totalScore: number;
  currentRound: number;
  totalRounds: number;
  onNext: () => void;
  isGameOver: boolean;
}

export function ResultPanel({
  isCorrect,
  question,
  buzzTimeMs,
  buzzCharIndex,
  ghosts,
  roundScore,
  totalScore,
  currentRound,
  totalRounds,
  onNext,
  isGameOver,
}: ResultPanelProps) {
  const fastestCorrectGhost = ghosts
    .filter((g) => g.isCorrect)
    .sort((a, b) => a.buzzTimeMs - b.buzzTimeMs)[0];

  const isWin =
    isCorrect && buzzTimeMs != null && fastestCorrectGhost
      ? buzzTimeMs < fastestCorrectGhost.buzzTimeMs
      : isCorrect === true;

  const resultLabel =
    isCorrect === null
      ? { text: "미응답", color: "text-gray-400", bg: "from-gray-700/40 to-gray-800/60" }
      : isWin
        ? { text: "승리!", color: "text-yellow-300", bg: "from-yellow-900/30 to-yellow-950/40" }
        : isCorrect
          ? { text: "정답!", color: "text-green-400", bg: "from-green-900/30 to-green-950/40" }
          : { text: "오답", color: "text-red-400", bg: "from-red-900/30 to-red-950/40" };

  return (
    <div className={`w-full max-w-sm mx-auto rounded-2xl border border-gray-700/50 bg-gradient-to-b ${resultLabel.bg} p-5 space-y-4`}>
      {/* Result header */}
      <div className="text-center">
        <div className={`text-4xl font-black ${resultLabel.color} ${isWin ? "animate-glow-gold inline-block px-4 py-1 rounded-xl" : ""}`}>
          {isWin && "👑 "}{resultLabel.text}
        </div>
      </div>

      {/* Answer reveal */}
      <div className="text-center text-sm">
        <span className="text-gray-500">정답 </span>
        <span className="text-white font-bold text-base">{question.answers[0]}</span>
      </div>

      {/* Stats */}
      <div className="bg-black/30 rounded-xl p-3 space-y-2 text-xs">
        {buzzTimeMs !== null && (
          <div className="flex justify-between">
            <span className="text-gray-500">내 버저</span>
            <span className="text-white font-mono">
              {(buzzTimeMs / 1000).toFixed(1)}s · {buzzCharIndex}글자
            </span>
          </div>
        )}
        {fastestCorrectGhost && (
          <div className="flex justify-between">
            <span className="text-gray-500">최고 고스트</span>
            <span className="text-gray-300 font-mono">
              {(fastestCorrectGhost.buzzTimeMs / 1000).toFixed(1)}s · {fastestCorrectGhost.userName}
            </span>
          </div>
        )}
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
