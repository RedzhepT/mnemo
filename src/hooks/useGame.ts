import { useCallback, useEffect, useRef, useState } from 'react'
import { MIN_ROUNDS_TO_COMPLETE } from '../utils/constants'
import { getLevelConfig } from '../utils/levels'
import { calculateScore } from '../utils/scoring'

export type GamePhase = 'idle' | 'showing' | 'input' | 'result'

export type ResultStatus = 'correct' | 'wrong-order' | 'wrong' | 'missed'

export interface CellResult {
  index: number
  status: ResultStatus
}

export type ResultMap = Record<number, ResultStatus>

const SAVE_KEY = 'mnemo_save'
const MAX_ROUND_HISTORY = 10
const LEVEL_COMPLETE_THRESHOLD = 90

interface MnemoSave {
  level: number
  roundHistory: number[]
  roundCount: number
  score: number
}

export interface UseGameReturn {
  phase: GamePhase
  level: number
  sequence: number[]
  playerInput: number[]
  score: number
  elapsedMs: number
  activeIndex: number | null
  resultMap: ResultMap
  roundHistory: number[]
  roundCount: number
  isPaused: boolean
  levelComplete: boolean
  startGame: () => void
  handleCellClick: (index: number) => void
  nextLevel: () => void
  resetGame: () => void
  pauseGame: () => void
  resumeGame: () => void
}

// Grid üzerinde tekrarsız rastgele kare indeksleri üretir
function generateSequence(gridSize: number, length: number): number[] {
  const cellCount = gridSize * gridSize
  const pool = Array.from({ length: cellCount }, (_, index) => index)

  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }

  return pool.slice(0, length)
}

// Oyuncu girişi ile hedef sırayı karşılaştırarak doğru tıklama sayısını döner
function countCorrectInputs(playerInput: number[], sequence: number[]): number {
  return playerInput.reduce(
    (count, value, index) => (value === sequence[index] ? count + 1 : count),
    0,
  )
}

// Result fazı için her karenin durum haritasını üretir
function buildResultMap(
  sequence: number[],
  playerInput: number[],
): ResultMap {
  const resultMap: ResultMap = {}
  const sequenceSet = new Set(sequence)
  const clickedIndices = new Set<number>()

  playerInput.forEach((cellIndex, position) => {
    clickedIndices.add(cellIndex)

    if (!sequenceSet.has(cellIndex)) {
      resultMap[cellIndex] = 'wrong'
      return
    }

    if (cellIndex === sequence[position]) {
      resultMap[cellIndex] = 'correct'
      return
    }

    resultMap[cellIndex] = 'wrong-order'
  })

  sequence.forEach((cellIndex) => {
    if (!clickedIndices.has(cellIndex)) {
      resultMap[cellIndex] = 'missed'
    }
  })

  return resultMap
}

// Tur geçmişine yeni puanı ekler, en fazla son 10 turu tutar
function appendRoundHistory(
  previousHistory: number[],
  roundScore: number,
): number[] {
  const nextHistory = [...previousHistory, roundScore]

  if (nextHistory.length <= MAX_ROUND_HISTORY) {
    return nextHistory
  }

  return nextHistory.slice(-MAX_ROUND_HISTORY)
}

// En az MIN_ROUNDS_TO_COMPLETE tur ve ortalamasına göre bölüm tamamlanma durumunu hesaplar
function calculateLevelComplete(roundHistory: number[]): boolean {
  if (roundHistory.length < MIN_ROUNDS_TO_COMPLETE) {
    return false
  }

  const average =
    roundHistory.reduce((sum, value) => sum + value, 0) / roundHistory.length

  return average >= LEVEL_COMPLETE_THRESHOLD
}

// localStorage'dan kayıtlı oyun verisini okur
function readSavedGame(): MnemoSave | null {
  const saved = localStorage.getItem(SAVE_KEY)

  if (!saved) {
    return null
  }

  try {
    return JSON.parse(saved) as MnemoSave
  } catch {
    return null
  }
}

export function useGame(): UseGameReturn {
  const [phase, setPhase] = useState<GamePhase>('idle')
  const [level, setLevel] = useState(1)
  const [sequence, setSequence] = useState<number[]>([])
  const [playerInput, setPlayerInput] = useState<number[]>([])
  const [score, setScore] = useState(0)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [resultMap, setResultMap] = useState<ResultMap>({})
  const [roundHistory, setRoundHistory] = useState<number[]>([])
  const [roundCount, setRoundCount] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [levelComplete, setLevelComplete] = useState(false)

  const showTimeoutsRef = useRef<number[]>([])
  const inputTimerRef = useRef<number | null>(null)
  const inputStartedAtRef = useRef(0)
  const sequenceRef = useRef<number[]>([])
  const elapsedMsRef = useRef(0)
  const roundHistoryRef = useRef<number[]>([])
  const phaseRef = useRef<GamePhase>('idle')
  const levelCompleteRef = useRef(false)
  const roundRecordedRef = useRef(false)
  const startGameRef = useRef<() => void>(() => {})

  phaseRef.current = phase
  roundHistoryRef.current = roundHistory
  levelCompleteRef.current = levelComplete

  // Zamanlayıcıları temizler
  const clearShowTimeouts = useCallback(() => {
    showTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId))
    showTimeoutsRef.current = []
  }, [])

  // Input fazı süre sayacını durdurur
  const stopInputTimer = useCallback(() => {
    if (inputTimerRef.current !== null) {
      window.clearInterval(inputTimerRef.current)
      inputTimerRef.current = null
    }
  }, [])

  // Input fazı süre sayacını başlatır
  const startInputTimer = useCallback(() => {
    stopInputTimer()
    inputStartedAtRef.current = Date.now()
    elapsedMsRef.current = 0
    setElapsedMs(0)

    inputTimerRef.current = window.setInterval(() => {
      const nextElapsed = Date.now() - inputStartedAtRef.current
      elapsedMsRef.current = nextElapsed
      setElapsedMs(nextElapsed)
    }, 50)
  }, [stopInputTimer])

  // Tur sonucunu geçmişe kaydeder ve bölüm tamamlanma durumunu günceller
  const recordRoundResult = useCallback((roundScore: number) => {
    if (roundRecordedRef.current) {
      return
    }

    roundRecordedRef.current = true

    const nextHistory = appendRoundHistory(
      roundHistoryRef.current,
      roundScore,
    )
    const average =
      nextHistory.reduce((sum, value) => sum + value, 0) / nextHistory.length

    console.log('Tur bitti. Score:', roundScore)
    console.log('Yeni history:', nextHistory)
    console.log('History length:', nextHistory.length)
    console.log('Ortalama:', average)
    console.log(
      'levelComplete oldu mu:',
      nextHistory.length >= MIN_ROUNDS_TO_COMPLETE && average >= 90,
    )

    roundHistoryRef.current = nextHistory
    setRoundHistory(nextHistory)
    setLevelComplete(calculateLevelComplete(nextHistory))
    setRoundCount((previousCount) => previousCount + 1)
    setScore(roundScore)
  }, [])

  // Belirtilen bölüm için gösterim fazını başlatır ve input fazına geçer
  const beginRound = useCallback(
    (roundLevel: number) => {
      clearShowTimeouts()
      stopInputTimer()

      const config = getLevelConfig(roundLevel)
      const nextSequence = generateSequence(
        config.gridSize,
        config.sequenceLength,
      )

      sequenceRef.current = nextSequence
      setSequence(nextSequence)
      setPlayerInput([])
      setResultMap({})
      setActiveIndex(null)
      setElapsedMs(0)
      elapsedMsRef.current = 0
      setPhase('showing')

      nextSequence.forEach((cellIndex, index) => {
        const showTimeout = window.setTimeout(() => {
          setActiveIndex(cellIndex)
        }, index * config.showTimeMs)
        showTimeoutsRef.current.push(showTimeout)
      })

      const finishTimeout = window.setTimeout(() => {
        setActiveIndex(null)
        setPhase('input')
        startInputTimer()
      }, nextSequence.length * config.showTimeMs)

      showTimeoutsRef.current.push(finishTimeout)
    },
    [clearShowTimeouts, startInputTimer, stopInputTimer],
  )

  // Oyunu mevcut bölümle başlatır
  const startGame = useCallback(() => {
    beginRound(level)
  }, [beginRound, level])

  startGameRef.current = startGame

  // Oyuncu kare tıklamasını işler
  const handleCellClick = useCallback(
    (index: number) => {
      if (phase !== 'input') {
        return
      }

      setPlayerInput((previousInput) => {
        const nextPlayerInput = [...previousInput, index]

        if (nextPlayerInput.length < sequenceRef.current.length) {
          return nextPlayerInput
        }

        stopInputTimer()

        const correctCount = countCorrectInputs(
          nextPlayerInput,
          sequenceRef.current,
        )
        const roundScore = calculateScore(
          correctCount,
          sequenceRef.current.length,
          elapsedMsRef.current,
        )

        setResultMap(
          buildResultMap(sequenceRef.current, nextPlayerInput),
        )
        recordRoundResult(roundScore)
        setPhase('result')

        return nextPlayerInput
      })
    },
    [phase, recordRoundResult, stopInputTimer],
  )

  // Bir sonraki bölüme geçer ve yeni tur başlatır
  const nextLevel = useCallback(() => {
    const newLevel = level + 1

    roundHistoryRef.current = []
    setRoundHistory([])
    setRoundCount(0)
    setLevelComplete(false)
    setLevel(newLevel)
    beginRound(newLevel)
  }, [beginRound, level])

  // Oyun state'ini başlangıç değerlerine sıfırlar
  const resetGame = useCallback(() => {
    clearShowTimeouts()
    stopInputTimer()
    sequenceRef.current = []
    localStorage.removeItem(SAVE_KEY)

    setPhase('idle')
    setLevel(1)
    setSequence([])
    setPlayerInput([])
    setScore(0)
    setElapsedMs(0)
    elapsedMsRef.current = 0
    setActiveIndex(null)
    setResultMap({})
    roundHistoryRef.current = []
    setRoundHistory([])
    setRoundCount(0)
    setIsPaused(false)
    setLevelComplete(false)
    roundRecordedRef.current = false
  }, [clearShowTimeouts, stopInputTimer])

  // Mevcut ilerlemeyi localStorage'a kaydeder
  const pauseGame = useCallback(() => {
    const saveData: MnemoSave = {
      level,
      roundHistory,
      roundCount,
      score,
    }

    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData))
    setIsPaused(true)
  }, [level, roundCount, roundHistory, score])

  // Kayıtlı ilerlemeyi localStorage'dan geri yükler
  const resumeGame = useCallback(() => {
    const savedGame = readSavedGame()

    if (!savedGame) {
      return
    }

    roundHistoryRef.current = savedGame.roundHistory
    setLevel(savedGame.level)
    setRoundHistory(savedGame.roundHistory)
    setRoundCount(savedGame.roundCount)
    setScore(savedGame.score)
    setLevelComplete(calculateLevelComplete(savedGame.roundHistory))
    setIsPaused(false)
    setPhase('idle')
  }, [])

  useEffect(() => {
    if (phase === 'input') {
      roundRecordedRef.current = false
    }
  }, [phase])

  useEffect(() => {
    return () => {
      clearShowTimeouts()
      stopInputTimer()
    }
  }, [clearShowTimeouts, stopInputTimer])

  useEffect(() => {
    if (localStorage.getItem(SAVE_KEY)) {
      resumeGame()
    }
  }, [resumeGame])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.code !== 'Space' ||
        phaseRef.current !== 'result' ||
        levelCompleteRef.current
      ) {
        return
      }

      event.preventDefault()
      startGameRef.current()
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return {
    phase,
    level,
    sequence,
    playerInput,
    score,
    elapsedMs,
    activeIndex,
    resultMap,
    roundHistory,
    roundCount,
    isPaused,
    levelComplete,
    startGame,
    handleCellClick,
    nextLevel,
    resetGame,
    pauseGame,
    resumeGame,
  }
}
