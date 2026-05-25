"use client";

interface BuzzerButtonProps {
  onBuzz: () => void;
  disabled: boolean;
}

export function BuzzerButton({ onBuzz, disabled }: BuzzerButtonProps) {
  return (
    <button
      onClick={onBuzz}
      disabled={disabled}
      className={`
        w-32 h-32 rounded-full text-xl font-black tracking-wider
        transition-all duration-150
        ${
          disabled
            ? "bg-gray-700 text-gray-500 cursor-not-allowed"
            : "bg-red-600 hover:bg-red-500 active:scale-95 text-white shadow-lg shadow-red-900/50 hover:shadow-red-800/60 cursor-pointer"
        }
      `}
    >
      버저!
    </button>
  );
}
