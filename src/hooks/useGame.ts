import { useCallback, useEffect, useRef, useState } from "react";
import { MAX_LEVEL, MIN_ROUNDS_TO_COMPLETE } from "../utils/constants";
import { getLevelConfig } from "../utils/levels";
import { calculateScore } from "../utils/scoring";

export type GamePhase = "idle" | "showing" | "input" | "result";

export type ResultStatus = "correct" | "wrong-order" | "wrong" | "missed";

export type EmojiType =
  | "cat"
  | "bear"
  | "flamingo"
  | "panda"
  | "swan"
  | "gorilla"
  | "lion"
  | "eagle"
  | "snowman"
  | "fox"
  | "tiger"
  | "frog"
  | "butterfly"
  | "dolphin"
  | "unicorn"
  | "octopus"
  | "elephant"
  | "giraffe"
  | "crab";

export const EMOJI_MAP: Record<EmojiType, string> = {
  cat: "🐱",
  bear: "🐻",
  flamingo: "🦩",
  panda: "🐼",
  swan: "🦢",
  gorilla: "🦍",
  lion: "🦁",
  eagle: "🦅",
  snowman: "⛄",
  fox: "🦊",
  tiger: "🐯",
  frog: "🐸",
  butterfly: "🦋",
  dolphin: "🐬",
  unicorn: "🦄",
  octopus: "🐙",
  elephant: "🐘",
  giraffe: "🦒",
  crab: "🦀",
};

const ALL_EMOJI_TYPES: EmojiType[] = [
  "cat",
  "bear",
  "flamingo",
  "panda",
  "swan",
  "gorilla",
  "lion",
  "eagle",
  "snowman",
  "fox",
  "tiger",
  "frog",
  "butterfly",
  "dolphin",
  "unicorn",
  "octopus",
  "elephant",
  "giraffe",
  "crab",
];

export interface EmojiCell {
  index: number;
  emoji: EmojiType;
}

export type InputPhase = EmojiType | null;

export interface CellResult {
  index: number;
  status: ResultStatus;
}

export type ResultMap = Record<number, ResultStatus>;

const SAVE_KEY = "mnemo_save";
const MAX_ROUND_HISTORY = 10;
const LEVEL_COMPLETE_THRESHOLD = 90;

interface MnemoSave {
  level: number;
  roundHistory: number[];
  roundCount: number;
  score: number;
}

export interface UseGameReturn {
  phase: GamePhase;
  level: number;
  sequence: number[];
  playerInput: number[];
  allPlayerInputs: number[];
  correctPlayerInputs: number[];
  wrongInputIndices: number[];
  score: number;
  elapsedMs: number;
  activeIndex: number | null;
  resultMap: ResultMap;
  roundHistory: number[];
  roundCount: number;
  isPaused: boolean;
  levelComplete: boolean;
  emojiSequence: EmojiCell[];
  currentInputCategory: InputPhase;
  categoryOrder: EmojiType[];
  activeCategoryEmojis: [EmojiType, EmojiType] | null;
  startGame: () => void;
  handleCellClick: (index: number) => void;
  nextLevel: () => void;
  resetGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  jumpToLevel: (targetLevel: number) => void;
  selectLevelAndStart: (targetLevel: number) => void;
}

// Grid üzerinde tekrarsız rastgele kare indeksleri üretir
function generateSequence(gridSize: number, length: number): number[] {
  const cellCount = gridSize * gridSize;
  const pool = Array.from({ length: cellCount }, (_, index) => index);

  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, length);
}

// 19 emoji arasından rastgele 2 farklı kategori seçer
function pickActiveCategoryEmojis(): [EmojiType, EmojiType] {
  const pool = [...ALL_EMOJI_TYPES];

  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const first = pool[0];
  const second = pool[1];

  return Math.random() < 0.5 ? [first, second] : [second, first];
}

// Her kareye seçilen kategorilerden birini atar; her kategoriden en az bir kare garantiler
function generateEmojiSequence(
  cellIndices: number[],
  categories: [EmojiType, EmojiType],
): EmojiCell[] {
  const [firstCategory, secondCategory] = categories;
  const emojis: EmojiType[] = cellIndices.map(() =>
    Math.random() < 0.5 ? firstCategory : secondCategory,
  );

  if (!emojis.includes(firstCategory)) {
    emojis[Math.floor(Math.random() * emojis.length)] = firstCategory;
  }

  if (!emojis.includes(secondCategory)) {
    const onlyFirstIndex =
      emojis.filter((emoji) => emoji === firstCategory).length === 1
        ? emojis.findIndex((emoji) => emoji === firstCategory)
        : -1;

    let secondIndex = Math.floor(Math.random() * emojis.length);

    while (secondIndex === onlyFirstIndex) {
      secondIndex = Math.floor(Math.random() * emojis.length);
    }

    emojis[secondIndex] = secondCategory;
  }

  return cellIndices.map((index, position) => ({
    index,
    emoji: emojis[position],
  }));
}

// Bölümdeki 2 kategorinin input sırasını rastgele belirler
function shuffleCategoryOrder(
  categories: [EmojiType, EmojiType],
): EmojiType[] {
  return Math.random() < 0.5
    ? [categories[0], categories[1]]
    : [categories[1], categories[0]];
}

// Belirli kategorideki kareleri gösterim sırasına göre döner
function getCategoryCellIndices(
  emojiSequence: EmojiCell[],
  category: EmojiType,
): number[] {
  return emojiSequence
    .filter((cell) => cell.emoji === category)
    .map((cell) => cell.index);
}

// Emoji modunda categoryOrder'a göre beklenen oyuncu giriş dizisini üretir
function getExpectedEmojiInputSequence(
  categoryOrder: EmojiType[],
  emojiSequence: EmojiCell[],
): number[] {
  return categoryOrder.flatMap((category) =>
    getCategoryCellIndices(emojiSequence, category),
  );
}

// Oyuncu girişi ile hedef sırayı karşılaştırarak doğru tıklama sayısını döner
function countCorrectInputs(playerInput: number[], sequence: number[]): number {
  return playerInput.reduce(
    (count, value, index) => (value === sequence[index] ? count + 1 : count),
    0,
  );
}

// Result fazı için her karenin durum haritasını üretir
function buildResultMap(sequence: number[], playerInput: number[]): ResultMap {
  const resultMap: ResultMap = {};
  const sequenceSet = new Set(sequence);
  const clickedIndices = new Set<number>();

  playerInput.forEach((cellIndex, position) => {
    clickedIndices.add(cellIndex);

    if (!sequenceSet.has(cellIndex)) {
      resultMap[cellIndex] = "wrong";
      return;
    }

    if (cellIndex === sequence[position]) {
      resultMap[cellIndex] = "correct";
      return;
    }

    resultMap[cellIndex] = "wrong-order";
  });

  sequence.forEach((cellIndex) => {
    if (!clickedIndices.has(cellIndex)) {
      resultMap[cellIndex] = "missed";
    }
  });

  return resultMap;
}

// Tur geçmişine yeni puanı ekler, en fazla son 10 turu tutar
function appendRoundHistory(
  previousHistory: number[],
  roundScore: number,
): number[] {
  const nextHistory = [...previousHistory, roundScore];

  if (nextHistory.length <= MAX_ROUND_HISTORY) {
    return nextHistory;
  }

  return nextHistory.slice(-MAX_ROUND_HISTORY);
}

// En az MIN_ROUNDS_TO_COMPLETE tur ve ortalamasına göre bölüm tamamlanma durumunu hesaplar
function calculateLevelComplete(roundHistory: number[]): boolean {
  if (roundHistory.length < MIN_ROUNDS_TO_COMPLETE) {
    return false;
  }

  const average =
    roundHistory.reduce((sum, value) => sum + value, 0) / roundHistory.length;

  return average >= LEVEL_COMPLETE_THRESHOLD;
}

// localStorage'dan kayıtlı oyun verisini okur
function readSavedGame(): MnemoSave | null {
  const saved = localStorage.getItem(SAVE_KEY);

  if (!saved) {
    return null;
  }

  try {
    return JSON.parse(saved) as MnemoSave;
  } catch {
    return null;
  }
}

export function useGame(): UseGameReturn {
  const [phase, setPhase] = useState<GamePhase>("idle");
  const [level, setLevel] = useState(1);
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerInput, setPlayerInput] = useState<number[]>([]);
  const [allPlayerInputs, setAllPlayerInputs] = useState<number[]>([]);
  const [correctPlayerInputs, setCorrectPlayerInputs] = useState<number[]>([]);
  const [wrongInputIndices, setWrongInputIndices] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [resultMap, setResultMap] = useState<ResultMap>({});
  const [roundHistory, setRoundHistory] = useState<number[]>([]);
  const [roundCount, setRoundCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [levelComplete, setLevelComplete] = useState(false);
  const [emojiSequence, setEmojiSequence] = useState<EmojiCell[]>([]);
  const [currentInputCategory, setCurrentInputCategory] =
    useState<InputPhase>(null);
  const [categoryOrder, setCategoryOrder] = useState<EmojiType[]>([]);
  const [activeCategoryEmojis, setActiveCategoryEmojis] = useState<
    [EmojiType, EmojiType] | null
  >(null);

  const showTimeoutsRef = useRef<number[]>([]);
  const inputTimerRef = useRef<number | null>(null);
  const inputStartedAtRef = useRef(0);
  const sequenceRef = useRef<number[]>([]);
  const emojiSequenceRef = useRef<EmojiCell[]>([]);
  const categoryOrderRef = useRef<EmojiType[]>([]);
  const activeCategoryEmojisRef = useRef<[EmojiType, EmojiType] | null>(null);
  const levelForEmojisRef = useRef<number | null>(null);
  const currentInputCategoryRef = useRef<InputPhase>(null);
  const categoryProgressRef = useRef(0);
  const allPlayerInputsRef = useRef<number[]>([]);
  const playerInputRef = useRef<number[]>([]);
  const correctPlayerInputsRef = useRef<number[]>([]);
  const wrongInputIndicesRef = useRef<number[]>([]);
  const roundModeRef = useRef<"normal" | "emoji">("normal");
  const elapsedMsRef = useRef(0);
  const roundHistoryRef = useRef<number[]>([]);
  const phaseRef = useRef<GamePhase>("idle");
  const levelCompleteRef = useRef(false);
  const roundRecordedRef = useRef(false);
  const startGameRef = useRef<() => void>(() => {});

  phaseRef.current = phase;
  roundHistoryRef.current = roundHistory;
  levelCompleteRef.current = levelComplete;
  emojiSequenceRef.current = emojiSequence;
  categoryOrderRef.current = categoryOrder;
  activeCategoryEmojisRef.current = activeCategoryEmojis;
  currentInputCategoryRef.current = currentInputCategory;
  playerInputRef.current = playerInput;
  allPlayerInputsRef.current = allPlayerInputs;
  correctPlayerInputsRef.current = correctPlayerInputs;
  wrongInputIndicesRef.current = wrongInputIndices;

  // Zamanlayıcıları temizler
  const clearShowTimeouts = useCallback(() => {
    showTimeoutsRef.current.forEach((timeoutId) =>
      window.clearTimeout(timeoutId),
    );
    showTimeoutsRef.current = [];
  }, []);

  // Input fazı süre sayacını durdurur
  const stopInputTimer = useCallback(() => {
    if (inputTimerRef.current !== null) {
      window.clearInterval(inputTimerRef.current);
      inputTimerRef.current = null;
    }
  }, []);

  // Input fazı süre sayacını başlatır
  const startInputTimer = useCallback(() => {
    stopInputTimer();
    inputStartedAtRef.current = Date.now();
    elapsedMsRef.current = 0;
    setElapsedMs(0);

    inputTimerRef.current = window.setInterval(() => {
      const nextElapsed = Date.now() - inputStartedAtRef.current;
      elapsedMsRef.current = nextElapsed;
      setElapsedMs(nextElapsed);
    }, 50);
  }, [stopInputTimer]);

  // Oyuncu tıklama dizilerini sıfırlar
  const resetPlayerInputs = useCallback(() => {
    setPlayerInput([]);
    setAllPlayerInputs([]);
    setCorrectPlayerInputs([]);
    setWrongInputIndices([]);
    allPlayerInputsRef.current = [];
    playerInputRef.current = [];
    correctPlayerInputsRef.current = [];
    wrongInputIndicesRef.current = [];
  }, []);

  // Bölüm başında emoji modu için 2 kategori seçer
  const assignActiveCategoryEmojisForLevel = useCallback((roundLevel: number) => {
    const config = getLevelConfig(roundLevel);

    if (config.mode !== "emoji") {
      activeCategoryEmojisRef.current = null;
      levelForEmojisRef.current = null;
      setActiveCategoryEmojis(null);
      return;
    }

    const picked = pickActiveCategoryEmojis();
    activeCategoryEmojisRef.current = picked;
    levelForEmojisRef.current = roundLevel;
    setActiveCategoryEmojis(picked);
  }, []);

  // Tur sonucunu geçmişe kaydeder ve bölüm tamamlanma durumunu günceller
  const recordRoundResult = useCallback((roundScore: number) => {
    if (roundRecordedRef.current) {
      return;
    }

    roundRecordedRef.current = true;

    const nextHistory = appendRoundHistory(roundHistoryRef.current, roundScore);
    const average =
      nextHistory.reduce((sum, value) => sum + value, 0) / nextHistory.length;

    console.log("Tur bitti. Score:", roundScore);
    console.log("Yeni history:", nextHistory);
    console.log("History length:", nextHistory.length);
    console.log("Ortalama:", average);
    console.log(
      "levelComplete oldu mu:",
      nextHistory.length >= MIN_ROUNDS_TO_COMPLETE && average >= 90,
    );

    roundHistoryRef.current = nextHistory;
    setRoundHistory(nextHistory);
    setLevelComplete(calculateLevelComplete(nextHistory));
    setRoundCount((previousCount) => previousCount + 1);
    setScore(roundScore);
  }, []);

  // Turu tamamlar ve result fazına geçer
  const completeRound = useCallback(
    (finalPlayerInput: number[]) => {
      stopInputTimer();

      const targetSequence =
        roundModeRef.current === "emoji"
          ? getExpectedEmojiInputSequence(
              categoryOrderRef.current,
              emojiSequenceRef.current,
            )
          : sequenceRef.current;

      const correctCount = countCorrectInputs(finalPlayerInput, targetSequence);
      const roundScore = calculateScore(
        correctCount,
        targetSequence.length,
        elapsedMsRef.current,
      );

      if (roundModeRef.current === "emoji") {
        console.log("allPlayerInputs:", finalPlayerInput);
        console.log("Beklenen dizi:", targetSequence);
        console.log(
          "correctCount hesabı:",
          finalPlayerInput.map(
            (p, i) => `${p}===${targetSequence[i]} → ${p === targetSequence[i]}`,
          ),
        );
        console.log("Toplam doğru:", correctCount);
        console.log("Toplam beklenen:", targetSequence.length);
        console.log("Ham puan:", roundScore);
      }

      setResultMap(buildResultMap(targetSequence, finalPlayerInput));
      recordRoundResult(roundScore);
      setPhase("result");
      setCurrentInputCategory(null);
      currentInputCategoryRef.current = null;
      resetPlayerInputs();
    },
    [recordRoundResult, resetPlayerInputs, stopInputTimer],
  );

  // Belirtilen bölüm için gösterim fazını başlatır ve input fazına geçer
  const beginRound = useCallback(
    (roundLevel: number) => {
      clearShowTimeouts();
      stopInputTimer();

      const config = getLevelConfig(roundLevel);
      const nextSequence = generateSequence(
        config.gridSize,
        config.sequenceLength,
      );

      roundModeRef.current = config.mode;
      sequenceRef.current = nextSequence;
      setSequence(nextSequence);
      resetPlayerInputs();
      console.log("allPlayerInputs sıfırlandı");
      setResultMap({});
      setActiveIndex(null);
      setElapsedMs(0);
      elapsedMsRef.current = 0;
      categoryProgressRef.current = 0;

      if (config.mode === "emoji") {
        const categories =
          activeCategoryEmojisRef.current ?? pickActiveCategoryEmojis();
        const nextCategoryOrder = shuffleCategoryOrder(categories);
        const nextEmojiSequence = generateEmojiSequence(
          nextSequence,
          categories,
        );

        emojiSequenceRef.current = nextEmojiSequence;
        categoryOrderRef.current = nextCategoryOrder;
        setEmojiSequence(nextEmojiSequence);
        setCategoryOrder(nextCategoryOrder);
        setCurrentInputCategory(null);
        currentInputCategoryRef.current = null;

        console.log("=== YENİ TUR ===");
        console.log("Bölüm emojileri:", categories);
        console.log(
          "Emoji sırası:",
          nextEmojiSequence.map((e) => `${e.index}:${e.emoji}`),
        );
        console.log("Kategori sırası:", nextCategoryOrder);
      } else {
        emojiSequenceRef.current = [];
        categoryOrderRef.current = [];
        setEmojiSequence([]);
        setCategoryOrder([]);
        setCurrentInputCategory(null);
        currentInputCategoryRef.current = null;
      }

      setPhase("showing");

      nextSequence.forEach((cellIndex, index) => {
        const showTimeout = window.setTimeout(() => {
          setActiveIndex(cellIndex);
        }, index * config.showTimeMs);
        showTimeoutsRef.current.push(showTimeout);
      });

      const finishTimeout = window.setTimeout(() => {
        setActiveIndex(null);
        setPhase("input");

        if (config.mode === "emoji") {
          const firstCategory = categoryOrderRef.current[0];
          currentInputCategoryRef.current = firstCategory;
          setCurrentInputCategory(firstCategory);
          categoryProgressRef.current = 0;
        }

        startInputTimer();
      }, nextSequence.length * config.showTimeMs);

      showTimeoutsRef.current.push(finishTimeout);
    },
    [clearShowTimeouts, resetPlayerInputs, startInputTimer, stopInputTimer],
  );

  // Oyunu mevcut bölümle başlatır
  const startGame = useCallback(() => {
    if (levelForEmojisRef.current !== level) {
      assignActiveCategoryEmojisForLevel(level);
    }

    beginRound(level);
  }, [assignActiveCategoryEmojisForLevel, beginRound, level]);

  startGameRef.current = startGame;

  // Emoji modunda kategori bazlı tıklamayı işler — her tıklamada adım ilerler
  const handleEmojiCellClick = useCallback(
    (
      index: number,
      previousCategoryInput: number[],
    ): {
      playerInput: number[];
      allPlayerInputs: number[];
      correctPlayerInputs: number[];
      wrongInputIndices: number[];
      shouldComplete: boolean;
    } | null => {
      const category = currentInputCategoryRef.current;

      if (!category) {
        return null;
      }

      const nextAllPlayerInputs = [...allPlayerInputsRef.current, index];
      const cell = emojiSequenceRef.current.find(
        (item) => item.index === index,
      );
      const expectedCells = getCategoryCellIndices(
        emojiSequenceRef.current,
        category,
      );
      const expectedIndex = expectedCells[categoryProgressRef.current];
      const isCorrectClick = cell?.emoji === category && index === expectedIndex;

      const nextCorrectPlayerInputs = isCorrectClick
        ? [...correctPlayerInputsRef.current, index]
        : correctPlayerInputsRef.current;

      const nextWrongInputIndices =
        !isCorrectClick && !wrongInputIndicesRef.current.includes(index)
          ? [...wrongInputIndicesRef.current, index]
          : wrongInputIndicesRef.current;

      categoryProgressRef.current += 1;
      const nextPlayerInput = [...previousCategoryInput, index];

      if (categoryProgressRef.current < expectedCells.length) {
        return {
          playerInput: nextPlayerInput,
          allPlayerInputs: nextAllPlayerInputs,
          correctPlayerInputs: nextCorrectPlayerInputs,
          wrongInputIndices: nextWrongInputIndices,
          shouldComplete: false,
        };
      }

      const currentCategoryIndex = categoryOrderRef.current.indexOf(category);

      if (currentCategoryIndex < categoryOrderRef.current.length - 1) {
        const nextCategory = categoryOrderRef.current[currentCategoryIndex + 1];

        categoryProgressRef.current = 0;
        currentInputCategoryRef.current = nextCategory;
        setCurrentInputCategory(nextCategory);

        return {
          playerInput: [],
          allPlayerInputs: nextAllPlayerInputs,
          correctPlayerInputs: nextCorrectPlayerInputs,
          wrongInputIndices: nextWrongInputIndices,
          shouldComplete: false,
        };
      }

      return {
        playerInput: nextPlayerInput,
        allPlayerInputs: nextAllPlayerInputs,
        correctPlayerInputs: nextCorrectPlayerInputs,
        wrongInputIndices: nextWrongInputIndices,
        shouldComplete: true,
      };
    },
    [],
  );

  // Oyuncu kare tıklamasını işler
  const handleCellClick = useCallback(
    (index: number) => {
      if (phase !== "input") {
        return;
      }

      if (roundModeRef.current === "emoji") {
        const category = currentInputCategoryRef.current;
        const expectedCells = category
          ? getCategoryCellIndices(emojiSequenceRef.current, category)
          : [];
        const expectedIndex = category
          ? expectedCells[categoryProgressRef.current]
          : undefined;

        console.log("Tıklanan kare:", index);
        console.log("Beklenen kategori:", category);
        console.log(
          "Bu kare doğru kategori mi:",
          emojiSequenceRef.current.find((e) => e.index === index)?.emoji ===
            category,
        );
        console.log("Beklenen sıradaki kare:", expectedIndex);

        const result = handleEmojiCellClick(index, playerInputRef.current);

        if (!result) {
          return;
        }

        playerInputRef.current = result.playerInput;
        allPlayerInputsRef.current = result.allPlayerInputs;
        correctPlayerInputsRef.current = result.correctPlayerInputs;
        wrongInputIndicesRef.current = result.wrongInputIndices;
        setPlayerInput(result.playerInput);
        setAllPlayerInputs(result.allPlayerInputs);
        setCorrectPlayerInputs(result.correctPlayerInputs);
        setWrongInputIndices(result.wrongInputIndices);

        if (result.shouldComplete) {
          completeRound(result.allPlayerInputs);
        }

        return;
      }

      setPlayerInput((previousInput) => {
        const nextPlayerInput = [...previousInput, index];

        if (nextPlayerInput.length < sequenceRef.current.length) {
          return nextPlayerInput;
        }

        completeRound(nextPlayerInput);
        return nextPlayerInput;
      });
    },
    [completeRound, handleEmojiCellClick, phase],
  );

  // Bir sonraki bölüme geçer ve yeni tur başlatır
  const nextLevel = useCallback(() => {
    const newLevel = level + 1;

    roundHistoryRef.current = [];
    setRoundHistory([]);
    setRoundCount(0);
    setLevelComplete(false);
    setLevel(newLevel);
    assignActiveCategoryEmojisForLevel(newLevel);
    beginRound(newLevel);
  }, [assignActiveCategoryEmojisForLevel, beginRound, level]);

  // Oyun state'ini başlangıç değerlerine sıfırlar
  const resetGame = useCallback(() => {
    clearShowTimeouts();
    stopInputTimer();
    sequenceRef.current = [];
    emojiSequenceRef.current = [];
    categoryOrderRef.current = [];
    currentInputCategoryRef.current = null;
    categoryProgressRef.current = 0;
    roundModeRef.current = "normal";
    localStorage.removeItem(SAVE_KEY);

    setPhase("idle");
    setLevel(1);
    assignActiveCategoryEmojisForLevel(1);
    setSequence([]);
    resetPlayerInputs();
    setScore(0);
    setElapsedMs(0);
    elapsedMsRef.current = 0;
    setActiveIndex(null);
    setResultMap({});
    roundHistoryRef.current = [];
    setRoundHistory([]);
    setRoundCount(0);
    setIsPaused(false);
    setLevelComplete(false);
    setEmojiSequence([]);
    setCategoryOrder([]);
    setCurrentInputCategory(null);
    roundRecordedRef.current = false;
  }, [
    assignActiveCategoryEmojisForLevel,
    clearShowTimeouts,
    resetPlayerInputs,
    stopInputTimer,
  ]);

  // Debug: belirtilen bölüme atlar ve tur geçmişini sıfırlar
  const jumpToLevel = useCallback(
    (targetLevel: number) => {
      clearShowTimeouts();
      stopInputTimer();

      const clampedLevel = Math.min(Math.max(targetLevel, 1), MAX_LEVEL);

      roundHistoryRef.current = [];
      setRoundHistory([]);
      setRoundCount(0);
      setLevelComplete(false);
      setLevel(clampedLevel);
      assignActiveCategoryEmojisForLevel(clampedLevel);
      setPhase("idle");
      setSequence([]);
      sequenceRef.current = [];
      resetPlayerInputs();
      setResultMap({});
      setActiveIndex(null);
      setEmojiSequence([]);
      setCategoryOrder([]);
      setCurrentInputCategory(null);
      emojiSequenceRef.current = [];
      categoryOrderRef.current = [];
      currentInputCategoryRef.current = null;
      categoryProgressRef.current = 0;
      roundRecordedRef.current = false;
    },
    [
      assignActiveCategoryEmojisForLevel,
      clearShowTimeouts,
      resetPlayerInputs,
      stopInputTimer,
    ],
  );

  // Seçilen bölüme atlar, ilerlemeyi sıfırlar ve oyunu başlatır
  const selectLevelAndStart = useCallback(
    (targetLevel: number) => {
      const clampedLevel = Math.min(Math.max(targetLevel, 1), MAX_LEVEL);

      jumpToLevel(clampedLevel);
      beginRound(clampedLevel);
    },
    [beginRound, jumpToLevel],
  );

  // Mevcut ilerlemeyi localStorage'a kaydeder
  const pauseGame = useCallback(() => {
    const saveData: MnemoSave = {
      level,
      roundHistory,
      roundCount,
      score,
    };

    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    setIsPaused(true);
  }, [level, roundCount, roundHistory, score]);

  // Kayıtlı ilerlemeyi localStorage'dan geri yükler
  const resumeGame = useCallback(() => {
    const savedGame = readSavedGame();

    if (!savedGame) {
      return;
    }

    roundHistoryRef.current = savedGame.roundHistory;
    setLevel(savedGame.level);
    setRoundHistory(savedGame.roundHistory);
    setRoundCount(savedGame.roundCount);
    setScore(savedGame.score);
    setLevelComplete(calculateLevelComplete(savedGame.roundHistory));
    setIsPaused(false);
    setPhase("idle");
  }, []);

  useEffect(() => {
    if (roundModeRef.current !== "emoji" || currentInputCategory === null) {
      return;
    }

    console.log("Beklenen kategori:", currentInputCategory);
    console.log(
      "Bu kategorideki kareler:",
      emojiSequence
        .filter((e) => e.emoji === currentInputCategory)
        .map((e) => e.index),
    );
  }, [currentInputCategory, emojiSequence]);

  useEffect(() => {
    if (phase === "input") {
      roundRecordedRef.current = false;
    }
  }, [phase]);

  useEffect(() => {
    return () => {
      clearShowTimeouts();
      stopInputTimer();
    };
  }, [clearShowTimeouts, stopInputTimer]);

  useEffect(() => {
    if (localStorage.getItem(SAVE_KEY)) {
      resumeGame();
    }
  }, [resumeGame]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.code !== "Space" ||
        phaseRef.current !== "result" ||
        levelCompleteRef.current
      ) {
        return;
      }

      event.preventDefault();
      startGameRef.current();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return {
    phase,
    level,
    sequence,
    playerInput,
    allPlayerInputs,
    correctPlayerInputs,
    wrongInputIndices,
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
    activeCategoryEmojis,
    startGame,
    handleCellClick,
    nextLevel,
    resetGame,
    pauseGame,
    resumeGame,
    jumpToLevel,
    selectLevelAndStart,
  };
}
