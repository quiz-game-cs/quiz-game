"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PlayRecord } from "@/lib/types";
import { checkAnswer, normalizeAnswer } from "@/lib/normalize";

const CHAR_INTERVAL_MS = 120;
const CHAR_INTERVAL_FAST_MS = 30; // 내가 답한 후 후루룩 reveal
const ANSWER_TIME_LIMIT_MS = 5000;
const AUTO_PASS_DELAY_MS = 5000;
const OPP_BUZZ_PAUSE_MS = 1500; // 상대 buzz 시 멈춤 시간
const OPP_BUZZ_FLASH_MS = 500; // 후루룩 중 상대 buzz 플래시
const RESULT_AUTO_ADVANCE_MS = 2200;
const TARGET_SCORE = 10;

export type OpponentRecord = {
  buzzTimeMs: number | null;
  buzzCharIndex: number | null;
  answerTimeMs: number | null;
  isCorrect: boolean;
  normalizedAnswer: string | null;
};

export type RoundData = {
  question: {
    id: string;
    text: string;
    answers: string[];
    categoryId: string | null;
    difficulty: number | null;
  };
  opponentRecord: OpponentRecord;
};

export type GhostBattlePhase =
  | "idle"
  | "revealing"
  | "opp-buzz-pause" // 상대가 먼저 부저 — 멈춰서 표시
  | "awaiting-buzz" // reveal 끝, 자동 패스 카운트다운
  | "buzzed"
  | "fast-reveal" // 내가 답한 후 후루룩
  | "result";

export type RoundResult = {
  question: RoundData["question"];
  me: {
    buzzTimeMs: number | null;
    buzzCharIndex: number | null;
    answerTimeMs: number | null;
    isCorrect: boolean;
    answer: string;
  };
  opponent: OpponentRecord;
  myPoints: number;
  oppPoints: number;
  myScoreAfter: number;
  oppScoreAfter: number;
};

type SessionUser = { id: string; nickname: string } | null;

type State = {
  phase: GhostBattlePhase;
  roundIdx: number;
  revealedCount: number;
  buzzTimeMs: number | null;
  buzzCharIndex: number | null;
  answerTimeLeft: number;
  autoPassTimeLeft: number;
  oppBuzzFlashAtIdx: number | null; // 후루룩 중 상대 buzz 도달했을 때 강조 위치
  myScore: number;
  oppScore: number;
  lastResult: RoundResult | null;
  isOver: boolean;
};

function calcRoundPoints(
  me: { isCorrect: boolean; buzzTimeMs: number | null; answerTimeMs: number | null },
  opp: OpponentRecord
) {
  const meTotal =
    me.isCorrect && me.buzzTimeMs != null && me.answerTimeMs != null
      ? me.buzzTimeMs + me.answerTimeMs
      : Number.POSITIVE_INFINITY;
  const oppTotal =
    opp.isCorrect && opp.buzzTimeMs != null && opp.answerTimeMs != null
      ? opp.buzzTimeMs + opp.answerTimeMs
      : Number.POSITIVE_INFINITY;

  let myPoints = 0;
  let oppPoints = 0;
  if (me.isCorrect && opp.isCorrect) {
    if (meTotal <= oppTotal) {
      myPoints = 2;
      oppPoints = 1;
    } else {
      myPoints = 1;
      oppPoints = 2;
    }
  } else if (me.isCorrect) {
    myPoints = 2;
  } else if (opp.isCorrect) {
    oppPoints = 2;
  }
  return { myPoints, oppPoints };
}

export function useGhostBattle(rounds: RoundData[], currentUser: SessionUser) {
  const [state, setState] = useState<State>({
    phase: "idle",
    roundIdx: 0,
    revealedCount: 0,
    buzzTimeMs: null,
    buzzCharIndex: null,
    answerTimeLeft: ANSWER_TIME_LIMIT_MS,
    autoPassTimeLeft: AUTO_PASS_DELAY_MS,
    oppBuzzFlashAtIdx: null,
    myScore: 0,
    oppScore: 0,
    lastResult: null,
    isOver: false,
  });

  const sessionUserRef = useRef<SessionUser>(currentUser);
  useEffect(() => {
    if (sessionUserRef.current == null && currentUser != null) {
      sessionUserRef.current = currentUser;
    }
  }, [currentUser]);

  const revealTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const answerTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoPassTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const oppBuzzPauseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const oppBuzzFlashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resultAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startTimeRef = useRef<number>(0);
  const buzzTimeRef = useRef<number>(0);
  const pausedAtRef = useRef<number | null>(null);
  const fullRevealAtRef = useRef<number>(0);

  const clearTimers = useCallback(() => {
    if (revealTimer.current) clearInterval(revealTimer.current);
    if (answerTimer.current) clearInterval(answerTimer.current);
    if (autoPassTimer.current) clearInterval(autoPassTimer.current);
    if (oppBuzzPauseTimer.current) clearTimeout(oppBuzzPauseTimer.current);
    if (oppBuzzFlashTimer.current) clearTimeout(oppBuzzFlashTimer.current);
    if (resultAdvanceTimer.current) clearTimeout(resultAdvanceTimer.current);
    revealTimer.current = null;
    answerTimer.current = null;
    autoPassTimer.current = null;
    oppBuzzPauseTimer.current = null;
    oppBuzzFlashTimer.current = null;
    resultAdvanceTimer.current = null;
  }, []);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  const saveRecord = useCallback(
    async (
      questionId: string,
      partial: Omit<PlayRecord, "userId" | "userName" | "questionId">
    ) => {
      const user = sessionUserRef.current;
      const record: PlayRecord = {
        questionId,
        ...partial,
        userId: user?.id ?? null,
        userName: user?.nickname ?? "익명",
      };
      try {
        await fetch("/api/play-records", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(record),
        });
      } catch (err) {
        console.error("play-records 저장 실패:", err);
      }
    },
    []
  );

  // skipRound ref — autoPass timer 에서 호출용
  const skipRoundRef = useRef<() => void>(() => {});

  const startAutoPassCountdown = useCallback(() => {
    if (autoPassTimer.current) clearInterval(autoPassTimer.current);
    fullRevealAtRef.current = Date.now();
    autoPassTimer.current = setInterval(() => {
      const left = Math.max(
        0,
        AUTO_PASS_DELAY_MS - (Date.now() - fullRevealAtRef.current)
      );
      setState((prev) => {
        if (prev.phase !== "awaiting-buzz") {
          if (autoPassTimer.current) clearInterval(autoPassTimer.current);
          autoPassTimer.current = null;
          return prev;
        }
        return { ...prev, autoPassTimeLeft: left };
      });
      if (left <= 0) {
        if (autoPassTimer.current) clearInterval(autoPassTimer.current);
        autoPassTimer.current = null;
        skipRoundRef.current();
      }
    }, 50);
  }, []);

  // Reveal loop helper. Reads the active round directly so it isn't stale.
  const startRevealLoop = useCallback(
    (round: RoundData, intervalMs: number, onComplete: () => void) => {
      if (revealTimer.current) clearInterval(revealTimer.current);
      revealTimer.current = setInterval(() => {
        setState((prev) => {
          if (
            prev.phase !== "revealing" &&
            prev.phase !== "fast-reveal"
          ) {
            // 멈춤(opp-buzz-pause) 또는 다른 phase → reveal 끔
            if (revealTimer.current) clearInterval(revealTimer.current);
            revealTimer.current = null;
            return prev;
          }
          const nextCount = prev.revealedCount + 1;
          const totalLen = round.question.text.length;

          // 상대 buzz 시점 도달 (revealing phase에서만 — fast-reveal에선 별도 처리)
          if (
            prev.phase === "revealing" &&
            round.opponentRecord.buzzCharIndex != null &&
            nextCount === round.opponentRecord.buzzCharIndex
          ) {
            if (revealTimer.current) clearInterval(revealTimer.current);
            revealTimer.current = null;
            pausedAtRef.current = Date.now();
            // OPP_BUZZ_PAUSE_MS 후에 reveal 재개
            oppBuzzPauseTimer.current = setTimeout(() => {
              if (pausedAtRef.current != null) {
                startTimeRef.current += Date.now() - pausedAtRef.current;
                pausedAtRef.current = null;
              }
              setState((s) => ({ ...s, phase: "revealing" }));
              startRevealLoop(round, CHAR_INTERVAL_MS, onComplete);
            }, OPP_BUZZ_PAUSE_MS);
            return {
              ...prev,
              revealedCount: nextCount,
              phase: "opp-buzz-pause",
            };
          }

          // fast-reveal 중 상대 buzz 시점 도달 → 플래시 (멈춤 X)
          if (
            prev.phase === "fast-reveal" &&
            round.opponentRecord.buzzCharIndex != null &&
            nextCount === round.opponentRecord.buzzCharIndex
          ) {
            if (oppBuzzFlashTimer.current) clearTimeout(oppBuzzFlashTimer.current);
            oppBuzzFlashTimer.current = setTimeout(() => {
              setState((s) => ({ ...s, oppBuzzFlashAtIdx: null }));
            }, OPP_BUZZ_FLASH_MS);
            return {
              ...prev,
              revealedCount: nextCount,
              oppBuzzFlashAtIdx: nextCount,
            };
          }

          if (nextCount >= totalLen) {
            if (revealTimer.current) clearInterval(revealTimer.current);
            revealTimer.current = null;
            // reveal 끝 — onComplete 호출은 다음 tick에서
            setTimeout(onComplete, 0);
          }
          return { ...prev, revealedCount: nextCount };
        });
      }, intervalMs);
    },
    []
  );

  const finalizeRound = useCallback(
    async (
      meResult: {
        buzzTimeMs: number | null;
        buzzCharIndex: number | null;
        answerTimeMs: number | null;
        isCorrect: boolean;
        answer: string;
        normalizedAnswer: string;
      },
      round: RoundData
    ) => {
      const { myPoints, oppPoints } = calcRoundPoints(meResult, round.opponentRecord);

      // 저장
      await saveRecord(round.question.id, {
        buzzTimeMs: meResult.buzzTimeMs,
        buzzCharIndex: meResult.buzzCharIndex,
        answerTimeMs: meResult.answerTimeMs,
        isCorrect: meResult.isCorrect,
        normalizedAnswer: meResult.normalizedAnswer,
      });

      setState((prev) => {
        const myScoreAfter = prev.myScore + myPoints;
        const oppScoreAfter = prev.oppScore + oppPoints;
        const isLastRound = prev.roundIdx >= rounds.length - 1;
        const scoreReached =
          myScoreAfter >= TARGET_SCORE || oppScoreAfter >= TARGET_SCORE;
        const overNow = isLastRound || scoreReached;

        const result: RoundResult = {
          question: round.question,
          me: {
            buzzTimeMs: meResult.buzzTimeMs,
            buzzCharIndex: meResult.buzzCharIndex,
            answerTimeMs: meResult.answerTimeMs,
            isCorrect: meResult.isCorrect,
            answer: meResult.answer,
          },
          opponent: round.opponentRecord,
          myPoints,
          oppPoints,
          myScoreAfter,
          oppScoreAfter,
        };

        // 결과 표시 후 자동 진행
        if (resultAdvanceTimer.current) clearTimeout(resultAdvanceTimer.current);
        resultAdvanceTimer.current = setTimeout(() => {
          if (overNow) {
            setState((s) => ({ ...s, isOver: true }));
          } else {
            setState((s) => ({
              ...s,
              roundIdx: s.roundIdx + 1,
              phase: "idle",
              revealedCount: 0,
              buzzTimeMs: null,
              buzzCharIndex: null,
              answerTimeLeft: ANSWER_TIME_LIMIT_MS,
              autoPassTimeLeft: AUTO_PASS_DELAY_MS,
              oppBuzzFlashAtIdx: null,
              lastResult: null,
            }));
          }
        }, RESULT_AUTO_ADVANCE_MS);

        return {
          ...prev,
          phase: "result",
          myScore: myScoreAfter,
          oppScore: oppScoreAfter,
          lastResult: result,
        };
      });
    },
    [rounds.length, saveRecord]
  );

  const startRound = useCallback(() => {
    setState((prev) => {
      if (prev.phase !== "idle") return prev;
      const round = rounds[prev.roundIdx];
      if (!round) return prev;
      clearTimers();
      pausedAtRef.current = null;
      startTimeRef.current = Date.now();

      // reveal 시작
      startRevealLoop(round, CHAR_INTERVAL_MS, () => {
        setState((s) => {
          if (s.phase !== "revealing") return s;
          fullRevealAtRef.current = Date.now();
          startAutoPassCountdown();
          return { ...s, phase: "awaiting-buzz", autoPassTimeLeft: AUTO_PASS_DELAY_MS };
        });
      });

      return {
        ...prev,
        phase: "revealing",
        revealedCount: 0,
        buzzTimeMs: null,
        buzzCharIndex: null,
        answerTimeLeft: ANSWER_TIME_LIMIT_MS,
        autoPassTimeLeft: AUTO_PASS_DELAY_MS,
        oppBuzzFlashAtIdx: null,
      };
    });
  }, [clearTimers, rounds, startAutoPassCountdown, startRevealLoop]);

  const buzz = useCallback(() => {
    setState((prev) => {
      if (
        prev.phase !== "revealing" &&
        prev.phase !== "awaiting-buzz" &&
        prev.phase !== "opp-buzz-pause"
      ) {
        return prev;
      }
      // 멈춤 중에도 부저 가능 — 단 buzz_time은 멈춤 끝났을 때 기준 (startTime이 멈춤 끝나면 조정됨)
      // 일단 멈춤 중엔 부저 무시 (간단함)
      if (prev.phase === "opp-buzz-pause") return prev;

      if (revealTimer.current) clearInterval(revealTimer.current);
      if (autoPassTimer.current) clearInterval(autoPassTimer.current);

      const now = Date.now();
      const buzzMs = now - startTimeRef.current;
      buzzTimeRef.current = now;

      // 답 입력 시간 측정 시작
      if (answerTimer.current) clearInterval(answerTimer.current);
      answerTimer.current = setInterval(() => {
        setState((s) => {
          const left = Math.max(
            0,
            ANSWER_TIME_LIMIT_MS - (Date.now() - buzzTimeRef.current)
          );
          if (left <= 0 && answerTimer.current) clearInterval(answerTimer.current);
          return { ...s, answerTimeLeft: left };
        });
      }, 50);

      return {
        ...prev,
        phase: "buzzed",
        buzzTimeMs: buzzMs,
        buzzCharIndex: prev.revealedCount,
        answerTimeLeft: ANSWER_TIME_LIMIT_MS,
      };
    });
  }, []);

  const startFastRevealThenResult = useCallback(
    (round: RoundData, meResult: Parameters<typeof finalizeRound>[0]) => {
      const totalLen = round.question.text.length;
      setState((prev) => ({ ...prev, phase: "fast-reveal" }));
      if (revealTimer.current) clearInterval(revealTimer.current);

      // 이미 reveal이 끝까지 갔다면 바로 finalize
      // (안 끝났으면 fast-reveal 진행 후 finalize)
      const onDone = () => {
        finalizeRound(meResult, round);
      };

      // 현재 revealedCount 보고 결정
      setState((prev) => {
        if (prev.revealedCount >= totalLen) {
          setTimeout(onDone, 200);
          return prev;
        }
        startRevealLoop(round, CHAR_INTERVAL_FAST_MS, onDone);
        return prev;
      });
    },
    [finalizeRound, startRevealLoop]
  );

  const submitAnswer = useCallback(
    (answer: string) => {
      setState((prev) => {
        if (prev.phase !== "buzzed") return prev;
        if (answerTimer.current) clearInterval(answerTimer.current);

        const round = rounds[prev.roundIdx];
        if (!round) return prev;

        const answerMs = Date.now() - buzzTimeRef.current;
        const correct = checkAnswer(answer, round.question.answers);
        const meResult = {
          buzzTimeMs: prev.buzzTimeMs,
          buzzCharIndex: prev.buzzCharIndex,
          answerTimeMs: answerMs,
          isCorrect: correct,
          answer,
          normalizedAnswer: normalizeAnswer(answer),
        };

        // 답 제출 후 후루룩 reveal → finalize
        setTimeout(() => startFastRevealThenResult(round, meResult), 0);
        return { ...prev, phase: "fast-reveal" };
      });
    },
    [rounds, startFastRevealThenResult]
  );

  const skipRound = useCallback(() => {
    setState((prev) => {
      if (
        prev.phase !== "revealing" &&
        prev.phase !== "awaiting-buzz" &&
        prev.phase !== "opp-buzz-pause"
      ) {
        return prev;
      }
      const round = rounds[prev.roundIdx];
      if (!round) return prev;

      clearTimers();
      const meResult = {
        buzzTimeMs: null,
        buzzCharIndex: null,
        answerTimeMs: null,
        isCorrect: false,
        answer: "",
        normalizedAnswer: "",
      };
      setTimeout(() => finalizeRound(meResult, round), 0);
      return { ...prev, phase: "result" };
    });
  }, [clearTimers, rounds, finalizeRound]);

  useEffect(() => {
    skipRoundRef.current = skipRound;
  });

  // roundIdx 변경 + phase=idle → 자동으로 다음 라운드 시작
  useEffect(() => {
    if (state.phase === "idle" && state.roundIdx < rounds.length && !state.isOver) {
      const t = setTimeout(() => startRound(), 0);
      return () => clearTimeout(t);
    }
  }, [state.phase, state.roundIdx, rounds.length, state.isOver, startRound]);

  return {
    state,
    rounds,
    buzz,
    submitAnswer,
    skipRound,
  };
}
