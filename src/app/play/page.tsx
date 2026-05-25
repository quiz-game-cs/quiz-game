"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, Suspense } from "react";
import { useGame } from "@/hooks/use-game";
import { BuzzerButton } from "@/components/buzzer-button";
import { AnswerInput } from "@/components/answer-input";
import { GhostPanel } from "@/components/ghost-panel";
import { ResultPanel } from "@/components/result-panel";
import { FinalResult } from "@/components/final-result";
import type { Question } from "@/lib/types";

function PlayContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rounds = Number(searchParams.get("rounds") ?? "1");

  const { state, startGame, buzz, submitAnswer, skipRound, startRound, setState } =
    useGame(rounds);

  const questionsRef = useRef<Question[]>([]);
  const [showFinal, setShowFinal] = useState(false);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    startGame().then((qs) => {
      questionsRef.current = qs;
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && state.phase === "revealing") {
        e.preventDefault();
        buzz();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state.phase, buzz]);

  const handleNext = useCallback(() => {
    if (state.isGameOver) {
      if (rounds > 1) {
        setShowFinal(true);
      } else {
        router.push("/");
      }
      return;
    }
    const nextIdx = state.currentRound;
    const nextQ = questionsRef.current[nextIdx];
    if (nextQ) {
      setState((prev) => ({ ...prev, currentRound: prev.currentRound + 1 }));
      startRound(nextQ);
    }
  }, [state.isGameOver, state.currentRound, rounds, router, startRound, setState]);

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center bg-gray-950 text-white">
        <div className="text-xl text-gray-400 animate-pulse">문제를 불러오는 중...</div>
      </main>
    );
  }

  if (showFinal) {
    return (
      <main className="flex-1 flex items-center justify-center bg-gray-950 text-white p-6">
        <FinalResult
          roundResults={state.roundResults}
          totalScore={state.totalScore}
        />
      </main>
    );
  }

  if (state.phase === "idle" && !state.question) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center bg-gray-950 text-white gap-4">
        <div className="text-xl text-gray-400">문제가 없습니다</div>
        <p className="text-gray-500 text-sm">먼저 문제를 등록하거나 시드 데이터를 넣어주세요.</p>
        <button
          onClick={() => router.push("/")}
          className="mt-4 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition-colors cursor-pointer"
        >
          메인으로
        </button>
      </main>
    );
  }

  const revealedText = state.question?.text?.slice(0, state.revealedCount) ?? "";
  const cursorVisible = state.phase === "revealing";

  return (
    <main className="flex-1 flex flex-col bg-gray-950 text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <button
          onClick={() => router.push("/")}
          className="text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
        >
          ← 나가기
        </button>
        {rounds > 1 && (
          <div className="text-gray-400 text-sm">
            Q{state.currentRound} / {state.totalRounds}
          </div>
        )}
        {rounds > 1 && (
          <div className="text-gray-400 text-sm font-mono">{state.totalScore}점</div>
        )}
      </header>

      {/* Question */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 gap-8">
        <div className="w-full max-w-2xl min-h-[120px] flex items-center justify-center">
          <p className="text-2xl md:text-3xl font-bold text-center leading-relaxed">
            {revealedText}
            {cursorVisible && (
              <span className="inline-block w-[3px] h-8 bg-blue-400 ml-1 animate-pulse align-middle" />
            )}
          </p>
        </div>

        {/* Ghost Panel */}
        {state.ghosts.length > 0 && (
          <div className="w-full max-w-md">
            <GhostPanel ghosts={state.ghosts} />
          </div>
        )}

        {/* Buzzer / Answer Input / Result */}
        <div className="flex flex-col items-center gap-4">
          {state.phase === "revealing" && (
            <>
              <BuzzerButton onBuzz={buzz} disabled={false} />
              <p className="text-gray-500 text-sm">
                스페이스바 또는 버튼을 누르세요
              </p>
              <button
                onClick={skipRound}
                className="text-gray-600 hover:text-gray-400 text-xs transition-colors cursor-pointer"
              >
                패스
              </button>
            </>
          )}

          {state.phase === "buzzed" && (
            <AnswerInput
              onSubmit={submitAnswer}
              timeLeft={state.answerTimeLeft}
            />
          )}

          {state.phase === "result" && state.question && (
            <ResultPanel
              isCorrect={state.isCorrect}
              question={state.question}
              buzzTimeMs={state.buzzTimeMs}
              buzzCharIndex={state.buzzCharIndex}
              ghosts={state.ghosts}
              roundScore={state.roundScore}
              totalScore={state.totalScore}
              currentRound={state.currentRound}
              totalRounds={state.totalRounds}
              onNext={handleNext}
              isGameOver={state.isGameOver}
            />
          )}
        </div>
      </section>
    </main>
  );
}

export default function PlayPage() {
  return (
    <Suspense
      fallback={
        <main className="flex-1 flex items-center justify-center bg-gray-950 text-white">
          <div className="text-xl text-gray-400 animate-pulse">로딩 중...</div>
        </main>
      }
    >
      <PlayContent />
    </Suspense>
  );
}
