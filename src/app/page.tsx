import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 flex items-center justify-center bg-gray-950 text-white">
      <div className="text-center space-y-8 px-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tight">
            ⚡ 하야오시 퀴즈
          </h1>
          <p className="text-gray-400 text-lg">
            문제가 한 글자씩 공개됩니다. 누구보다 빨리 버저를 누르세요!
          </p>
        </div>

        <div className="flex flex-col gap-4 max-w-xs mx-auto">
          <Link
            href="/play?rounds=1"
            className="block px-8 py-4 bg-red-600 hover:bg-red-500 rounded-xl text-lg font-bold transition-colors text-center shadow-lg shadow-red-900/30"
          >
            1문제 플레이
          </Link>
          <Link
            href="/play?rounds=10"
            className="block px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl text-lg font-bold transition-colors text-center shadow-lg shadow-blue-900/30"
          >
            10문제 모드
          </Link>
        </div>

        <div className="pt-4">
          <Link
            href="/admin/questions"
            className="text-gray-500 hover:text-gray-300 text-sm underline underline-offset-4 transition-colors"
          >
            문제 등록 →
          </Link>
        </div>
      </div>
    </main>
  );
}
