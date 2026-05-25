"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { Question, Ghost, GhostState, GamePhase, PlayRecord } from "@/lib/types";
import { checkAnswer, normalizeAnswer } from "@/lib/normalize";
import { calculateRoundScore } from "@/lib/scoring";

const CHAR_INTERVAL_MS = 120;
const ANSWER_TIME_LIMIT_MS = 5000;

interface GameState {
  phase: GamePhase;
  question: Question | null;
  revealedCount: number;
  ghosts: GhostState[];
  buzzTimeMs: number | null;
  buzzCharIndex: number | null;
  answerTimeLeft: number;
  isCorrect: boolean | null;
  roundScore: number;
  totalScore: number;
  currentRound: number;
  totalRounds: number;
  roundResults: Array<{ score: number; isCorrect: boolean | null; question: Question }>;
  isGameOver: boolean;
}

export function useGame(totalRounds: number = 1) {
  const [state, setState] = useState<GameState>({
    phase: "idle",
    question: null,
    revealedCount: 0,
    ghosts: [],
    buzzTimeMs: null,
    buzzCharIndex: null,
    answerTimeLeft: ANSWER_TIME_LIMIT_MS,
    isCorrect: null,
    roundScore: 0,
    totalScore: 0,
    currentRound: 0,
    totalRounds: totalRounds,
    roundResults: [],
    isGameOver: false,
  });

  const revealTimer = useRef<ReturnType<typeof setInterval>>(null);
  const answerTimer = useRef<ReturnType<typeof setInterval>>(null);
  const ghostTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const startTimeRef = useRef<number>(0);
  const buzzTimeRef = useRef<number>(0);

  const clearAllTimers = useCallback(() => {
    if (revealTimer.current) clearInterval(revealTimer.current);
    if (answerTimer.current) clearInterval(answerTimer.current);
    ghostTimers.current.forEach(clearTimeout);
    ghostTimers.current = [];
  }, []);

  useEffect(() => {
    return () => clearAllTimers();
  }, [clearAllTimers]);

  const loadQuestion = useCallback(async (count: number = 1): Promise<Question[]> => {
    const res = await fetch(`/api/questions/random?count=${count}`);
    if (!res.ok) return [];
    const data = await res.json();
    if (count === 1) {
      return data?.text ? [data] : [];
    }
    return Array.isArray(data) ? data.filter((q: Question) => q?.text) : [];
  }, []);

  const loadGhosts = useCallback(async (questionId: string): Promise<Ghost[]> => {
    const res = await fetch(`/api/questions/${questionId}/ghosts`);
    const data = await res.json();
    return data.ghosts ?? [];
  }, []);

  const saveRecord = useCallback(async (record: PlayRecord) => {
    await fetch("/api/play-records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
    });
  }, []);

  const startRound = useCallback(
    async (question: Question) => {
      clearAllTimers();

      const ghosts = await loadGhosts(question.id);
      const ghostStates: GhostState[] = ghosts.map((g) => ({
        ...g,
        status: "waiting" as const,
      }));

      setState((prev) => ({
        ...prev,
        phase: "revealing",
        question,
        revealedCount: 0,
        ghosts: ghostStates,
        buzzTimeMs: null,
        buzzCharIndex: null,
        answerTimeLeft: ANSWER_TIME_LIMIT_MS,
        isCorrect: null,
        roundScore: 0,
      }));

      startTimeRef.current = Date.now();

      revealTimer.current = setInterval(() => {
        setState((prev) => {
          const next = prev.revealedCount + 1;
          if (next >= (prev.question?.text.length ?? 0)) {
            if (revealTimer.current) clearInterval(revealTimer.current);
          }
          return { ...prev, revealedCount: next };
        });
      }, CHAR_INTERVAL_MS);

      ghostStates.forEach((ghost, idx) => {
        const timer = setTimeout(() => {
          setState((prev) => {
            const updated = [...prev.ghosts];
            updated[idx] = {
              ...updated[idx],
              status: updated[idx].isCorrect ? "correct" : "wrong",
            };
            return { ...prev, ghosts: updated };
          });
        }, ghost.buzzTimeMs);
        ghostTimers.current.push(timer);

        const buzzerVisual = setTimeout(() => {
          setState((prev) => {
            const updated = [...prev.ghosts];
            if (updated[idx].status === "waiting") {
              updated[idx] = { ...updated[idx], status: "buzzed" };
            }
            return { ...prev, ghosts: updated };
          });
        }, ghost.buzzTimeMs - 300);
        ghostTimers.current.push(buzzerVisual);
      });
    },
    [clearAllTimers, loadGhosts]
  );

  const startGame = useCallback(async (keepScore = false) => {
    const questionsData = await loadQuestion(totalRounds);
    setState((prev) => ({
      ...prev,
      totalScore: keepScore ? prev.totalScore : 0,
      currentRound: 1,
      roundResults: [],
      isGameOver: false,
    }));
    if (questionsData[0]) {
      await startRound(questionsData[0]);
    }
    return questionsData;
  }, [loadQuestion, totalRounds, startRound]);

  const buzz = useCallback(() => {
    setState((prev) => {
      if (prev.phase !== "revealing") return prev;

      if (revealTimer.current) clearInterval(revealTimer.current);

      const now = Date.now();
      const buzzMs = now - startTimeRef.current;
      buzzTimeRef.current = now;

      answerTimer.current = setInterval(() => {
        setState((s) => {
          const left = Math.max(0, ANSWER_TIME_LIMIT_MS - (Date.now() - buzzTimeRef.current));
          if (left <= 0) {
            if (answerTimer.current) clearInterval(answerTimer.current);
            return { ...s, answerTimeLeft: 0, phase: "answered", isCorrect: false };
          }
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

  const submitAnswer = useCallback(
    (answer: string) => {
      setState((prev) => {
        if (prev.phase !== "buzzed" || !prev.question) return prev;

        if (answerTimer.current) clearInterval(answerTimer.current);

        const answerMs = Date.now() - buzzTimeRef.current;
        const correct = checkAnswer(answer, prev.question.answers);

        const fastestCorrectGhost = prev.ghosts
          .filter((g) => g.isCorrect)
          .sort((a, b) => a.buzzTimeMs - b.buzzTimeMs)[0];

        const score = calculateRoundScore({
          isCorrect: correct,
          playerBuzzTimeMs: prev.buzzTimeMs,
          fastestCorrectGhostBuzzTimeMs: fastestCorrectGhost?.buzzTimeMs ?? null,
        });

        const newResults = [
          ...prev.roundResults,
          { score, isCorrect: correct, question: prev.question },
        ];

        saveRecord({
          questionId: prev.question.id,
          userName: "플레이어",
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
          roundScore: score,
          totalScore: prev.totalScore + score,
          roundResults: newResults,
          isGameOver: prev.currentRound >= prev.totalRounds,
        };
      });
    },
    [saveRecord]
  );

  const skipRound = useCallback(() => {
    setState((prev) => {
      if (prev.phase !== "revealing" || !prev.question) return prev;

      clearAllTimers();

      const newResults = [
        ...prev.roundResults,
        { score: 0, isCorrect: null, question: prev.question },
      ];

      saveRecord({
        questionId: prev.question.id,
        userName: "플레이어",
        buzzTimeMs: null,
        buzzCharIndex: null,
        answerTimeMs: null,
        isCorrect: false,
        normalizedAnswer: "",
      });

      return {
        ...prev,
        phase: "result",
        isCorrect: null,
        roundScore: 0,
        roundResults: newResults,
        isGameOver: prev.currentRound >= prev.totalRounds,
      };
    });
  }, [clearAllTimers, saveRecord]);

  return {
    state,
    startGame,
    buzz,
    submitAnswer,
    skipRound,
    startRound,
    setState,
  };
}
