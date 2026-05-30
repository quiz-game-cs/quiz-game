"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { Question, PlayRecord } from "@/lib/types";
import { checkAnswer, normalizeAnswer } from "@/lib/normalize";

const CHAR_INTERVAL_MS = 120;
const ANSWER_TIME_LIMIT_MS = 5000;
const AUTO_PASS_DELAY_MS = 5000;

export type SoloPhase = "idle" | "revealing" | "awaiting-buzz" | "buzzed" | "answered" | "result";

type SessionUser = { id: string; nickname: string } | null;

interface SoloState {
  phase: SoloPhase;
  question: Question | null;
  revealedCount: number;
  buzzTimeMs: number | null;
  buzzCharIndex: number | null;
  answerTimeLeft: number;
  autoPassTimeLeft: number;
  isCorrect: boolean | null;
  lastQuestion: Question | null;
  lastIsCorrect: boolean | null;
  totalPlayed: number;
  totalCorrect: number;
}

export function useSoloGame(currentUser: SessionUser) {
  const [state, setState] = useState<SoloState>({
    phase: "idle",
    question: null,
    revealedCount: 0,
    buzzTimeMs: null,
    buzzCharIndex: null,
    answerTimeLeft: ANSWER_TIME_LIMIT_MS,
    autoPassTimeLeft: AUTO_PASS_DELAY_MS,
    isCorrect: null,
    lastQuestion: null,
    lastIsCorrect: null,
    totalPlayed: 0,
    totalCorrect: 0,
  });

  // Session user snapshot — locked at first non-null value, ignores later changes.
  const sessionUserRef = useRef<SessionUser>(currentUser);
  useEffect(() => {
    if (sessionUserRef.current == null && currentUser != null) {
      sessionUserRef.current = currentUser;
    }
  }, [currentUser]);

  const revealTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const answerTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoPassTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const buzzTimeRef = useRef<number>(0);
  const fullRevealAtRef = useRef<number>(0);

  const clearAllTimers = useCallback(() => {
    if (revealTimer.current) clearInterval(revealTimer.current);
    if (answerTimer.current) clearInterval(answerTimer.current);
    if (autoPassTimer.current) clearInterval(autoPassTimer.current);
    revealTimer.current = null;
    answerTimer.current = null;
    autoPassTimer.current = null;
  }, []);

  useEffect(() => {
    return () => clearAllTimers();
  }, [clearAllTimers]);

  const loadQuestion = useCallback(async (): Promise<Question | null> => {
    const res = await fetch(`/api/questions/random?count=1&authorNickname=inseop`);
    if (!res.ok) return null;
    const data = await res.json();
    return data?.text ? data : null;
  }, []);

  const saveRecord = useCallback(async (partial: Omit<PlayRecord, "userId" | "userName">) => {
    const user = sessionUserRef.current;
    const record: PlayRecord = {
      ...partial,
      userId: user?.id ?? null,
      userName: user?.nickname ?? "익명",
    };
    await fetch("/api/play-records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
    });
  }, []);

  // skipRound을 setInterval 콜백에서 안전하게 호출하기 위한 ref
  const skipRoundRef = useRef<() => void>(() => {});

  const startAutoPassCountdown = useCallback(() => {
    if (autoPassTimer.current) clearInterval(autoPassTimer.current);
    fullRevealAtRef.current = Date.now();
    autoPassTimer.current = setInterval(() => {
      const left = Math.max(0, AUTO_PASS_DELAY_MS - (Date.now() - fullRevealAtRef.current));
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

  const startRound = useCallback(
    (question: Question) => {
      clearAllTimers();

      setState((prev) => ({
        ...prev,
        phase: "revealing",
        question,
        revealedCount: 0,
        buzzTimeMs: null,
        buzzCharIndex: null,
        answerTimeLeft: ANSWER_TIME_LIMIT_MS,
        autoPassTimeLeft: AUTO_PASS_DELAY_MS,
        isCorrect: null,
      }));

      startTimeRef.current = Date.now();

      revealTimer.current = setInterval(() => {
        setState((prev) => {
          if (prev.phase !== "revealing" || !prev.question) return prev;
          const next = prev.revealedCount + 1;
          if (next >= prev.question.text.length) {
            if (revealTimer.current) clearInterval(revealTimer.current);
            revealTimer.current = null;
            startAutoPassCountdown();
            return { ...prev, revealedCount: next, phase: "awaiting-buzz" };
          }
          return { ...prev, revealedCount: next };
        });
      }, CHAR_INTERVAL_MS);
    },
    [clearAllTimers, startAutoPassCountdown]
  );

  const startGame = useCallback(async () => {
    const q = await loadQuestion();
    if (q) startRound(q);
    return q;
  }, [loadQuestion, startRound]);

  const buzz = useCallback(() => {
    setState((prev) => {
      if (prev.phase !== "revealing" && prev.phase !== "awaiting-buzz") return prev;
      clearAllTimers();

      const now = Date.now();
      const buzzMs = now - startTimeRef.current;
      buzzTimeRef.current = now;

      answerTimer.current = setInterval(() => {
        setState((s) => {
          const left = Math.max(0, ANSWER_TIME_LIMIT_MS - (Date.now() - buzzTimeRef.current));
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
  }, [clearAllTimers]);

  const submitAnswer = useCallback(
    (answer: string) => {
      setState((prev) => {
        if ((prev.phase !== "buzzed" && prev.phase !== "answered") || !prev.question) return prev;

        if (answerTimer.current) clearInterval(answerTimer.current);

        const answerMs = Date.now() - buzzTimeRef.current;
        const correct = checkAnswer(answer, prev.question.answers);

        saveRecord({
          questionId: prev.question.id,
          buzzTimeMs: prev.buzzTimeMs,
          buzzCharIndex: prev.buzzCharIndex,
          answerTimeMs: answerMs,
          isCorrect: correct,
          normalizedAnswer: normalizeAnswer(answer),
        });

        return {
          ...prev,
          phase: "result",
          isCorrect: correct,
          lastQuestion: prev.question,
          lastIsCorrect: correct,
          totalPlayed: prev.totalPlayed + 1,
          totalCorrect: prev.totalCorrect + (correct ? 1 : 0),
        };
      });
    },
    [saveRecord]
  );

  const skipRound = useCallback(() => {
    setState((prev) => {
      if (prev.phase !== "revealing" && prev.phase !== "awaiting-buzz") return prev;
      clearAllTimers();
      if (!prev.question) return prev;

      saveRecord({
        questionId: prev.question.id,
        buzzTimeMs: null,
        buzzCharIndex: null,
        answerTimeMs: null,
        isCorrect: false,
        normalizedAnswer: "",
      });

      return {
        ...prev,
        phase: "result",
        isCorrect: false,
        lastQuestion: prev.question,
        lastIsCorrect: false,
        totalPlayed: prev.totalPlayed + 1,
      };
    });
  }, [clearAllTimers, saveRecord]);

  const nextQuestion = useCallback(async () => {
    const q = await loadQuestion();
    if (q) startRound(q);
  }, [loadQuestion, startRound]);

  // skipRound가 매 렌더 새로 생성되니, 자동 패스 콜백에서 항상 최신 버전 호출.
  useEffect(() => {
    skipRoundRef.current = skipRound;
  });

  return {
    state,
    startGame,
    buzz,
    submitAnswer,
    skipRound,
    nextQuestion,
  };
}
