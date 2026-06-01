"use client";

import Link from "next/link";

interface Props {
  myNickname: string;
  oppNickname: string;
  myScore: number;
  oppScore: number;
  onRematch: () => void;
}

export function GhostBattleResult({
  myNickname,
  oppNickname,
  myScore,
  oppScore,
  onRematch,
}: Props) {
  const verdict = myScore > oppScore ? "win" : myScore < oppScore ? "loss" : "draw";
  const headline =
    verdict === "win" ? "승리!" : verdict === "loss" ? "패배" : "무승부";
  const tone =
    verdict === "win"
      ? "from-yellow-300 via-yellow-400 to-amber-500"
      : verdict === "loss"
      ? "from-gray-300 via-gray-400 to-gray-500"
      : "from-blue-300 via-blue-400 to-blue-500";

  return (
    <main className="flex-1 flex flex-col items-center justify-center bg-gray-950 text-white px-4">
      <h1
        className={`text-6xl md:text-7xl font-black mb-8 bg-gradient-to-r ${tone} bg-clip-text text-transparent`}
      >
        {headline}
      </h1>

      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between text-lg">
          <div className="font-bold truncate">{myNickname}</div>
          <div className="font-black text-2xl text-blue-400">{myScore}</div>
        </div>
        <div className="my-3 border-t border-gray-800" />
        <div className="flex items-center justify-between text-lg">
          <div className="font-bold truncate">{oppNickname} 👻</div>
          <div className="font-black text-2xl text-purple-400">{oppScore}</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
        <button
          onClick={onRematch}
          className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-black transition-colors cursor-pointer"
        >
          다시 도전
        </button>
        <Link
          href="/ghost-battle"
          className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-black text-center transition-colors"
        >
          다른 상대
        </Link>
        <Link
          href="/"
          className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-black text-center transition-colors"
        >
          홈으로
        </Link>
      </div>
    </main>
  );
}
