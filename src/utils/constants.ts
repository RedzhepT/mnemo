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

export const MAX_LEVEL = 20

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
