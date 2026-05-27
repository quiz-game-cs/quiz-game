"use client";

import { useEffect, useRef, useState } from "react";
import type { User } from "@/lib/types";

type Props = {
  open: boolean;
  initialNickname?: string;
  onClose: () => void;
  onSuccess: (user: Pick<User, "id" | "nickname">) => void;
};

export function NicknameModal({ open, initialNickname = "", onClose, onSuccess }: Props) {
  const [value, setValue] = useState(initialNickname);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setValue(initialNickname);
      setError(null);
      setIsSubmitting(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open, initialNickname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const submit = async () => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError("닉네임을 입력해주세요");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "닉네임 저장에 실패했습니다");
        return;
      }
      onSuccess({ id: data.id, nickname: data.nickname });
      onClose();
    } catch (err) {
      console.error("닉네임 저장 실패:", err);
      setError("네트워크 오류로 저장하지 못했습니다");
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = initialNickname ? "닉네임 변경" : "닉네임 설정";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-[min(420px,90vw)] rounded-2xl bg-gray-900 border border-gray-800 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-white mb-4">{title}</h2>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="닉네임 입력"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 text-white
            placeholder:text-gray-500 outline-none focus:border-gray-500 disabled:opacity-50"
        />
        {error && (
          <p className="mt-2 text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-600 to-red-700
              hover:from-red-500 hover:to-red-600 text-white font-bold
              disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? "저장 중..." : "확인"}
          </button>
        </div>
      </div>
    </div>
  );
}
