import { useCallback, useEffect, useRef, useState } from "react";
import {
  MIN_ROUNDS_TO_COMPLETE,
  PRIMUS_LEVEL,
  PRIMUS_LEVEL_COMPLETE_THRESHOLD,
  PRIMUS_MAX_ROUND_HISTORY,
  PRIMUS_ROUND_TIME_MS,
  PRIMUS_SAVE_KEY,
} from "../utils/constants";
import { generateBoard } from "../utils/primus/numbers";
import { calculateScore } from "../utils/scoring";

export type PrimusPhase = "idle" | "input" | "result";

export type PrimusResultStatus = "correct" | "wrong" | "missed";

export type PrimusResultMap = Record<number, PrimusResultStatus>;

interface PrimusSave {
  level: number;
  roundHistory: number[];
  roundCount: number;
  score: number;
}

export interface UsePrimusReturn {
  phase: PrimusPhase;
  board: number[];
  primeIndices: number[];
  playerInput: number[];
  wrongInputIndices: number[];
  resultMap: PrimusResultMap;
  score: number;
  elapsedMs: number;
  remainingMs: number;
  roundHistory: number[];
  roundCount: number;
  levelComplete: boolean;
  level: number;
  handleCellClick: (index: number) => void;
  startRound: () => void;
  nextRound: () => void;
}

// Tur geçmişine yeni skoru ekler ve sliding window uygular
function appendRoundScore(history: number[], nextScore: number): number[] {
  const nextHistory = [...history, nextScore];

  if (nextHistory.length <= PRIMUS_MAX_ROUND_HISTORY) {
    return nextHistory;
  }

  return nextHistory.slice(-PRIMUS_MAX_ROUND_HISTORY);
}

// Bölüm tamamlanma durumunu hesaplar
function calculateLevelComplete(roundHistory: number[]): boolean {
  if (roundHistory.length < MIN_ROUNDS_TO_COMPLETE) {
    return false;
  }

  const average =
    roundHistory.reduce((sum, value) => sum + value, 0) / roundHistory.length;

  return average >= PRIMUS_LEVEL_COMPLETE_THRESHOLD;
}

// localStorage'dan kayıtlı Primus verisini okur
function readSavedGame(): PrimusSave | null {
  const saved = localStorage.getItem(PRIMUS_SAVE_KEY);

  if (!saved) {
    return null;
  }

  try {
    return JSON.parse(saved) as PrimusSave;
  } catch {
    return null;
  }
}

// Primus oyun state ve tur mantığını yönetir
export function usePrimus(): UsePrimusReturn {
  const [phase, setPhase] = useState<PrimusPhase>("idle");
  const [board, setBoard] = useState<number[]>([]);
  const [primeIndices, setPrimeIndices] = useState<number[]>([]);
  const [playerInput, setPlayerInput] = useState<number[]>([]);
  const [wrongInputIndices, setWrongInputIndices] = useState<number[]>([]);
  const [resultMap, setResultMap] = useState<PrimusResultMap>({});
  const [score, setScore] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [remainingMs, setRemainingMs] = useState(PRIMUS_ROUND_TIME_MS);
  const [roundHistory, setRoundHistory] = useState<number[]>([]);
  const [roundCount, setRoundCount] = useState(0);
  const [levelComplete, setLevelComplete] = useState(false);
  const [level] = useState(PRIMUS_LEVEL);

  const phaseRef = useRef<PrimusPhase>("idle");
  const boardRef = useRef<number[]>([]);
  const primeIndicesRef = useRef<number[]>([]);
  const playerInputRef = useRef<number[]>([]);
  const wrongInputIndicesRef = useRef<number[]>([]);
  const roundHistoryRef = useRef<number[]>([]);
  const roundCountRef = useRef(0);
  const inputStartedAtRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const finishRoundRef = useRef<() => void>(() => {});

  phaseRef.current = phase;
  boardRef.current = board;
  primeIndicesRef.current = primeIndices;
  playerInputRef.current = playerInput;
  wrongInputIndicesRef.current = wrongInputIndices;
  roundHistoryRef.current = roundHistory;

  // Input fazı sayacını durdurur
  const stopTimer = useCallback((): void => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Tur sonucu haritasını oluşturur
  const buildResultMap = useCallback((): PrimusResultMap => {
    const nextResultMap: PrimusResultMap = {};
    const selectedSet = new Set([
      ...playerInputRef.current,
      ...wrongInputIndicesRef.current,
    ]);

    for (const index of playerInputRef.current) {
      nextResultMap[index] = "correct";
    }

    for (const index of wrongInputIndicesRef.current) {
      nextResultMap[index] = "wrong";
    }

    for (const index of primeIndicesRef.current) {
      if (!selectedSet.has(index)) {
        nextResultMap[index] = "missed";
      }
    }

    return nextResultMap;
  }, []);

  // Turu sonlandırır, skoru hesaplar ve result fazına geçer
  const finishRound = useCallback((): void => {
    if (phaseRef.current !== "input") {
      return;
    }

    stopTimer();

    const elapsed = Date.now() - inputStartedAtRef.current;
    const correctCount = playerInputRef.current.length;
    const wrongCount = wrongInputIndicesRef.current.length;
    const totalCount = primeIndicesRef.current.length + wrongCount;
    const nextScore =
      totalCount > 0
        ? calculateScore(correctCount, totalCount, elapsed)
        : 0;

    const nextHistory = appendRoundScore(roundHistoryRef.current, nextScore);
    const nextRoundCount = roundCountRef.current + 1;
    const nextLevelComplete = calculateLevelComplete(nextHistory);

    roundHistoryRef.current = nextHistory;
    roundCountRef.current = nextRoundCount;
    setElapsedMs(elapsed);
    setRemainingMs(0);
    setScore(nextScore);
    setResultMap(buildResultMap());
    setRoundHistory(nextHistory);
    setRoundCount(nextRoundCount);
    setLevelComplete(nextLevelComplete);
    setPhase("result");

    localStorage.setItem(
      PRIMUS_SAVE_KEY,
      JSON.stringify({
        level,
        roundHistory: nextHistory,
        roundCount: nextRoundCount,
        score: nextScore,
      }),
    );
  }, [buildResultMap, level, stopTimer]);

  finishRoundRef.current = finishRound;

  // Input fazı geri sayım sayacını başlatır
  const startTimer = useCallback((): void => {
    stopTimer();
    inputStartedAtRef.current = Date.now();
    setRemainingMs(PRIMUS_ROUND_TIME_MS);

    timerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - inputStartedAtRef.current;
      const nextRemaining = Math.max(PRIMUS_ROUND_TIME_MS - elapsed, 0);

      setRemainingMs(nextRemaining);

      if (nextRemaining <= 0) {
        finishRoundRef.current();
      }
    }, 50);
  }, [stopTimer]);

  // Yeni tur başlatır: tahta üretir ve input fazına geçer
  const startRound = useCallback((): void => {
    stopTimer();

    const generatedBoard = generateBoard();

    boardRef.current = generatedBoard.values;
    primeIndicesRef.current = generatedBoard.primeIndices;
    playerInputRef.current = [];
    wrongInputIndicesRef.current = [];

    setBoard(generatedBoard.values);
    setPrimeIndices(generatedBoard.primeIndices);
    setPlayerInput([]);
    setWrongInputIndices([]);
    setResultMap({});
    setScore(0);
    setElapsedMs(0);
    setPhase("input");
    startTimer();
  }, [startTimer, stopTimer]);

  // Result fazından sonraki tura geçer
  const nextRound = useCallback((): void => {
    if (phaseRef.current !== "result" || levelComplete) {
      return;
    }

    setPhase("idle");
  }, [levelComplete]);

  // Hücre tıklamasını işler (seçiliyse geri alır / değilse ekler)
  const handleCellClick = useCallback(
    (index: number): void => {
      if (phaseRef.current !== "input") {
        return;
      }

      const isAlreadyCorrect = playerInputRef.current.includes(index);
      const isAlreadyWrong = wrongInputIndicesRef.current.includes(index);

      if (isAlreadyCorrect) {
        const nextInput = playerInputRef.current.filter(
          (selectedIndex) => selectedIndex !== index,
        );
        playerInputRef.current = nextInput;
        setPlayerInput(nextInput);
      } else if (isAlreadyWrong) {
        const nextWrong = wrongInputIndicesRef.current.filter(
          (selectedIndex) => selectedIndex !== index,
        );
        wrongInputIndicesRef.current = nextWrong;
        setWrongInputIndices(nextWrong);
      } else {
        const isPrimeCell = primeIndicesRef.current.includes(index);

        if (isPrimeCell) {
          const nextInput = [...playerInputRef.current, index];
          playerInputRef.current = nextInput;
          setPlayerInput(nextInput);
        } else {
          const nextWrong = [...wrongInputIndicesRef.current, index];
          wrongInputIndicesRef.current = nextWrong;
          setWrongInputIndices(nextWrong);
        }
      }

      // Mevcut seçim sayısı === asal sayısı ise turu gerçek elapsedMs ile bitir
      const currentSelectionCount =
        playerInputRef.current.length + wrongInputIndicesRef.current.length;

      if (currentSelectionCount === primeIndicesRef.current.length) {
        finishRoundRef.current();
      }
    },
    [],
  );

  // Kayıtlı ilerlemeyi yükle
  useEffect(() => {
    const savedGame = readSavedGame();

    if (!savedGame) {
      return;
    }

    roundHistoryRef.current = savedGame.roundHistory;
    roundCountRef.current = savedGame.roundCount;
    setRoundHistory(savedGame.roundHistory);
    setRoundCount(savedGame.roundCount);
    setScore(savedGame.score);
    setLevelComplete(calculateLevelComplete(savedGame.roundHistory));
  }, []);

  useEffect(() => {
    return () => {
      stopTimer();
    };
  }, [stopTimer]);

  return {
    phase,
    board,
    primeIndices,
    playerInput,
    wrongInputIndices,
    resultMap,
    score,
    elapsedMs,
    remainingMs,
    roundHistory,
    roundCount,
    levelComplete,
    level,
    handleCellClick,
    startRound,
    nextRound,
  };
}
