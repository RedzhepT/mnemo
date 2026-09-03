import { useCallback, useEffect, useRef, useState } from "react";
import {
  MIN_ROUNDS_TO_COMPLETE,
  PRIMUS_BRIEFING_MS,
  PRIMUS_LEVEL,
  PRIMUS_LEVEL_COMPLETE_THRESHOLD,
  PRIMUS_MAX_LEVEL,
  PRIMUS_MAX_ROUND_HISTORY,
  PRIMUS_PRACTICE_SAVE_KEY,
  PRIMUS_SAVE_KEY,
} from "../utils/constants";
import {
  getPracticeLevelConfig,
  getPrimusLevelConfig,
  getRoundTypeForLevel,
  type PrimusLevelConfig,
} from "../utils/primus/levels";
import {
  generateBoard,
  pickRoundType,
  type PrimusRoundType,
} from "../utils/primus/numbers";
import { calculateScore } from "../utils/scoring";

export type PrimusPhase = "idle" | "briefing" | "input" | "result";

export type PrimusPlayMode = "campaign" | "practice";

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
  playMode: PrimusPlayMode;
  board: number[];
  gridSize: number;
  targetIndices: number[];
  roundType: PrimusRoundType;
  playerInput: number[];
  wrongInputIndices: number[];
  resultMap: PrimusResultMap;
  score: number;
  elapsedMs: number;
  remainingMs: number;
  roundTimeMs: number;
  roundHistory: number[];
  roundCount: number;
  levelComplete: boolean;
  level: number;
  levelConfig: PrimusLevelConfig;
  handleCellClick: (index: number) => void;
  startRound: () => void;
  nextRound: () => void;
  skipBriefing: () => void;
  nextLevel: () => void;
  goToLevel: (targetLevel: number) => void;
  enterPractice: () => void;
  exitPractice: () => void;
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

// localStorage'dan Primus kaydını okur
function readSavedGame(saveKey: string): PrimusSave | null {
  const saved = localStorage.getItem(saveKey);

  if (!saved) {
    return null;
  }

  try {
    return JSON.parse(saved) as PrimusSave;
  } catch {
    return null;
  }
}

// Aktif moda göre kayıt anahtarını döner
function getSaveKey(playMode: PrimusPlayMode): string {
  return playMode === "practice" ? PRIMUS_PRACTICE_SAVE_KEY : PRIMUS_SAVE_KEY;
}

// Primus oyun state ve tur mantığını yönetir
export function usePrimus(): UsePrimusReturn {
  const [playMode, setPlayMode] = useState<PrimusPlayMode>("campaign");
  const [phase, setPhase] = useState<PrimusPhase>("idle");
  const [board, setBoard] = useState<number[]>([]);
  const [gridSize, setGridSize] = useState(3);
  const [targetIndices, setTargetIndices] = useState<number[]>([]);
  const [roundType, setRoundType] = useState<PrimusRoundType>("asal");
  const [playerInput, setPlayerInput] = useState<number[]>([]);
  const [wrongInputIndices, setWrongInputIndices] = useState<number[]>([]);
  const [resultMap, setResultMap] = useState<PrimusResultMap>({});
  const [score, setScore] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [roundTimeMs, setRoundTimeMs] = useState(
    getPrimusLevelConfig(PRIMUS_LEVEL).roundTimeSec * 1000,
  );
  const [remainingMs, setRemainingMs] = useState(
    getPrimusLevelConfig(PRIMUS_LEVEL).roundTimeSec * 1000,
  );
  const [roundHistory, setRoundHistory] = useState<number[]>([]);
  const [roundCount, setRoundCount] = useState(0);
  const [levelComplete, setLevelComplete] = useState(false);
  const [level, setLevel] = useState(PRIMUS_LEVEL);
  const [levelConfig, setLevelConfig] = useState(
    getPrimusLevelConfig(PRIMUS_LEVEL),
  );

  const phaseRef = useRef<PrimusPhase>("idle");
  const playModeRef = useRef<PrimusPlayMode>("campaign");
  const boardRef = useRef<number[]>([]);
  const targetIndicesRef = useRef<number[]>([]);
  const playerInputRef = useRef<number[]>([]);
  const wrongInputIndicesRef = useRef<number[]>([]);
  const roundHistoryRef = useRef<number[]>([]);
  const roundCountRef = useRef(0);
  const levelRef = useRef(PRIMUS_LEVEL);
  const levelCompleteRef = useRef(false);
  const recentRoundTypesRef = useRef<PrimusRoundType[]>([]);
  const roundTimeMsRef = useRef(roundTimeMs);
  const inputStartedAtRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const briefingTimerRef = useRef<number | null>(null);
  const finishRoundRef = useRef<() => void>(() => {});
  const beginInputPhaseRef = useRef<() => void>(() => {});

  phaseRef.current = phase;
  playModeRef.current = playMode;
  boardRef.current = board;
  targetIndicesRef.current = targetIndices;
  playerInputRef.current = playerInput;
  wrongInputIndicesRef.current = wrongInputIndices;
  roundHistoryRef.current = roundHistory;
  levelRef.current = level;
  levelCompleteRef.current = levelComplete;
  roundTimeMsRef.current = roundTimeMs;

  // Input fazı sayacını durdurur
  const stopTimer = useCallback((): void => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Briefing fazı zamanlayıcısını durdurur
  const stopBriefingTimer = useCallback((): void => {
    if (briefingTimerRef.current !== null) {
      window.clearTimeout(briefingTimerRef.current);
      briefingTimerRef.current = null;
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

    for (const index of targetIndicesRef.current) {
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
    const totalCount = targetIndicesRef.current.length + wrongCount;
    const nextScore =
      totalCount > 0
        ? calculateScore(correctCount, totalCount, elapsed)
        : 0;

    const nextHistory = appendRoundScore(roundHistoryRef.current, nextScore);
    const nextRoundCount = roundCountRef.current + 1;
    const nextLevelComplete =
      playModeRef.current === "practice"
        ? false
        : calculateLevelComplete(nextHistory);

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
      getSaveKey(playModeRef.current),
      JSON.stringify({
        level: playModeRef.current === "practice" ? 0 : levelRef.current,
        roundHistory: nextHistory,
        roundCount: nextRoundCount,
        score: nextScore,
      }),
    );
  }, [buildResultMap, stopTimer]);

  finishRoundRef.current = finishRound;

  // Input fazı geri sayım sayacını başlatır
  const startTimer = useCallback((): void => {
    stopTimer();
    inputStartedAtRef.current = Date.now();
    const duration = roundTimeMsRef.current;
    setRemainingMs(duration);

    timerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - inputStartedAtRef.current;
      const nextRemaining = Math.max(duration - elapsed, 0);

      setRemainingMs(nextRemaining);

      if (nextRemaining <= 0) {
        finishRoundRef.current();
      }
    }, 50);
  }, [stopTimer]);

  // Briefing sonrası input fazına geçer ve oyun süresini başlatır
  const beginInputPhase = useCallback((): void => {
    setPhase("input");
    startTimer();
  }, [startTimer]);

  beginInputPhaseRef.current = beginInputPhase;

  // Briefing fazını başlatır
  const startBriefingPhase = useCallback((): void => {
    stopBriefingTimer();
    stopTimer();
    setPhase("briefing");
    setRemainingMs(roundTimeMsRef.current);

    briefingTimerRef.current = window.setTimeout(() => {
      briefingTimerRef.current = null;

      if (phaseRef.current === "briefing") {
        beginInputPhaseRef.current();
      }
    }, PRIMUS_BRIEFING_MS);
  }, [stopBriefingTimer, stopTimer]);

  // Briefing fazını erken kapatır
  const skipBriefing = useCallback((): void => {
    if (phaseRef.current !== "briefing") {
      return;
    }

    stopBriefingTimer();
    beginInputPhaseRef.current();
  }, [stopBriefingTimer]);

  // Yeni tur başlatır (campaign veya practice config)
  const startRound = useCallback((): void => {
    stopTimer();
    stopBriefingTimer();

    const isPractice = playModeRef.current === "practice";
    const config = isPractice
      ? getPracticeLevelConfig()
      : getPrimusLevelConfig(levelRef.current);

    const nextRoundType = isPractice
      ? pickRoundType(recentRoundTypesRef.current)
      : getRoundTypeForLevel(config.questionMode);

    recentRoundTypesRef.current = [
      ...recentRoundTypesRef.current,
      nextRoundType,
    ];

    const generatedBoard = generateBoard({
      gridSize: config.gridSize,
      targetCount: config.targetCount,
      roundType: nextRoundType,
      digitMode: config.digitMode,
      oneDigitMin: config.oneDigitMin,
      oneDigitMax: config.oneDigitMax,
    });

    const nextRoundTimeMs = config.roundTimeSec * 1000;

    boardRef.current = generatedBoard.values;
    targetIndicesRef.current = generatedBoard.targetIndices;
    playerInputRef.current = [];
    wrongInputIndicesRef.current = [];
    roundTimeMsRef.current = nextRoundTimeMs;

    setBoard(generatedBoard.values);
    setGridSize(config.gridSize);
    setTargetIndices(generatedBoard.targetIndices);
    setRoundType(generatedBoard.roundType);
    setLevelConfig(config);
    setRoundTimeMs(nextRoundTimeMs);
    setPlayerInput([]);
    setWrongInputIndices([]);
    setResultMap({});
    setScore(0);
    setElapsedMs(0);

    startBriefingPhase();
  }, [startBriefingPhase, stopBriefingTimer, stopTimer]);

  // Result fazından doğrudan yeni tur başlatır
  const nextRound = useCallback((): void => {
    if (phaseRef.current !== "result" || levelCompleteRef.current) {
      return;
    }

    startRound();
  }, [startRound]);

  // Sonraki bölüme geçer (yalnızca campaign)
  const nextLevel = useCallback((): void => {
    if (playModeRef.current !== "campaign" || !levelCompleteRef.current) {
      return;
    }

    const newLevel = Math.min(levelRef.current + 1, PRIMUS_MAX_LEVEL);

    stopTimer();
    stopBriefingTimer();
    recentRoundTypesRef.current = [];
    roundHistoryRef.current = [];
    roundCountRef.current = 0;
    levelRef.current = newLevel;
    levelCompleteRef.current = false;

    setLevel(newLevel);
    setLevelConfig(getPrimusLevelConfig(newLevel));
    setRoundHistory([]);
    setRoundCount(0);
    setLevelComplete(false);
    setScore(0);
    setBoard([]);
    setTargetIndices([]);
    setPlayerInput([]);
    setWrongInputIndices([]);
    setResultMap({});
    setPhase("idle");

    localStorage.setItem(
      PRIMUS_SAVE_KEY,
      JSON.stringify({
        level: newLevel,
        roundHistory: [],
        roundCount: 0,
        score: 0,
      }),
    );
  }, [stopBriefingTimer, stopTimer]);

  // Belirtilen bölüme atlar (campaign)
  const goToLevel = useCallback(
    (targetLevel: number): void => {
      if (playModeRef.current !== "campaign") {
        return;
      }

      stopTimer();
      stopBriefingTimer();

      const clampedLevel = Math.min(Math.max(targetLevel, 1), PRIMUS_MAX_LEVEL);

      recentRoundTypesRef.current = [];
      roundHistoryRef.current = [];
      roundCountRef.current = 0;
      levelRef.current = clampedLevel;
      levelCompleteRef.current = false;

      setLevel(clampedLevel);
      setLevelConfig(getPrimusLevelConfig(clampedLevel));
      setRoundHistory([]);
      setRoundCount(0);
      setLevelComplete(false);
      setScore(0);
      setBoard([]);
      setTargetIndices([]);
      setPlayerInput([]);
      setWrongInputIndices([]);
      setResultMap({});
      setPhase("idle");

      localStorage.setItem(
        PRIMUS_SAVE_KEY,
        JSON.stringify({
          level: clampedLevel,
          roundHistory: [],
          roundCount: 0,
          score: 0,
        }),
      );
    },
    [stopBriefingTimer, stopTimer],
  );

  // DEBUG alıştırma moduna geçer
  const enterPractice = useCallback((): void => {
    stopTimer();
    stopBriefingTimer();

    playModeRef.current = "practice";
    recentRoundTypesRef.current = [];
    setPlayMode("practice");

    const savedPractice = readSavedGame(PRIMUS_PRACTICE_SAVE_KEY);
    roundHistoryRef.current = savedPractice?.roundHistory ?? [];
    roundCountRef.current = savedPractice?.roundCount ?? 0;
    levelCompleteRef.current = false;

    setLevelConfig(getPracticeLevelConfig());
    setRoundHistory(savedPractice?.roundHistory ?? []);
    setRoundCount(savedPractice?.roundCount ?? 0);
    setScore(savedPractice?.score ?? 0);
    setLevelComplete(false);
    setBoard([]);
    setTargetIndices([]);
    setPlayerInput([]);
    setWrongInputIndices([]);
    setResultMap({});
    setPhase("idle");
  }, [stopBriefingTimer, stopTimer]);

  // Alıştırmadan ana oyuna döner
  const exitPractice = useCallback((): void => {
    stopTimer();
    stopBriefingTimer();

    playModeRef.current = "campaign";
    recentRoundTypesRef.current = [];
    setPlayMode("campaign");

    const savedCampaign = readSavedGame(PRIMUS_SAVE_KEY);
    const restoredLevel = Math.min(
      Math.max(savedCampaign?.level ?? PRIMUS_LEVEL, 1),
      PRIMUS_MAX_LEVEL,
    );

    roundHistoryRef.current = savedCampaign?.roundHistory ?? [];
    roundCountRef.current = savedCampaign?.roundCount ?? 0;
    levelRef.current = restoredLevel;
    levelCompleteRef.current = calculateLevelComplete(
      savedCampaign?.roundHistory ?? [],
    );

    setLevel(restoredLevel);
    setLevelConfig(getPrimusLevelConfig(restoredLevel));
    setRoundHistory(savedCampaign?.roundHistory ?? []);
    setRoundCount(savedCampaign?.roundCount ?? 0);
    setScore(savedCampaign?.score ?? 0);
    setLevelComplete(calculateLevelComplete(savedCampaign?.roundHistory ?? []));
    setBoard([]);
    setTargetIndices([]);
    setPlayerInput([]);
    setWrongInputIndices([]);
    setResultMap({});
    setPhase("idle");
  }, [stopBriefingTimer, stopTimer]);

  // Hücre tıklamasını işler
  const handleCellClick = useCallback((index: number): void => {
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
      const isTargetCell = targetIndicesRef.current.includes(index);

      if (isTargetCell) {
        const nextInput = [...playerInputRef.current, index];
        playerInputRef.current = nextInput;
        setPlayerInput(nextInput);
      } else {
        const nextWrong = [...wrongInputIndicesRef.current, index];
        wrongInputIndicesRef.current = nextWrong;
        setWrongInputIndices(nextWrong);
      }
    }

    const currentSelectionCount =
      playerInputRef.current.length + wrongInputIndicesRef.current.length;

    if (currentSelectionCount === targetIndicesRef.current.length) {
      finishRoundRef.current();
    }
  }, []);

  // Briefing fazında Space ile erken geçiş
  useEffect(() => {
    if (phase !== "briefing") {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.code === "Space") {
        event.preventDefault();
        skipBriefing();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [phase, skipBriefing]);

  // Kampanya kaydını yükle
  useEffect(() => {
    const savedGame = readSavedGame(PRIMUS_SAVE_KEY);

    if (!savedGame) {
      return;
    }

    const restoredLevel = Math.min(
      Math.max(savedGame.level || PRIMUS_LEVEL, 1),
      PRIMUS_MAX_LEVEL,
    );

    roundHistoryRef.current = savedGame.roundHistory;
    roundCountRef.current = savedGame.roundCount;
    levelRef.current = restoredLevel;
    levelCompleteRef.current = calculateLevelComplete(savedGame.roundHistory);

    setLevel(restoredLevel);
    setLevelConfig(getPrimusLevelConfig(restoredLevel));
    setRoundHistory(savedGame.roundHistory);
    setRoundCount(savedGame.roundCount);
    setScore(savedGame.score);
    setLevelComplete(calculateLevelComplete(savedGame.roundHistory));
  }, []);

  useEffect(() => {
    return () => {
      stopTimer();
      stopBriefingTimer();
    };
  }, [stopBriefingTimer, stopTimer]);

  return {
    phase,
    playMode,
    board,
    gridSize,
    targetIndices,
    roundType,
    playerInput,
    wrongInputIndices,
    resultMap,
    score,
    elapsedMs,
    remainingMs,
    roundTimeMs,
    roundHistory,
    roundCount,
    levelComplete,
    level,
    levelConfig,
    handleCellClick,
    startRound,
    nextRound,
    skipBriefing,
    nextLevel,
    goToLevel,
    enterPractice,
    exitPractice,
  };
}
