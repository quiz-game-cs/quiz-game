"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, Suspense } from "react";
import { useGame } from "@/hooks/use-game";
import { BuzzerButton } from "@/components/buzzer-button";
import { AnswerInput } from "@/components/answer-input";
import { PlayerArena } from "@/components/player-arena";
import { ResultPanel } from "@/components/result-panel";
import { FinalResult } from "@/components/final-result";
import { calculateRanking } from "@/lib/ranking";
import type { Question, GhostState } from "@/lib/types";

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

  const loadNextSingle = useCallback(async () => {
    setLoading(true);
    const qs = await startGame(true);
    questionsRef.current = qs;
    setLoading(false);
  }, [startGame]);

  const handleNext = useCallback(() => {
    if (state.isGameOver) {
      if (rounds > 1) {
        setShowFinal(true);
      } else {
        loadNextSingle();
      }
      return;
    }
    const nextIdx = state.currentRound;
    const nextQ = questionsRef.current[nextIdx];
    if (nextQ) {
      setState((prev) => ({ ...prev, currentRound: prev.currentRound + 1 }));
      startRound(nextQ);
    }
  }, [state.isGameOver, state.currentRound, rounds, loadNextSingle, startRound, setState]);

  const handleContinue = useCallback(async () => {
    setShowFinal(false);
    setLoading(true);
    const qs = await startGame();
    questionsRef.current = qs;
    setLoading(false);
  }, [startGame]);

  const derivePlayerStatus = (): GhostState["status"] | "idle" => {
    if (state.phase === "result") {
      if (state.isCorrect === null) return "waiting";
      return state.isCorrect ? "correct" : "wrong";
    }
    if (state.phase === "buzzed" || state.phase === "answered") return "buzzed";
    return "waiting";
  };

  const ranking =
    state.phase === "result"
      ? calculateRanking(state.isCorrect, state.buzzCharIndex, state.ghosts)
      : null;

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
          onContinue={handleContinue}
          rounds={rounds}
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
  const isGhostBuzzing = state.phase === "ghost-buzzing";

  return (
    <main className="flex-1 flex flex-col bg-gray-950 text-white min-h-0">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-800/60">
        <button
          onClick={() => router.push("/")}
          className="text-gray-600 hover:text-gray-300 text-sm transition-colors cursor-pointer"
        >
          ← 나가기
        </button>
        {rounds > 1 && (
          <div className="bg-gray-800/60 px-3 py-1 rounded-full text-xs font-mono text-gray-400">
            Q{state.currentRound} / {state.totalRounds}
          </div>
        )}
        <div className="bg-gray-800/60 px-3 py-1 rounded-full text-xs font-mono text-blue-400 font-bold">
          {state.totalScore}점
        </div>
      </header>

      {/* Question area */}
      <section className="px-4 pt-5 pb-3">
        <div className="w-full max-w-2xl mx-auto min-h-[80px] flex items-center justify-center">
          <p className="text-xl md:text-2xl font-bold text-center leading-relaxed">
            {revealedText}
            {cursorVisible && (
              <span className="inline-block w-[3px] h-7 bg-blue-400 ml-1 animate-pulse align-middle" />
            )}
            {isGhostBuzzing && (
              <span className="inline-block w-[3px] h-7 bg-yellow-400 ml-1 align-middle" />
            )}
          </p>
        </div>
      </section>

      {/* Player Arena */}
      <section className="px-4 py-3">
        <PlayerArena
          ghosts={state.ghosts}
          playerBuzzCharIndex={state.buzzCharIndex}
          playerStatus={derivePlayerStatus()}
          playerScoreChange={state.phase === "result" ? state.roundScore : null}
          ranking={ranking}
          activeGhostIdx={state.activeGhostIdx}
        />
      </section>

      {/* Action area */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 pb-6 gap-4 min-h-0">
        {state.phase === "revealing" && (
          <div className="flex flex-col items-center gap-2">
            <BuzzerButton onBuzz={buzz} disabled={false} />
            <button
              onClick={skipRound}
              className="text-gray-600 hover:text-gray-400 text-xs transition-colors cursor-pointer mt-1"
            >
              패스
            </button>
          </div>
        )}

        {isGhostBuzzing && state.activeGhostIdx != null && (
          <div className="text-center space-y-2">
            <div className="text-yellow-300 font-black text-lg animate-pulse">
              🔔 {state.ghosts[state.activeGhostIdx]?.userName} 도전 중...
            </div>
            <div className="text-gray-500 text-xs">잠시 대기</div>
          </div>
        )}

        {(state.phase === "buzzed" || state.phase === "answered") && (
          <AnswerInput onSubmit={submitAnswer} timeLeft={state.answerTimeLeft} />
        )}

        {state.phase === "result" && state.question && (
          <ResultPanel
            isCorrect={state.isCorrect}
            question={state.question}
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
