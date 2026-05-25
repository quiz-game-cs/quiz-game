"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Question } from "@/lib/types";

export default function AdminQuestionsPage() {
  const [text, setText] = useState("");
  const [answers, setAnswers] = useState<string[]>([""]);
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState(1);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/questions/random?count=20")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setQuestions(data);
        else if (data && !data.error) setQuestions([data]);
      })
      .catch(() => {});
  }, []);

  const addAnswer = () => setAnswers((prev) => [...prev, ""]);
  const removeAnswer = (idx: number) =>
    setAnswers((prev) => prev.filter((_, i) => i !== idx));
  const updateAnswer = (idx: number, val: string) =>
    setAnswers((prev) => prev.map((a, i) => (i === idx ? val : a)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validAnswers = answers.filter((a) => a.trim());
    if (!text.trim() || validAnswers.length === 0) {
      setMessage("문제문과 최소 1개의 정답을 입력하세요.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim(),
          answers: validAnswers,
          category: category.trim() || null,
          difficulty,
        }),
      });

      if (res.ok) {
        const q = await res.json();
        setQuestions((prev) => [q, ...prev]);
        setText("");
        setAnswers([""]);
        setCategory("");
        setDifficulty(1);
        setMessage("문제가 등록되었습니다!");
      } else {
        setMessage("등록에 실패했습니다.");
      }
    } catch {
      setMessage("네트워크 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">문제 등록</h1>
        <Link
          href="/"
          className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
        >
          ← 메인으로
        </Link>
      </header>

      <div className="max-w-2xl mx-auto p-6 space-y-8">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-400 mb-1">문제문</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
              placeholder="대한민국의 수도는 어디인가?"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">정답 후보</label>
            <div className="space-y-2">
              {answers.map((ans, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={ans}
                    onChange={(e) => updateAnswer(i, e.target.value)}
                    className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder={`정답 ${i + 1}`}
                  />
                  {answers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAnswer(i)}
                      className="px-3 text-red-400 hover:text-red-300 cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addAnswer}
                className="text-sm text-blue-400 hover:text-blue-300 cursor-pointer"
              >
                + 정답 추가
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm text-gray-400 mb-1">카테고리</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="과학"
              />
            </div>
            <div className="w-32">
              <label className="block text-sm text-gray-400 mb-1">난이도</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(Number(e.target.value))}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                {[1, 2, 3, 4, 5].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {message && (
            <p className={`text-sm ${message.includes("등록") ? "text-green-400" : "text-red-400"}`}>
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white font-bold rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            {saving ? "저장 중..." : "문제 등록"}
          </button>
        </form>

        {/* List */}
        {questions.length > 0 && (
          <div>
            <h2 className="text-lg font-bold mb-3">등록된 문제 ({questions.length})</h2>
            <div className="space-y-2">
              {questions.map((q) => (
                <div
                  key={q.id}
                  className="bg-gray-800/60 rounded-lg px-4 py-3 space-y-1"
                >
                  <p className="text-white">{q.text}</p>
                  <div className="flex gap-2 flex-wrap">
                    {q.answers.map((a, i) => (
                      <span
                        key={i}
                        className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded"
                      >
                        {a}
                      </span>
                    ))}
                    {q.category && (
                      <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded">
                        {q.category}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
