"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { Question, Ghost, GhostState, GamePhase, PlayRecord } from "@/lib/types";
import { checkAnswer, normalizeAnswer } from "@/lib/normalize";
import { calculateRoundScore } from "@/lib/scoring";

const CHAR_INTERVAL_MS = 120;
const ANSWER_TIME_LIMIT_MS = 10000;
const GHOST_BUZZ_DELAY_MS = 1500;
const GHOST_RESULT_DELAY_MS = 1000;

interface GameState {
  phase: GamePhase;
  question: Question | null;
  revealedCount: number;
  ghosts: GhostState[];
  activeGhostIdx: number | null;
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
    activeGhostIdx: null,
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
  const ghostPhaseTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const startTimeRef = useRef<number>(0);
  const buzzTimeRef = useRef<number>(0);
  const ghostBuzzQueue = useRef<{ idx: number; charIndex: number }[]>([]);
  const processedGhostChars = useRef<Set<string>>(new Set());

  const clearAllTimers = useCallback(() => {
    if (revealTimer.current) clearInterval(revealTimer.current);
    if (answerTimer.current) clearInterval(answerTimer.current);
    if (ghostPhaseTimer.current) clearTimeout(ghostPhaseTimer.current);
    revealTimer.current = null;
    answerTimer.current = null;
    ghostPhaseTimer.current = null;
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

  // Stable ref to a function that starts/resumes character reveal with ghost interrupt support.
  // We use a ref to break the circular dependency between startRevealing and itself (via setTimeout callbacks).
  const startRevealingRef = useRef<() => void>(() => {});

  const startRevealingImpl = () => {
    setState((prev) => {
      if (prev.phase === "ghost-buzzing") {
        return { ...prev, phase: "revealing", activeGhostIdx: null };
      }
      return prev;
    });

    revealTimer.current = setInterval(() => {
      setState((prev) => {
        if (prev.phase !== "revealing") return prev;
        const next = prev.revealedCount + 1;

        const matchingGhost = ghostBuzzQueue.current.find((g) => {
          const key = `${g.idx}-${g.charIndex}`;
          return g.charIndex === next && !processedGhostChars.current.has(key);
        });

        if (matchingGhost) {
          if (revealTimer.current) clearInterval(revealTimer.current);
          revealTimer.current = null;
          const key = `${matchingGhost.idx}-${matchingGhost.charIndex}`;
          processedGhostChars.current.add(key);

          const updated = [...prev.ghosts];
          updated[matchingGhost.idx] = { ...updated[matchingGhost.idx], status: "buzzed" };

          ghostPhaseTimer.current = setTimeout(() => {
            setState((s) => {
              const g = [...s.ghosts];
              g[matchingGhost.idx] = {
                ...g[matchingGhost.idx],
                status: g[matchingGhost.idx].isCorrect ? "correct" : "wrong",
              };
              return { ...s, ghosts: g };
            });

            ghostPhaseTimer.current = setTimeout(() => {
              startRevealingRef.current();
            }, GHOST_RESULT_DELAY_MS);
          }, GHOST_BUZZ_DELAY_MS);

          return {
            ...prev,
            revealedCount: next,
            phase: "ghost-buzzing",
            activeGhostIdx: matchingGhost.idx,
            ghosts: updated,
          };
        }

        if (next >= (prev.question?.text.length ?? 0)) {
          if (revealTimer.current) clearInterval(revealTimer.current);
          revealTimer.current = null;
        }
        return { ...prev, revealedCount: next };
      });
    }, CHAR_INTERVAL_MS);
  };

  useEffect(() => {
    startRevealingRef.current = startRevealingImpl;
  });

  const startRound = useCallback(
    async (question: Question) => {
      clearAllTimers();

      const ghosts = await loadGhosts(question.id);
      const ghostStates: GhostState[] = ghosts.map((g) => ({
        ...g,
        status: "waiting" as const,
      }));

      ghostBuzzQueue.current = ghosts
        .map((g, idx) => ({ idx, charIndex: g.buzzCharIndex }))
        .sort((a, b) => a.charIndex - b.charIndex);
      processedGhostChars.current = new Set();

      setState((prev) => ({
        ...prev,
        phase: "revealing",
        question,
        revealedCount: 0,
        ghosts: ghostStates,
        activeGhostIdx: null,
        buzzTimeMs: null,
        buzzCharIndex: null,
        answerTimeLeft: ANSWER_TIME_LIMIT_MS,
        isCorrect: null,
        roundScore: 0,
      }));

      startTimeRef.current = Date.now();

      revealTimer.current = setInterval(() => {
        setState((prev) => {
          if (prev.phase !== "revealing") return prev;
          const next = prev.revealedCount + 1;

          const matchingGhost = ghostBuzzQueue.current.find((g) => {
            const key = `${g.idx}-${g.charIndex}`;
            return g.charIndex === next && !processedGhostChars.current.has(key);
          });

          if (matchingGhost) {
            if (revealTimer.current) clearInterval(revealTimer.current);
            revealTimer.current = null;
            const key = `${matchingGhost.idx}-${matchingGhost.charIndex}`;
            processedGhostChars.current.add(key);

            const updated = [...prev.ghosts];
            updated[matchingGhost.idx] = { ...updated[matchingGhost.idx], status: "buzzed" };

            ghostPhaseTimer.current = setTimeout(() => {
              setState((s) => {
                const g = [...s.ghosts];
                g[matchingGhost.idx] = {
                  ...g[matchingGhost.idx],
                  status: g[matchingGhost.idx].isCorrect ? "correct" : "wrong",
                };
                return { ...s, ghosts: g };
              });

              ghostPhaseTimer.current = setTimeout(() => {
                startRevealingRef.current();
              }, GHOST_RESULT_DELAY_MS);
            }, GHOST_BUZZ_DELAY_MS);

            return {
              ...prev,
              revealedCount: next,
              phase: "ghost-buzzing",
              activeGhostIdx: matchingGhost.idx,
              ghosts: updated,
            };
          }

          if (next >= (prev.question?.text.length ?? 0)) {
            if (revealTimer.current) clearInterval(revealTimer.current);
            revealTimer.current = null;
          }
          return { ...prev, revealedCount: next };
        });
      }, CHAR_INTERVAL_MS);
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

      clearAllTimers();

      const now = Date.now();
      const buzzMs = now - startTimeRef.current;
      buzzTimeRef.current = now;

      answerTimer.current = setInterval(() => {
        setState((s) => {
          const left = Math.max(0, ANSWER_TIME_LIMIT_MS - (Date.now() - buzzTimeRef.current));
          if (left <= 0) {
            if (answerTimer.current) clearInterval(answerTimer.current);
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
        activeGhostIdx: null,
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

        const fastestCorrectGhost = prev.ghosts
          .filter((g) => g.isCorrect)
          .sort((a, b) => a.buzzCharIndex - b.buzzCharIndex)[0];

        const score = calculateRoundScore({
          isCorrect: correct,
          playerBuzzCharIndex: prev.buzzCharIndex,
          fastestCorrectGhostBuzzCharIndex: fastestCorrectGhost?.buzzCharIndex ?? null,
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

        const updatedGhosts = prev.ghosts.map((g) => {
          if (g.status === "waiting") {
            return { ...g, status: (g.isCorrect ? "correct" : "wrong") as GhostState["status"] };
          }
          return g;
        });

        return {
          ...prev,
          phase: "result",
          isCorrect: correct,
          roundScore: score,
          totalScore: prev.totalScore + score,
          roundResults: newResults,
          isGameOver: prev.currentRound >= prev.totalRounds,
          ghosts: updatedGhosts,
          activeGhostIdx: null,
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

      const updatedGhosts = prev.ghosts.map((g) => {
        if (g.status === "waiting") {
          return { ...g, status: (g.isCorrect ? "correct" : "wrong") as GhostState["status"] };
        }
        return g;
      });

      return {
        ...prev,
        phase: "result",
        isCorrect: null,
        roundScore: 0,
        roundResults: newResults,
        isGameOver: prev.currentRound >= prev.totalRounds,
        ghosts: updatedGhosts,
        activeGhostIdx: null,
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
