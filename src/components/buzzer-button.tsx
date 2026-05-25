"use client";

interface BuzzerButtonProps {
  onBuzz: () => void;
  disabled: boolean;
}

export function BuzzerButton({ onBuzz, disabled }: BuzzerButtonProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={onBuzz}
        disabled={disabled}
        className={`
          w-36 h-36 md:w-40 md:h-40 rounded-full text-2xl font-black tracking-widest
          transition-all duration-150 border-4
          ${
            disabled
              ? "bg-gray-800 text-gray-600 border-gray-700 cursor-not-allowed"
              : `bg-gradient-to-b from-red-500 to-red-700 hover:from-red-400 hover:to-red-600
                 active:scale-90 text-white border-red-400/50
                 shadow-[0_0_40px_rgba(239,68,68,0.3)] hover:shadow-[0_0_60px_rgba(239,68,68,0.4)]
                 animate-buzz-pulse cursor-pointer`
          }
        `}
      >
        BUZZ!
      </button>
      {!disabled && (
        <p className="text-gray-500 text-xs tracking-wider">
          SPACE 또는 탭하세요
        </p>
      )}
    </div>
  );
}
