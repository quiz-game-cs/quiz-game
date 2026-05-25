"use client";

import Link from "next/link";
import type { Question } from "@/lib/types";

interface FinalResultProps {
  roundResults: Array<{ score: number; isCorrect: boolean | null; question: Question }>;
  totalScore: number;
  onContinue: () => void;
  rounds: number;
}

export function FinalResult({ roundResults, totalScore, onContinue, rounds }: FinalResultProps) {
  const correctCount = roundResults.filter((r) => r.isCorrect === true).length;

  return (
    <div className="max-w-lg mx-auto space-y-6 text-center">
      <h2 className="text-3xl font-black text-white">게임 종료!</h2>

      <div className="text-6xl font-black text-yellow-300">{totalScore}점</div>

      <div className="text-gray-400">
        {roundResults.length}문제 중 {correctCount}문제 정답
      </div>

      <div className="bg-gray-800/60 rounded-lg divide-y divide-gray-700">
        {roundResults.map((r, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3 text-sm">
            <div className="flex items-center gap-3">
              <span className="text-gray-500">Q{i + 1}</span>
              <span className="text-gray-300 truncate max-w-[200px]">
                {r.question.text}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span>
                {r.isCorrect === null ? "😶" : r.isCorrect ? "✅" : "❌"}
              </span>
              <span
                className={`font-mono font-bold ${r.score > 0 ? "text-green-400" : r.score < 0 ? "text-red-400" : "text-gray-500"}`}
              >
                {r.score > 0 ? "+" : ""}
                {r.score}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 justify-center pt-2">
        <Link
          href="/"
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition-colors"
        >
          메인으로
        </Link>
        <button
          onClick={onContinue}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-colors cursor-pointer"
        >
          {rounds}문제 더 풀기
        </button>
      </div>
    </div>
  );
}
