"use client";

import { useState } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { NicknameModal } from "@/components/nickname-modal";

export function NicknameHeader() {
  const { user, isLoading, setUser } = useCurrentUser();
  const [modalOpen, setModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="fixed top-4 right-4 z-40">
        <div className="px-3 py-2 rounded-full bg-gray-900/60 border border-gray-800 text-gray-600 text-sm">
          ...
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed top-4 right-4 z-40">
        {user ? (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            title="클릭해서 닉네임 변경"
            className="group flex items-center gap-2 px-3 py-2 rounded-full
              bg-gray-900/70 hover:bg-gray-800 border border-gray-800 hover:border-gray-700
              text-gray-200 text-sm transition-colors max-w-[180px]"
          >
            <span aria-hidden>👤</span>
            <span className="truncate">{user.nickname}</span>
            <span className="hidden group-hover:inline text-xs text-gray-500">✎</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="px-3 py-2 rounded-full bg-gray-900/70 hover:bg-gray-800
              border border-gray-800 hover:border-gray-700
              text-gray-300 hover:text-white text-sm transition-colors"
          >
            닉네임 설정
          </button>
        )}
      </div>

      <NicknameModal
        open={modalOpen}
        initialNickname={user?.nickname ?? ""}
        onClose={() => setModalOpen(false)}
        onSuccess={(next) => setUser(next)}
      />
    </>
  );
}
