"use client";

import { useState, useRef, useEffect } from "react";

interface AnswerInputProps {
  onSubmit: (answer: string) => void;
  timeLeft: number;
}

export function AnswerInput({ onSubmit, timeLeft }: AnswerInputProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      onSubmit(value || "");
    }
  }, [timeLeft, onSubmit, value]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value);
    }
  };

  const seconds = Math.ceil(timeLeft / 1000);
  const urgency = seconds <= 2;

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-3">
      <div className={`text-center text-2xl font-mono font-bold ${urgency ? "text-red-400 animate-pulse" : "text-yellow-300"}`}>
        {seconds}초
      </div>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="정답을 입력하세요"
          className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white text-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          제출
        </button>
      </div>
    </form>
  );
}
