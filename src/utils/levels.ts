import { MAX_LEVEL } from './constants'

export interface LevelConfig {
  gridSize: number
  sequenceLength: number
  showTimeMs: number
  mode: 'normal' | 'emoji'
}

const LEVEL_CONFIGS: LevelConfig[] = [
  { gridSize: 6, sequenceLength: 3, showTimeMs: 700, mode: 'normal' }, // 1
  { gridSize: 6, sequenceLength: 3, showTimeMs: 600, mode: 'normal' }, // 2
  { gridSize: 6, sequenceLength: 3, showTimeMs: 500, mode: 'normal' }, // 3
  { gridSize: 6, sequenceLength: 3, showTimeMs: 400, mode: 'normal' }, // 4
  { gridSize: 7, sequenceLength: 4, showTimeMs: 700, mode: 'normal' }, // 5
  { gridSize: 7, sequenceLength: 4, showTimeMs: 600, mode: 'normal' }, // 6
  { gridSize: 7, sequenceLength: 4, showTimeMs: 500, mode: 'normal' }, // 7
  { gridSize: 7, sequenceLength: 4, showTimeMs: 400, mode: 'normal' }, // 8
  { gridSize: 8, sequenceLength: 5, showTimeMs: 700, mode: 'normal' }, // 9
  { gridSize: 8, sequenceLength: 5, showTimeMs: 600, mode: 'normal' }, // 10
  { gridSize: 8, sequenceLength: 5, showTimeMs: 500, mode: 'normal' }, // 11
  { gridSize: 8, sequenceLength: 5, showTimeMs: 400, mode: 'normal' }, // 12
  { gridSize: 8, sequenceLength: 6, showTimeMs: 700, mode: 'normal' }, // 13
  { gridSize: 8, sequenceLength: 6, showTimeMs: 600, mode: 'normal' }, // 14
  { gridSize: 8, sequenceLength: 6, showTimeMs: 500, mode: 'normal' }, // 15
  { gridSize: 8, sequenceLength: 6, showTimeMs: 400, mode: 'normal' }, // 16
  { gridSize: 6, sequenceLength: 3, showTimeMs: 700, mode: 'emoji' }, // 17
  { gridSize: 6, sequenceLength: 3, showTimeMs: 600, mode: 'emoji' }, // 18
  { gridSize: 6, sequenceLength: 3, showTimeMs: 500, mode: 'emoji' }, // 19
  { gridSize: 6, sequenceLength: 3, showTimeMs: 400, mode: 'emoji' }, // 20
  { gridSize: 7, sequenceLength: 4, showTimeMs: 700, mode: 'emoji' }, // 21
  { gridSize: 7, sequenceLength: 4, showTimeMs: 600, mode: 'emoji' }, // 22
  { gridSize: 7, sequenceLength: 4, showTimeMs: 500, mode: 'emoji' }, // 23
  { gridSize: 7, sequenceLength: 4, showTimeMs: 400, mode: 'emoji' }, // 24
  { gridSize: 8, sequenceLength: 5, showTimeMs: 700, mode: 'emoji' }, // 25
  { gridSize: 8, sequenceLength: 5, showTimeMs: 600, mode: 'emoji' }, // 26
  { gridSize: 8, sequenceLength: 5, showTimeMs: 500, mode: 'emoji' }, // 27
  { gridSize: 8, sequenceLength: 5, showTimeMs: 400, mode: 'emoji' }, // 28
  { gridSize: 8, sequenceLength: 6, showTimeMs: 700, mode: 'emoji' }, // 29
  { gridSize: 8, sequenceLength: 6, showTimeMs: 600, mode: 'emoji' }, // 30
  { gridSize: 8, sequenceLength: 6, showTimeMs: 500, mode: 'emoji' }, // 31
  { gridSize: 8, sequenceLength: 6, showTimeMs: 400, mode: 'emoji' }, // 32
]

// Bölüm numarasına göre konfigürasyonu döner
export function getLevelConfig(level: number): LevelConfig {
  const clampedLevel = Math.min(Math.max(level, 1), MAX_LEVEL)

  return LEVEL_CONFIGS[clampedLevel - 1]
}
