import { useCallback, useEffect, useRef, useState } from 'react'
import { MIN_ROUNDS_TO_COMPLETE } from '../utils/constants'
import { getLevelConfig } from '../utils/levels'
import { calculateScore } from '../utils/scoring'

export type GamePhase = 'idle' | 'showing' | 'input' | 'result'

export type ResultStatus = 'correct' | 'wrong-order' | 'wrong' | 'missed'

export type EmojiType = 'cat' | 'bear'

export interface EmojiCell {
  index: number
  emoji: EmojiType
}

export type InputPhase = EmojiType | null

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
  emojiSequence: EmojiCell[]
  currentInputCategory: InputPhase
  categoryOrder: EmojiType[]
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

// Her kareye rastgele emoji atar; en az bir kedi ve bir ayı garantiler
function generateEmojiSequence(cellIndices: number[]): EmojiCell[] {
  const emojis: EmojiType[] = cellIndices.map(() =>
    Math.random() < 0.5 ? 'cat' : 'bear',
  )

  if (!emojis.includes('cat')) {
    emojis[Math.floor(Math.random() * emojis.length)] = 'cat'
  }

  if (!emojis.includes('bear')) {
    const catOnlyIndex =
      emojis.filter((emoji) => emoji === 'cat').length === 1
        ? emojis.findIndex((emoji) => emoji === 'cat')
        : -1

    let bearIndex = Math.floor(Math.random() * emojis.length)

    while (bearIndex === catOnlyIndex) {
      bearIndex = Math.floor(Math.random() * emojis.length)
    }

    emojis[bearIndex] = 'bear'
  }

  return cellIndices.map((index, position) => ({
    index,
    emoji: emojis[position],
  }))
}

// O turda kategorilerin hangi sırayla sorulacağını rastgele belirler
function generateCategoryOrder(): EmojiType[] {
  return Math.random() < 0.5 ? ['cat', 'bear'] : ['bear', 'cat']
}

// Belirli kategorideki kareleri gösterim sırasına göre döner
function getCategoryCellIndices(
  emojiSequence: EmojiCell[],
  category: EmojiType,
): number[] {
  return emojiSequence
    .filter((cell) => cell.emoji === category)
    .map((cell) => cell.index)
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
  const [emojiSequence, setEmojiSequence] = useState<EmojiCell[]>([])
  const [currentInputCategory, setCurrentInputCategory] = useState<InputPhase>(null)
  const [categoryOrder, setCategoryOrder] = useState<EmojiType[]>([])

  const showTimeoutsRef = useRef<number[]>([])
  const inputTimerRef = useRef<number | null>(null)
  const inputStartedAtRef = useRef(0)
  const sequenceRef = useRef<number[]>([])
  const emojiSequenceRef = useRef<EmojiCell[]>([])
  const categoryOrderRef = useRef<EmojiType[]>([])
  const currentInputCategoryRef = useRef<InputPhase>(null)
  const categoryProgressRef = useRef(0)
  const roundModeRef = useRef<'normal' | 'emoji'>('normal')
  const elapsedMsRef = useRef(0)
  const roundHistoryRef = useRef<number[]>([])
  const phaseRef = useRef<GamePhase>('idle')
  const levelCompleteRef = useRef(false)
  const roundRecordedRef = useRef(false)
  const startGameRef = useRef<() => void>(() => {})

  phaseRef.current = phase
  roundHistoryRef.current = roundHistory
  levelCompleteRef.current = levelComplete
  emojiSequenceRef.current = emojiSequence
  categoryOrderRef.current = categoryOrder
  currentInputCategoryRef.current = currentInputCategory

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

  // Turu tamamlar ve result fazına geçer
  const completeRound = useCallback(
    (finalPlayerInput: number[]) => {
      stopInputTimer()

      const targetSequence =
        roundModeRef.current === 'emoji'
          ? emojiSequenceRef.current.map((cell) => cell.index)
          : sequenceRef.current

      const correctCount = countCorrectInputs(finalPlayerInput, targetSequence)
      const roundScore = calculateScore(
        correctCount,
        targetSequence.length,
        elapsedMsRef.current,
      )

      setResultMap(buildResultMap(targetSequence, finalPlayerInput))
      recordRoundResult(roundScore)
      setPhase('result')
      setCurrentInputCategory(null)
      currentInputCategoryRef.current = null
    },
    [recordRoundResult, stopInputTimer],
  )

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

      roundModeRef.current = config.mode
      sequenceRef.current = nextSequence
      setSequence(nextSequence)
      setPlayerInput([])
      setResultMap({})
      setActiveIndex(null)
      setElapsedMs(0)
      elapsedMsRef.current = 0
      categoryProgressRef.current = 0

      if (config.mode === 'emoji') {
        const nextEmojiSequence = generateEmojiSequence(nextSequence)
        const nextCategoryOrder = generateCategoryOrder()

        emojiSequenceRef.current = nextEmojiSequence
        categoryOrderRef.current = nextCategoryOrder
        setEmojiSequence(nextEmojiSequence)
        setCategoryOrder(nextCategoryOrder)
        setCurrentInputCategory(null)
        currentInputCategoryRef.current = null
      } else {
        emojiSequenceRef.current = []
        categoryOrderRef.current = []
        setEmojiSequence([])
        setCategoryOrder([])
        setCurrentInputCategory(null)
        currentInputCategoryRef.current = null
      }

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

        if (config.mode === 'emoji') {
          const firstCategory = categoryOrderRef.current[0]
          currentInputCategoryRef.current = firstCategory
          setCurrentInputCategory(firstCategory)
          categoryProgressRef.current = 0
        }

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

  // Emoji modunda kategori bazlı tıklamayı işler
  const handleEmojiCellClick = useCallback(
    (index: number, previousInput: number[]) => {
      const category = currentInputCategoryRef.current

      if (!category) {
        return previousInput
      }

      const cell = emojiSequenceRef.current.find((item) => item.index === index)

      if (!cell || cell.emoji !== category) {
        return previousInput
      }

      const expectedCells = getCategoryCellIndices(
        emojiSequenceRef.current,
        category,
      )
      const expectedIndex = expectedCells[categoryProgressRef.current]

      if (index !== expectedIndex) {
        return previousInput
      }

      const nextPlayerInput = [...previousInput, index]
      categoryProgressRef.current += 1

      if (categoryProgressRef.current < expectedCells.length) {
        return nextPlayerInput
      }

      const currentCategoryIndex = categoryOrderRef.current.indexOf(category)

      if (currentCategoryIndex < categoryOrderRef.current.length - 1) {
        const nextCategory = categoryOrderRef.current[currentCategoryIndex + 1]

        categoryProgressRef.current = 0
        currentInputCategoryRef.current = nextCategory
        setCurrentInputCategory(nextCategory)

        return nextPlayerInput
      }

      completeRound(nextPlayerInput)
      return nextPlayerInput
    },
    [completeRound],
  )

  // Oyuncu kare tıklamasını işler
  const handleCellClick = useCallback(
    (index: number) => {
      if (phase !== 'input') {
        return
      }

      if (roundModeRef.current === 'emoji') {
        setPlayerInput((previousInput) =>
          handleEmojiCellClick(index, previousInput),
        )
        return
      }

      setPlayerInput((previousInput) => {
        const nextPlayerInput = [...previousInput, index]

        if (nextPlayerInput.length < sequenceRef.current.length) {
          return nextPlayerInput
        }

        completeRound(nextPlayerInput)
        return nextPlayerInput
      })
    },
    [completeRound, handleEmojiCellClick, phase],
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
    emojiSequenceRef.current = []
    categoryOrderRef.current = []
    currentInputCategoryRef.current = null
    categoryProgressRef.current = 0
    roundModeRef.current = 'normal'
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
    setEmojiSequence([])
    setCategoryOrder([])
    setCurrentInputCategory(null)
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
    emojiSequence,
    currentInputCategory,
    categoryOrder,
    startGame,
    handleCellClick,
    nextLevel,
    resetGame,
    pauseGame,
    resumeGame,
  }
}
