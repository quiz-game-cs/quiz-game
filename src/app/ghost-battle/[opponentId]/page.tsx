"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/use-current-user";
import { NicknameHeader } from "@/components/nickname-header";
import { BuzzerButton } from "@/components/buzzer-button";
import { AnswerInput } from "@/components/answer-input";
import { GhostBattleResult } from "@/components/ghost-battle-result";
import { AutoPassBar } from "@/components/auto-pass-bar";
import { useGhostBattle, type RoundData } from "@/hooks/use-ghost-battle";

type SetupResponse = {
  opponent: { id: string; nickname: string };
  rounds: RoundData[];
};

const AUTO_PASS_TOTAL_MS = 5000;

export default function GhostBattleMatchPage({
  params,
}: {
  params: Promise<{ opponentId: string }>;
}) {
  const { opponentId } = use(params);
  const router = useRouter();
  const { user, isLoading: userLoading } = useCurrentUser();
  const [setup, setSetup] = useState<SetupResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (userLoading) return;
    setLoading(true);
    setError(null);
    fetch(`/api/ghost-battle/setup?opponentId=${opponentId}&authorNickname=inseop`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setSetup(data);
        }
      })
      .catch((err) => {
        console.error(err);
        setError("매치 준비에 실패했습니다");
      })
      .finally(() => setLoading(false));
  }, [opponentId, userLoading, reloadKey]);

  const { state, rounds, buzz, submitAnswer, skipRound } = useGhostBattle(
    setup?.rounds ?? [],
    user ?? null
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === "Space" &&
        (state.phase === "revealing" || state.phase === "awaiting-buzz")
      ) {
        e.preventDefault();
        buzz();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state.phase, buzz]);

  const handleRematch = useCallback(() => {
    setSetup(null);
    setReloadKey((k) => k + 1);
  }, []);

  if (userLoading || loading) {
    return (
      <main className="flex-1 flex items-center justify-center bg-gray-950 text-white">
        <NicknameHeader />
        <div className="text-xl text-gray-400 animate-pulse">매치 준비 중...</div>
      </main>
    );
  }

  if (error || !setup) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center bg-gray-950 text-white gap-4">
        <NicknameHeader />
        <div className="text-xl text-gray-400">
          {error ?? "매치를 준비하지 못했습니다"}
        </div>
        <button
          onClick={() => router.push("/ghost-battle")}
          className="mt-4 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition-colors cursor-pointer"
        >
          상대 선택으로
        </button>
      </main>
    );
  }

  if (state.isOver) {
    return (
      <GhostBattleResult
        myNickname={user?.nickname ?? "나"}
        oppNickname={setup.opponent.nickname}
        myScore={state.myScore}
        oppScore={state.oppScore}
        onRematch={handleRematch}
      />
    );
  }

  const round = rounds[state.roundIdx];
  const totalLen = round?.question.text.length ?? 0;
  const revealedText = round?.question.text.slice(0, state.revealedCount) ?? "";
  const remainingText = round?.question.text.slice(state.revealedCount) ?? "";
  const cursorVisible = state.phase === "revealing";
  const inOppBuzzPause = state.phase === "opp-buzz-pause";
  const inFastReveal = state.phase === "fast-reveal";
  const showAutoPass = state.phase === "awaiting-buzz";
  const showResult = state.phase === "result" && state.lastResult;
  const inputPhase = state.phase === "buzzed";

  const oppBuzzIdx = round?.opponentRecord.buzzCharIndex ?? null;
  const oppCorrect = round?.opponentRecord.isCorrect ?? false;

  return (
    <main className="flex-1 flex flex-col bg-gray-950 text-white min-h-0">
      <NicknameHeader />

      {/* Score header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-800/60">
        <button
          onClick={() => router.push("/ghost-battle")}
          className="text-gray-600 hover:text-gray-300 text-sm transition-colors cursor-pointer"
        >
          ← 나가기
        </button>
        <div className="text-xs font-mono text-gray-400">
          R{state.roundIdx + 1} / {rounds.length}
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-blue-400 font-mono font-bold">{state.myScore}</span>
          <span className="text-gray-600">:</span>
          <span className="text-purple-400 font-mono font-bold">{state.oppScore}</span>
        </div>
      </header>

      {/* Player banner */}
      <section className="flex items-center justify-between px-6 py-3 bg-gray-900/40">
        <div className="text-blue-400 font-bold truncate">
          🙂 {user?.nickname ?? "나"}
        </div>
        <div className="text-gray-500 text-sm">vs</div>
        <div className="text-purple-400 font-bold truncate">
          👻 {setup.opponent.nickname}
        </div>
      </section>

      {/* Auto-pass bar */}
      <section className="px-4 pt-3">
        <div className="h-2.5">
          {showAutoPass && (
            <AutoPassBar
              timeLeftMs={state.autoPassTimeLeft}
              totalMs={AUTO_PASS_TOTAL_MS}
            />
          )}
        </div>
      </section>

      {/* Question */}
      <section className="px-4 pt-4 pb-3">
        <div className="w-full max-w-2xl mx-auto min-h-[80px] flex items-center justify-center">
          <p className="text-xl md:text-2xl font-bold text-center leading-relaxed">
            {revealedText.split("").map((ch, i) => {
              const idx = i + 1;
              const isOppBuzzFlash = state.oppBuzzFlashAtIdx === idx;
              const isOppBuzzPoint = inOppBuzzPause && oppBuzzIdx === idx;
              return (
                <span
                  key={i}
                  className={
                    isOppBuzzFlash || isOppBuzzPoint
                      ? "text-yellow-300 animate-pulse"
                      : ""
                  }
                >
                  {ch}
                </span>
              );
            })}
            {cursorVisible && (
              <span className="inline-block w-[3px] h-7 bg-blue-400 ml-1 animate-pulse align-middle" />
            )}
            {inFastReveal && state.revealedCount < totalLen && (
              <span className="text-gray-600">{remainingText}</span>
            )}
          </p>
        </div>

        {/* Opponent buzz callout */}
        {inOppBuzzPause && (
          <div className="text-center mt-3">
            <div className="text-yellow-300 font-black text-lg animate-pulse">
              👻 상대 버저! {oppCorrect ? "✅" : "❌"}
            </div>
          </div>
        )}
        {state.oppBuzzFlashAtIdx != null && (
          <div className="text-center mt-3">
            <div className="text-yellow-300 font-bold text-sm">
              👻 상대 {state.oppBuzzFlashAtIdx}자에서 부저 {oppCorrect ? "✅" : "❌"}
            </div>
          </div>
        )}
      </section>

      {/* Action area */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 pb-6 gap-4 min-h-0">
        {(state.phase === "revealing" || state.phase === "awaiting-buzz") && (
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

        {inputPhase && (
          <AnswerInput onSubmit={submitAnswer} timeLeft={state.answerTimeLeft} />
        )}

        {showResult && state.lastResult && (
          <RoundResultPanel result={state.lastResult} />
        )}
      </section>
    </main>
  );
}

function RoundResultPanel({
  result,
}: {
  result: NonNullable<ReturnType<typeof useGhostBattle>["state"]["lastResult"]>;
}) {
  const fmt = (ms: number | null) =>
    ms == null ? "-" : `${(ms / 1000).toFixed(2)}초`;
  const totalMs = (b: number | null, a: number | null) =>
    b == null || a == null ? null : b + a;

  return (
    <div className="w-full max-w-md mx-auto rounded-2xl bg-gray-900 border border-gray-800 p-4 space-y-3">
      <div className="text-center">
        <div className="text-xs text-gray-500 mb-1">정답</div>
        <div className="text-white font-bold">{result.question.answers[0]}</div>
      </div>

      <div className="border-t border-gray-800" />

      <Row
        label="나"
        accent="text-blue-400"
        isCorrect={result.me.isCorrect}
        buzz={result.me.buzzTimeMs}
        ans={result.me.answerTimeMs}
        total={totalMs(result.me.buzzTimeMs, result.me.answerTimeMs)}
        points={result.myPoints}
        formatter={fmt}
        answer={result.me.answer}
      />
      <Row
        label="상대"
        accent="text-purple-400"
        isCorrect={result.opponent.isCorrect}
        buzz={result.opponent.buzzTimeMs}
        ans={result.opponent.answerTimeMs}
        total={totalMs(result.opponent.buzzTimeMs, result.opponent.answerTimeMs)}
        points={result.oppPoints}
        formatter={fmt}
        answer={null}
      />

      <div className="border-t border-gray-800" />

      <div className="flex justify-between text-sm font-mono">
        <span className="text-blue-400">스코어 {result.myScoreAfter}</span>
        <span className="text-purple-400">: {result.oppScoreAfter}</span>
      </div>
    </div>
  );
}

function Row({
  label,
  accent,
  isCorrect,
  buzz,
  ans,
  total,
  points,
  formatter,
  answer,
}: {
  label: string;
  accent: string;
  isCorrect: boolean;
  buzz: number | null;
  ans: number | null;
  total: number | null;
  points: number;
  formatter: (ms: number | null) => string;
  answer: string | null;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex flex-col">
        <span className={`font-bold ${accent}`}>
          {label} {isCorrect ? "✅" : "❌"}
          {points > 0 && <span className="ml-1 text-yellow-300">+{points}</span>}
        </span>
        {answer != null && (
          <span className="text-gray-500 text-xs truncate max-w-[140px]">
            "{answer || "(빈 답)"}"
          </span>
        )}
      </div>
      <div className="text-right text-gray-400 font-mono text-xs">
        {formatter(buzz)} + {formatter(ans)}
        <br />
        <span className="text-gray-500">= {formatter(total)}</span>
      </div>
    </div>
  );
}
