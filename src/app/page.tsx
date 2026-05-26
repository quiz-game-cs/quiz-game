import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 flex items-center justify-center bg-gray-950 text-white">
      <div className="text-center space-y-10 px-6">
        {/* Title */}
        <div className="space-y-3">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight bg-gradient-to-r from-yellow-300 via-red-400 to-purple-500 bg-clip-text text-transparent">
            ⚡ 퀴즈퀴즈야
          </h1>
          <p className="text-gray-400 text-base md:text-lg max-w-md mx-auto">
            문제가 한 글자씩 공개됩니다.
            <br className="hidden md:block" />
            고스트보다 빨리 버저를 누르세요!
          </p>
        </div>

        {/* Mode buttons */}
        <div className="flex flex-col gap-4 max-w-xs mx-auto">
          <Link
            href="/play?rounds=1"
            className="group relative block px-8 py-5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600
              rounded-2xl text-lg font-black transition-all text-center
              shadow-lg shadow-red-900/30 hover:shadow-red-800/40 hover:scale-[1.02]"
          >
            <span className="text-2xl mr-2">🎯</span>
            1문제 플레이
            <span className="block text-xs font-normal text-red-200/60 mt-1">
              무한 연습 모드
            </span>
          </Link>
          <Link
            href="/play?rounds=10"
            className="group relative block px-8 py-5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600
              rounded-2xl text-lg font-black transition-all text-center
              shadow-lg shadow-blue-900/30 hover:shadow-blue-800/40 hover:scale-[1.02]"
          >
            <span className="text-2xl mr-2">🏆</span>
            10문제 대전
            <span className="block text-xs font-normal text-blue-200/60 mt-1">
              고스트와 정식 대결
            </span>
          </Link>
        </div>

        {/* Rules summary */}
        <div className="max-w-sm mx-auto text-gray-600 text-xs space-y-1 leading-relaxed">
          <p>🔔 버저 → 5초 안에 정답 입력</p>
          <p>👻 3명의 고스트와 실시간 대전</p>
          <p>🏆 4명 중 1등을 노려보세요!</p>
        </div>

        {/* Admin link */}
        <div>
          <Link
            href="/admin/questions"
            className="text-gray-600 hover:text-gray-400 text-xs underline underline-offset-4 transition-colors"
          >
            문제 관리 →
          </Link>
        </div>
      </div>
    </main>
  );
}
