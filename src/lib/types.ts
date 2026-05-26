export interface Category {
  id: string;
  name: string;
  displayOrder: number;
}

export interface Question {
  id: string;
  text: string;
  answers: string[];
  categoryId: string | null;
  categoryName?: string | null;
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

export type GamePhase = "idle" | "revealing" | "ghost-buzzing" | "buzzed" | "answered" | "result";

export interface PlayRecord {
  questionId: string;
  userName: string;
  buzzTimeMs: number | null;
  buzzCharIndex: number | null;
  answerTimeMs: number | null;
  isCorrect: boolean;
  normalizedAnswer: string;
}
