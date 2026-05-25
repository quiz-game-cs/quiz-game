export interface Question {
  id: string;
  text: string;
  answers: string[];
  category: string | null;
  difficulty: number | null;
}

export interface Ghost {
  userName: string;
  buzzTimeMs: number;
  buzzCharIndex: number;
  isCorrect: boolean;
}

export type GhostStatus = "waiting" | "buzzed" | "correct" | "wrong";

export interface GhostState extends Ghost {
  status: GhostStatus;
}

export type GamePhase = "idle" | "revealing" | "buzzed" | "answered" | "result";

export interface PlayRecord {
  questionId: string;
  userName: string;
  buzzTimeMs: number | null;
  buzzCharIndex: number | null;
  answerTimeMs: number | null;
  isCorrect: boolean;
  normalizedAnswer: string;
}
