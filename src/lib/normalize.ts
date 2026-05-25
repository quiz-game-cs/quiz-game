export function normalizeAnswer(input: string): string {
  return input.trim().replace(/\s+/g, "").toLowerCase();
}

export function checkAnswer(input: string, validAnswers: string[]): boolean {
  const normalized = normalizeAnswer(input);
  return validAnswers.some((ans) => normalizeAnswer(ans) === normalized);
}
