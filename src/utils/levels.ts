import {
  GRID_SIZES,
  MAX_LEVEL,
  SEQUENCE_LENGTHS,
  SHOW_TIMES_MS,
  type LevelRange,
} from './constants'

export interface LevelConfig {
  gridSize: number
  sequenceLength: number
  showTimeMs: number
  mode: 'normal' | 'emoji'
}

// Bölüm aralığı listesinden verilen level için değer seçer
function getRangeValue<T extends LevelRange>(
  ranges: readonly T[],
  level: number,
  getValue: (range: T) => number,
): number {
  const match = ranges.find(
    (range) => level >= range.minLevel && level <= range.maxLevel,
  )

  if (!match) {
    throw new Error(`Bölüm ${level} için konfigürasyon bulunamadı`)
  }

  return getValue(match)
}

// Bölüm numarasına göre grid boyutu, sıra uzunluğu ve gösterim süresini döner
export function getLevelConfig(level: number): LevelConfig {
  const clampedLevel = Math.min(Math.max(level, 1), MAX_LEVEL)

  return {
    gridSize: getRangeValue(GRID_SIZES, clampedLevel, (range) => range.size),
    sequenceLength: getRangeValue(
      SEQUENCE_LENGTHS,
      clampedLevel,
      (range) => range.length,
    ),
    showTimeMs: getRangeValue(SHOW_TIMES_MS, clampedLevel, (range) => range.ms),
    mode: clampedLevel <= 2 ? 'normal' : 'emoji',
  }
}
