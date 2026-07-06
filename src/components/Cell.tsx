import type { ResultStatus } from '../hooks/useGame'

export interface CellProps {
  index: number
  gridSize: number
  isActive: boolean
  isPlayerSelected: boolean
  resultStatus: ResultStatus | null
  sequenceOrder: number | null
  onClick: (index: number) => void
}

// Kare durumuna göre Tailwind sınıflarını döner
function getCellClassName(
  index: number,
  gridSize: number,
  isActive: boolean,
  isPlayerSelected: boolean,
  resultStatus: ResultStatus | null,
): string {
  const base =
    'relative flex aspect-square w-full items-center justify-center rounded-[2px] border border-mnemo-border text-lg font-semibold transition-all duration-300 cursor-pointer select-none'

  if (resultStatus === 'correct') {
    return `${base} border-transparent bg-green-500 text-white shadow-md`
  }

  if (resultStatus === 'wrong-order') {
    return `${base} border-transparent bg-[#F97316] text-white shadow-md`
  }

  if (resultStatus === 'wrong') {
    return `${base} border-transparent bg-red-500 text-white shadow-md`
  }

  if (resultStatus === 'missed') {
    return `${base} border-transparent bg-blue-500 text-white shadow-md`
  }

  if (isActive) {
    return `${base} border-transparent bg-mnemo-primary text-white shadow-lg scale-105 brightness-110`
  }

  if (isPlayerSelected) {
    return `${base} border-transparent bg-mnemo-yellow text-white shadow-md`
  }

  const row = Math.floor(index / gridSize)
  const col = index % gridSize
  const isLight = (row + col) % 2 === 0

  if (isLight) {
    return `${base} bg-[#F0D9B5] hover:bg-[#F5E0C0] active:scale-95`
  }

  return `${base} bg-[#B58863] hover:bg-[#C49A75] active:scale-95`
}

// Oyun tahtasındaki tek bir kareyi render eder
export function Cell({
  index,
  gridSize,
  isActive,
  isPlayerSelected,
  resultStatus,
  sequenceOrder,
  onClick,
}: CellProps) {
  return (
    <button
      type="button"
      aria-label={`Kare ${index + 1}`}
      className={getCellClassName(
        index,
        gridSize,
        isActive,
        isPlayerSelected,
        resultStatus,
      )}
      onClick={() => onClick(index)}
    >
      {sequenceOrder !== null && <span>{sequenceOrder}</span>}
    </button>
  )
}
