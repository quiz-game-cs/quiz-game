"use client";

import { useState, useRef, useEffect } from "react";

interface AnswerInputProps {
  onSubmit: (answer: string) => void;
  timeLeft: number;
}

const TOTAL_TIME = 5000;
const RADIUS = 28;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

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

  const progress = timeLeft / TOTAL_TIME;
  const dashOffset = CIRCUMFERENCE * (1 - progress);
  const seconds = Math.ceil(timeLeft / 1000);
  const strokeColor = progress > 0.4 ? "#facc15" : "#ef4444";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
      {/* Circular timer */}
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r={RADIUS} fill="none" stroke="#1f2937" strokeWidth="4" />
          <circle
            cx="32" cy="32" r={RADIUS} fill="none"
            stroke={strokeColor}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            className="transition-all duration-100"
          />
        </svg>
        <div className={`absolute inset-0 flex items-center justify-center text-2xl font-black font-mono
          ${seconds <= 2 ? "text-red-400 animate-pulse" : "text-yellow-300"}`}>
          {seconds}
        </div>
      </div>

      {/* Input */}
      <div className="flex gap-2 w-full max-w-sm">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="정답을 입력하세요"
          className="flex-1 px-4 py-3 bg-gray-800/80 border-2 border-gray-600 rounded-xl text-white text-lg
            focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/50
            placeholder:text-gray-600"
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className="px-5 py-3 bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-700 disabled:text-gray-500
            text-black font-black rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          GO
        </button>
      </div>
    </form>
  );
}
