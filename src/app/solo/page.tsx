"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSoloGame } from "@/hooks/use-solo-game";
import { useCurrentUser } from "@/hooks/use-current-user";
import { NicknameHeader } from "@/components/nickname-header";
import { BuzzerButton } from "@/components/buzzer-button";
import { AnswerInput } from "@/components/answer-input";
import { SoloArena } from "@/components/solo-arena";
import type { GhostState } from "@/lib/types";

export default function SoloPage() {
  const router = useRouter();
  const { user, isLoading: userLoading } = useCurrentUser();

  const { state, startGame, buzz, submitAnswer, skipRound, nextQuestion } = useSoloGame(
    user ?? null
  );

  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  useEffect(() => {
    if (userLoading || initialized.current) return;
    initialized.current = true;
    startGame().then(() => setLoading(false));
  }, [userLoading, startGame]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && (state.phase === "revealing" || state.phase === "awaiting-buzz")) {
        e.preventDefault();
        buzz();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state.phase, buzz]);

  const handleNext = useCallback(async () => {
    setLoading(true);
    await nextQuestion();
    setLoading(false);
  }, [nextQuestion]);

  const derivePlayerStatus = (): GhostState["status"] | "idle" => {
    if (state.phase === "result") {
      return state.isCorrect ? "correct" : "wrong";
    }
    if (state.phase === "buzzed" || state.phase === "answered") return "buzzed";
    return "waiting";
  };

  if (userLoading || loading) {
    return (
      <main className="flex-1 flex items-center justify-center bg-gray-950 text-white">
        <NicknameHeader />
        <div className="text-xl text-gray-400 animate-pulse">문제를 불러오는 중...</div>
      </main>
    );
  }

  if (!state.question) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center bg-gray-950 text-white gap-4">
        <NicknameHeader />
        <div className="text-xl text-gray-400">문제가 없습니다</div>
        <button
          onClick={() => router.push("/")}
          className="mt-4 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition-colors cursor-pointer"
        >
          메인으로
        </button>
      </main>
    );
  }

  const revealedText = state.question.text.slice(0, state.revealedCount);
  const cursorVisible = state.phase === "revealing";
  const showAutoPassCountdown = state.phase === "awaiting-buzz";
  const autoPassSeconds = Math.ceil(state.autoPassTimeLeft / 1000);
  const playerName = user?.nickname ?? "나";
  const accuracy =
    state.totalPlayed > 0 ? Math.round((state.totalCorrect / state.totalPlayed) * 100) : null;

  return (
    <main className="flex-1 flex flex-col bg-gray-950 text-white min-h-0">
      <NicknameHeader />

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-800/60">
        <button
          onClick={() => router.push("/")}
          className="text-gray-600 hover:text-gray-300 text-sm transition-colors cursor-pointer"
        >
          ← 나가기
        </button>
        <div className="bg-gray-800/60 px-3 py-1 rounded-full text-xs font-mono text-gray-400">
          푼 문제 {state.totalPlayed}
          {accuracy != null && <span className="ml-2 text-blue-400">정답률 {accuracy}%</span>}
        </div>
      </header>

      {/* Question */}
      <section className="px-4 pt-5 pb-3">
        <div className="w-full max-w-2xl mx-auto min-h-[80px] flex items-center justify-center">
          <p className="text-xl md:text-2xl font-bold text-center leading-relaxed">
            {revealedText}
            {cursorVisible && (
              <span className="inline-block w-[3px] h-7 bg-blue-400 ml-1 animate-pulse align-middle" />
            )}
          </p>
        </div>
      </section>

      {/* Arena */}
      <section className="px-4 py-3">
        <SoloArena
          playerName={playerName}
          playerStatus={derivePlayerStatus()}
          playerBuzzCharIndex={state.buzzCharIndex}
          playerScoreChange={null}
        />
      </section>

      {/* Action */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 pb-6 gap-4 min-h-0">
        {(state.phase === "revealing" || state.phase === "awaiting-buzz") && (
          <div className="flex flex-col items-center gap-2">
            <BuzzerButton onBuzz={buzz} disabled={false} />
            {showAutoPassCountdown && (
              <div className="text-yellow-300 font-bold text-sm animate-pulse">
                {autoPassSeconds}초 안에 부저를 누르세요
              </div>
            )}
            <button
              onClick={skipRound}
              className="text-gray-600 hover:text-gray-400 text-xs transition-colors cursor-pointer mt-1"
            >
              패스
            </button>
          </div>
        )}

        {(state.phase === "buzzed" || state.phase === "answered") && (
          <AnswerInput onSubmit={submitAnswer} timeLeft={state.answerTimeLeft} />
        )}

        {state.phase === "result" && state.lastQuestion && (
          <div className="w-full max-w-md mx-auto flex flex-col items-center gap-4">
            <div className="text-center">
              <div className={`text-3xl font-black mb-2 ${state.lastIsCorrect ? "text-green-400" : "text-red-400"}`}>
                {state.lastIsCorrect ? "✅ 정답!" : "❌ 오답"}
              </div>
              <div className="text-gray-400 text-sm">정답</div>
              <div className="text-white text-lg font-bold">
                {state.lastQuestion.answers[0]}
              </div>
            </div>
            <button
              onClick={handleNext}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-black text-lg transition-colors cursor-pointer"
            >
              다음 문제
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
