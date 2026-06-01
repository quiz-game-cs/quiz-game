"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCurrentUser } from "@/hooks/use-current-user";
import { NicknameHeader } from "@/components/nickname-header";

type Opponent = {
  id: string;
  nickname: string;
  totalPlays: number;
  correctCount: number;
  accuracy: number;
};

export default function GhostBattlePickerPage() {
  const router = useRouter();
  const { user, isLoading: userLoading } = useCurrentUser();
  const [opponents, setOpponents] = useState<Opponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userLoading) return;
    const params = new URLSearchParams();
    if (user) params.set("excludeUserId", user.id);
    setLoading(true);
    fetch(`/api/users/playable-opponents?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setOpponents(data.opponents ?? []);
        }
      })
      .catch((err) => {
        console.error(err);
        setError("상대 목록을 불러오지 못했습니다");
      })
      .finally(() => setLoading(false));
  }, [userLoading, user]);

  return (
    <main className="flex-1 flex flex-col bg-gray-950 text-white min-h-0">
      <NicknameHeader />

      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-800/60">
        <button
          onClick={() => router.push("/")}
          className="text-gray-600 hover:text-gray-300 text-sm transition-colors cursor-pointer"
        >
          ← 나가기
        </button>
        <div className="text-sm text-gray-400">상대 선택</div>
        <div className="w-12" />
      </header>

      <section className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-black text-center mb-2">고스트 대전</h1>
          <p className="text-gray-400 text-sm text-center mb-6">
            10문제 이상 푼 사용자와 1:1 매치를 해보세요.
          </p>

          {loading && (
            <div className="text-center text-gray-500 py-12 animate-pulse">
              상대 목록을 불러오는 중...
            </div>
          )}
          {error && (
            <div className="text-center text-red-400 py-12">{error}</div>
          )}
          {!loading && !error && opponents.length === 0 && (
            <div className="text-center text-gray-500 py-12">
              아직 매치 가능한 상대가 없습니다.
              <br />
              누군가 10문제 이상 풀 때까지 기다려주세요.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {opponents.map((o) => (
              <Link
                key={o.id}
                href={`/ghost-battle/${o.id}`}
                className="group block p-4 rounded-2xl bg-gradient-to-br from-purple-700/30 to-purple-900/40
                  border border-purple-700/40 hover:border-purple-500 hover:from-purple-600/40
                  transition-all"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-black text-sm">
                    👻
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-base truncate">{o.nickname}</div>
                    <div className="text-xs text-gray-400">
                      푼 문제 {o.totalPlays} · 정답률 {Math.round(o.accuracy * 100)}%
                    </div>
                  </div>
                </div>
                <div className="text-right text-xs text-purple-300 group-hover:text-purple-200">
                  도전 →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
