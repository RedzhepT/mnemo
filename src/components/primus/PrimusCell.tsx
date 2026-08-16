import type { PrimusPhase, PrimusResultStatus } from "../../hooks/usePrimus";

export interface PrimusCellProps {
  index: number;
  gridSize: number;
  value: number;
  phase: PrimusPhase;
  isSelected: boolean;
  resultStatus: PrimusResultStatus | null;
  onClick: (index: number) => void;
}

// Hücre durumuna göre Tailwind sınıflarını döner
function getCellClassName(
  index: number,
  gridSize: number,
  phase: PrimusPhase,
  isSelected: boolean,
  resultStatus: PrimusResultStatus | null,
): string {
  const base =
    "relative flex aspect-square w-full items-center justify-center rounded-[2px] border border-mnemo-border text-lg font-semibold transition-all duration-300 cursor-pointer select-none outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 active:outline-none";

  if (phase === "result") {
    if (resultStatus === "correct") {
      return `${base} border-transparent bg-green-500 text-white shadow-md`;
    }

    if (resultStatus === "wrong") {
      return `${base} border-transparent bg-red-500 text-white shadow-md`;
    }

    if (resultStatus === "missed") {
      return `${base} border-transparent bg-blue-500 text-white shadow-md`;
    }

    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    const isLight = (row + col) % 2 === 0;

    if (isLight) {
      return `${base} border-transparent bg-[#F0D9B5] text-[#1A1A2E]`;
    }

    return `${base} border-transparent bg-[#B58863] text-[#1A1A2E]`;
  }

  if (isSelected) {
    return `${base} border-transparent bg-mnemo-yellow text-white shadow-md`;
  }

  const row = Math.floor(index / gridSize);
  const col = index % gridSize;
  const isLight = (row + col) % 2 === 0;

  if (isLight) {
    return `${base} bg-[#F0D9B5] text-[#1A1A2E] hover:bg-[#F5E0C0] active:scale-95`;
  }

  return `${base} bg-[#B58863] text-[#1A1A2E] hover:bg-[#C49A75] active:scale-95`;
}

// Primus tahtasındaki tek bir sayılı hücreyi render eder
export function PrimusCell({
  index,
  gridSize,
  value,
  phase,
  isSelected,
  resultStatus,
  onClick,
}: PrimusCellProps) {
  return (
    <button
      type="button"
      aria-label={`Hücre ${index + 1}, sayı ${value}`}
      className={getCellClassName(
        index,
        gridSize,
        phase,
        isSelected,
        resultStatus,
      )}
      onClick={() => onClick(index)}
    >
      <span>{value}</span>
    </button>
  );
}
