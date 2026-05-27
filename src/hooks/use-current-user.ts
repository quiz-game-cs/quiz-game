"use client";

import { useCallback, useEffect, useState } from "react";
import type { User } from "@/lib/types";

const STORAGE_KEY = "quizquizya:userId";

type CurrentUser = Pick<User, "id" | "nickname"> | null;

export function useCurrentUser() {
  const [user, setUserState] = useState<CurrentUser>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userId = typeof window === "undefined" ? null : window.localStorage.getItem(STORAGE_KEY);
    if (!userId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/users/${userId}`);
        if (cancelled) return;
        if (res.status === 404) {
          window.localStorage.removeItem(STORAGE_KEY);
          setUserState(null);
          return;
        }
        if (!res.ok) {
          console.error("user 조회 실패:", res.status);
          return;
        }
        const data: User = await res.json();
        setUserState({ id: data.id, nickname: data.nickname });
      } catch (err) {
        console.error("user 조회 네트워크 오류:", err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const setUser = useCallback((next: CurrentUser) => {
    if (next) {
      window.localStorage.setItem(STORAGE_KEY, next.id);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    setUserState(next);
  }, []);

  const clearUser = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setUserState(null);
  }, []);

  return { user, isLoading, setUser, clearUser };
}
