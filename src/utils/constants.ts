export interface LevelRange {
  minLevel: number
  maxLevel: number
}

export interface GridSizeRange extends LevelRange {
  size: number
}

export interface SequenceLengthRange extends LevelRange {
  length: number
}

export interface ShowTimeRange extends LevelRange {
  ms: number
}

export const MAX_LEVEL = 32

export const DEBUG_MODE = true
export const MIN_ROUNDS_TO_COMPLETE = DEBUG_MODE ? 4 : 10

// Primus oyun sabitleri
export const PRIMUS_GRID_SIZE = 4
export const PRIMUS_CELL_COUNT = PRIMUS_GRID_SIZE * PRIMUS_GRID_SIZE
export const PRIMUS_ROUND_TIME_MS = 8000
export const PRIMUS_PRIME_COUNT = 3
export const PRIMUS_MIN_ONE_DIGIT_COUNT = 3
export const PRIMUS_MAX_ONE_DIGIT_COUNT = 8
export const PRIMUS_ONE_DIGIT_MIN = 2
export const PRIMUS_ONE_DIGIT_MAX = 9
export const PRIMUS_SAVE_KEY = 'primus_save'
export const PRIMUS_LEVEL = 1
export const PRIMUS_LEVEL_COMPLETE_THRESHOLD = 90
export const PRIMUS_MAX_ROUND_HISTORY = 10
export const PRIMUS_TWO_DIGIT_MIN = 10
export const PRIMUS_TWO_DIGIT_MAX = 99

export const GRID_SIZES: GridSizeRange[] = [
  { minLevel: 1, maxLevel: 5, size: 6 },
  { minLevel: 6, maxLevel: 10, size: 6 },
  { minLevel: 11, maxLevel: MAX_LEVEL, size: 7 },
]

export const SEQUENCE_LENGTHS: SequenceLengthRange[] = [
  { minLevel: 1, maxLevel: 5, length: 3 },
  { minLevel: 6, maxLevel: 10, length: 4 },
  { minLevel: 11, maxLevel: MAX_LEVEL, length: 4 },
]

export const SHOW_TIMES_MS: ShowTimeRange[] = [
  { minLevel: 1, maxLevel: 5, ms: 600 },
  { minLevel: 6, maxLevel: 10, ms: 500 },
  { minLevel: 11, maxLevel: MAX_LEVEL, ms: 400 },
]
