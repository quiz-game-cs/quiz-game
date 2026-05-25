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

  const resultLabel =
    isCorrect === null
      ? { text: "미응답", color: "text-gray-400", emoji: "😶" }
      : isCorrect
        ? buzzTimeMs && fastestCorrectGhost && buzzTimeMs < fastestCorrectGhost.buzzTimeMs
          ? { text: "승리!", color: "text-yellow-300", emoji: "🏆" }
          : { text: "정답!", color: "text-green-400", emoji: "✅" }
        : { text: "오답", color: "text-red-400", emoji: "❌" };

  return (
    <div className="space-y-5 text-center">
      <div className={`text-4xl font-black ${resultLabel.color}`}>
        {resultLabel.emoji} {resultLabel.text}
      </div>

      <div className="text-gray-300">
        <span className="text-gray-500">정답:</span>{" "}
        <span className="text-white font-bold">{question.answers[0]}</span>
      </div>

      <div className="bg-gray-800/60 rounded-lg p-4 space-y-2 text-sm">
        {buzzTimeMs !== null && (
          <div className="flex justify-between">
            <span className="text-gray-400">내 버저 시점</span>
            <span className="text-white">
              {(buzzTimeMs / 1000).toFixed(1)}초 ({buzzCharIndex}글자)
            </span>
          </div>
        )}
        {fastestCorrectGhost && (
          <div className="flex justify-between">
            <span className="text-gray-400">최고 고스트</span>
            <span className="text-white">
              {(fastestCorrectGhost.buzzTimeMs / 1000).toFixed(1)}초 ({fastestCorrectGhost.buzzCharIndex}글자) — {fastestCorrectGhost.userName}
            </span>
          </div>
        )}
        <div className="flex justify-between border-t border-gray-700 pt-2 mt-2">
          <span className="text-gray-400">이번 점수</span>
          <span className={`font-bold ${roundScore > 0 ? "text-green-400" : roundScore < 0 ? "text-red-400" : "text-gray-400"}`}>
            {roundScore > 0 ? "+" : ""}{roundScore}
          </span>
        </div>
        {totalRounds > 1 && (
          <div className="flex justify-between">
            <span className="text-gray-400">누적 점수</span>
            <span className="text-white font-bold">{totalScore}</span>
          </div>
        )}
      </div>

      <button
        onClick={onNext}
        className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors cursor-pointer"
      >
        {isGameOver
          ? totalRounds > 1
            ? "최종 결과 보기"
            : "메인으로"
          : `다음 문제 (${currentRound}/${totalRounds})`}
      </button>
    </div>
  );
}
