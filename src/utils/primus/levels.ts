import {
  PRIMUS_GRID_SIZE,
  PRIMUS_MAX_LEVEL,
  PRIMUS_MAX_ONE_DIGIT_COUNT,
  PRIMUS_MIN_ONE_DIGIT_COUNT,
  PRIMUS_ROUND_TIME_MS,
  PRIMUS_TARGET_COUNT,
} from "../constants";
import type { PrimusRoundType } from "./numbers";

export type PrimusQuestionMode =
  | "fixedAsal"
  | "fixedKare"
  | "fixedKup"
  | "random3"
  | "random2";

export type PrimusDigitMode =
  | "weightedOne"
  | "mix1_2"
  | "weightedTwo"
  | "twoOnly"
  | "mix2_3"
  | "threeOnly";

export type PrimusLevelPhase =
  | "Tanışma"
  | "Alışma"
  | "Gelişme"
  | "Ustalaşma"
  | "İleri";

export interface PrimusLevelConfig {
  level: number;
  gridSize: number;
  targetCount: number;
  digitMode: PrimusDigitMode;
  questionMode: PrimusQuestionMode;
  oneDigitMin: number;
  oneDigitMax: number;
  roundTimeSec: number;
  phase: PrimusLevelPhase;
}

// CSV / PRD 19 bölüm tablosu ile birebir
const PRIMUS_LEVELS: PrimusLevelConfig[] = [
  { level: 1, gridSize: 3, targetCount: 2, digitMode: "weightedOne", questionMode: "fixedAsal", oneDigitMin: 6, oneDigitMax: 8, roundTimeSec: 14, phase: "Tanışma" },
  { level: 2, gridSize: 3, targetCount: 2, digitMode: "mix1_2", questionMode: "fixedKare", oneDigitMin: 6, oneDigitMax: 8, roundTimeSec: 14, phase: "Tanışma" },
  { level: 3, gridSize: 3, targetCount: 2, digitMode: "mix1_2", questionMode: "fixedKup", oneDigitMin: 6, oneDigitMax: 8, roundTimeSec: 14, phase: "Tanışma" },
  { level: 4, gridSize: 3, targetCount: 3, digitMode: "mix1_2", questionMode: "random3", oneDigitMin: 5, oneDigitMax: 8, roundTimeSec: 13, phase: "Tanışma" },
  { level: 5, gridSize: 3, targetCount: 3, digitMode: "mix1_2", questionMode: "random3", oneDigitMin: 4, oneDigitMax: 8, roundTimeSec: 12, phase: "Tanışma" },
  { level: 6, gridSize: 3, targetCount: 3, digitMode: "mix1_2", questionMode: "random3", oneDigitMin: 4, oneDigitMax: 8, roundTimeSec: 11, phase: "Tanışma" },
  { level: 7, gridSize: 4, targetCount: 3, digitMode: "mix1_2", questionMode: "random3", oneDigitMin: 3, oneDigitMax: 8, roundTimeSec: 13, phase: "Alışma" },
  { level: 8, gridSize: 4, targetCount: 3, digitMode: "mix1_2", questionMode: "random3", oneDigitMin: 3, oneDigitMax: 8, roundTimeSec: 12, phase: "Alışma" },
  { level: 9, gridSize: 4, targetCount: 4, digitMode: "mix1_2", questionMode: "random3", oneDigitMin: 2, oneDigitMax: 8, roundTimeSec: 11, phase: "Alışma" },
  { level: 10, gridSize: 5, targetCount: 4, digitMode: "mix1_2", questionMode: "random3", oneDigitMin: 2, oneDigitMax: 8, roundTimeSec: 12, phase: "Gelişme" },
  { level: 11, gridSize: 5, targetCount: 4, digitMode: "weightedTwo", questionMode: "random3", oneDigitMin: 1, oneDigitMax: 8, roundTimeSec: 11, phase: "Gelişme" },
  { level: 12, gridSize: 5, targetCount: 5, digitMode: "twoOnly", questionMode: "random2", oneDigitMin: 0, oneDigitMax: 2, roundTimeSec: 10, phase: "Gelişme" },
  { level: 13, gridSize: 6, targetCount: 5, digitMode: "twoOnly", questionMode: "random2", oneDigitMin: 0, oneDigitMax: 1, roundTimeSec: 11, phase: "Ustalaşma" },
  { level: 14, gridSize: 6, targetCount: 5, digitMode: "twoOnly", questionMode: "random2", oneDigitMin: 0, oneDigitMax: 0, roundTimeSec: 10, phase: "Ustalaşma" },
  { level: 15, gridSize: 6, targetCount: 6, digitMode: "mix2_3", questionMode: "random2", oneDigitMin: 0, oneDigitMax: 0, roundTimeSec: 9, phase: "Ustalaşma" },
  { level: 16, gridSize: 7, targetCount: 6, digitMode: "mix2_3", questionMode: "random2", oneDigitMin: 0, oneDigitMax: 0, roundTimeSec: 11, phase: "İleri" },
  { level: 17, gridSize: 7, targetCount: 6, digitMode: "mix2_3", questionMode: "random2", oneDigitMin: 0, oneDigitMax: 0, roundTimeSec: 10, phase: "İleri" },
  { level: 18, gridSize: 7, targetCount: 7, digitMode: "threeOnly", questionMode: "random2", oneDigitMin: 0, oneDigitMax: 0, roundTimeSec: 9, phase: "İleri" },
  { level: 19, gridSize: 7, targetCount: 7, digitMode: "threeOnly", questionMode: "random2", oneDigitMin: 0, oneDigitMax: 0, roundTimeSec: 8, phase: "İleri" },
];

// Bölüm numarasını 1..PRIMUS_MAX_LEVEL aralığına sıkıştırır
function clampLevel(level: number): number {
  return Math.min(Math.max(level, 1), PRIMUS_MAX_LEVEL);
}

// Bölüm config'ini döner
export function getPrimusLevelConfig(level: number): PrimusLevelConfig {
  const clamped = clampLevel(level);
  return PRIMUS_LEVELS[clamped - 1];
}

// Tüm bölüm config listesini döner
export function getAllPrimusLevelConfigs(): PrimusLevelConfig[] {
  return PRIMUS_LEVELS;
}

// Bölüm soru modundan tur tipini üretir (random3/random2 her çağrıda bağımsız; tip garantisi yok)
export function getRoundTypeForLevel(
  questionMode: PrimusQuestionMode,
): PrimusRoundType {
  if (questionMode === "fixedAsal") {
    return "asal";
  }

  if (questionMode === "fixedKare") {
    return "kare";
  }

  if (questionMode === "fixedKup") {
    return "kup";
  }

  if (questionMode === "random3") {
    const options: PrimusRoundType[] = ["asal", "kare", "kup"];
    return options[Math.floor(Math.random() * options.length)];
  }

  // random2: asal | kareKup
  return Math.random() < 0.5 ? "asal" : "kareKup";
}

// Soru modunu UI etiketine çevirir
export function getQuestionModeLabel(questionMode: PrimusQuestionMode): string {
  switch (questionMode) {
    case "fixedAsal":
      return "Asal";
    case "fixedKare":
      return "Kare";
    case "fixedKup":
      return "Küp";
    case "random3":
      return "Asal/Kare/Küp-Random";
    case "random2":
      return "Asal/Kare&Küp-Random";
  }
}

// Alıştırma (DEBUG) sabit config — 4×4, N=3, mix1_2, 8 sn; tip seçimi pickRoundType ile
export function getPracticeLevelConfig(): PrimusLevelConfig {
  return {
    level: 0,
    gridSize: PRIMUS_GRID_SIZE,
    targetCount: PRIMUS_TARGET_COUNT,
    digitMode: "mix1_2",
    questionMode: "random2",
    oneDigitMin: PRIMUS_MIN_ONE_DIGIT_COUNT,
    oneDigitMax: PRIMUS_MAX_ONE_DIGIT_COUNT,
    roundTimeSec: PRIMUS_ROUND_TIME_MS / 1000,
    phase: "Alışma",
  };
}
