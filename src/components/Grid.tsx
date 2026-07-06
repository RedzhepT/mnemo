import type {
  EmojiCell,
  EmojiType,
  InputPhase,
  ResultMap,
} from '../hooks/useGame'
import { Cell } from './Cell'

export interface GridProps {
  gridSize: number
  sequence: number[]
  playerInput: number[]
  phase: string
  activeIndex: number | null
  resultMap: ResultMap
  emojiSequence: EmojiCell[]
  isEmojiMode: boolean
  currentInputCategory: InputPhase
  onCellClick: (index: number) => void
}

const GRID_COLS_CLASS: Record<number, string> = {
  6: 'grid-cols-6',
  7: 'grid-cols-7',
}

// Kare index'inin sequence içindeki 1 tabanlı sıra numarasını döner
function getSequenceOrder(
  index: number,
  sequence: number[],
  phase: string,
): number | null {
  if (phase !== 'result') {
    return null
  }

  const position = sequence.indexOf(index)

  if (position === -1) {
    return null
  }

  return position + 1
}

// Kare index'i için emojiSequence'den emoji bilgisini döner
function getCellEmoji(
  index: number,
  emojiSequence: EmojiCell[],
): EmojiType | null {
  return emojiSequence.find((cell) => cell.index === index)?.emoji ?? null
}

// gridSize x gridSize oyun tahtasını render eder
export function Grid({
  gridSize,
  sequence,
  playerInput,
  phase,
  activeIndex,
  resultMap,
  emojiSequence,
  isEmojiMode,
  currentInputCategory,
  onCellClick,
}: GridProps) {
  const cellCount = gridSize * gridSize
  const gridColsClass =
    GRID_COLS_CLASS[gridSize] ?? `grid-cols-[repeat(${gridSize},minmax(0,1fr))]`

  void currentInputCategory

  return (
    <div
      className={`grid w-full max-w-md gap-0.5 ${gridColsClass} mx-auto px-4 sm:max-w-lg`}
    >
      {Array.from({ length: cellCount }, (_, index) => (
        <Cell
          key={index}
          index={index}
          gridSize={gridSize}
          isActive={phase === 'showing' && activeIndex === index}
          isPlayerSelected={phase === 'input' && playerInput.includes(index)}
          resultStatus={phase === 'result' ? (resultMap[index] ?? null) : null}
          sequenceOrder={getSequenceOrder(index, sequence, phase)}
          emoji={getCellEmoji(index, emojiSequence)}
          isEmojiMode={isEmojiMode}
          onClick={onCellClick}
        />
      ))}
    </div>
  )
}
